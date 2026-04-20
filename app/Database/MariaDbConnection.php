<?php

namespace Pterodactyl\Database;

use Illuminate\Filesystem\Filesystem;
use Illuminate\Database\MariaDbConnection as BaseMariaDbConnection;
use Pterodactyl\Database\Schema\MariaDbSchemaState;

class MariaDbConnection extends BaseMariaDbConnection
{
    /**
     * Get the schema state for the connection.
     *
     * Returns a custom schema state that disables SSL on the mysql CLI when no
     * SSL CA certificate is configured, preventing migration failures when the
     * database server does not have SSL enabled.
     */
    public function getSchemaState(?Filesystem $files = null, ?callable $processFactory = null): MariaDbSchemaState
    {
        return new MariaDbSchemaState($this, $files, $processFactory);
    }
}
