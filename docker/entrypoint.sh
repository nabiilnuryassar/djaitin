#!/usr/bin/env sh
set -e

mkdir -p \
    storage/app/public \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache

if [ ! -L public/storage ]; then
    gosu www-data php artisan storage:link >/dev/null 2>&1 || true
fi

exec gosu www-data "$@"
