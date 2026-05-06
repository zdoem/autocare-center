# $ralph + OMX

คุณคือ Senior Fullstack Engineer สำหรับโปรเจกต์ Autocar Service Center

Stack:
- Next.js App Router
- React / TypeScript
- Tabler UI
- SweetAlert2
- Next.js API Routes
- Zod
- PostgreSQL / Prisma ORM
- NextAuth.js

Goal:
สร้างระบบคลังอะไหล่ (Inventory Module) จำนวน 3 หน้า ให้ครบสมบูรณ์และตรงตาม Mockup พร้อมเชื่อมต่อกับฐานข้อมูลจริงผ่าน Prisma

---

## Implementation Plan

### หน้าที่ 1 — รายการ Stock (`/inventory/stock`)

**Mockup Reference:** `inv-stock.html`

**UI Components:**
- Page Header + ปุ่ม "รับสินค้าเข้า (PO)" และ "ประวัติความเคลื่อนไหว"
- Filter Bar: ช่องค้นหา (รหัส/ชื่ออะไหล่), Dropdown หมวดหมู่, Dropdown สถานะสต๊อก
- Card Header แสดงจำนวนรายการรวมและมูลค่ารวมในคลัง
- ตารางรายการอะไหล่ พร้อมการไฮไลท์แถวตามสถานะ

**API ที่ใช้:**
- `GET /api/master/spare?search=&categoryId=&stockStatus=` (ใช้ API เดิมที่มีอยู่แล้ว)
- Query `stockStatus=low` (ใกล้หมด) หรือ `stockStatus=out` (หมด)

**Files:**
- [MODIFY] `src/app/api/master/spare/route.ts` — ไม่ต้องแก้ไข API เดิม ใช้ได้ทันที
- [NEW] `src/app/inventory/stock/page.tsx` — หน้า Dashboard Stock

---

### หน้าที่ 2 — สร้างใบสั่งซื้อ (`/inventory/purchase`)

**Mockup Reference:** `inv-purchase.html`

**UI Components:**
- Layout แบบ 8:4 (ฟอร์ม PO ด้านซ้าย, Summary Card ด้านขวา sticky)
- Card 1 — เลือก Vendor (Dropdown) + วันที่คาดรับ + Info Bar แสดงรายละเอียด Vendor
- Card 2 — ตารางรายการสั่งซื้อ (ช่องกรอกจำนวน + ราคา/หน่วย + รวม)
- Card 3 — ช่องหมายเหตุ
- Modal — ค้นหาและเลือกอะไหล่จากรายการ Spare ทั้งหมด
- Summary Card — เลขที่ PO (Auto-generate), จำนวนรายการ, ยอดก่อน VAT, VAT 7%, ยอดสุทธิ
- ปุ่ม: "บันทึก PO (รอรับ)" และ "รับสินค้าเข้า Stock ทันที"

**API ที่ใช้:**
- `GET /api/master/vendor` — ดึงรายชื่อ Vendor
- `GET /api/master/spare` — ดึงรายการอะไหล่สำหรับ Modal
- `POST /api/inventory/purchase` — สร้าง Purchase พร้อม Transaction

**Files:**
- [NEW] `src/app/api/inventory/purchase/route.ts`
- [NEW] `src/app/inventory/purchase/page.tsx`

---

### หน้าที่ 3 — ประวัติความเคลื่อนไหว (`/inventory/movement`)

**Mockup Reference:** `inv-movement.html`

**UI Components:**
- Summary Cards 3 ใบ: รับเข้า / เบิกออก / ปรับปรุง (จำนวนรายการ + รวมหน่วย)
- Filter Bar: ค้นหาชื่ออะไหล่/เลขอ้างอิง, กรองตามประเภท (IN/OUT/ADJUST/RETURN)
- ตารางประวัติ: วันที่-เวลา, ประเภท (Badge), รหัส/ชื่ออะไหล่, ก่อน, เปลี่ยน (+/-), หลัง, อ้างอิง, หมายเหตุ

**API ที่ใช้:**
- `GET /api/inventory/movement?movementType=&limit=100`

**Files:**
- [NEW] `src/app/api/inventory/movement/route.ts`
- [NEW] `src/app/inventory/movement/page.tsx`

---

## Database Schema (อ้างอิง Prisma)

