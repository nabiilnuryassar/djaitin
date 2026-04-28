# Deployment Runbook — Djaitin Production Server

## 1. Tujuan

Runbook ini menjadi panduan deploy Djaitin ke server production/staging. Jalur utama yang direkomendasikan adalah Docker Compose karena dependency PHP, Nginx, PostgreSQL, queue worker, dan scheduler sudah distandarkan di repo.

Referensi detail Docker ada di [DOCKER-SETUP.md](./DOCKER-SETUP.md).

Deploy utama di server dapat dijalankan dengan satu command:

```bash
APP_URL=https://domain-production.com APP_PORT=8000 ./scripts/deploy.sh --seed
```

Gunakan `--seed` hanya pada first deployment. Untuk update release berikutnya cukup jalankan:

```bash
./scripts/deploy.sh
```

## 2. Arsitektur Deployment

```text
Internet
  |
  | HTTPS
  v
Reverse Proxy Host / Load Balancer
  |
  | HTTP internal port APP_PORT
  v
Docker nginx -> Docker app PHP-FPM -> PostgreSQL
                         |
                         +-> worker queue
                         +-> scheduler
```

Komponen:

- `nginx`: menerima HTTP internal dan meneruskan request PHP ke `app`.
- `app`: menjalankan Laravel PHP-FPM.
- `postgres`: database utama.
- `worker`: memproses queue berbasis database.
- `scheduler`: menjalankan Laravel scheduler setiap 60 detik.

## 3. Requirement Server

Minimal staging:

- Ubuntu 22.04/24.04 LTS atau distro Linux setara
- Docker Engine 24+
- Docker Compose v2
- RAM 2 GB
- Disk 20 GB

Rekomendasi production:

- RAM 4 GB+
- Disk 50 GB+ tergantung volume upload
- backup database harian
- backup storage harian
- reverse proxy dengan SSL
- monitoring log dan disk usage

## 4. Environment Production

Buat file env:

```bash
cp .env.docker.example .env.docker
```

Nilai wajib diganti:

```env
APP_NAME=Djaitin
APP_ENV=production
APP_DEBUG=false
APP_URL=https://domain-production.com
APP_PORT=8000

DB_DATABASE=djaitin
DB_USERNAME=djaitin
DB_PASSWORD=<password-kuat>

MAIL_MAILER=smtp
MAIL_HOST=<smtp-host>
MAIL_PORT=587
MAIL_USERNAME=<smtp-user>
MAIL_PASSWORD=<smtp-password>
MAIL_FROM_ADDRESS=no-reply@domain-production.com
MAIL_FROM_NAME="${APP_NAME}"
```

Generate `APP_KEY`:

```bash
docker compose --env-file .env.docker run --rm app php artisan key:generate --show
```

Salin output ke `APP_KEY` di `.env.docker`.

## 5. First Deployment

### Jalur Satu Command

1. Clone repo dan masuk ke folder aplikasi:

```bash
git clone <repo-url> djaitin-app
cd djaitin-app
```

2. Jalankan deploy awal:

```bash
APP_URL=https://domain-production.com APP_PORT=8000 ./scripts/deploy.sh --seed
```

Script akan membuat `.env.docker` jika belum ada, generate `APP_KEY`, generate `DB_PASSWORD` jika masih default/kosong, build image, start service, menjalankan migration, menjalankan `ProductionStarterSeeder`, optimize Laravel, dan restart worker/scheduler.

Catat credential starter yang muncul di console, lalu ganti password setelah login pertama.

### Jalur Manual

Gunakan jalur manual jika perlu debugging per langkah atau environment server membutuhkan proses deploy khusus.

1. Clone repo:

```bash
git clone <repo-url> djaitin-app
cd djaitin-app
```

2. Siapkan `.env.docker` sesuai section environment.

3. Build image:

```bash
docker compose --env-file .env.docker build --pull
```

4. Start service:

```bash
docker compose --env-file .env.docker up -d
```

5. Jalankan migration:

```bash
docker compose --env-file .env.docker exec app php artisan migrate --force
```

6. Jalankan starter seeder untuk akun internal dan master data awal:

```bash
docker compose --env-file .env.docker exec app php artisan db:seed --class=ProductionStarterSeeder --force
```

Catat credential yang muncul, lalu ganti password setelah login pertama.

7. Optimize Laravel:

```bash
docker compose --env-file .env.docker exec app php artisan optimize
```

8. Validasi:

```bash
docker compose --env-file .env.docker ps
docker compose --env-file .env.docker logs --tail=100 app
docker compose --env-file .env.docker logs --tail=100 nginx
```

## 6. Reverse Proxy Dan SSL

Container `nginx` expose port dari `APP_PORT`, default `8000`. Di production, pasang reverse proxy host untuk HTTPS.

Contoh Nginx host:

