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
ปรับปรุง UI และโครงสร้างหน้า `/ops/job/[id]` (Job Detail) ให้ตรงตามดีไซน์ Mockup (`svc-job-detail.html`) โดยใช้โครงสร้างแบบ 2 คอลัมน์ และผูก Logic การทำงานเดิมเข้ากับ UI ใหม่ โดยไม่กระทบกับฐานข้อมูลหรือ Workflow หลัก

Workflow & UI Mappings:
1. **Layout (2 คอลัมน์)**
   - **คอลัมน์ซ้าย (8 ส่วน):**
     - **ข้อมูลรถ & ข้อมูลลูกค้า:** จัดกลุ่มเป็น `datagrid` แยกจากการ์ดเดียว เป็น 2 ส่วน
     - **รายการซ่อม/บริการ:** แยกตารางสำหรับ `itemType === 'SERVICE'` เท่านั้น
     - **อะไหล่ที่ใช้:** แยกตารางสำหรับ `itemType === 'SPARE'` เท่านั้น
   - **คอลัมน์ขวา (4 ส่วน):**
     - **สถานะงาน:** การ์ดเปลี่ยนสถานะและช่างผู้รับผิดชอบ (Dropdown) พร้อมปุ่ม "บันทึกสถานะ" สำหรับแอดมินแก้ไขแบบ Override
     - **สรุปยอด:** สรุปค่าบริการ, ค่าอะไหล่, ค่าแรง, ส่วนลด, VAT 7%, ยอดสุทธิ
     - **Actions:** ปุ่ม Call to Action หลักและปุ่มพิมพ์ใบเสนอราคา

2. **State Machine & Actions**
   - **RECEIVED / APPROVED:** 
     - ปุ่มหลัก -> `เริ่มงานซ่อม` (กดแล้วเปลี่ยนเป็น IN_PROGRESS)
   - **IN_PROGRESS / INSPECTION / WAITING_PARTS / QC_CHECK:**
     - ปุ่มหลัก -> `เสร็จงาน / ส่งชำระ` (กดแล้วเปลี่ยนเป็น WAITING_PAYMENT)
   - **WAITING_PAYMENT:**
     - ปุ่มหลัก -> `ไปหน้ารับชำระเงิน` (Redirect ไป `/cash/payment?jobId=[id]`)
   - **COMPLETED:**
     - ปุ่มหลัก -> `ส่งมอบรถ` (กดแล้วเปลี่ยนเป็น DELIVERED)

3. **Multi-Select Modal**
   - คง Modal เดิมไว้ แต่เมื่อกด "เพิ่มรายการ" ในตารางบริการ ให้ Tab เริ่มต้นเป็น "ค่าบริการ"
   - เมื่อกด "เพิ่มอะไหล่" ในตารางอะไหล่ ให้ Tab เริ่มต้นเป็น "อะไหล่"

Step-by-Step Implementation:
1. Analyze Mockup `svc-job-detail.html`
2. Refactor `<MainLayout>` contents into `<div className="row">` with `col-lg-8` and `col-lg-4`
3. Split the single `job.items` map into two tables (Service and Spare)
4. Implement the Datagrid design for Car and Customer info
5. Implement the Right Sidebar Summary, Status Form, and primary Action Buttons mapping to the State Machine
6. Verify routing logic, SweetAlerts, and UI responsiveness
7. Output checklist of files changed and manual tests performed

---

## 📌 คำอธิบาย Workflow Logic สำหรับหน้า Job Detail

การออกแบบหน้า Job Detail ใหม่นี้ ถูกสร้างขึ้นเพื่อเชื่อมโยงกับ **Service Jobs Dashboard** และรองรับ **Payment Workflow** อย่างไร้รอยต่อ โดยใช้หลักการ 2 ส่วนคือ **"Happy Path"** และ **"Admin Override"**

### 1. Happy Path (ปุ่ม Action สีชัดเจนด้านล่าง)
เป็นเส้นทางการทำงานปกติที่ช่างหรือพนักงานรับรถควรจะทำตามลำดับขั้นตอน โดยระบบจะ "แนะนำ" สิ่งที่ต้องทำต่อไปผ่านปุ่มขนาดใหญ่ในคอลัมน์ขวาล่าง ซึ่งจะเปลี่ยนแปลงข้อความตาม `job.status` ปัจจุบัน:

