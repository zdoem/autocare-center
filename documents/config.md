# Autocar Service Center — System Configuration & Operational Memory

> เอกสารบันทึกค่า Configuration, บัญชีผู้ใช้, ฐานข้อมูล และข้อมูล Master Data เพื่อการพัฒนาและทดสอบระบบ

---

## 🚗 1. ข้อมูลภาพรวมโครงการ (Project Overview)
- **Project Name:** Autocar Service Center (ระบบบริหารศูนย์บริการรถยนต์)
- **Root Directory:** `z:\Antigravity_workspace2\autocare-center`
- **Tech Stack:**
  - **Framework:** Next.js 16 (App Router)
  - **Frontend Library:** React 19, Tabler UI, SweetAlert2, React Hot Toast
  - **Language:** TypeScript 5
  - **ORM:** Prisma ORM 6
  - **Database:** PostgreSQL (Port: 5432)
  - **Authentication:** NextAuth.js (Auth.js v5) with JWT strategy

---

## 🗄️ 2. การตั้งค่าฐานข้อมูล (Database Configuration)
- **Database Engine:** PostgreSQL
- **Connection URL:** `postgresql://pgadmin:P@ssw0rd@localhost:5432/db_autocar`
- **Prisma Schema:** `prisma/schema.prisma`
- **Port:** `5432` (Start ผ่าน Docker Container หรือ PostgreSQL Local Service)

---

## 🔑 3. บัญชีผู้ใช้สำหรับการทดสอบ (User Accounts & Authentication)

ระบบรองรับการเข้าสู่ระบบผ่านทั้ง **Username** และ **Email** โดยใช้รหัสผ่านชุดใดชุดหนึ่งด้านล่าง:

| Username | Email | รหัสผ่าน (Password) | Role | ตำแหน่ง / แผนก |
|---|---|---|:---:|---|
| `admin` | `admin@autocar.com` | `admin123` หรือ `P@ssw0rd` | **ADMIN** | Manager / ฝ่ายบริหาร |
| `cashier` | `cashier@autocar.com` | `admin123` หรือ `P@ssw0rd` | **CASHIER** | Cashier / ฝ่ายการเงิน/ขาย |
| `tech` | `tech@autocar.com` | `admin123` หรือ `P@ssw0rd` | **TECHNICIAN** | Senior Technician / ฝ่ายบริการ |

---

## ⚙️ 4. คำสั่งสำคัญในการดูแลและทดสอบระบบ (Diagnostic & Running Commands)

```bash
# 1. ตรวจสอบสถานะการเชื่อมต่อ Database & ข้อมูลพื้นฐาน
npm run check

# 2. เริ่มต้นรัน Dev Server (http://localhost:3000)
npm run dev

# 3. สั่ง Seed ข้อมูล Master Data และ Sample Data เข้า Database
npx ts-node prisma/seed.ts

# 4. ตรวจสอบจำนวนข้อมูลในทุกตารางของ Database
npx ts-node prisma/check_data.ts

# 5. เปิด Prisma Studio เพื่อจัดการข้อมูลผ่าน GUI
npx prisma studio

# 6. รัน E2E Test ทั้งหมดด้วย Playwright
npx playwright test

# 7. รัน E2E Test เฉพาะ Chromium (Authenticated)
npx playwright test --project=chromium

# 8. รัน E2E Test เฉพาะไฟล์ที่ต้องการ
npx playwright test tests/e2e/auth/login.spec.ts
```

---

## 📊 5. สรุปข้อมูล Master Data & Sample Data ในระบบ

