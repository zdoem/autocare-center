# autocare-center
 Autocar Service Center ระบบบริหารจัดการ ศูนย์บริการรถยนต์ครบวงจร , อู่ขนาดกลาง , ร้านคาแคร์ หรือประยุกต์ใช้กับ ร้านซ่อมรถมอเตอร์ไซ์


 Viewed README.md:1-37
Created README.md
Ran command: `git add README.md && git commit -m "docs: add comprehensive project README with setup instructions and test suite details"`
Ran command: `git add README.md; git commit -m "docs: add comprehensive project README with setup instructions and test suite details"`

สร้างและอัปเดตไฟล์ **[README.md](file:///z:/Antigravity_workspace2/autocare-center/README.md)** สำหรับโครงการ **Autocar Service Center** เรียบร้อยแล้วครับ! 📘✨

---

## 📄 หัวข้อสำคัญใน README.md ที่สร้างขึ้น:

1. **🌟 คุณสมบัติเด่นของระบบ (Core Features):**
   - ระบบสิทธิ์และการยืนยันตัวตน (Role-based NextAuth.js)
   - แดชบอร์ดตามสายงาน (Admin, Technician, Cashier)
   - ระบบข้อมูลหลัก (HR, ลูกค้า, รถยนต์, อะไหล่, ผู้จัดจำหน่าย, บริการ)
   - ระบบปฏิบัติการศูนย์บริการ (Vehicle Intake Wizard, Service Job Workflow, Maintenance Recommendations, History & Search)
   - ระบบการเงินและแคชเชียร์ (การชำระเงิน, ออกใบเสร็จ `RCT-`, คำนวณ VAT 7%)
   - ระบบคลังสินค้าและอะไหล่ (สั่งซื้อ PO `PO-`, การรับสินค้า, ตัดสต็อกอัตโนมัติ, แจ้งเตือนสต็อกต่ำ)
   - ระบบรายงานเชิงวิเคราะห์ 8 ด้าน

2. **🛠️ เทคโนโลยีที่ใช้ (Tech Stack):**
   - Next.js 16 (App Router), React 19, TypeScript 5
   - PostgreSQL, Prisma ORM 6.19.2
   - NextAuth.js (Auth.js v5), Zod Schema Validation
   - Playwright Test Suite (Chromium & Direct APIRequestContext)

3. **🚀 ขั้นตอนการติดตั้งและรันโปรเจกต์ (Getting Started & Setup):**
   - การติดตั้ง dependencies (`npm install`)
   - การตั้งค่าไฟล์ `.env`
   - การทำ Database Migration & Data Seeding (`npx prisma migrate dev`, `npx prisma db seed`)
   - คำสั่งเปิดเซิร์ฟเวอร์ (`npm run dev`)

4. **🧪 คำสั่งรันชุดทดสอบอัตโนมัติ 188 รายการ (Test Suite Commands):**
   - `npx playwright test --project=api-tests` (Direct API Testing)
   - `npx playwright test --project=chromium` (UI E2E Testing)
   - `npx playwright test --project=chromium --project=api-tests` (Full Suite)

5. **📂 โครงสร้างโฟลเดอร์โครงการ (Directory Structure)**

---

บันทึกและ Commit โค้ดไฟล์ `README.md` ลงใน Git Commit `9e4e709` เรียบร้อยแล้วครับ!
