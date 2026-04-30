# Djaitin App

Djaitin App is an integrated tailoring and convection management platform built with Laravel 12, Inertia.js v2, React 19, and Tailwind CSS v4.

It covers the full operational flow for:
- Public landing and service discovery
- Customer portal (orders, checkout, payments, profile, measurements)
- Office backoffice (operations, production, shipping, reporting)
- Admin master data and user management

## Core Features

- Multi-role access control (`customer`, `owner`, `admin`, `kasir`, `produksi`)
- Multiple order types (tailor, convection, ready-to-wear)
- Cart and checkout workflow
- Payment proof upload and verification flow
- Production stage tracking and shipping management
- Customer profile, address book, and measurement library
- Notification and audit log support
- PDF document generation (via DomPDF)

## Tech Stack

- Backend: Laravel 12, PHP 8.4+
- Frontend: Inertia.js v2, React 19, TypeScript
- Styling: Tailwind CSS v4 + Radix UI primitives
- Database: PostgreSQL (Docker setup), SQLite supported for local testing
- Auth/Security: Laravel Fortify, authorization policies, role middleware
- Tooling: Vite 7, ESLint 9, Prettier 3, Laravel Pint, Pest 4

## Requirements

- PHP 8.4+ (8.2+ minimum per composer constraints)
- Composer 2+
- Node.js 20+ and npm
- PostgreSQL 15+ (or SQLite for simple local setup)

## Quick Start (Local)

1. Install dependencies:

```bash
composer install
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Generate app key:

```bash
php artisan key:generate
```

4. Configure database in `.env`, then migrate + seed:

```bash
php artisan migrate:fresh --seed
```

5. Run development services:

```bash
composer run dev
```

This runs Laravel server, queue listener, log tailing, and Vite dev server concurrently.

## Demo Accounts

When using `php artisan migrate:fresh --seed`, demo accounts are available:

- `customer@djaitin.com`
- `admin@djaitin.com`
- `owner@djaitin.com`
- `kasir@djaitin.com`
- `produksi@djaitin.com`

Default password:

```text
password
```

## Production Starter Seeding

For staging/production baseline setup without sample transactions:

```bash
php artisan db:seed --class=ProductionStarterSeeder --force
```

Notes:
- Creates minimal internal accounts + essential master data
- Does not create demo customers/orders/payments
- Generates random passwords for newly created internal users and prints them to console

## Docker Deployment

This repository includes Docker configuration for app, nginx, postgres, worker, and scheduler.

Quick deploy:

```bash
APP_URL=https://your-domain.com APP_PORT=8000 ./scripts/deploy.sh --seed
```

For regular updates:

```bash
./scripts/deploy.sh
```

See full deployment details in [`docs/DOCKER-SETUP.md`](docs/DOCKER-SETUP.md).

## Testing

Run all tests:

```bash
php artisan test
```

Run compact test output:

```bash
php artisan test --compact
```

## Code Quality

Run PHP formatter:

```bash
vendor/bin/pint --dirty --format agent
```

Run frontend checks:

```bash
npm run lint:check
npm run format:check
npm run types:check
```

## Project Structure

```text
app/                    # Domain logic (Controllers, Services, Models, Policies)
resources/js/pages/     # Inertia React pages (Landing, Customer, Office, Auth)
routes/                 # Route groups (web, landing, customer, office, settings)
database/               # Migrations, factories, seeders
tests/                  # Pest feature and unit tests
docker/                 # Nginx/PHP configs and Docker entrypoints
docs/                   # Product, deployment, and operational documentation
```

## Useful Documentation

- `docs/STARTER-ACCOUNTS-AND-SEEDING.md`
- `docs/DOCKER-SETUP.md`
- `docs/DEPLOYMENT-RUNBOOK.md`
- `docs/USER-MANUAL.md`
- `docs/DOCS-INDEX.md`

## License

This project is open-sourced under the [MIT license](https://opensource.org/licenses/MIT).
