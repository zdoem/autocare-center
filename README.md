# 🚗 Autocar Service Center System

ระบบบริหารจัดการศูนย์บริการซ่อมบำรุงรถยนต์แบบครบวงจร (Full-Stack Auto Service Center Management System) พัฒนาด้วย Next.js 16 (App Router), React 19, TypeScript, PostgreSQL, Prisma ORM 6 และ Playwright Testing Suite

---

## 🌟 คุณสมบัติเด่นของระบบ (Core Features)

### 1. 🔐 ระบบยืนยันตัวตนและการเข้าถึง (Authentication & Role-Based Access)
- รองรับการเข้าใช้งานตามบทบาท (Admin, Manager, Technician, Cashier)
- ระบบจัดการสิทธิ์และความปลอดภัยด้วย NextAuth.js (Auth.js v5)

### 2. 📊 แดชบอร์ดและภาพรวมการทำงาน (Real-time Dashboards)
- แดชบอร์ดแสดง KPI ภาพรวม รายรับประจำวัน จำนวนงานซ่อมตามสถานะ และงานที่อยู่ระหว่างดำเนินการ
- มุมมองแยกตามสายงาน (Admin, Technician, Cashier Dashboard)

### 3. 📁 ระบบจัดการข้อมูลหลัก (Master Data Management)
- **ข้อมูลบุคลากร (HR):** แผนก (Department), ตำแหน่ง (Position), ประเภทพนักงาน (Employee Type), พนักงาน (Employee)
- **ข้อมูลลูกค้าและรถยนต์:** ประเภทลูกค้า (Customer Type), ลูกค้า (Customer), ยี่ห้อรถ (Car Brand), รุ่นรถ (Car Model), รถยนต์ (Vehicle)
- **ข้อมูลบริการและอะไหล่:** หมวดหมู่บริการ (Service Category), รายการบริการ (Service), หมวดหมู่อะไหล่ (Spares Category), รายการอะไหล่ (Spare), ผู้จัดจำหน่าย (Vendor), ช่องทางชำระเงิน (Payment Type)

### 4. 🛠️ ระบบปฏิบัติการศูนย์บริการ (Service Operations Workflow)
- **ระบบรับรถเข้าบริการ (Vehicle Intake Wizard):** บันทึกข้อมูลรถ เลขไมล์ อาการแจ้งซ่อม ตรวจเช็กรอบคัน (Inspection Checklist) และถ่ายภาพบันทึกสภาพรถ
- **ระบบติดตามสถานะงานซ่อม (Service Job Workflow):**  
  `RECEIVED` (รับรถ) ➔ `INSPECTION` (ตรวจเช็ก) ➔ `WAITING_APPROVAL` (รออนุมัติ) ➔ `IN_PROGRESS` (กำลังซ่อม) ➔ `WAITING_PARTS` (รออะไหล่) ➔ `QC_CHECK` (ตรวจคุณภาพ) ➔ `COMPLETED` (ซ่อมเสร็จสิ้น) ➔ `DELIVERED` (ส่งมอบรถ)
- **ระบบแนะนำรายการบำรุงรักษา (Maintenance Recommendations):** ประเมินรายการบำรุงรักษาอัตโนมัติตามระยะทาง (Km)
- **ระบบค้นหาและประวัติการซ่อม (Search & History):** ค้นหารถยนต์ ลูกค้า ทะเบียนรถ เบอร์โทรศัพท์ และดูประวัติการซ่อมย้อนหลัง

### 5. 💰 ระบบการเงินและแคชเชียร์ (Cashier & Financial Management)
- บันทึกการชำระเงินรองรับหลายช่องทาง (เงินสด, โอนเงิน, บัตรเครดิต)
- ออกใบเสร็จรับเงินอัตโนมัติ (`RCT-YYYYMM-XXXX`) พร้อมคำนวณภาษีมูลค่าเพิ่ม (VAT 7%)
- สรุปรายรับประจำวันและการปิดยอดแคชเชียร์

### 6. 📦 ระบบคลังสินค้าและอะไหล่ (Inventory Management)
- การสั่งซื้ออะไหล่จาก Vendor (`PO-YYMMDD-XXX`)
- การรับสินค้าเข้าคลัง และการตัดสต็อกอัตโนมัติเมื่อมีการใช้งานซ่อม
- ระบบบันทึกการเคลื่อนไหวสต็อก (Stock Movement IN / OUT / ADJUST)
- ระบบแจ้งเตือนอะไหล่สต็อกต่ำ (Low Stock Alert & Out of Stock Notification)

