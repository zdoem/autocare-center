# PostgreSQL & Database Connection Configuration Guide

เอกสารแนะนำการตั้งค่าและการเข้าถึงฐานข้อมูล **PostgreSQL** และการตรวจสอบข้อมูลผ่าน **pgAdmin 4** และ **Prisma Studio** สำหรับโครงการ Autocar Service Center

---

## 🗄️ 1. ข้อมูลการเชื่อมต่อฐานข้อมูล (Database Connection Credentials)

### 1.1 Connection URL (`.env`)
```env
DATABASE_URL="postgresql://pgadmin:P@ssw0rd@localhost:5432/db_autocar?schema=public"
```

### 1.2 รายละเอียดพารามิเตอร์ (Connection Details)
- **Database Engine:** PostgreSQL 15+
- **Host (จาก Host Machine):** `localhost` หรือ `127.0.0.1`
- **Host (จากภายใน Docker Container / pgAdmin):** `host.docker.internal` หรือ `my_postgres`
- **Port:** `5432`
- **Database Name:** `db_autocar`
- **Username:** `pgadmin`
- **Password:** `P@ssw0rd`

---

## 🐘 2. การเข้าใช้งานผ่าน pgAdmin 4 (http://localhost:5050)

pgAdmin 4 ทำงานอยู่บน Docker Container `my_pgadmin` บนพอร์ต `5050`

### ขั้นตอนการเข้าใช้งานและลงทะเบียน Server:

#### Step 1: เปิดเบราว์เซอร์และล็อกอิน
- **URL:** [http://localhost:5050](http://localhost:5050)
- **Email:** `admin@admin.com`
- **Password:** `P@ssw0rd`

#### Step 2: ลงทะเบียนเพิ่มการเชื่อมต่อ PostgreSQL Server (Register Server)
1. ในเมนูด้านซ้าย คลิกขวาที่ **Servers** ➔ เลือก **Register** ➔ **Server...**
2. **แถบ General:**
   - **Name:** `Autocar Postgres` (หรือชื่อตามต้องการ)
3. **แถบ Connection:**
   - **Host name / address:** `host.docker.internal` *(หรือ `my_postgres`)*
   - **Port:** `5432`
   - **Maintenance database:** `db_autocar` *(หรือ `postgres`)*
   - **Username:** `pgadmin`
   - **Password:** `P@ssw0rd`
   - ติ๊กเลือก **Save password?**
4. กดปุ่ม **Save**

#### Step 3: การเรียกดูและจัดการข้อมูล (View/Edit Data)
1. ขยายเมนูด้านซ้าย: `Servers` ➔ `Autocar Postgres` ➔ `Databases` ➔ `db_autocar` ➔ `Schemas` ➔ `public` ➔ **`Tables`**
2. คลิกขวาที่ตารางที่ต้องการดูข้อมูล (เช่น `service_jobs`, `cars`, `customers`, `payments`)
3. เลือก **View/Edit Data** ➔ **All Rows** เพื่อดูข้อมูลตารางได้ทันที

---

## ⚡ 3. การเข้าใช้งานผ่าน Prisma Studio (http://localhost:5555)

Prisma Studio เป็น Web GUI สำหรับจัดการและส่องดูข้อมูล PostgreSQL ที่มีความสะดวกรวดเร็ว

### วิธีเปิดใช้งาน:
เปิด Terminal ในโฟลเดอร์โปรเจกต์แล้วรันคำสั่ง:
```bash
npx prisma studio
```
ระบบจะเปิดเบราว์เซอร์ไปที่ [http://localhost:5555](http://localhost:5555) โดยอัตโนมัติ

---

## ⚙️ 4. คำสั่งจัดการและตรวจเช็กระบบฐานข้อมูล (Useful Commands)

### 4.1 ตรวจเช็กสถานะการเชื่อมต่อฐานข้อมูล (System Health Check)
```bash
npm run check
```
*(ทำการตรวจสอบ TCP Port 5432, การยืนยันตัวตน Prisma และนับจำนวนแถวข้อมูลในฐานข้อมูล)*

### 4.2 การสร้าง Migration และ Seed ข้อมูลเริ่มต้น
```bash
# รัน Migration อัปเดตสกีมาฐานข้อมูล
npx prisma migrate dev

# Seed ข้อมูลเริ่มต้น (พนักงาน, อะไหล่, รายการบริการ, ลูกค้า)
npx prisma db seed
```

### 4.3 คำสั่ง Docker สำหรับตรวจสอบและจัดการ Containers
```bash
# ตรวจสอบสถานะการรันของ Postgres และ pgAdmin
docker ps

# สั่งเริ่มต้นรัน Postgres & pgAdmin Containers (ถ้าปิดอยู่)
docker start my_postgres my_pgadmin
```
