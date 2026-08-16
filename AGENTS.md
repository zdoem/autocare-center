# Autocar Service Center - Operational Memory & Quick Start

## 🚗 Quick Commands
- **System Health Check:** `npm run check`
- **Development Server:** `npm run dev` (http://localhost:3000)
- **Database GUI:** `npx prisma studio`
- **Seed Data:** `npx prisma db seed`

## 🗄️ Database Connection
- **Port:** `5432`
- **Credentials:** `postgresql://pgadmin:P@ssw0rd@localhost:5432/db_autocar`
- **Container / Service:** Ensure Docker container or local PostgreSQL is running on port 5432 before starting dev server.

## 📁 Key Routes & Modules
- Auth: `/login`, `/forgot-password`, `/reset-password`
- Operations: `/ops`
- Service: `/service`
- Cashier: `/cash`
- Inventory: `/inventory`
- Master Data: `/master`
- Reports: `/reports`
