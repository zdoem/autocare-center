# $ralph + OMX

คุณคือ Senior Fullstack Engineer สำหรับโปรเจกต์ **Autocar Service Center**

**Stack:** Next.js App Router · React · TypeScript · Tabler UI · SweetAlert2 · Prisma ORM / PostgreSQL · NextAuth.js

**Goal:** Implement รายงานทั้งหมด 11 รายการ ตาม Mockup ให้สมบูรณ์ เชื่อมข้อมูลจริงจาก Prisma

---

## รายการรายงานทั้งหมด (adminNav.ts)

| # | Menu Label | URL | Status |
|---|-----------|-----|--------|
| 1 | สรุปรายวัน | `/reports/daily` | ✅ Done |
| 2 | สรุปรายเดือน | `/reports/monthly` | ✅ Done |
| 3 | งานวันนี้ | `/reports/jobs-today` | ✅ Done |
| 4 | รับชำระ | `/reports/payment` | ✅ Done |
| 5 | สรุปบริการ | `/reports/service` | ✅ Done |
| 6 | ผลงานช่าง | `/reports/technician` | ✅ Done |
| 7 | Stock คงเหลือ | `/reports/stock` | ✅ Done |
| 8 | ลูกค้า | `/reports/customer` | ✅ Done |
| 9 | การสั่งซื้อ (PO) | `/reports/purchase` | ✅ Done |
| 10 | ค่าใช้จ่าย/ต้นทุน | `/reports/expense` | ✅ Done |
| 11 | ลูกค้า Top | `/reports/top-customer` | ✅ Done |

---

## กลุ่มที่ 1 — Operations Reports (รายงานงานซ่อม)

---

### 📅 R01 — สรุปรายวัน (`/reports/daily`)

**Mockup:** `rpt-daily.html` | **Filter:** Date Picker

**วัตถุประสงค์:** ดูภาพรวมรายได้และค่าใช้จ่ายประจำวัน สำหรับผู้จัดการและแคชเชียร์

**UI Layout:**
- Summary Cards 4 ใบ: รายได้วันนี้ (เขียว) / ค่าใช้จ่าย (แดง) / งานซ่อม (น้ำเงิน) / ใบเสร็จ (azure)
- Layout 6:6 — ตาราง "รายได้" (ค่าบริการ/อะไหล่/แรง) | ตาราง "ค่าใช้จ่าย" (PO/สาธารณูปโภค/อื่นๆ)
- ตาราง "สรุปการรับชำระ": Job No, ทะเบียน, ลูกค้า, วิธีชำระ, ยอด, เวลา

**Data Source:** `GET /api/reports/daily?date=YYYY-MM-DD`
- Query: `ServiceJob` (isPaid=true, jobDate=วันนั้น)
- Query: `Payment` group by paymentType
- Query: `Purchase` (purchaseDate=วันนั้น) → ค่าใช้จ่าย

**Files:** `api/reports/daily/route.ts` · `reports/daily/page.tsx`

---

### 📆 R02 — สรุปรายเดือน (`/reports/monthly`)

**Mockup:** `rpt-monthly.html` | **Filter:** Dropdown เดือน-ปี (12 เดือน)

**วัตถุประสงค์:** วิเคราะห์รายได้รายเดือนแบบละเอียดรายวัน พร้อมกราฟและสัดส่วน

**UI Layout:**
- Report Header: ชื่อบริษัท/ที่อยู่ (print-ready)
- Summary Cards 4 ใบ: รายได้รวม / ค่าใช้จ่าย / กำไรสุทธิ / งานซ่อม
- Chart Row 8:4 — CSS Bar Chart รายได้รายวัน | Progress Bar สัดส่วน (บริการ/อะไหล่/แรง)
- ตาราง: วันที่ / จำนวนงาน / ค่าบริการ / ค่าอะไหล่ / ค่าแรง / รวม (Row/วัน)

**Data Source:** `GET /api/reports/monthly?month=YYYY-MM`
- Group `ServiceJob` by วันที่ → รายได้รายวัน
- CSS Bar height = (ยอดวัน / ยอดสูงสุด) × 100%

**Files:** `api/reports/monthly/route.ts` · `reports/monthly/page.tsx`

---

### 🔧 R03 — งานวันนี้ (`/reports/jobs-today`)

**Mockup:** `rpt-jobs-today.html` | **Filter:** Date Picker (default: today)

**วัตถุประสงค์:** ติดตามสถานะงานซ่อมประจำวัน สำหรับหน้าร้านและช่าง