| ตาราง / โมดูล | จำนวนรายการ | รายละเอียดโดยสังเขป |
|---|:---:|---|
| **Users** | 3 บัญชี | Admin, Cashier, Technician |
| **Employees** | 3 คน | Admin User, Cashier Staff, Technician Somchai |
| **Departments** | 5 แผนก | บริหาร, บุคคล, ไอที, บริการ, การเงิน/ขาย |
| **Positions** | 5 ตำแหน่ง | Manager, HR Officer, IT Support, Senior Technician, Cashier |
| **Customer Types** | 5 ประเภท | VIP (ลด 10%), ทั่วไป, นิติบุคคล (ลด 15%), Fleet (ลด 20%), พนักงาน (ลด 25%) |
| **Customers** | 4 ราย | สมศักดิ์ พานทอง, วิภา สุขใจ, ประยุทธ์ มั่นคง, บริษัท สุขใจ จำกัด |
| **Car Brands** | 7 ยี่ห้อ | Toyota, Honda, Mazda, Nissan, Isuzu, Mitsubishi, Ford |
| **Car Models** | 9 รุ่น | Camry, Altis, Yaris, Revo, Civic, Accord, City, Mazda 3, D-Max |
| **Cars** | 3 คัน | กก 1234 (Toyota Camry), ขข 5678 (Honda Civic), คง 9999 (Isuzu D-Max) |
| **Service Categories** | 5 หมวดหมู่ | เครื่องยนต์ & เช็คระยะ, เบรก & ช่วงล่าง, ไฟ & แอร์, ยาง & ศูนย์ล้อ, ทั่วไป |
| **Services** | 15 บริการ | ถ่ายน้ำมันเครื่อง, เช็คระยะ, เปลี่ยนผ้าเบรก, ล้างแอร์, ตั้งศูนย์ ฯลฯ |
| **Spares Categories** | 5 หมวดหมู่ | น้ำมันหล่อลื่น, ไส้กรอง, ระบบเบรก, ระบบไฟ & แบตเตอรี่, สายพาน |
| **Spares** | 15 รายการ | น้ำมันเครื่องสังเคราะห์, กรองน้ำมัน, ผ้าเบรก Bendix, หัวเทียน, แบตเตอรี่ ฯลฯ |
| **Vendors** | 3 เจ้า | บจก.น้ำมันไทย หล่อลื่น, บจก.อะไหล่แท้ เซ็นเตอร์, Brake & Suspension Pro |
| **Payment Types** | 6 วิธี | เงินสด, โอนเงิน, QR PromptPay, บัตรเครดิต, บัตรเดบิต, เครดิต (วางบิล) |
| **Maintenance Templates** | 3 เทมเพลต | บำรุงรักษา 10,000 km, 20,000 km, 40,000 km |
| **Service Jobs** | 1 งาน | `SJ-2026-0001` (มี Labor, QC, Media, Quotation, Recommendations, Reminders) |

---

## 🗺️ 6. แผนผัง URL & API Endpoints สำคัญ

### 🌐 หน้าระบบ (Pages)
- **Login / Auth:** `/login`, `/forgot-password`, `/reset-password`
- **Dashboard:** `/dashboard`, `/dashboard-admin`, `/dashboard-cashier`, `/dashboard-technician`
- **Master Customers:** `/master/customer`, `/master/customer-type`, `/master/customer/[id]`
- **Master Vehicles:** `/master/car-brand`, `/master/car-model`, `/master/car`
- **Master Services & Spares:** `/master/service-category`, `/master/service`, `/master/spares-category`, `/master/spare`, `/master/vendor`
- **Master HR:** `/master/department`, `/master/position`, `/master/employee-type`, `/master/employee`
- **Operations & Billing:** `/ops/receive`, `/ops/search`, `/ops/job`, `/ops/billing`, `/ops/cash-receipt`, `/cash/pending`, `/cash/daily`
- **Inventory:** `/inventory/stock`, `/inventory/po`, `/inventory/receive`, `/inventory/movements`, `/inventory/alerts`
- **Reports (Module 11):** `/reports`, `/reports/daily-sales`, `/reports/monthly-sales`, `/reports/services`, `/reports/spares`, `/reports/technician-performance`, `/reports/customer-history`, `/reports/debtor-aging`, `/reports/tax-invoice-summary`, `/reports/car-brand-model`, `/reports/job-status`, `/reports/followup`, `/reports/repeat-customer`
- **Settings (Module 12):** `/settings`

---

## 🧪 7. สรุปสถานะการทดสอบระบบ E2E (Playwright E2E Testing Summary)

โครงสร้างไฟล์ทดสอบถูกจัดไว้อย่างเป็นระเบียบในโฟลเดอร์ `tests/`:

```
tests/
├── fixtures/
│   ├── auth.setup.ts          ← Global auth state setup (บันทึก token ไว้ที่ tests/.auth/admin.json)
│   ├── test-helpers.ts        ← Shared UI interaction helpers (Modal, Swal, Toast)
│   └── test-data.ts           ← Dynamic Test Data Generator
└── e2e/
    ├── auth/                  ← Login & Forgot Password (PASS 100%)
    ├── dashboard/             ← Admin, Cashier, Technician Dashboards (PASS 100%)
    ├── master/                ← 16 Master Data CRUD Pages (Table Pass 100%, Modal tuned)
    ├── ops/                   ← Job Workflow, Register, Search (Tuned & Ready)
    ├── cash/                  ← Payment & Daily Cash Reports (PASS 100%)
    ├── inventory/             ← Stock, PO, Receive, Movements, Alerts (PASS 100%)
    ├── reports/               ← 13 Reports pages (PASS 100%)
    └── settings/              ← System Settings (PASS 100%)
```

---
*บันทึกข้อมูลล่าสุด: 15 สิงหาคม 2026*
