# 🐳 Docker & PostgreSQL Deployment Guide

เอกสารคำแนะนำการเตรียมและขึ้นระบบ (Deployment Guide) สำหรับ **Autocar Service Center** ด้วย **Docker**, **docker-compose**, **PostgreSQL 15**, และ **pgAdmin 4**

---

## 📊 1. ภาพรวมสถาปัตยกรรม Docker Containers (Container Overview)

การขึ้นระบบด้วย `docker-compose` จะแบ่งประเภทจำนวน Container / Image ตามรูปแบบการใช้งาน:

| รูปแบบ | จำนวน Containers | รายชื่อ Containers / Services | เหมาะสำหรับ |
| :--- | :---: | :--- | :--- |
| **Minimal Stack** | **2** | `autocare_app` (Next.js), `autocare_db` (PostgreSQL) | Production แบบประหยัดทรัพยากร |
| **Complete Stack** | **3** | `autocare_app` (Next.js), `autocare_db` (PostgreSQL), `autocare_pgadmin` (pgAdmin 4) | **แนะนำสำหรับ Dev / Staging / Production** |
| **Enterprise Stack** | **4** | `autocare_app`, `autocare_db`, `autocare_pgadmin`, `autocare_nginx` (Reverse Proxy) | Production องค์กรขนาดใหญ่ที่มี SSL / Nginx |

---

## 🛠️ 2. ไฟล์กำหนดโครงสร้าง Docker (Docker Configuration Files)

### 2.1 Multi-Stage `Dockerfile` (สำหรับ Next.js 16 App)
สร้างไฟล์ `Dockerfile` ไว้ที่ Root Directory ของโปรเจกต์:

```dockerfile
# Step 1: Base image
FROM node:20-alpine AS base
WORKDIR /app

# Step 2: Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# Step 3: Builder (Compile Next.js & Prisma Client)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# Step 4: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

---

### 2.2 ไฟล์ `docker-compose.yml` ( Complete 3-Container Stack )
สร้างไฟล์ `docker-compose.yml` ไว้ที่ Root Directory ของโปรเจกต์:

```yaml
version: '3.8'

services:
  # 1. Next.js Web Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: autocare_app
    restart: always
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://pgadmin:P%40ssw0rd@db:5432/db_autocar?schema=public
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=autocar-super-secret-key-2026
    depends_on:
      db:
        condition: service_healthy

  # 2. PostgreSQL 15 Database
  db:
    image: postgres:15-alpine
    container_name: autocare_db
    restart: always
    environment:
      POSTGRES_USER: pgadmin
      POSTGRES_PASSWORD: P@ssw0rd
      POSTGRES_DB: db_autocar
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pgadmin -d db_autocar"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 3. pgAdmin 4 (Database Management Web GUI)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: autocare_pgadmin
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: P@ssw0rd
    ports:
      - "5050:80"
    depends_on:
      - db

volumes:
  postgres_data:
```

---

## 🚀 3. ขั้นตอนการขึ้นระบบด้วย Docker (Deployment Steps)

### Step 1: สั่ง Build และเริ่มต้น Containers
```bash
docker compose up -d --build
```

### Step 2: รัน Database Migration และ Seed ข้อมูลใน Docker Container
```bash
# รัน Prisma Migration
docker compose exec app npx prisma migrate deploy

# Seed ข้อมูลเริ่มต้น (พนักงาน, อะไหล่, รายการบริการ)
docker compose exec app npx prisma db seed
```

### Step 3: ตรวจสอบสถานะการทำงาน
```bash
# ตรวจสอบ Containers ที่รันอยู่
docker compose ps

# ดู Logs ของระบบ
docker compose logs -f app
```

---

## 🔗 4. สรุป URL การเข้าถึงแต่ละ Service

| Service | URL | ข้อมูลเข้าใช้งาน (Credentials) |
| :--- | :--- | :--- |
| **Next.js Web Application** | [http://localhost:3000](http://localhost:3000) | Username: `admin` / Password: `password123` |
| **pgAdmin 4 (Database GUI)** | [http://localhost:5050](http://localhost:5050) | Email: `admin@admin.com` / Password: `P@ssw0rd` |
| **PostgreSQL Database** | `localhost:5432` | User: `pgadmin` / Password: `P@ssw0rd` / DB: `db_autocar` |

---

## 📦 5. การสำรองข้อมูล (Database Backup & Restore)

### การสำรองข้อมูล (Backup Database)
```bash
docker compose exec db pg_dump -U pgadmin db_autocar > backup_$(date +%Y%m%d).sql
```

### การนำเข้าข้อมูลสำรอง (Restore Database)
```bash
cat backup_YYYYMMDD.sql | docker compose exec -T db psql -U pgadmin -d db_autocar
```
