#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-.env.docker}"
ENV_PATH="${ROOT_DIR}/${ENV_FILE}"
ENV_EXAMPLE="${ROOT_DIR}/.env.docker.example"

SEED_STARTER="${SEED_STARTER:-false}"
RUN_PULL="${RUN_PULL:-true}"
RUN_BUILD="${RUN_BUILD:-true}"
RUN_MIGRATE="${RUN_MIGRATE:-true}"
RUN_OPTIMIZE="${RUN_OPTIMIZE:-true}"
USE_MAINTENANCE="${USE_MAINTENANCE:-true}"

log() {
    printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

fail() {
    printf '\n[deploy:error] %s\n' "$*" >&2
    exit 1
}

usage() {
    cat <<'USAGE'
Usage:
  ./scripts/deploy.sh [options]

Options:
  --seed              Run ProductionStarterSeeder after migration.
  --no-pull           Skip git pull.
  --no-build          Skip Docker image build.
  --no-migrate        Skip database migration.
  --no-optimize       Skip Laravel optimize commands.
  --no-maintenance    Do not call artisan down/up during deploy.
  -h, --help          Show this help.

Useful env overrides:
  APP_URL=https://example.com APP_PORT=8000 DB_PASSWORD=strongpass ./scripts/deploy.sh --seed
  BRANCH=main ./scripts/deploy.sh
  ENV_FILE=.env.production.docker ./scripts/deploy.sh
USAGE
}

while [ "${1:-}" != "" ]; do
    case "$1" in
        --seed)
            SEED_STARTER=true
            ;;
        --no-pull)
            RUN_PULL=false
            ;;
        --no-build)
            RUN_BUILD=false
            ;;
        --no-migrate)
            RUN_MIGRATE=false
            ;;
        --no-optimize)
            RUN_OPTIMIZE=false
            ;;
        --no-maintenance)
            USE_MAINTENANCE=false
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            fail "Unknown option: $1"
            ;;
    esac

    shift
done

require_command() {
    command -v "$1" >/dev/null 2>&1 || fail "Command '$1' is required."
}

compose() {
    DJAITIN_ENV_FILE="$ENV_FILE" docker compose --env-file "$ENV_FILE" "$@"
}

set_env_value() {
    local key="$1"
    local value="$2"
    local file="$3"
    local tmp

    tmp="$(mktemp)"

    if grep -q "^${key}=" "$file"; then
        awk -v key="$key" -v value="$value" '
            $0 ~ "^" key "=" {
                print key "=" value
                next
            }
            { print }
        ' "$file" > "$tmp"
    else
        cp "$file" "$tmp"
        printf '%s=%s\n' "$key" "$value" >> "$tmp"
    fi

    mv "$tmp" "$file"
}

get_env_value() {
    local key="$1"
    local file="$2"

    grep -E "^${key}=" "$file" | tail -n 1 | cut -d '=' -f 2- || true
}

random_secret() {
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -base64 32 | tr -d '\n'
    else
        date +%s%N | sha256sum | cut -d ' ' -f 1
    fi
}

wait_for_app() {
    local retries=30

    until compose exec -T app php artisan about >/dev/null 2>&1; do
        retries=$((retries - 1))

        if [ "$retries" -le 0 ]; then
            fail "Application container did not become ready."
        fi

        sleep 2
    done
}

cd "$ROOT_DIR"

require_command docker

if ! docker compose version >/dev/null 2>&1; then
    fail "Docker Compose v2 is required. Install the docker compose plugin first."
fi

if [ ! -f "$ENV_PATH" ]; then
    [ -f "$ENV_EXAMPLE" ] || fail ".env.docker.example not found."

    log "Creating $ENV_FILE from .env.docker.example"
    cp "$ENV_EXAMPLE" "$ENV_PATH"
fi

if [ "${APP_URL:-}" != "" ]; then
    set_env_value APP_URL "$APP_URL" "$ENV_PATH"
fi

if [ "${APP_PORT:-}" != "" ]; then
    set_env_value APP_PORT "$APP_PORT" "$ENV_PATH"
fi

current_db_password="$(get_env_value DB_PASSWORD "$ENV_PATH")"
if [ "${DB_PASSWORD:-}" != "" ]; then
    set_env_value DB_PASSWORD "$DB_PASSWORD" "$ENV_PATH"
elif [ "$current_db_password" = "change_this_password" ] || [ "$current_db_password" = "" ]; then
    generated_db_password="$(random_secret)"
    set_env_value DB_PASSWORD "$generated_db_password" "$ENV_PATH"
    log "Generated DB_PASSWORD in $ENV_FILE"
fi

current_app_key="$(get_env_value APP_KEY "$ENV_PATH")"
if [ "$current_app_key" = "" ]; then
    generated_app_key="base64:$(random_secret)"
    set_env_value APP_KEY "$generated_app_key" "$ENV_PATH"
    log "Generated APP_KEY in $ENV_FILE"
fi

if [ "$RUN_PULL" = "true" ] && [ -d .git ]; then
    branch="${BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"
    log "Pulling latest code from origin/${branch}"
    git pull --ff-only origin "$branch"
fi

if [ "$RUN_BUILD" = "true" ]; then
    log "Building Docker images"
    compose build --pull
fi

log "Starting containers"
compose up -d

log "Waiting for application container"
wait_for_app

if [ "$USE_MAINTENANCE" = "true" ]; then
    log "Putting application into maintenance mode"
    compose exec -T app php artisan down || true
fi

if [ "$RUN_MIGRATE" = "true" ]; then
    log "Running database migrations"
    compose exec -T app php artisan migrate --force
fi

if [ "$SEED_STARTER" = "true" ]; then
    log "Running production starter seeder"
    compose exec -T app php artisan db:seed --class=ProductionStarterSeeder --force
fi

if [ "$RUN_OPTIMIZE" = "true" ]; then
    log "Rebuilding Laravel cache"
    compose exec -T app php artisan optimize:clear
    compose exec -T app php artisan optimize
fi

log "Restarting queue worker and scheduler"
compose exec -T app php artisan queue:restart || true
compose restart worker scheduler

if [ "$USE_MAINTENANCE" = "true" ]; then
    log "Bringing application back online"
    compose exec -T app php artisan up
fi

log "Container status"
compose ps

log "Deployment finished"