### 7. 📈 ระบบรายงานเชิงวิเคราะห์ (Analytics & Reports)
- รายงานรายรับประจำวัน (Daily Summary Report)
- รายงานรายรับประจำเดือน (Monthly Revenue Breakdown)
- รายงานการให้บริการตามหมวดหมู่ (Service Category Analytics)
- รายงานลูกค้าทรงคุณค่า (Top Customers & Customer Report)
- รายงานประสิทธิภาพช่างซ่อม (Technician Performance Stats)

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

| ส่วนประกอบ | เทคโนโลยีที่ใช้ |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript 5 |
| **Styling & UI Components** | Vanilla CSS Design System, Tabler UI Components, Modern CSS Glassmorphism |
| **Backend & API** | Next.js Route Handlers (`src/app/api/...`), Server Actions |
| **Database & ORM** | PostgreSQL 15+, Prisma ORM 6.19.2 |
| **Authentication** | NextAuth.js (Auth.js v5) / bcryptjs |
| **Form Validation** | Zod Schema Validation |
| **Automation & Testing** | Playwright Test Runner (UI E2E & Direct API Integration Suite) |

---

## ⚙️ ข้อกำหนดก่อนเริ่มใช้งาน (Prerequisites)

1. **Node.js:** v18.18.0 ขึ้นไป (แนะนำ Node.js v20 LTS)
2. **Database:** PostgreSQL Server 15+ (Listening on port `5432`)
3. **Package Manager:** npm (v9+)

---

## 🚀 การติดตั้งและตั้งค่าเริ่มต้น (Getting Started)

### 1. Clone Repository & Install Dependencies
```bash
cd autocare-center
npm install
```

### 2. Configure Environment Variables (`.env`)
สร้างไฟล์ `.env` ใน Root Directory:
```env
DATABASE_URL="postgresql://pgadmin:P@ssw0rd@localhost:5432/db_autocar?schema=public"
NEXTAUTH_URL="http://127.0.0.1:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"
```

### 3. Database Migration & Data Seeding
```bash
# รัน Database Migration
npx prisma migrate dev --name init

# Seed ข้อมูลเริ่มต้น (ผู้ใช้งานเริ่มต้น, แผนก, ตำแหน่ง, อะไหล่, รายการบริการ)
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ `http://127.0.0.1:3000`

---

## 🧪 การทดสอบอัตโนมัติ (Automated Testing Suite)

โครงการนี้มีชุดทดสอบครอบคลุม **188 Test Cases** (100% Pass Rate):

```bash
# 1. รันการทดสอบระบบ Direct API ทั้งหมด (124 Cases)
npx playwright test --project=api-tests

# 2. รันการทดสอบหน้าจอ UI E2E ทั้งหมด (64 Cases)
npx playwright test --project=chromium

# 3. รันการทดสอบภาพรวมทั้งระบบ (188 Cases)
npx playwright test --project=chromium --project=api-tests
```

ดูรายงานสรุปการทดสอบฉบับเต็มได้ที่ [`documents/E2E_TEST_SUMMARY.md`](./documents/E2E_TEST_SUMMARY.md)

---

## 📂 โครงสร้างโฟลเดอร์โครงการ (Directory Structure)

```
autocare-center/
├── documents/                # เอกสารสรุปการทดสอบและสถาปัตยกรรมระบบ
├── prisma/
│   ├── schema.prisma         # Prisma Data Model & Enums
│   └── seed.ts               # Database Initial Seed Script
├── public/                   # Static Assets & Images
├── src/
│   ├── app/                  # Next.js App Router (Pages & API Routes)
│   │   ├── (auth)/           # Pages: Login, Forgot Password
│   │   ├── api/              # API Endpoints (/master, /ops, /cash, /inventory, /reports)
│   │   ├── cash/             # Cashier & Payment Pages
│   │   ├── inventory/        # Stock & PO Pages
│   │   ├── master/           # Master Data CRUD Pages
│   │   ├── ops/              # Vehicle Intake & Service Job Pages
│   │   └── reports/          # Report Pages
│   ├── components/           # UI Components & Layouts
│   ├── lib/                  # Database, Auth, Utils & Zod Validations
│   └── middleware.ts         # Authentication Middleware
├── tests/
│   ├── api/                  # Direct API Integration Spec Files (124 cases)
│   ├── e2e/                  # UI End-to-End Spec Files (64 cases)
│   └── fixtures/             # Test Data & API Helpers
├── playwright.config.ts      # Playwright Configuration
└── package.json
```

---

## 📝 ลิขสิทธิ์และการดูแลรักษา (Maintainers)

- **Project Name:** Autocar Service Center
- **Development Team:** AutoCare Software Team
- **License:** MIT License