**UI Layout:**
- Badge แสดงวันที่ขนาดใหญ่
- Summary Cards 4 ใบ: ทั้งหมด / รอดำเนินการ (เหลือง) / กำลังซ่อม (azure) / เสร็จ (เขียว)
- ตาราง: #, Job No, ทะเบียน, ยี่ห้อ/รุ่น, ลูกค้า, งาน, ช่าง, สถานะ, เวลารับ
- สีแถว: เขียว=เสร็จ, ปกติ=รออื่นๆ

**Status Badge Map:**
```
RECEIVED/INSPECTION/WAITING_* → bg-yellow "รอ"
IN_PROGRESS/QC_CHECK          → bg-azure  "กำลังซ่อม"
COMPLETED/DELIVERED           → bg-green  "เสร็จ"
```

**Data Source:** `GET /api/reports/jobs-today?date=YYYY-MM-DD`
- Query: `ServiceJob` include `car.carBrand`, `car.carModel`, `car.customer`, `technician`

**Files:** `api/reports/jobs-today/route.ts` · `reports/jobs-today/page.tsx`

---

### 💳 R04 — รับชำระ (`/reports/payment`)

**Mockup:** `rpt-payment.html` | **Filter:** Date Picker

**วัตถุประสงค์:** รายงานการรับชำระเงินแยกตามวิธีชำระ สำหรับแคชเชียร์และผู้จัดการ

**UI Layout:**
- Summary Cards 4 ใบ: เงินสด (เขียว) / โอน/QR (น้ำเงิน) / บัตรเครดิต (ม่วง) / รวม (azure)
- ตาราง: เลขใบเสร็จ / ทะเบียน / ลูกค้า / รายการ / วิธีชำระ / ก่อน VAT / VAT / ยอดสุทธิ / เวลา / ผู้รับเงิน
- tfoot รวมยอดทุก column

**Payment Type Mapping:**
```
CASH        → bg-success "เงินสด"
TRANSFER/QR → bg-primary "โอน"
CREDIT_CARD → bg-purple  "บัตร"
```

**Data Source:** `GET /api/reports/payment?date=YYYY-MM-DD`
- Query: `Payment` include `paymentType`, `serviceJob.car.customer`, `serviceJob.user`

**Files:** `api/reports/payment/route.ts` · `reports/payment/page.tsx`

---

### 🛠️ R05 — สรุปบริการ (`/reports/service`)

**Mockup:** `rpt-service.html` | **Filter:** Dropdown เดือน

**วัตถุประสงค์:** วิเคราะห์บริการยอดนิยม Top 10 และรายได้แยกตามประเภทบริการ

**UI Layout:**
- Layout 8:4 — Progress Bar บริการยอดนิยม Top 10 | Summary Datagrid (งาน/รายได้ค่าบริการ/อะไหล่/แรง)
- ตาราง: #, ประเภทบริการ, จำนวน, รายได้บริการ, รายได้อะไหล่, รายได้ค่าแรง, รวม
- Progress width = (count / maxCount) × 100%

**Data Source:** `GET /api/reports/service?month=YYYY-MM`
- Query: `ServiceJobItem` (itemType=SERVICE) → group by service.name
- เรียง DESC by count → Top 10

**Files:** `api/reports/service/route.ts` · `reports/service/page.tsx`

---

### 👷 R06 — ผลงานช่าง (`/reports/technician`)

**Mockup:** `rpt-technician.html` | **Filter:** Dropdown เดือน

**วัตถุประสงค์:** ประเมินประสิทธิภาพช่างแต่ละคน — งาน, ชั่วโมง, ค่าแรง, completion rate

**UI Layout:**
- Performance Cards แต่ละช่าง: Avatar / ชื่อ-ตำแหน่ง / งาน-ชม-ค่าแรง / Progress Bar Rate
- Rank badge: #1=bg-warning, #2=bg-secondary, #3=bg-orange
- ตาราง: ช่าง, งานรับ, งานเสร็จ, งานค้าง, ชม., เฉลี่ย/งาน, Rate%, ค่าแรง

**Logic:**
```
completionRate = (completedJobs / totalJobs) × 100
avgHours      = totalHours / totalJobs
```

**Data Source:** `GET /api/reports/technician?month=YYYY-MM`
- Query: `ServiceJob` (technicianId != null) group by technicianId
- Include: `technician.position`, `laborRecords`

**Files:** `api/reports/technician/route.ts` · `reports/technician/page.tsx`

---

## กลุ่มที่ 2 — Inventory Reports (รายงานคลัง)

---

### 📦 R07 — Stock คงเหลือ (`/reports/stock`)

**Mockup:** `rpt-stock.html` | **Filter:** Dropdown หมวดหมู่ + Search

**วัตถุประสงค์:** ตรวจสอบสต๊อกอะไหล่ทั้งหมด พร้อมมูลค่ารวม และสถานะ

