# Setup Development Environment

## Prerequisites

1. **Node.js** v20 atau lebih baru
2. **Docker Desktop** (untuk database)
   - Download: https://www.docker.com/products/docker-desktop
   - Install dan pastikan Docker sudah running

## Quick Start

### 1. Clone repository
```bash
git clone <repository-url>
cd lms
```

### 2. Install dependencies
```bash
cd backend
npm install
```

### 3. Start database dengan Docker
```bash
# Kembali ke root folder
cd ..

# Start PostgreSQL container
docker-compose up -d

# Tunggu ~10 detik sampai database ready
```

### 4. Setup database schema
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 5. Start development server
```bash
npm run dev
```

Server akan jalan di: http://localhost:3001

## Menjalankan Tests

```bash
cd backend
npm test
```

## Mematikan database
```bash
docker-compose down
```

## Troubleshooting

**Database tidak bisa connect:**
- Pastikan Docker Desktop sudah running
- Cek status container: `docker ps`
- Restart container: `docker-compose restart`

**Port 5433 sudah dipakai:**
- Ubah port di `docker-compose.yml` (misal ke 5434)
- Ubah juga di `backend/.env` file

**Reset database:**
```bash
docker-compose down -v
docker-compose up -d
cd backend
npx prisma migrate dev
npx prisma db seed
```
