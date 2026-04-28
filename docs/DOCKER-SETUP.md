# Docker Setup — Djaitin

## 1. Tujuan

Docker setup ini disiapkan untuk menjalankan Djaitin sebagai aplikasi web Laravel/Inertia dengan komponen berikut:

- `app`: PHP 8.4 FPM untuk Laravel
- `nginx`: web server untuk public assets dan PHP gateway
- `postgres`: database PostgreSQL
- `worker`: queue worker Laravel
- `scheduler`: scheduler Laravel setiap 60 detik

Setup ini cocok untuk staging, demo server, atau production server kecil-menengah. Untuk production serius, tetap aktifkan backup database, TLS, monitoring, dan rotasi log dari sisi server.

## 2. File Yang Disediakan

| File | Fungsi |
| --- | --- |
| `Dockerfile` | Build image PHP/Laravel dan image Nginx static public assets |
| `docker-compose.yml` | Menjalankan app, nginx, database, worker, dan scheduler |
| `.env.docker.example` | Template environment untuk Docker |
| `.dockerignore` | Mengecilkan build context dan mencegah secret masuk image |
| `docker/nginx/default.conf` | Konfigurasi Nginx untuk Laravel |
| `docker/php/php.ini` | Konfigurasi PHP production baseline |
| `docker/php/opcache.ini` | Konfigurasi OPcache production |
| `docker/entrypoint.sh` | Menyiapkan folder writable dan storage link saat container start |
| `scripts/deploy.sh` | Script deploy satu command untuk server Docker |

## 3. Requirement Server

Minimal:

- Docker Engine 24+
- Docker Compose v2
- CPU 2 core
- RAM 2 GB untuk staging/demo, 4 GB lebih aman untuk production
- Disk 20 GB minimum, lebih besar jika banyak upload bukti pembayaran dan lampiran desain

Port default:

- app HTTP: `8000`
- PostgreSQL hanya internal Docker network, tidak diekspos ke host

## 4. Setup Local Docker

Untuk server staging/production, jalur paling praktis adalah memakai script deploy:

```bash
APP_URL=https://domain-production.com APP_PORT=8000 ./scripts/deploy.sh --seed
```

Gunakan `--seed` hanya pada deploy awal untuk membuat akun internal dan master data starter. Deploy berikutnya cukup:

```bash
./scripts/deploy.sh
```

Script akan membuat `.env.docker` dari `.env.docker.example` jika belum ada, mengisi `APP_KEY` dan `DB_PASSWORD` jika masih kosong/default, pull source terbaru, build image, start service, migrate, optimize, dan restart worker/scheduler.

Setup manual tetap bisa digunakan untuk local development atau saat perlu menjalankan langkah satu per satu.

1. Copy env Docker:

```bash
cp .env.docker.example .env.docker
```

2. Edit nilai penting:

```env
APP_URL=http://localhost:8000
APP_PORT=8000
DB_PASSWORD=change_this_password
```

3. Generate `APP_KEY`:

```bash
docker compose --env-file .env.docker run --rm app php artisan key:generate --show
```

Salin output `base64:...` ke `APP_KEY` di `.env.docker`.

4. Build dan start:

```bash
docker compose --env-file .env.docker build
docker compose --env-file .env.docker up -d
```

5. Jalankan migration:

```bash
docker compose --env-file .env.docker exec app php artisan migrate --force
```

6. Isi starter data production:

```bash
docker compose --env-file .env.docker exec app php artisan db:seed --class=ProductionStarterSeeder --force
```

Simpan credential yang muncul di console, lalu ganti password setelah login pertama.

7. Optimize Laravel:

```bash
docker compose --env-file .env.docker exec app php artisan optimize
```

8. Buka aplikasi:

```text
http://localhost:8000
```

## 5. Command Operasional Harian

Melihat container:

```bash
docker compose --env-file .env.docker ps
```

Validasi file compose memakai template env:

```bash
DJAITIN_ENV_FILE=.env.docker.example docker compose --env-file .env.docker.example config
```

Melihat log app:

```bash
docker compose --env-file .env.docker logs -f app
```

Melihat log web server:

```bash
docker compose --env-file .env.docker logs -f nginx
```

Masuk shell app:

```bash
docker compose --env-file .env.docker exec app sh
```

Restart queue worker setelah deploy:

```bash
docker compose --env-file .env.docker exec app php artisan queue:restart
docker compose --env-file .env.docker restart worker
```

Clear dan rebuild cache Laravel:

```bash
docker compose --env-file .env.docker exec app php artisan optimize:clear
docker compose --env-file .env.docker exec app php artisan optimize
```

## 6. Update Release

Jalur rekomendasi:

```bash
./scripts/deploy.sh
```

Jika server tidak boleh melakukan `git pull` otomatis:

```bash
./scripts/deploy.sh --no-pull
```

Langkah manual di bawah ini tersedia sebagai fallback jika perlu debugging deployment.

1. Pull source terbaru:

```bash
git pull origin <branch-release>
```

2. Rebuild image:

```bash
docker compose --env-file .env.docker build --pull
```

3. Masuk maintenance mode:

```bash
docker compose --env-file .env.docker exec app php artisan down
```

4. Start ulang container:

```bash
docker compose --env-file .env.docker up -d
```

5. Jalankan migration:

```bash
docker compose --env-file .env.docker exec app php artisan migrate --force
```

6. Rebuild cache dan restart queue:

```bash
docker compose --env-file .env.docker exec app php artisan optimize:clear
docker compose --env-file .env.docker exec app php artisan optimize
docker compose --env-file .env.docker exec app php artisan queue:restart
docker compose --env-file .env.docker restart worker scheduler
```

7. Keluar maintenance mode:

```bash
docker compose --env-file .env.docker exec app php artisan up
```

## 7. Backup Dan Restore

Backup database:

```bash
docker compose --env-file .env.docker exec postgres pg_dump -U djaitin djaitin > backups/djaitin-$(date +%Y%m%d-%H%M%S).sql
```

Backup uploaded files:

```bash
docker run --rm -v djaitin-app_app-storage:/data -v "$PWD/backups:/backups" alpine tar czf /backups/djaitin-storage-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
```

Restore database ke database kosong:

```bash
docker compose --env-file .env.docker exec -T postgres psql -U djaitin djaitin < backups/<file>.sql
```

Restore storage:

```bash
docker run --rm -v djaitin-app_app-storage:/data -v "$PWD/backups:/backups" alpine sh -c "tar xzf /backups/<file>.tar.gz -C /data"
```

## 8. Catatan Production

- Gunakan domain production pada `APP_URL`.
- Jangan commit `.env.docker`.
- Ganti `DB_PASSWORD` sebelum deploy.
- Jalankan `APP_DEBUG=false` di production.
- Letakkan TLS/SSL di reverse proxy host seperti Nginx, Caddy, Traefik, atau load balancer.
- Pastikan backup database dan volume `app-storage` berjalan rutin.
- Jangan menjalankan `migrate:fresh --seed` di production aktif.
