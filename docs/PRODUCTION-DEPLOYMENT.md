# Panduan Deployment Production - Djaitin

## Quick Start (Deploy Pertama Kali)

```bash
# 1. Clone repository di server production
git clone https://github.com/nabiilnuryassar/djaitin.git
cd djaitin

# 2. Deploy dengan seeding data awal
APP_URL=https://domain-production.com APP_PORT=8000 ./scripts/deploy.sh --seed
```

## Prerequisites Server

### Minimum Requirements
- **Docker Engine**: 24+
- **Docker Compose**: v2
- **CPU**: 2 core
- **RAM**: 4 GB (2 GB untuk staging, 4 GB untuk production)
- **Disk**: 20 GB minimum
- **Port**: 8000 (atau port lain yang tersedia)

### Install Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Logout dan login kembali
```

## Deployment Step-by-Step

### 1. Setup Server

```bash
# Clone repository
git clone https://github.com/nabiilnuryassar/djaitin.git
cd djaitin

# Checkout branch production (jika berbeda dari main)
git checkout production
```

### 2. Configure Environment

```bash
# Copy template environment
cp .env.docker.example .env.docker

# Edit konfigurasi penting
nano .env.docker
```

**Konfigurasi yang WAJIB diubah:**

```env
APP_URL=https://domain-production.com
APP_PORT=8000
APP_DEBUG=false
APP_ENV=production

# Database (GUNAKAN PASSWORD KUAT!)
DB_PASSWORD=your_strong_password_here

# Optional: Custom domain
# Jika pakai reverse proxy (Nginx/Caddy/Traefik), sesuaikan APP_URL
```

### 3. Generate Application Key

```bash
docker compose --env-file .env.docker run --rm app php artisan key:generate --show
```

Copy output `base64:...` ke `APP_KEY` di `.env.docker`

### 4. Deploy Aplikasi

#### Option A: Deploy Script (Recommended)

```bash
# Deploy pertama kali dengan seeding
./scripts/deploy.sh --seed

# Atau dengan custom domain
APP_URL=https://djaitin.com APP_PORT=8000 ./scripts/deploy.sh --seed
```

#### Option B: Manual Deploy

```bash
# Build Docker image
docker compose --env-file .env.docker build --pull

# Start containers
docker compose --env-file .env.docker up -d

# Run migrations
docker compose --env-file .env.docker exec app php artisan migrate --force

# Seed data awal (HANYA untuk deploy pertama)
docker compose --env-file .env.docker exec app php artisan db:seed --class=ProductionStarterSeeder --force

# Optimize Laravel
docker compose --env-file .env.docker exec app php artisan optimize

# Restart queue worker
docker compose --env-file .env.docker exec app php artisan queue:restart
docker compose --env-file .env.docker restart worker
```

### 5. Verify Deployment

```bash
# Check container status
docker compose --env-file .env.docker ps

# Check logs
docker compose --env-file .env.docker logs -f app nginx

# Test aplikasi
curl http://localhost:8000
```

**Expected Output:**
- Semua container status: `Up` atau `running`
- Aplikasi accessible di `http://localhost:8000`
- No error logs critical

## Setup SSL/TLS (Production)

Djaitin tidak include SSL langsung. Gunakan reverse proxy:

### Option 1: Caddy (Automatic HTTPS)

```caddyfile
# /etc/caddy/Caddyfile
djaitin.com {
    reverse_proxy localhost:8000
}
```

```bash
sudo systemctl restart caddy
```

### Option 2: Nginx + Let's Encrypt

```nginx
# /etc/nginx/sites-available/djaitin
server {
    listen 80;
    server_name djaitin.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name djaitin.com;

    ssl_certificate /etc/letsencrypt/live/djaitin.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/djaitin.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo certbot --nginx -d djaitin.com
sudo systemctl restart nginx
```

### Option 3: Traefik (Docker Native)

Lihat `docs/DEPLOYMENT-RUNBOOK.md` untuk konfigurasi Traefik.

## Update/Redeploy

### Standard Update

```bash
# Pull latest code
git pull origin production

# Deploy dengan script
./scripts/deploy.sh
```

### Manual Update

```bash
git pull origin production

# Maintenance mode
docker compose --env-file .env.docker exec app php artisan down

# Rebuild
docker compose --env-file .env.docker build --pull
docker compose --env-file .env.docker up -d

# Migrate
docker compose --env-file .env.docker exec app php artisan migrate --force

# Clear cache & restart queue
docker compose --env-file .env.docker exec app php artisan optimize:clear
docker compose --env-file .env.docker exec app php artisan optimize
docker compose --env-file .env.docker exec app php artisan queue:restart
docker compose --env-file .env.docker restart worker

# Exit maintenance
docker compose --env-file .env.docker exec app php artisan up
```

## Backup & Restore

### Backup Database

