param(
    [string]$AppUrl = "http://localhost",
    [string]$MysqlPassword,
    [string]$MysqlRootPassword,
    [switch]$NoStart
)

$ErrorActionPreference = "Stop"
$MaxRetries = 30
$RetryDelaySeconds = 2

function Require-Command {
    param([string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command not found: $Name"
    }
}

Require-Command "docker"

$projectRoot = (Get-Location).Path
$composeFile = Join-Path $projectRoot "docker-compose.yml"
$envFile = Join-Path $projectRoot ".env"

if (-not (Test-Path $composeFile)) {
    if (-not (Test-Path (Join-Path $projectRoot "docker-compose.example.yml"))) {
        throw "File docker-compose.example.yml not found."
    }

    Copy-Item (Join-Path $projectRoot "docker-compose.example.yml") $composeFile
}

if (-not (Test-Path $envFile)) {
    if (-not (Test-Path (Join-Path $projectRoot ".env.example"))) {
        throw "File .env.example not found."
    }

    Copy-Item (Join-Path $projectRoot ".env.example") $envFile
}

$composeContent = Get-Content $composeFile -Raw

if (-not $NoStart) {
    if ([string]::IsNullOrWhiteSpace($MysqlPassword)) {
        $secureMysqlPassword = Read-Host "Enter MYSQL_PASSWORD" -AsSecureString
        $mysqlPasswordPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureMysqlPassword)
        try {
            $MysqlPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($mysqlPasswordPtr)
        } finally {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($mysqlPasswordPtr)
        }
    }

    if ([string]::IsNullOrWhiteSpace($MysqlRootPassword)) {
        $secureMysqlRootPassword = Read-Host "Enter MYSQL_ROOT_PASSWORD" -AsSecureString
        $mysqlRootPasswordPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureMysqlRootPassword)
        try {
            $MysqlRootPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($mysqlRootPasswordPtr)
        } finally {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($mysqlRootPasswordPtr)
        }
    }

    if ([string]::IsNullOrWhiteSpace($MysqlPassword) -or [string]::IsNullOrWhiteSpace($MysqlRootPassword)) {
        throw "MYSQL_PASSWORD and MYSQL_ROOT_PASSWORD are required to continue."
    }
}

if ([regex]::IsMatch($composeContent, '(?m)APP_URL: "[^"]*"')) {
    $composeContent = [regex]::Replace($composeContent, '(?m)APP_URL: "[^"]*"', "APP_URL: `"$AppUrl`"", 1)
} else {
    throw "Unable to update APP_URL in docker-compose.yml: expected pattern APP_URL: `"...`" was not found."
}

if (-not [string]::IsNullOrWhiteSpace($MysqlPassword)) {
    if ([regex]::IsMatch($composeContent, '(?m)MYSQL_PASSWORD: &db-password "[^"]*"')) {
        $composeContent = [regex]::Replace($composeContent, '(?m)MYSQL_PASSWORD: &db-password "[^"]*"', "MYSQL_PASSWORD: &db-password `"$MysqlPassword`"", 1)
    } else {
        throw "Unable to update MYSQL_PASSWORD in docker-compose.yml: expected pattern MYSQL_PASSWORD: &db-password `"...`" was not found."
    }
}

if (-not [string]::IsNullOrWhiteSpace($MysqlRootPassword)) {
    if ([regex]::IsMatch($composeContent, '(?m)MYSQL_ROOT_PASSWORD: "[^"]*"')) {
        $composeContent = [regex]::Replace($composeContent, '(?m)MYSQL_ROOT_PASSWORD: "[^"]*"', "MYSQL_ROOT_PASSWORD: `"$MysqlRootPassword`"", 1)
    } else {
        throw "Unable to update MYSQL_ROOT_PASSWORD in docker-compose.yml: expected pattern MYSQL_ROOT_PASSWORD: `"...`" was not found."
    }
}

Set-Content -Path $composeFile -Value $composeContent -NoNewline

if ($NoStart) {
    Write-Host "Configuration completed (NoStart mode)."
    exit 0
}

docker compose up -d

$ready = $false
for ($i = 0; $i -lt $MaxRetries; $i++) {
    try {
        docker compose exec -T panel php -v *> $null
        if ($LASTEXITCODE -eq 0) {
            $ready = $true
            break
        }
    } catch {
        # Keep retrying until timeout.
    }

    Start-Sleep -Seconds $RetryDelaySeconds
}

if (-not $ready) {
    throw "Panel container did not become ready in time."
}

$databaseReady = $false
for ($i = 0; $i -lt $MaxRetries; $i++) {
    try {
        docker compose exec -T panel php artisan migrate:status --no-ansi *> $null
        if ($LASTEXITCODE -eq 0) {
            $databaseReady = $true
            break
        }
    } catch {
        # Keep retrying until timeout.
    }

    Start-Sleep -Seconds $RetryDelaySeconds
}

if (-not $databaseReady) {
    throw "Database did not become ready in time."
}

docker compose exec panel php artisan key:generate --force
docker compose exec panel php artisan migrate --force --seed

Write-Host "Installation completed. Access: $AppUrl"