**UI Layout:**
- Summary Cards 4 ใบ: รายการทั้งหมด / ปกติ (เขียว) / ใกล้หมด (เหลือง) / หมด (แดง)
- ตาราง: รหัส, ชื่ออะไหล่, หมวด, คงเหลือ, Min, Max, ต้นทุน/หน่วย, มูลค่าคงเหลือ, สถานะ
- tfoot รวมมูลค่าคงเหลือ = Σ(currentStock × costPrice)

**Stock Status Logic:**
```
currentStock <= 0              → หมด    (bg-dark)
currentStock <= minStock       → ต่ำ    (bg-red)
currentStock <= minStock × 1.5 → ใกล้หมด (bg-yellow)
else                           → ปกติ   (bg-green)
```

**Data Source:** ♻️ ใช้ `GET /api/master/spare` เดิม (ไม่ต้องสร้าง API ใหม่)

**Files:** `reports/stock/page.tsx` (API เดิม)

---

### 🛒 R08 — การสั่งซื้อ (PO) (`/reports/purchase`)

**Mockup:** `rpt-purchase.html` | **Filter:** Dropdown เดือน (12 เดือน)

**วัตถุประสงค์:** ดูประวัติ Purchase Order ทั้งหมดในเดือนที่เลือก วิเคราะห์ค่าใช้จ่ายด้าน Inventory

**UI Layout:**
- Summary Cards 4 ใบ: จำนวน PO / มูลค่ารวม (แดง) / รับแล้ว (เขียว) / รอรับ (เหลือง)
- ตาราง: PO No, วันที่, Vendor, รายการ, ยอดรวม, สถานะ, วันที่รับ
- tfoot รวมมูลค่า

**Status Badge:**
```
RECEIVED  → bg-green "รับแล้ว"
PENDING   → bg-yellow "รอรับ"
CANCELLED → bg-secondary "ยกเลิก"
```

**Data Source:** `GET /api/inventory/purchase` (กรอง by month ใน client-side)
- Include: `vendor`, `items`

**Files:** `reports/purchase/page.tsx` (ใช้ API inventory เดิม)

---

### 💰 R09 — ค่าใช้จ่าย/ต้นทุน (`/reports/expense`)

**Mockup:** `rpt-expense.html` | **Filter:** Dropdown เดือน

**วัตถุประสงค์:** วิเคราะห์ต้นทุนรวมของศูนย์บริการ แยกตามหมวด 4 ประเภท

**UI Layout:**
- Summary ใหญ่: ค่าใช้จ่ายรวม + 4 หมวดพร้อม %
  - ค่าอะไหล่ (จาก Purchase) / เงินเดือน (จาก Employee) / ค่าน้ำ-ไฟ / อื่นๆ
- ตาราง ค่าสั่งซื้ออะไหล่ (PO list)
- ตาราง เงินเดือนพนักงาน (Employee list)
- ตาราง ค่าใช้จ่ายอื่นๆ (Static placeholder → เชื่อม SystemExpense ในอนาคต)

**สัดส่วน:**
```
%หมวด = (ยอดหมวด / รวมทั้งหมด) × 100
```

**Data Source:**
- `GET /api/inventory/purchase` → ค่าอะไหล่
- `GET /api/master/employee` → เงินเดือน
- Static data → ค่าน้ำ-ไฟ/อื่นๆ (รอ SystemExpense table)

**Files:** `reports/expense/page.tsx`

---

## กลุ่มที่ 3 — Customer Reports (รายงานลูกค้า)

---

### 👥 R10 — รายชื่อลูกค้า (`/reports/customer`)

**Mockup:** `rpt-customer.html` | **Filter:** Search + Dropdown ประเภท + Pagination

**วัตถุประสงค์:** ฐานข้อมูลลูกค้าทั้งหมด พร้อมสถิติการใช้บริการ

**UI Layout:**
- Summary Cards 4 ใบ: ลูกค้าทั้งหมด / VIP (เหลือง) / ลูกค้าใหม่เดือนนี้ (เขียว) / รถทั้งหมด (cyan)
- ตาราง: #, Avatar+รหัส, ชื่อ, โทร, Email, ประเภท, รถ, จำนวนครั้ง, ยอดสะสม, ล่าสุด
- Pagination 20 รายการ/หน้า

**Data Source:** `GET /api/reports/customer?search=&type=&page=`
- Query: `Customer` include `customerType`, `cars`, count `serviceJobs`
- Summary: VIP count, newThisMonth, totalCars

**Files:** `api/reports/customer/route.ts` · `reports/customer/page.tsx`

---

### 🏆 R11 — ลูกค้า Top (`/reports/top-customer`)

**Mockup:** `rpt-top-customer.html` | **Filter:** Period Buttons (เดือน/ไตรมาส/ปี)