```nginx
server {
    listen 80;
    server_name domain-production.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name domain-production.com;

    ssl_certificate /etc/letsencrypt/live/domain-production.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/domain-production.com/privkey.pem;

    client_max_body_size 25m;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

Pastikan `APP_URL=https://domain-production.com`.

## 7. Release Update

Jalur rekomendasi untuk update release:

```bash
cd /path/to/djaitin-app
./scripts/deploy.sh
```

Jika source sudah di-pull oleh CI/CD atau proses lain:

```bash
./scripts/deploy.sh --no-pull
```

Jika hanya ingin restart dan optimize tanpa build image:

```bash
./scripts/deploy.sh --no-build
```

Langkah manual di bawah ini tetap tersedia sebagai fallback.

1. Masuk folder repo:

```bash
cd /path/to/djaitin-app
```

2. Pull release terbaru:

```bash
git pull origin <release-branch>
```

3. Build image baru:

```bash
docker compose --env-file .env.docker build --pull
```

4. Masuk maintenance mode:

```bash
docker compose --env-file .env.docker exec app php artisan down
```

5. Restart service dengan image baru:

```bash
docker compose --env-file .env.docker up -d
```

6. Jalankan migration:

```bash
docker compose --env-file .env.docker exec app php artisan migrate --force
```

7. Rebuild cache:

```bash
docker compose --env-file .env.docker exec app php artisan optimize:clear
docker compose --env-file .env.docker exec app php artisan optimize
```

8. Restart worker dan scheduler:

```bash
docker compose --env-file .env.docker exec app php artisan queue:restart
docker compose --env-file .env.docker restart worker scheduler
```

9. Keluar maintenance mode:

```bash
docker compose --env-file .env.docker exec app php artisan up
```

## 8. Post-Deploy Validation

Customer:

- landing page terbuka
- login/register berjalan
- dashboard `/app` terbuka
- tailor configurator bisa submit dengan DP minimal 50%
- katalog dan checkout RTW berjalan
- convection request berjalan
- pembayaran transfer bisa upload bukti

Office:

- login staff berjalan
- dashboard `/office` terbuka
- order detail bisa dibuka
- payment transfer bisa verify/reject
- production board bisa update stage
- shipping bisa update resi/status
- nota dan kwitansi bisa diunduh
- laporan bisa export

Command tambahan:

```bash
docker compose --env-file .env.docker exec app php artisan about
docker compose --env-file .env.docker exec app php artisan queue:failed
```

## 9. Backup

Buat folder backup:

```bash
mkdir -p backups
```

Backup database:

```bash
docker compose --env-file .env.docker exec postgres pg_dump -U djaitin djaitin > backups/djaitin-$(date +%Y%m%d-%H%M%S).sql
```

Backup storage:

```bash
docker run --rm -v djaitin-app_app-storage:/data -v "$PWD/backups:/backups" alpine tar czf /backups/djaitin-storage-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
```

Rekomendasi:

- backup database harian
- backup storage harian
- simpan backup minimal di storage terpisah dari server utama
- test restore minimal sebelum go-live

## 10. Rollback

Rollback code:

```bash
git checkout <tag-atau-commit-stabil>
docker compose --env-file .env.docker build
docker compose --env-file .env.docker up -d
docker compose --env-file .env.docker exec app php artisan optimize:clear
docker compose --env-file .env.docker exec app php artisan optimize
```

Jika migration sudah mengubah data secara destruktif, rollback code saja tidak cukup. Restore database dari backup terakhir yang valid.

## 11. Security Checklist

- `APP_DEBUG=false`
- `.env.docker` tidak masuk git
- password database kuat
- akun starter sudah diganti password
- domain memakai HTTPS
- folder backup tidak berada di public web root
- server firewall hanya membuka port yang diperlukan
- akses SSH memakai key, bukan password
- backup rutin diuji restore

## 12. Troubleshooting Deployment

### Halaman 500 setelah deploy

Command:

```bash
docker compose --env-file .env.docker logs --tail=200 app
docker compose --env-file .env.docker exec app php artisan optimize:clear
```

Cek:

- `.env.docker`
- koneksi database
- `APP_KEY`
- permission `storage` dan `bootstrap/cache`

### Asset tidak berubah

Rebuild image:

```bash
docker compose --env-file .env.docker build --no-cache nginx app
docker compose --env-file .env.docker up -d
```

### Queue tidak memproses notifikasi

Command:

```bash
docker compose --env-file .env.docker logs --tail=200 worker
docker compose --env-file .env.docker exec app php artisan queue:restart
docker compose --env-file .env.docker restart worker
```

### Upload file gagal

Cek:

- `FILESYSTEM_DISK=public`
- volume `app-storage`
- batas upload Nginx/PHP 25 MB
- folder `storage/app/public`
