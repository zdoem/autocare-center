# Autocar Service Center - Operational Memory & Quick Start

## 🚗 Quick Commands
- **System Health Check:** `npm run check`
- **Development Server:** `npm run dev` (http://localhost:3000)
- **Database GUI:** `http://localhost:8080` (phpMyAdmin) or `npx prisma studio`
- **Seed Data:** `npx prisma db seed`

## 🗄️ Database Connection (MariaDB 11.8)
- **Database Engine:** MariaDB 11.8 (running in Docker container `autocare_mariadb` with volume `autocare_mariadb_data`)
- **Port:** `3306`
- **Database Name:** `db_autocar`
- **Credentials:** `mysql://root:P@ssw0rd@localhost:3306/db_autocar`
- **phpMyAdmin URL:** `http://localhost:8080` (User: `root`, Pass: `P@ssw0rd`)

## 📁 Key Routes & Modules
- Auth: `/login`, `/forgot-password`, `/reset-password`
- Operations: `/ops`
- Service: `/service`
- Cashier: `/cash`
- Inventory: `/inventory`
- Master Data: `/master`
- Reports: `/reports`
- Audit Logs: `/reports/audit-logs`
- API Usage & Health: `/reports/api-usage`