```bash
# Manual backup
docker compose --env-file .env.docker exec postgres pg_dump -U djaitin djaitin > backups/djaitin-$(date +%Y%m%d-%H%M%S).sql

# Automated backup (cron)
0 2 * * * cd /path/to/djaitin && docker compose --env-file .env.docker exec postgres pg_dump -U djaitin djaitin | gzip > backups/djaitin-$(date +\%Y\%m\%d).sql.gz
```

### Backup Storage (Upload Files)

```bash
docker run --rm \
  -v djaitin-app_app-storage:/data \
  -v "$PWD/backups:/backups" \
  alpine tar czf /backups/djaitin-storage-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
```

### Restore Database

```bash
docker compose --env-file .env.docker exec -T postgres psql -U djaitin djaitin < backups/djaitin-20240115-120000.sql
```

### Restore Storage

```bash
docker run --rm \
  -v djaitin-app_app-storage:/data \
  -v "$PWD/backups:/backups" \
  alpine sh -c "tar xzf /backups/djaitin-storage-20240115-120000.tar.gz -C /data"
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose --env-file .env.docker logs app

# Check container status
docker compose --env-file .env.docker ps

# Restart all
docker compose --env-file .env.docker down
docker compose --env-file .env.docker up -d
```

### Database Connection Failed

```bash
# Check postgres container
docker compose --env-file .env.docker logs postgres

# Verify database credentials
docker compose --env-file .env.docker exec app php artisan tinker
>>> DB::connection()->getPdo();

# Reset database (DESTRUCTIVE!)
docker compose --env-file .env.docker exec app php artisan migrate:fresh --seed
```

### 500 Internal Server Error

```bash
# Check Laravel logs
docker compose --env-file .env.docker exec app tail -f storage/logs/laravel.log

# Clear all cache
docker compose --env-file .env.docker exec app php artisan optimize:clear

# Check file permissions
docker compose --env-file .env.docker exec app ls -la storage bootstrap/cache

# Fix permissions
docker compose --env-file .env.docker exec app chown -R www-data:www-data storage bootstrap/cache
```

### Queue Worker Not Processing Jobs

```bash
# Restart queue worker
docker compose --env-file .env.docker exec app php artisan queue:restart
docker compose --env-file .env.docker restart worker

# Check queue logs
docker compose --env-file .env.docker logs worker

# Check failed jobs
docker compose --env-file .env.docker exec app php artisan queue:failed
```

## Monitoring & Maintenance

### Health Check

```bash
# Application health
curl -f http://localhost:8000/up || exit 1

# Container health
docker compose --env-file .env.docker ps

# Database health
docker compose --env-file .env.docker exec app php artisan db:show
```

### Log Rotation

Tambahkan ke `docker-compose.yml`:

```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Scheduled Tasks

Cron job untuk maintenance:

```bash
# Backup database daily at 2 AM
0 2 * * * cd /path/to/djaitin && ./scripts/backup.sh

# Clear cache weekly
0 3 * * 0 cd /path/to/djaitin && docker compose --env-file .env.docker exec app php artisan optimize:clear
```

## Security Checklist

- [ ] `APP_DEBUG=false` di production
- [ ] Password database kuat dan unik
- [ ] SSL/TLS enabled (HTTPS)
- [ ] `.env.docker` tidak di-commit ke git
- [ ] Backup database otomatis aktif
- [ ] Firewall configured (only 80, 443 open)
- [ ] Regular security updates applied
- [ ] Access logs monitored

## Performance Optimization

### Enable OPcache

Sudah enabled by default di Dockerfile. Verify:

```bash
docker compose --env-file .env.docker exec app php -i | grep opcache
```

### Enable Redis Cache (Optional)

Tambahkan Redis service di `docker-compose.yml`:

```yaml
redis:
  image: redis:7-alpine
  restart: unless-stopped
  networks:
    - djaitin_net
```

Update `.env.docker`:

```env
CACHE_DRIVER=redis
REDIS_HOST=redis
```

### CDN for Assets

Update `APP_URL` di `.env.docker` untuk pakai CDN domain:

```env
APP_URL=https://cdn.djaitin.com
```

Atau gunakan Cloudflare/CloudFront.

## Scaling

### Horizontal Scaling

Untuk multiple instances:

1. Setup load balancer (Nginx/Traefik)
2. Share `storage` volume atau gunakan S3
3. Gunakan Redis untuk session/cache
4. Database eksternal (managed PostgreSQL)

### Vertical Scaling

Increase server resources:

```bash
# Stop containers
docker compose --env-file .env.docker down

# Increase server RAM/CPU (cloud provider console)

# Restart
docker compose --env-file .env.docker up -d
```

## Support

- **Documentation**: `docs/DOCKER-SETUP.md`
- **Runbook**: `docs/DEPLOYMENT-RUNBOOK.md`
- **Issues**: https://github.com/nabiilnuryassar/djaitin/issues

---

**Last Updated**: 2026-06-16
**Maintainer**: Djaitin Dev Team
