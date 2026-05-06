# $ralph + OMX

คุณคือ Senior Fullstack Engineer สำหรับโปรเจกต์ Autocar Service Center

Stack:
- Next.js App Router
- React
- TypeScript
- Tabler UI
- SweetAlert2
- Next.js API Routes
- Zod
- PostgreSQL
- Prisma
- NextAuth.js

Goal:
สร้างระบบคลังอะไหล่ (Inventory Module) จำนวน 3 หน้า ได้แก่ รายการ Stock (`/inventory/stock`), สั่งซื้อสินค้าเข้า (`/inventory/purchase`), และประวัติความเคลื่อนไหว (`/inventory/movement`) ให้มีหน้าตาตรงตาม Mockup (`inv-stock.html`, `inv-purchase.html`, `inv-movement.html`) และทำงานร่วมกับ Schema Database ที่มีอยู่ (`Spare`, `Purchase`, `PurchaseItem`, `StockMovement`) ได้อย่างสมบูรณ์

Workflow & UI Mappings:
1. **รายการ Stock (`/inventory/stock`)**
   - **อ้างอิง:** `inv-stock.html`
   - **UI:** หน้า Dashboard สรุปจำนวนอะไหล่คงเหลือ (`currentStock`) มีแถบสีแบ่งแยกสถานะ ปกติ/ใกล้หมด/หมด อ้างอิงจาก `minStock`
   - **Data Flow:** ดึงข้อมูลจาก `Spare` model (สามารถใช้ API `/api/master/spare` เดิม หรือสร้างใหม่ที่ Optimize สำหรับตารางนี้)
2. **สร้างใบสั่งซื้อ / รับเข้า (`/inventory/purchase`)**
   - **อ้างอิง:** `inv-purchase.html`
   - **UI:** ฟอร์มสร้างใบ PO มี Dropdown เลือก `Vendor` ด้านขวามี Summary Card สำหรับรวมยอด ด้านล่างมีปุ่ม "เพิ่มรายการ" เพื่อเปิด Modal ค้นหาและเลือกอะไหล่ 
   - **Data Flow:** บันทึกข้อมูลลงในตาราง `Purchase` และ `PurchaseItem` โดยสถานะจะเป็น `PENDING` หรือถ้ากดรับของแล้วจะเป็น `RECEIVED` พร้อมกับอัปเดต `currentStock` และสร้าง Log ลง `StockMovement` ด้วย
3. **ประวัติความเคลื่อนไหว (`/inventory/movement`)**
   - **อ้างอิง:** `inv-movement.html`
   - **UI:** ตารางประวัติ (Stock Card) เรียงตามเวลา แจ้งว่าเป็นการรับเข้า (`IN`), เบิกออก (`OUT`), หรือปรับปรุง (`ADJUST`)
   - **Data Flow:** ดึงข้อมูลจากตาราง `StockMovement` มาเรียงลำดับ DESC

Step-by-Step Implementation:
1. **API Routes Development:**
   - [NEW] `/api/inventory/purchase` (GET, POST): จัดการใบสั่งซื้อ
   - [NEW] `/api/inventory/movement` (GET): ดึงประวัติเข้า-ออก
2. **Page Creation - Stock:**
   - [NEW] `src/app/inventory/stock/page.tsx`: สร้างตารางรายการ Stock พร้อมการแจ้งเตือนสีเหลือง/แดงเมื่อต่ำกว่าจุด Reorder
3. **Page Creation - Purchase:**
   - [NEW] `src/app/inventory/purchase/page.tsx`: สร้างฟอร์มใบสั่งซื้อพร้อม Modal เลือกอะไหล่และคำนวณราคารวม
4. **Page Creation - Movement:**
   - [NEW] `src/app/inventory/movement/page.tsx`: สร้างหน้าแสดงประวัติ StockMovement
5. **Testing & Verification:**
   - จำลองการรับสินค้าเข้า (Purchase) สังเกตว่า `currentStock` ในระบบเพิ่มขึ้นหรือไม่ และมี History ไปโผล่ในหน้า Movement หรือไม่

---

## 📌 คำอธิบาย Workflow Logic สำหรับหน้าระบบคลังอะไหล่ (Inventory Module)

ระบบคลังอะไหล่ถูกออกแบบมาเพื่อควบคุมการหมุนเวียนของสินค้า ตั้งแต่การรับของเข้า การเช็คยอดคงเหลือ ไปจนถึงการสืบค้นประวัติย้อนหลัง โดยแบ่งส่วนทำงานเป็น 3 หน้าจอหลัก:

### 1. หน้า Dashboard สต๊อกสินค้า (`/inventory/stock`)
หน้าต่างนี้ทำหน้าที่เป็นศูนย์กลางให้ผู้ดูแลคลังสินค้าเห็นภาพรวมทั้งหมด
*   **เป้าหมาย:** ทราบได้ทันทีว่าอะไหล่ชิ้นไหน "กำลังจะหมด" หรือ "หมดแล้ว" เพื่อให้สั่งซื้อมาเติมได้ทันเวลา
*   **Logic:** อาศัยการเปรียบเทียบค่า `currentStock` (สต๊อกปัจจุบัน) กับ `minStock` (จุดสั่งซื้อ/ขั้นต่ำ) หากสต๊อกปัจจุบันน้อยกว่าหรือเท่ากับจุดสั่งซื้อ ระบบจะไฮไลท์สีเหลือง/แดงเพื่อแจ้งเตือนพนักงาน

### 2. หน้าสร้างใบสั่งซื้อ/รับสินค้าเข้า (`/inventory/purchase`)
หน้าต่างนี้ใช้สำหรับตอนที่ต้องการซื้ออะไหล่เข้ามาเติมในร้าน
*   **เป้าหมาย:** บันทึกว่าซื้ออะไรเข้ามา ซื้อจากใคร (Vendor) และราคาต้นทุนเท่าไหร่
*   **Logic:**
    *   เมื่อกดบันทึก PO แบบ **"ได้รับของแล้ว (RECEIVED)"** ระบบหลังบ้านจะเกิด 3 เหตุการณ์พร้อมกัน (Transaction):
        1. บันทึกข้อมูลใบเสร็จลงตาราง `Purchase` และ `PurchaseItem`
        2. วิ่งไปบวกจำนวนอะไหล่เพิ่มที่ตาราง `Spare` (`currentStock` = ตัวเลขเดิม + ที่รับเข้า)
        3. สร้าง Log บันทึกประวัติลงตาราง `StockMovement` (ประเภท `IN`) ระบุว่าใครเป็นคนรับเข้า

### 3. หน้าประวัติความเคลื่อนไหว (`/inventory/movement`)
หน้าต่างนี้เปรียบเสมือนสมุดบัญชีเงินฝาก (Statement) ของคลังอะไหล่
*   **เป้าหมาย:** ใช้ตรวจสอบการทุจริต หรือตามหาสินค้าที่สูญหาย (Audit Trail)
*   **Logic:** ตารางนี้จะดึง Log ทั้งหมดมาแสดงเรียงตามเวลา (ใหม่สุดอยู่บนสุด) โดยแบ่งเป็น 3 ประเภทหลัก:
    *   `IN` (สีเขียว): ของรับเข้าจากใบสั่งซื้อ
    *   `OUT` (สีส้ม): ของถูกเบิกออกไปใช้กับงานซ่อม (เชื่อมโยงกับ Job ID)
    *   `ADJUST` (สีเทา): แอดมินปรับลดยอดเองด้วยมือ (เช่น กรณีตรวจนับสต๊อกสิ้นเดือนแล้วของหาย)