**วัตถุประสงค์:** จัดอันดับลูกค้าที่ใช้บริการมากที่สุด ช่วงเวลาที่เลือก

**UI Layout:**
- Period Button Group: เดือน (30 วัน) / ไตรมาส (90 วัน) / ปี (365 วัน)
- Podium Cards Top 3: Avatar, ชื่อ, ยอดสะสม, จำนวนครั้ง, 🥇🥈🥉
- ตาราง Ranking Top 20: อันดับ, Avatar+ชื่อ, โทร, จำนวนครั้ง, ยอดสะสม, ประเภท
- สีแถว: #1=bg-warning-lt, #2=bg-secondary-lt, #3=bg-orange-lt

**Data Source:** `GET /api/reports/top-customer?period=month|quarter|year&limit=20`
- Query: `ServiceJob` (COMPLETED/DELIVERED, isPaid=true, ช่วงเวลา)
- Group by customerId → รวม grandTotal, นับ jobCount → Sort DESC

**Files:** `api/reports/top-customer/route.ts` · `reports/top-customer/page.tsx`

---

## API Summary Table

| API | Method | ไฟล์ | ใช้งานโดย |
|-----|--------|------|----------|
| `/api/reports/daily` | GET | `api/reports/daily/route.ts` | R01 |
| `/api/reports/monthly` | GET | `api/reports/monthly/route.ts` | R02 |
| `/api/reports/jobs-today` | GET | `api/reports/jobs-today/route.ts` | R03 |
| `/api/reports/payment` | GET | `api/reports/payment/route.ts` | R04 |
| `/api/reports/service` | GET | `api/reports/service/route.ts` | R05 |
| `/api/reports/technician` | GET | `api/reports/technician/route.ts` | R06 |
| `/api/master/spare` | GET | ♻️ API เดิม | R07 |
| `/api/inventory/purchase` | GET | ♻️ API เดิม | R08, R09 |
| `/api/master/employee` | GET | ♻️ API เดิม | R09 |
| `/api/reports/customer` | GET | `api/reports/customer/route.ts` | R10 |
| `/api/reports/top-customer` | GET | `api/reports/top-customer/route.ts` | R11 |

---

## Files Structure

```
src/app/
├── api/reports/
│   ├── daily/route.ts          ✅
│   ├── monthly/route.ts        ✅
│   ├── jobs-today/route.ts     ✅
│   ├── payment/route.ts        ✅
│   ├── service/route.ts        ✅
│   ├── technician/route.ts     ✅
│   ├── customer/route.ts       ✅
│   └── top-customer/route.ts   ✅
└── reports/
    ├── daily/page.tsx          ✅
    ├── monthly/page.tsx        ✅
    ├── jobs-today/page.tsx     ✅
    ├── payment/page.tsx        ✅
    ├── service/page.tsx        ✅
    ├── technician/page.tsx     ✅
    ├── stock/page.tsx          ✅
    ├── customer/page.tsx       ✅
    ├── purchase/page.tsx       ✅
    ├── expense/page.tsx        ✅
    └── top-customer/page.tsx   ✅
```

---

## Workflow Diagram

```
User เลือก Filter
      │
      ▼
Page ส่ง fetch() → API Route
      │
      ▼
Prisma Query ฐานข้อมูล PostgreSQL
      │
      ▼
Process: Group / Sort / Calculate
      │
      ▼
Return JSON { success, data }
      │
      ▼
Page แสดงผล: Summary Cards + Table
```

---

## Verification Checklist

| รายงาน | Test Point |
|--------|-----------|
| R01 สรุปรายวัน | ยอดรายได้ = ผลรวม grandTotal ของ Job วันนั้น |
| R02 สรุปรายเดือน | ยอดรวมเดือน = ผลรวม Daily rows |
| R03 งานวันนี้ | total = pending + inProgress + completed |
| R04 รับชำระ | ยอด CASH + TRANSFER + CARD = รวมทั้งหมด |
| R05 สรุปบริการ | บริการที่ 1 ต้อง Progress Bar = 100% |
| R06 ผลงานช่าง | completionRate = completedJobs/totalJobs × 100 |
| R07 Stock | มูลค่ารวม = Σ(currentStock × costPrice) |
| R08 สั่งซื้อ | PO แสดงตาม month filter ถูกต้อง |
| R09 ค่าใช้จ่าย | ยอดรวม = อะไหล่ + เงินเดือน + สาธารณูปโภค + อื่นๆ |
| R10 ลูกค้า | search + filter + pagination ทำงานถูกต้อง |
| R11 ลูกค้า Top | Top3 Podium แสดงถูกอันดับ, period filter เปลี่ยนข้อมูล |
