# Docker Setup untuk Affiliate Growth Hub

## 🐳 Cara Menggunakan Docker

### Prasyarat
- Docker Desktop terinstall (untuk Windows/Mac)
- Docker & Docker Compose (untuk Linux)

### Development Environment

1. **Jalankan aplikasi dengan database:**
```bash
npm run docker:dev
```

2. **Jalankan di background (detached mode):**
```bash
npm run docker:dev:detached
```

3. **Lihat logs:**
```bash
npm run docker:logs
```

4. **Hentikan semua container:**
```bash
npm run docker:down
```

### Environment Variables

Buat file `.env` dengan konfigurasi berikut:
```env
MONGODB_URI=mongodb://localhost:27017/affiliate-growth-hub
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### Database Containers

- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`

### Production Build

```bash
# Build image untuk production
npm run docker:build

# Jalankan container production
npm run docker:run
```

## 🔄 Volume Mounting

- Source code di-mount untuk hot reload
- `node_modules` terisolasi di container
- `.next` build cache di-mount

## 🌐 Akses Aplikasi

Setelah dijalankan, aplikasi akan accessible di:
- **Frontend**: http://localhost:3000
- **MongoDB**: mongodb://localhost:27017
- **Redis**: redis://localhost:6379

## 🐧 Penggunaan di Mac/Linux

Docker bekerja cross-platform, jadi setup sama untuk:
- Windows (dengan Docker Desktop)
- macOS (dengan Docker Desktop)
- Linux (native Docker)