```prisma
// อะไหล่ (Master Data)
model Spare {
  id            String  // Primary Key
  code          String  // รหัสอะไหล่ (SP001, SP002, ...)
  name          String  // ชื่ออะไหล่
  costPrice     Decimal // ราคาต้นทุน
  sellingPrice  Decimal // ราคาขาย
  minStock      Int     // จำนวนขั้นต่ำ (Reorder Point)
  maxStock      Int     // จำนวนสูงสุด
  currentStock  Int     // จำนวนคงเหลือ ← ตัวเลขนี้จะอัปเดตทุกครั้งมีการรับ/จ่าย
  reorderPoint  Int     // จุดสั่งซื้อ
  sparesCategoryId String?
  vendorId      String?
}

// ใบสั่งซื้อ (PO Header)
model Purchase {
  id           String         // Primary Key
  purchaseNo   String @unique // PO-YYMMDD-001
  vendorId     String         // FK → Vendor
  totalAmount  Decimal        // รวมก่อน VAT
  vat          Decimal        // อัตรา VAT (7)
  vatAmount    Decimal        // ยอด VAT
  grandTotal   Decimal        // ยอดสุทธิ
  status       PurchaseStatus // PENDING | RECEIVED | CANCELLED
  receivedDate DateTime?      // วันที่รับของจริง
  notes        String?
  items        PurchaseItem[]
}

// รายการใน PO
model PurchaseItem {
  purchaseId String
  spareId    String   // FK → Spare
  quantity   Decimal  // จำนวนที่สั่ง
  unitPrice  Decimal  // ราคาต้นทุน/หน่วย ณ เวลาซื้อ
  total      Decimal  // quantity * unitPrice
}

// ประวัติความเคลื่อนไหว (Audit Log)
model StockMovement {
  id           String       // Primary Key
  movementNo   String @unique
  movementDate DateTime
  movementType MovementType // IN | OUT | ADJUST | RETURN
  spareId      String       // FK → Spare
  quantity     Decimal      // จำนวนที่เปลี่ยนแปลง
  beforeQty    Int          // สต๊อกก่อนเปลี่ยน
  afterQty     Int          // สต๊อกหลังเปลี่ยน
  reference    String?      // เลขอ้างอิง (PO Number, Job No, ...)
  notes        String?
}
```

---

## 📌 Workflow Logic แต่ละหน้า

### 1. หน้า Dashboard สต๊อกสินค้า (`/inventory/stock`)

หน้าจอนี้ทำหน้าที่เป็น **"ศูนย์ควบคุมคลัง"** ให้เจ้าหน้าที่คลังสินค้าเห็นภาพรวมทันที

**Workflow การแสดงผล:**
1. เมื่อเข้าหน้า ระบบเรียก `GET /api/master/spare` ดึงรายการอะไหล่ทั้งหมด
2. API คืนค่าพร้อมฟิลด์เสริม `isLowStock` และ `isOutOfStock` ที่คำนวณมาแล้ว:
   - `isLowStock = currentStock < minStock && currentStock > 0` → แถวสีเหลือง Badge "ใกล้หมด"
   - `isOutOfStock = currentStock === 0` → แถวสีแดง Badge "หมด"
3. ระบบคำนวณ **มูลค่ารวมในคลัง** = ผลรวม `(currentStock × costPrice)` ของทุกรายการ
4. ฟิลเตอร์ทำงานแบบ Reactive (ค้นหาตาม search + categoryId + stockStatus)

**Business Logic ที่สำคัญ:**
```
ถ้า currentStock = 0         → สถานะ "หมด"     (bg-dark)
ถ้า currentStock <= minStock  → สถานะ "ใกล้หมด" (bg-yellow)
ถ้า currentStock > minStock   → สถานะ "ปกติ"    (bg-green)
```

---

### 2. หน้าสร้างใบสั่งซื้อ/รับสินค้าเข้า (`/inventory/purchase`)

หน้าจอนี้ใช้สำหรับ **"การนำอะไหล่เข้าคลัง"** ทุกรูปแบบ โดยมี 2 โหมดหลัก

**โหมดที่ 1: บันทึก PO รอรับ (status: `PENDING`)**
1. แคชเชียร์สั่งอะไหล่จาก Vendor แต่ของยังไม่มาถึง
2. กรอก Vendor + รายการสินค้า + วันที่คาดรับ
3. กด **"บันทึก PO (รอรับ)"** → สร้างเอกสาร PO ไว้ในระบบ
4. `currentStock` ยังไม่เปลี่ยนแปลง เพราะของยังไม่มา

**โหมดที่ 2: รับสินค้าเข้า Stock ทันที (status: `RECEIVED`)**
1. ของมาถึงพร้อมกัน กรอกข้อมูลและกด **"รับสินค้าเข้า Stock ทันที"**
2. API Backend ทำ **1 Prisma Transaction** พร้อมกัน 3 ขั้นตอน:
   ```
   ขั้น 1: สร้างใบ Purchase + PurchaseItem (บันทึกต้นทุน)
   ขั้น 2: UPDATE spare SET currentStock = currentStock + qty (สำหรับทุกรายการ)
   ขั้น 3: INSERT StockMovement (IN) พร้อมบันทึก beforeQty, afterQty
   ```
3. หากขั้นตอนใดล้มเหลว → Transaction Rollback ทั้งหมด (ไม่มีข้อมูลค้างในระบบ)
4. ระบบ Redirect กลับไปหน้า `/inventory/stock` พร้อมแสดง Toast แจ้งสำเร็จ

**Auto-Generate PO Number:**
```
รูปแบบ: PO-YYMMDD-SEQ
ตัวอย่าง: PO-260507-001 (วันที่ 07 พ.ค. 2026 ใบที่ 1)
```

