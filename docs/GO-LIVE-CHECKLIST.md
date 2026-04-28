# Go-Live Checklist — MVP

## 1. Technical Readiness

- [ ] `.env` production sudah final
- [ ] `APP_URL` sesuai domain production
- [ ] database production aktif dan backup berjalan
- [ ] jika memakai Docker, `.env.docker` sudah final dan tidak masuk git
- [ ] jika memakai Docker, `docker compose --env-file .env.docker ps` semua service sehat
- [ ] `php artisan migrate --force` sukses
- [ ] `php artisan storage:link` sudah dibuat
- [ ] mail configuration untuk verify email sudah aktif
- [ ] asset terbaru sudah di-build dan ter-deploy
- [ ] permission folder storage dan cache benar

## 2. Product Readiness

- [x] flow customer: tailor, RTW, convection
- [x] flow office: order, payment, production, shipping
- [x] reports dan audit log
- [x] notifikasi customer
- [x] dokumen PDF dan export laporan

## 3. Verification Readiness

- [x] `php artisan test --compact`
- [x] `npm run build`
- [x] `npm run types:check`

## 4. Operational Readiness

- [ ] akun awal `admin`, `owner`, `kasir`, `produksi` sudah dibuat
- [ ] SOP verifikasi payment sudah disepakati
- [ ] SOP update production stage sudah disepakati
- [ ] SOP update shipment dan resi sudah disepakati
- [ ] PIC support saat minggu pertama go-live sudah ditentukan

## 5. Data Readiness

- [ ] daftar fabric awal sudah benar
- [ ] daftar garment model awal sudah benar
- [ ] daftar courier aktif sudah benar
- [ ] produk RTW aktif dan stok awal sudah valid
- [ ] discount policy awal sudah dicek

## 6. Launch Control

- [ ] mulai dari internal pilot
- [ ] lanjut ke customer terbatas
- [ ] review bug harian pada 7 hari pertama
- [ ] tetapkan SLA hotfix untuk issue critical
