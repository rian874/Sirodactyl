param(
    [string]$AppUrl = "http://localhost",
    [string]$MysqlPassword = "CHANGE_ME",
    [string]$MysqlRootPassword = "CHANGE_ME_TOO",
    [switch]$NoStart
)

$ErrorActionPreference = "Stop"

function Require-Command {
    param([string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Comando obrigatório não encontrado: $Name"
    }
}

Require-Command "docker"

$projectRoot = (Get-Location).Path
$composeFile = Join-Path $projectRoot "docker-compose.yml"
$envFile = Join-Path $projectRoot ".env"

if (-not (Test-Path $composeFile)) {
    if (-not (Test-Path (Join-Path $projectRoot "docker-compose.example.yml"))) {
        throw "Arquivo docker-compose.example.yml não encontrado."
    }

    Copy-Item (Join-Path $projectRoot "docker-compose.example.yml") $composeFile
}

if (-not (Test-Path $envFile)) {
    if (-not (Test-Path (Join-Path $projectRoot ".env.example"))) {
        throw "Arquivo .env.example não encontrado."
    }

    Copy-Item (Join-Path $projectRoot ".env.example") $envFile
}

$composeContent = Get-Content $composeFile -Raw
$composeContent = $composeContent -replace 'MYSQL_PASSWORD: &db-password "CHANGE_ME"', "MYSQL_PASSWORD: &db-password `"$MysqlPassword`""
$composeContent = $composeContent -replace 'MYSQL_ROOT_PASSWORD: "CHANGE_ME_TOO"', "MYSQL_ROOT_PASSWORD: `"$MysqlRootPassword`""
$composeContent = $composeContent -replace 'APP_URL: "http://example.com"', "APP_URL: `"$AppUrl`""
Set-Content -Path $composeFile -Value $composeContent -NoNewline

if ($NoStart) {
    Write-Host "Configuração concluída (modo NoStart)."
    exit 0
}

docker compose up -d
docker compose exec panel php artisan key:generate --force
docker compose exec panel php artisan migrate --force --seed

Write-Host "Instalação concluída. Acesse: $AppUrl"