---

### 3. หน้าประวัติความเคลื่อนไหว (`/inventory/movement`)

หน้าจอนี้เปรียบเสมือน **"Statement สมุดบัญชีคลัง"** บันทึกทุกการเข้า-ออกของอะไหล่

**ประเภทการเคลื่อนไหว (MovementType):**

| ประเภท | สี | เกิดขึ้นเมื่อ | ผลต่อ currentStock |
|--------|----|--------------|-------------------|
| `IN` | 🟢 เขียว | รับสินค้าจากใบสั่งซื้อ (PO RECEIVED) | เพิ่มขึ้น |
| `OUT` | 🟠 ส้ม | ช่างเบิกอะไหล่ใช้ในงานซ่อม (Service Job) | ลดลง |
| `ADJUST` | ⚫ เทา | แอดมินปรับสต๊อกด้วยมือ (ตรวจนับสิ้นเดือน) | เพิ่มหรือลด |
| `RETURN` | 🔵 น้ำเงิน | คืนอะไหล่ที่เปิดแล้วไม่ได้ใช้กลับเข้าคลัง | เพิ่มขึ้น |

**ฟิลด์สำคัญในแต่ละ Log:**
- `beforeQty` / `afterQty`: ยอดก่อน-หลัง เพื่อให้ตรวจสอบความถูกต้องได้
- `reference`: เลขอ้างอิง เช่น `PO-260507-001` หรือ `JOB-001234`
- `movementNo`: รหัส Log ที่ไม่ซ้ำกัน Format: `IN-PO-260507-001-{spareId_last4}`

**Business Rule:**
- `afterQty` ต้องตรงกับ `currentStock` ใน `Spare` ณ เวลานั้น
- หาก `afterQty` ไม่ตรง แสดงว่ามีการแก้ไขฐานข้อมูลโดยตรง (Red Flag ทุจริต)

---

## State Machine ภาพรวม Inventory Flow

```
[Vendor] ──สั่งซื้อ──► [Purchase PENDING]
                              │
                     ของมาถึง│
                              ▼
                    [Purchase RECEIVED]
                              │
               Prisma Transaction
               ┌──────────────┴─────────────┐
               ▼                             ▼
    [Spare.currentStock += qty]   [StockMovement IN created]
               │
               ▼
    [หน้า /inventory/stock อัปเดตยอด]
               │
               │──── ช่างเบิกใช้ (Service Job) ────►
               │                                    [Spare.currentStock -= qty]
               │                                    [StockMovement OUT created]
               │
               ▼
    [หน้า /inventory/movement แสดง Log ทั้งหมด]
```

---

## ไฟล์ที่สร้าง/แก้ไขทั้งหมด

| ไฟล์ | สถานะ | คำอธิบาย |
|------|--------|---------|
| `src/app/inventory/stock/page.tsx` | ✅ NEW | Dashboard สต๊อก + แจ้งเตือนสี |
| `src/app/inventory/purchase/page.tsx` | ✅ NEW | ฟอร์ม PO + Modal เลือกอะไหล่ |
| `src/app/inventory/movement/page.tsx` | ✅ NEW | ตาราง Stock Card + Summary Cards |
| `src/app/api/inventory/purchase/route.ts` | ✅ NEW | API POST สร้าง PO + Transaction |
| `src/app/api/inventory/movement/route.ts` | ✅ NEW | API GET ดึง StockMovement Log |
| `src/app/api/master/spare/route.ts` | ♻️ REUSE | ใช้ของเดิม ไม่แก้ไข |

---

## Verification Plan

1. **ทดสอบหน้า Stock** → ไปที่ `http://localhost:3000/inventory/stock`
   - ต้องเห็นรายการอะไหล่ทั้งหมด
   - อะไหล่ที่ `currentStock < minStock` ต้องขึ้น Badge "ใกล้หมด" สีเหลือง
   - อะไหล่ที่ `currentStock = 0` ต้องขึ้น Badge "หมด" สีดำ

2. **ทดสอบสร้าง PO และรับสินค้า** → ไปที่ `http://localhost:3000/inventory/purchase`
   - เลือก Vendor → กด "เพิ่มรายการ" → เลือกอะไหล่ 2-3 ตัว → กรอกจำนวน
   - กด **"รับสินค้าเข้า Stock ทันที"**
   - ต้องแสดง Toast สำเร็จและ Redirect ไปหน้า Stock

3. **ตรวจสอบผล** → กลับไปหน้า `/inventory/stock`
   - ยอด `currentStock` ของอะไหล่ที่รับเข้าต้องเพิ่มขึ้นตามจำนวนที่กรอก

4. **ตรวจสอบประวัติ** → ไปที่ `http://localhost:3000/inventory/movement`
   - ต้องมีรายการ `IN` ปรากฏพร้อมเลขอ้างอิง PO ที่เพิ่งสร้าง
   - ตรวจสอบว่า `beforeQty` + จำนวนที่รับ = `afterQty`
