# Deployment Runbook — Production

## 1. Pre-Deployment

Pastikan sebelum deploy:

- branch release sudah final
- migration baru sudah direview
- env production sudah lengkap
- queue, storage, dan mail sudah siap

## 2. Minimum Environment

- PHP 8.4+
- PostgreSQL
- ekstensi yang dibutuhkan Laravel dan DomPDF
- writable storage dan bootstrap cache

## 3. Checklist `.env`

Minimal cek:

- `APP_NAME`
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL`
- `DB_*`
- `MAIL_*`
- `SESSION_DRIVER`
- `QUEUE_CONNECTION`
- `FILESYSTEM_DISK=public`

## 4. Step Deployment

### 4.1 Pull Code

```bash
git pull origin <release-branch>
composer install --no-dev --optimize-autoloader
npm ci
npm run build
```

### 4.2 Laravel Optimize

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

### 4.3 Database & Storage

```bash
php artisan migrate --force
php artisan storage:link
```

### 4.4 Starter Data

Untuk fresh production:

```bash
php artisan db:seed --class=ProductionStarterSeeder --force
```

Untuk environment demo/internal:

```bash
php artisan migrate:fresh --seed
```

## 5. Post-Deploy Validation

### Customer Surface

- halaman publik terbuka
- register/login customer berjalan
- dashboard customer terbuka
- catalog, checkout, notifications terbuka

### Office Surface

- login staff berjalan
- dashboard office terbuka
- orders, payments, production, shipping, reports dapat diakses sesuai role

### Documents

- nota PDF bisa diunduh
- kwitansi PDF bisa diunduh
- export report PDF / CSV bisa diunduh

## 6. Security Step Setelah Deploy

1. rotasi password starter accounts
2. pastikan tidak ada akun demo yang aktif di production
3. pastikan `APP_DEBUG=false`
4. cek permission file upload

## 7. Observability Minimum

- pantau log Laravel setelah deploy
- pantau browser log bila ada issue frontend
- review error payment, upload proof, shipment update, dan report export

## 8. Rollback Thinking

Siapkan rollback jika:

- migration merusak flow inti
- login gagal
- report/export gagal
- payment verification gagal

Rollback minimal:

- kembalikan code ke release stabil terakhir
- restore database jika migration destruktif
- rebuild assets dari release stabil

## 9. Command Ringkas Release

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan db:seed --class=ProductionStarterSeeder --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```
