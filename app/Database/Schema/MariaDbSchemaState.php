<?php

namespace Pterodactyl\Database\Schema;

class MariaDbSchemaState extends MySqlSchemaState
{
    /**
     * Get the base dump command arguments for MariaDB as a string.
     * MariaDB does not support --set-gtid-purged=OFF or --column-statistics=0
     * in the same way MySQL does, so we override the command here.
     */
    protected function baseDumpCommand(): string
    {
        $command = 'mysqldump ' . $this->connectionString() . ' --no-tablespaces --skip-add-locks --skip-comments --skip-set-charset --tz-utc --column-statistics=0';

        return $command . ' "${:LARAVEL_LOAD_DATABASE}"';
    }
}