*   **เมื่อเปิดบิลใหม่ (`RECEIVED` / `APPROVED`):**
    *   **ปุ่มแสดง:** "เริ่มงานซ่อม" (สีน้ำเงิน/Primary)
    *   **Logic:** เมื่อกด ระบบจะยิง API แบบ `PUT` เพื่อเปลี่ยนสถานะเป็น `IN_PROGRESS` ทำให้รถคันนี้ย้ายจากแท็บ "รอรับรถ" ไปอยู่แท็บ "กำลังซ่อม" ในหน้า Dashboard
*   **เมื่ออยู่ในระหว่างการซ่อม (`IN_PROGRESS` / `INSPECTION` / `WAITING_PARTS` / `QC_CHECK`):**
    *   **ปุ่มแสดง:** "เสร็จงาน / ส่งชำระ" (สีเขียว/Success)
    *   **Logic:** เมื่อช่างซ่อมเสร็จและกดปุ่มนี้ ระบบจะเปลี่ยนสถานะเป็น `WAITING_PAYMENT` ทันที ซึ่งนี่คือจุดเชื่อมต่อสำคัญที่จะส่งมอบงานนี้ให้ **แคชเชียร์** ต่อไป งานชิ้นนี้จะเด้งไปโชว์ในแท็บ "รอชำระ" บน Dashboard ส่วนกลาง
*   **เมื่อรอการชำระเงิน (`WAITING_PAYMENT`):**
    *   **ปุ่มแสดง:** "ไปหน้ารับชำระเงิน" (สีส้ม/Warning)
    *   **Logic:** นี่ไม่ใช่การเปลี่ยนสถานะ แต่เป็นการ Redirect (พนักงานกดแล้วพาไปที่ URL `/cash/payment?jobId=[id]`) เพื่อให้ทำกระบวนการรับเงินให้เสร็จสิ้น (เมื่อรับเงินเสร็จ ระบบแคชเชียร์จะเปลี่ยนสถานะเป็น `COMPLETED` ให้เอง)
*   **เมื่อชำระเงินเสร็จสิ้น (`COMPLETED`):**
    *   **ปุ่มแสดง:** "ส่งมอบรถ" (สีเขียวอ่อน/Lime)
    *   **Logic:** เปลี่ยนสถานะรถเป็น `DELIVERED` ถือเป็นการสิ้นสุดกระบวนการ

### 2. Admin Override (การ์ด "สถานะงาน" เปลี่ยนสถานะเอง)
ในโลกความเป็นจริงอาจเกิดการทำงานข้ามขั้นตอน, ข้อผิดพลาด, หรือการยกเลิกงานกะทันหัน ดังนั้นในคอลัมน์ขวาบน จึงมี **Dropdown Status** ให้เลือกแบบอิสระ
*   **Logic:** แอดมินสามารถเปิด Dropdown และกดเลือกสถานะกลับไปกลับมาได้ตามต้องการ (เช่น ลูกค้าเปลี่ยนใจ ยังไม่ซ่อม ขอถอยกลับไปรออะไหล่) เมื่อเลือกแล้วกด **"บันทึกสถานะ"** ระบบจะทำการส่งค่าไปเซฟใน Database ทันที
*   นอกจากนี้ยังสามารถ **เปลี่ยนช่างผู้รับผิดชอบ (`technicianId`)** ได้จากจุดนี้ด้วย ซึ่งรายชื่อช่างจะถูกดึงมาจากระบบพนักงาน (`/api/master/employee`) โดยกรองเฉพาะคนที่มีบทบาทหรือตำแหน่งเกี่ยวกับ "ช่าง" เท่านั้น

### บทสรุปของ Workflow
การปรับปรุง UI ครั้งนี้ **ไม่ได้แก้ไขฐานข้อมูลหรือ State Machine เดิมที่มีอยู่** แต่เป็นการ **"ครอบ UI"** ให้สอดคล้องกับพฤติกรรมผู้ใช้งาน:
*   **ลดข้อผิดพลาด (Reduce Error):** ช่างไม่ต้องคอยหาว่าต้องเปลี่ยน Status เป็นอะไรต่อ แค่กดปุ่มใหญ่ๆ ตามที่ระบบแนะนำ
*   **เชื่อมกับ Payment สมบูรณ์:** โยนงานไปให้แคชเชียร์ได้ด้วยปุ่มเดียว ("เสร็จงาน / ส่งชำระ") 
*   **ยืดหยุ่นสูง (Flexible):** หากมีอะไรผิดพลาด แอดมินสามารถ Override สถานะได้เสมอ
