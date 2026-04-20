<?php

namespace Pterodactyl\Database\Schema;

use Illuminate\Database\Schema\MySqlSchemaState as BaseMySqlSchemaState;

class MySqlSchemaState extends BaseMySqlSchemaState
{
    /**
     * Generate a basic connection string for the database, adding --skip-ssl
     * when no SSL CA certificate is configured. This prevents the MariaDB/MySQL
     * CLI from requiring SSL when the server does not have it enabled, which
     * causes migrations to fail with "TLS/SSL error: SSL is required, but the
     * server does not support it".
     */
    protected function connectionString(): string
    {
        $value = parent::connectionString();

        if (!isset($this->connection->getConfig()['options'][\PDO::MYSQL_ATTR_SSL_CA])) {
            $value .= ' --skip-ssl';
        }

        return $value;
    }
}
