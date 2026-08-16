import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting full database seed...')

    // Clean up existing data in dependency order
    console.log('🧹 Cleaning up database...')
    await prisma.maintenanceReminder.deleteMany()
    await prisma.serviceJobRecommendation.deleteMany()
    await prisma.maintenanceTemplateItem.deleteMany()
    await prisma.maintenanceTemplate.deleteMany()
    await prisma.serviceJobMedia.deleteMany()
    await prisma.serviceJobQC.deleteMany()
    await prisma.serviceJobLabor.deleteMany()

    await prisma.stockMovement.deleteMany()
    await prisma.purchaseItem.deleteMany()
    await prisma.purchase.deleteMany()

    await prisma.cashReceipt.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.paymentType.deleteMany()

    await prisma.serviceJobItem.deleteMany()
    await prisma.serviceJob.deleteMany()

    await prisma.spare.deleteMany()
    await prisma.service.deleteMany()
    await prisma.vendor.deleteMany()
    await prisma.sparesCategory.deleteMany()
    await prisma.serviceCategory.deleteMany()

    await prisma.carImage.deleteMany()
    await prisma.car.deleteMany()

    await prisma.customer.deleteMany()
    await prisma.customerType.deleteMany()

    await prisma.user.deleteMany()
    await prisma.employee.deleteMany()
    await prisma.position.deleteMany()
    await prisma.department.deleteMany()
    await prisma.employeeType.deleteMany()

    await prisma.carModel.deleteMany()
    await prisma.carBrand.deleteMany()

    // ============================================
    // 1. CAR BRANDS & MODELS
    // ============================================
    console.log('📝 Seeding Car Brands & Models...')
    const toyota = await prisma.carBrand.create({
        data: {
            code: 'BR001',
            nameThai: 'โตโยต้า',
            nameEnglish: 'Toyota',
            name: 'Toyota',
            logoUrl: 'https://www.carlogos.org/car-logos/toyota-logo.png',
            isActive: true,
        }
    })
    const honda = await prisma.carBrand.create({
        data: {
            code: 'BR002',
            nameThai: 'ฮอนด้า',
            nameEnglish: 'Honda',
            name: 'Honda',
            logoUrl: 'https://www.carlogos.org/car-logos/honda-logo.png',
            isActive: true,
        }
    })
    const mazda = await prisma.carBrand.create({
        data: {
            code: 'BR003',
            nameThai: 'มาสด้า',
            nameEnglish: 'Mazda',
            name: 'Mazda',
            logoUrl: 'https://www.carlogos.org/car-logos/mazda-logo.png',
            isActive: true,
        }
    })
    const nissan = await prisma.carBrand.create({
        data: {
            code: 'BR004',
            nameThai: 'นิสสัน',
            nameEnglish: 'Nissan',
            name: 'Nissan',
            logoUrl: 'https://www.carlogos.org/car-logos/nissan-logo.png',
            isActive: true,
        }
    })
    const isuzu = await prisma.carBrand.create({
        data: {
            code: 'BR005',
            nameThai: 'อีซูซุ',
            nameEnglish: 'Isuzu',
            name: 'Isuzu',
            logoUrl: 'https://www.carlogos.org/car-logos/isuzu-logo.png',
            isActive: true,
        }
    })
    const mitsubishi = await prisma.carBrand.create({
        data: {
            code: 'BR006',
            nameThai: 'มิตซูบิชิ',
            nameEnglish: 'Mitsubishi',
            name: 'Mitsubishi',
            logoUrl: 'https://www.carlogos.org/car-logos/mitsubishi-logo.png',
            isActive: true,
        }
    })
    const ford = await prisma.carBrand.create({
        data: {
            code: 'BR007',
            nameThai: 'ฟอร์ด',
            nameEnglish: 'Ford',
            name: 'Ford',
            logoUrl: 'https://www.carlogos.org/car-logos/ford-logo.png',
            isActive: true,
        }
    })

    const camry = await prisma.carModel.create({
        data: { code: 'MD001', name: 'Camry', carBrandId: toyota.id, yearStart: 2019, yearEnd: 2024, vehicleType: 'รถเก๋ง', fuelType: 'Hybrid', isActive: true }
    })
    const altis = await prisma.carModel.create({
        data: { code: 'MD002', name: 'Corolla Altis', carBrandId: toyota.id, yearStart: 2019, yearEnd: 2024, vehicleType: 'รถเก๋ง', fuelType: 'Gasoline', isActive: true }
    })
    const yaris = await prisma.carModel.create({
        data: { code: 'MD003', name: 'Yaris', carBrandId: toyota.id, yearStart: 2017, yearEnd: 2023, vehicleType: 'รถเก๋ง', fuelType: 'Gasoline', isActive: true }
    })
    const revo = await prisma.carModel.create({
        data: { code: 'MD004', name: 'Hilux Revo', carBrandId: toyota.id, yearStart: 2015, yearEnd: 2024, vehicleType: 'กระบะ', fuelType: 'Diesel', isActive: true }
    })
    const civic = await prisma.carModel.create({
        data: { code: 'MD005', name: 'Civic', carBrandId: honda.id, yearStart: 2016, yearEnd: 2024, vehicleType: 'รถเก๋ง', fuelType: 'Gasoline', isActive: true }
    })
    const accord = await prisma.carModel.create({
        data: { code: 'MD006', name: 'Accord', carBrandId: honda.id, yearStart: 2018, yearEnd: 2024, vehicleType: 'รถเก๋ง', fuelType: 'Hybrid', isActive: true }
    })
    const city = await prisma.carModel.create({
        data: { code: 'MD007', name: 'City', carBrandId: honda.id, yearStart: 2019, yearEnd: 2024, vehicleType: 'รถเก๋ง', fuelType: 'Gasoline', isActive: true }
    })
    const mazda3 = await prisma.carModel.create({
        data: { code: 'MD008', name: 'Mazda 3', carBrandId: mazda.id, yearStart: 2019, yearEnd: 2024, vehicleType: 'รถเก๋ง', fuelType: 'Gasoline', isActive: true }
    })
    const dmax = await prisma.carModel.create({
        data: { code: 'MD009', name: 'D-Max', carBrandId: isuzu.id, yearStart: 2019, yearEnd: 2024, vehicleType: 'กระบะ', fuelType: 'Diesel', isActive: true }
    })

    // ============================================
    // 2. DEPARTMENTS, POSITIONS, EMPLOYEES & USERS
    // ============================================
    console.log('📝 Seeding Departments, Positions, Employees & Users...')
    const deptManagement = await prisma.department.create({
        data: { name: 'ฝ่ายบริหาร', code: '01', description: 'Management Department', employeeCount: 1 }
    })
    const deptHR = await prisma.department.create({
        data: { name: 'ฝ่ายบุคคล', code: '02', description: 'Human Resources', employeeCount: 0 }
    })
    const deptIT = await prisma.department.create({
        data: { name: 'ฝ่ายไอที', code: '03', description: 'Information Technology', employeeCount: 0 }
    })
    const deptService = await prisma.department.create({
        data: { name: 'ฝ่ายบริการ', code: '04', description: 'Service Department', employeeCount: 1 }
    })
    const deptSales = await prisma.department.create({
        data: { name: 'ฝ่ายการเงิน/ขาย', code: '05', description: 'Finance & Sales', employeeCount: 1 }
    })

    const typeFullTime = await prisma.employeeType.create({
        data: { name: 'Full-time', code: '01', description: 'พนักงานประจำ' }
    })
    const typePartTime = await prisma.employeeType.create({
        data: { name: 'Part-time', code: '02', description: 'พนักงานพาร์ทไทม์' }
    })

    const posManager = await prisma.position.create({
        data: { name: 'Manager', code: '01', departmentId: deptManagement.id, baseSalary: 50000 }
    })
    const posHR = await prisma.position.create({
        data: { name: 'HR Officer', code: '02', departmentId: deptHR.id, baseSalary: 25000 }
    })
    const posIT = await prisma.position.create({
        data: { name: 'IT Support', code: '03', departmentId: deptIT.id, baseSalary: 30000 }
    })
    const posTechnician = await prisma.position.create({
        data: { name: 'Senior Technician', code: '04', departmentId: deptService.id, baseSalary: 25000 }
    })
    const posCashier = await prisma.position.create({
        data: { name: 'Cashier', code: '05', departmentId: deptSales.id, baseSalary: 20000 }
    })

    // Passwords hashed with admin123 (and we also support P@ssw0rd)
    const passwordHash = await bcrypt.hash('admin123', 12)

    const empAdmin = await prisma.employee.create({
        data: {
            code: 'E001',
            name: 'Admin User',
            nickname: 'Admin',
            username: 'admin',
            password: passwordHash,
            departmentId: deptManagement.id,
            positionId: posManager.id,
            employeeTypeId: typeFullTime.id,
            role: 'ADMIN',
            phone: '081-234-5678',
            email: 'admin@autocar.com',
            startDate: new Date(),
            salary: 60000
        }
    })

    const empCashier = await prisma.employee.create({
        data: {
            code: 'E002',
            name: 'Cashier Staff',
            nickname: 'Cat',
            username: 'cashier',
            password: passwordHash,
            departmentId: deptSales.id,
            positionId: posCashier.id,
            employeeTypeId: typeFullTime.id,
            role: 'CASHIER',
            phone: '089-111-2222',
            email: 'cashier@autocar.com',
            startDate: new Date(),
            salary: 20000
        }
    })

    const empTech = await prisma.employee.create({
        data: {
            code: 'E003',
            name: 'Technician Somchai',
            nickname: 'Chai',
            username: 'tech',
            password: passwordHash,
            departmentId: deptService.id,
            positionId: posTechnician.id,
            employeeTypeId: typeFullTime.id,
            role: 'TECHNICIAN',
            phone: '089-333-4444',
            email: 'tech@autocar.com',
            startDate: new Date(),
            salary: 25000
        }
    })

    // Users
    await prisma.user.create({
        data: {
            username: 'admin',
            password: passwordHash,
            email: 'admin@autocar.com',
            name: 'Admin User',
            role: 'ADMIN',
            employeeId: empAdmin.id,
            isActive: true
        }
    })

    await prisma.user.create({
        data: {
            username: 'cashier',
            password: passwordHash,
            email: 'cashier@autocar.com',
            name: 'Cashier Staff',
            role: 'CASHIER',
            employeeId: empCashier.id,
            isActive: true
        }
    })

    await prisma.user.create({
        data: {
            username: 'tech',
            password: passwordHash,
            email: 'tech@autocar.com',
            name: 'Technician Somchai',
            role: 'TECHNICIAN',
            employeeId: empTech.id,
            isActive: true
        }
    })

    // ============================================
    // 3. CUSTOMER TYPES & CUSTOMERS
    // ============================================
    console.log('📝 Seeding Customer Types & Customers...')
    const ctVIP = await prisma.customerType.create({
        data: { code: 'CT01', name: 'VIP', description: 'ลูกค้าประจำ / ใช้บริการ > 10 ครั้ง', discount: 10, isActive: true }
    })
    const ctNormal = await prisma.customerType.create({
        data: { code: 'CT02', name: 'ทั่วไป', description: 'ลูกค้าทั่วไป', discount: 0, isActive: true }
    })
    const ctCorporate = await prisma.customerType.create({
        data: { code: 'CT03', name: 'นิติบุคคล', description: 'บริษัท / องค์กร', discount: 15, isActive: true }
    })
    const ctFleet = await prisma.customerType.create({
        data: { code: 'CT04', name: 'Fleet', description: 'ลูกค้าที่มีรถหลายคัน', discount: 20, isActive: true }
    })
    const ctEmployee = await prisma.customerType.create({
        data: { code: 'CT05', name: 'พนักงาน', description: 'พนักงานและครอบครัว', discount: 25, isActive: true }
    })

    const customer1 = await prisma.customer.create({
        data: {
            code: 'C-0001',
            firstName: 'สมศักดิ์',
            lastName: 'พานทอง',
            fullName: 'สมศักดิ์ พานทอง',
            phone: '081-234-5678',
            email: 'somsak@email.com',
            lineId: 'somsak_line',
            address: '123 ถ.สุขุมวิท กทม.',
            taxId: null,
            customerTypeId: ctVIP.id,
            isActive: true,
        }
    })
    const customer2 = await prisma.customer.create({
        data: {
            code: 'C-0002',
            firstName: 'วิภา',
            lastName: 'สุขใจ',
            fullName: 'วิภา สุขใจ',
            phone: '089-999-8888',
            email: 'vipa@email.com',
            lineId: 'vipa_happy',
            address: '456 ถ.พระราม 9 กทม.',
            taxId: null,
            customerTypeId: ctVIP.id,
            isActive: true,
        }
    })
    const customer3 = await prisma.customer.create({
        data: {
            code: 'C-0003',
            firstName: 'ประยุทธ์',
            lastName: 'มั่นคง',
            fullName: 'ประยุทธ์ มั่นคง',
            phone: '086-555-4444',
            email: 'prayut@email.com',
            lineId: null,
            address: '789 ถ.ลาดพร้าว กทม.',
            taxId: null,
            customerTypeId: ctNormal.id,
            isActive: true,
        }
    })
    const customer4 = await prisma.customer.create({
        data: {
            code: 'C-0004',
            firstName: 'บริษัท สุขใจ',
            lastName: 'จำกัด',
            fullName: 'บริษัท สุขใจ จำกัด',
            phone: '02-123-4567',
            email: 'sukjai@company.com',
            lineId: 'sukjai_co',
            address: '200 ถ.สีลม กทม.',
            taxId: '1234567890123',
            customerTypeId: ctCorporate.id,
            isActive: true,
        }
    })

    // ============================================
    // 4. CARS
    // ============================================
    console.log('📝 Seeding Cars...')
    const car1 = await prisma.car.create({
        data: {
            code: 'CAR-0001',
            licensePlate: 'กก 1234',
            province: 'กรุงเทพมหานคร',
            carBrandId: toyota.id,
            carModelId: camry.id,
            year: 2022,
            color: 'ขาว',
            vin: 'JTD12345678901234',
            engineNo: 'ENG-123456',
            customerId: customer1.id,
            mileage: 45000,
            isActive: true
        }
    })
    const car2 = await prisma.car.create({
        data: {
            code: 'CAR-0002',
            licensePlate: 'ขข 5678',
            province: 'นนทบุรี',
            carBrandId: honda.id,
            carModelId: civic.id,
            year: 2020,
            color: 'ดำ',
            vin: 'JHM98765432109876',
            engineNo: 'ENG-987654',
            customerId: customer2.id,
            mileage: 68000,
            isActive: true
        }
    })
    const car3 = await prisma.car.create({
        data: {
            code: 'CAR-0003',
            licensePlate: 'คง 9999',
            province: 'กรุงเทพมหานคร',
            carBrandId: isuzu.id,
            carModelId: dmax.id,
            year: 2021,
            color: 'บรอนซ์เงิน',
            vin: 'ISZ11223344556677',
            engineNo: 'ENG-556677',
            customerId: customer4.id,
            mileage: 82000,
            isActive: true
        }
    })

    // ============================================
    // 5. SERVICE CATEGORIES & SERVICES
    // ============================================
    console.log('📝 Seeding Service Categories & Services...')
    const scEngine = await prisma.serviceCategory.create({
        data: { code: 'SC001', name: 'เครื่องยนต์ & เช็คระยะ', description: 'บริการถ่ายน้ำมันเครื่อง และตรวจเช็คระยะมาตรฐาน', isActive: true }
    })
    const scBrake = await prisma.serviceCategory.create({
        data: { code: 'SC002', name: 'ระบบเบรก & ช่วงล่าง', description: 'บริการซ่อมบำรุงระบบเบรก โช้คอัพ และช่วงล่าง', isActive: true }
    })
    const scElectrical = await prisma.serviceCategory.create({
        data: { code: 'SC003', name: 'ระบบไฟ & แอร์', description: 'บริการระบบไฟฟ้า แบตเตอรี่ และระบบปรับอากาศ', isActive: true }
    })
    const scTire = await prisma.serviceCategory.create({
        data: { code: 'SC004', name: 'ยาง & ศูนย์ล้อ', description: 'เปลี่ยนยาง ถ่วงล้อ และตั้งศูนย์', isActive: true }
    })
    const scGeneral = await prisma.serviceCategory.create({
        data: { code: 'SC005', name: 'งานบริการทั่วไป', description: 'ตรวจเช็คสภาพรถและบริการทำความสะอาด', isActive: true }
    })

    const services = [
        { code: 'SV001', name: 'เปลี่ยนถ่ายน้ำมันเครื่อง', description: 'เปลี่ยนน้ำมันเครื่อง + กรองน้ำมัน', price: 500, laborCost: 300, laborHours: 1.0, serviceCategoryId: scEngine.id },
        { code: 'SV002', name: 'เช็คระยะ 10,000 km', description: 'เช็คระยะตามคู่มือ ทุก 10,000 กม.', price: 1500, laborCost: 800, laborHours: 2.0, serviceCategoryId: scEngine.id },
        { code: 'SV003', name: 'เช็คระยะ 20,000 km', description: 'เช็คระยะตามคู่มือ ทุก 20,000 กม.', price: 2500, laborCost: 1200, laborHours: 3.0, serviceCategoryId: scEngine.id },
        { code: 'SV004', name: 'เปลี่ยนน้ำมันเกียร์', description: 'ถ่ายน้ำมันเกียร์ออโต้/ธรรมดา', price: 800, laborCost: 400, laborHours: 1.5, serviceCategoryId: scEngine.id },
        { code: 'SV005', name: 'เปลี่ยนผ้าเบรค (หน้า)', description: 'เปลี่ยนผ้าเบรคล้อหน้า ซ้าย-ขวา', price: 1200, laborCost: 500, laborHours: 1.5, serviceCategoryId: scBrake.id },
        { code: 'SV006', name: 'เปลี่ยนผ้าเบรค (หลัง)', description: 'เปลี่ยนผ้าเบรคล้อหลัง ซ้าย-ขวา', price: 1000, laborCost: 500, laborHours: 1.5, serviceCategoryId: scBrake.id },
        { code: 'SV007', name: 'เปลี่ยนโช้คอัพ (คู่)', description: 'เปลี่ยนโช้คอัพ 1 คู่ (หน้าหรือหลัง)', price: 2000, laborCost: 800, laborHours: 2.5, serviceCategoryId: scBrake.id },
        { code: 'SV008', name: 'ล้างแอร์ เติมน้ำยา', description: 'ล้างระบบแอร์ + เติมน้ำยาแอร์', price: 1200, laborCost: 600, laborHours: 2.0, serviceCategoryId: scElectrical.id },
        { code: 'SV009', name: 'เปลี่ยนแบตเตอรี่', description: 'ค่าบริการเปลี่ยนแบตเตอรี่ (ไม่รวมแบต)', price: 200, laborCost: 150, laborHours: 0.5, serviceCategoryId: scElectrical.id },
        { code: 'SV010', name: 'ซ่อมระบบไฟ', description: 'ตรวจเช็ค/ซ่อมระบบไฟฟ้ารถยนต์', price: 500, laborCost: 500, laborHours: 1.5, serviceCategoryId: scElectrical.id },
        { code: 'SV011', name: 'ตั้งศูนย์ถ่วงล้อ', description: 'ตั้งศูนย์ล้อ + ถ่วงล้อทั้ง 4 ล้อ', price: 800, laborCost: 400, laborHours: 1.0, serviceCategoryId: scTire.id },
        { code: 'SV012', name: 'สลับยางถ่วงล้อ', description: 'สลับตำแหน่งยาง 4 ล้อ พร้อมถ่วง', price: 400, laborCost: 300, laborHours: 1.0, serviceCategoryId: scTire.id },
        { code: 'SV013', name: 'ตรวจเช็คสภาพรถ 30 จุด', description: 'ตรวจเช็คความปลอดภัยทั่วไป 30 รายการ', price: 300, laborCost: 300, laborHours: 1.0, serviceCategoryId: scGeneral.id },
        { code: 'SV014', name: 'ล้างหัวฉีดน้ำมัน', description: 'ล้างทำความสะอาดระบบหัวฉีดเชื้อเพลิง', price: 1500, laborCost: 700, laborHours: 2.0, serviceCategoryId: scEngine.id },
        { code: 'SV015', name: 'เปลี่ยนหัวเทียน', description: 'เปลี่ยนหัวเทียน 4 หัว', price: 400, laborCost: 200, laborHours: 0.5, serviceCategoryId: scEngine.id },
    ]

    for (const s of services) {
        await prisma.service.create({
            data: { ...s, isActive: true }
        })
    }

    // ============================================
    // 6. SPARES CATEGORIES, SPARES & VENDORS
    // ============================================
    console.log('📝 Seeding Spares Categories, Spares & Vendors...')
    const v1 = await prisma.vendor.create({
        data: { code: 'V001', name: 'บจก.น้ำมันไทย หล่อลื่น', contactName: 'คุณสมชาย', phone: '02-111-1111', email: 'sales@namman.co.th', address: '123 ถ.พระราม 4 กทม.', taxId: '0105536001234', isActive: true }
    })
    const v2 = await prisma.vendor.create({
        data: { code: 'V002', name: 'บจก.อะไหล่แท้ เซ็นเตอร์', contactName: 'คุณวิภา', phone: '02-222-2222', email: 'order@genuine.co.th', address: '456 ถ.วิภาวดี กทม.', taxId: '0105536005678', isActive: true }
    })
    const v3 = await prisma.vendor.create({
        data: { code: 'V003', name: 'Brake & Suspension Pro', contactName: 'Mr.John', phone: '02-333-3333', email: 'john@brakecenter.com', address: '789 ถ.รัชดา กทม.', taxId: '0105536009012', isActive: true }
    })

    const spCatLube = await prisma.sparesCategory.create({
        data: { code: 'SPC01', name: 'น้ำมันหล่อลื่น & สารเคมี', description: 'น้ำมันเครื่อง, เกียร์, น้ำมันเบรก', isActive: true }
    })
    const spCatFilter = await prisma.sparesCategory.create({
        data: { code: 'SPC02', name: 'ไส้กรอง', description: 'กรองน้ำมันเครื่อง, กรองอากาศ, กรองแอร์', isActive: true }
    })
    const spCatBrake = await prisma.sparesCategory.create({
        data: { code: 'SPC03', name: 'ระบบเบรก', description: 'ผ้าเบรก, จานเบรก, ลูกยางเบรก', isActive: true }
    })
    const spCatElectric = await prisma.sparesCategory.create({
        data: { code: 'SPC04', name: 'ระบบไฟ & แบตเตอรี่', description: 'หลอดไฟ, แบตเตอรี่, หัวเทียน', isActive: true }
    })
    const spCatBelt = await prisma.sparesCategory.create({
        data: { code: 'SPC05', name: 'สายพาน & ท่อยาง', description: 'สายพานไทม์มิ่ง, สายพานหน้าเครื่อง', isActive: true }
    })

    const spares = [
        { code: 'SP001', name: 'น้ำมันเครื่อง สังเคราะห์แท้ 0W-20 (4L)', sparesCategoryId: spCatLube.id, vendorId: v1.id, unit: 'แกลลอน', costPrice: 650, sellingPrice: 950, currentStock: 35, minStock: 5, maxStock: 100, reorderPoint: 10 },
        { code: 'SP002', name: 'น้ำมันเครื่อง กึ่งสังเคราะห์ 5W-30 (4L)', sparesCategoryId: spCatLube.id, vendorId: v1.id, unit: 'แกลลอน', costPrice: 550, sellingPrice: 850, currentStock: 40, minStock: 5, maxStock: 100, reorderPoint: 10 },
        { code: 'SP003', name: 'น้ำมันเครื่อง ดีเซล 10W-30 (6L)', sparesCategoryId: spCatLube.id, vendorId: v1.id, unit: 'แกลลอน', costPrice: 700, sellingPrice: 1050, currentStock: 25, minStock: 5, maxStock: 100, reorderPoint: 10 },
        { code: 'SP004', name: 'น้ำมันเกียร์ ATF WS (1L)', sparesCategoryId: spCatLube.id, vendorId: v1.id, unit: 'ลิตร', costPrice: 180, sellingPrice: 280, currentStock: 50, minStock: 10, maxStock: 150, reorderPoint: 20 },
        { code: 'SP005', name: 'กรองน้ำมันเครื่อง Toyota แท้', sparesCategoryId: spCatFilter.id, vendorId: v2.id, unit: 'ชิ้น', costPrice: 80, sellingPrice: 150, currentStock: 60, minStock: 10, maxStock: 200, reorderPoint: 20 },
        { code: 'SP006', name: 'กรองน้ำมันเครื่อง Honda แท้', sparesCategoryId: spCatFilter.id, vendorId: v2.id, unit: 'ชิ้น', costPrice: 85, sellingPrice: 160, currentStock: 45, minStock: 10, maxStock: 200, reorderPoint: 20 },
        { code: 'SP007', name: 'กรองอากาศ Camry/Altis', sparesCategoryId: spCatFilter.id, vendorId: v2.id, unit: 'ชิ้น', costPrice: 150, sellingPrice: 300, currentStock: 20, minStock: 5, maxStock: 50, reorderPoint: 10 },
        { code: 'SP008', name: 'กรองแอร์ PM2.5', sparesCategoryId: spCatFilter.id, vendorId: v2.id, unit: 'ชิ้น', costPrice: 120, sellingPrice: 250, currentStock: 30, minStock: 5, maxStock: 60, reorderPoint: 10 },
        { code: 'SP009', name: 'ผ้าเบรกหน้า Bendix Ultra Premium', sparesCategoryId: spCatBrake.id, vendorId: v3.id, unit: 'ชุด', costPrice: 600, sellingPrice: 1100, currentStock: 15, minStock: 3, maxStock: 30, reorderPoint: 5 },
        { code: 'SP010', name: 'ผ้าเบรกหลัง Bendix Ultra Premium', sparesCategoryId: spCatBrake.id, vendorId: v3.id, unit: 'ชุด', costPrice: 500, sellingPrice: 950, currentStock: 12, minStock: 3, maxStock: 30, reorderPoint: 5 },
        { code: 'SP011', name: 'น้ำมันเบรก DOT4 (0.5L)', sparesCategoryId: spCatBrake.id, vendorId: v3.id, unit: 'ขวด', costPrice: 90, sellingPrice: 180, currentStock: 40, minStock: 8, maxStock: 80, reorderPoint: 15 },
        { code: 'SP012', name: 'หัวเทียน NGK Iridium (1 หัว)', sparesCategoryId: spCatElectric.id, vendorId: v2.id, unit: 'หัว', costPrice: 120, sellingPrice: 220, currentStock: 48, minStock: 12, maxStock: 100, reorderPoint: 20 },
        { code: 'SP013', name: 'แบตเตอรี่ GS Maintenance Free 65Ah', sparesCategoryId: spCatElectric.id, vendorId: v2.id, unit: 'ลูก', costPrice: 1800, sellingPrice: 2800, currentStock: 8, minStock: 2, maxStock: 20, reorderPoint: 4 },
        { code: 'SP014', name: 'สายพานไทม์มิ่ง Gates', sparesCategoryId: spCatBelt.id, vendorId: v2.id, unit: 'เส้น', costPrice: 850, sellingPrice: 1500, currentStock: 10, minStock: 2, maxStock: 20, reorderPoint: 4 },
        { code: 'SP015', name: 'สายพานหน้าเครื่อง Bando', sparesCategoryId: spCatBelt.id, vendorId: v2.id, unit: 'เส้น', costPrice: 350, sellingPrice: 650, currentStock: 15, minStock: 3, maxStock: 30, reorderPoint: 6 },
    ]

    for (const sp of spares) {
        await prisma.spare.create({
            data: { ...sp, isActive: true }
        })
    }

    // ============================================
    // 7. PAYMENT TYPES
    // ============================================
    console.log('📝 Seeding Payment Types...')
    const paymentTypes = [
        { code: 'PM01', name: 'เงินสด', description: 'รับชำระด้วยเงินสด', isActive: true },
        { code: 'PM02', name: 'โอนเงิน', description: 'โอนผ่านบัญชีธนาคาร', isActive: true },
        { code: 'PM03', name: 'QR PromptPay', description: 'สแกน QR Code PromptPay', isActive: true },
        { code: 'PM04', name: 'บัตรเครดิต', description: 'Visa, Mastercard, JCB', isActive: true },
        { code: 'PM05', name: 'บัตรเดบิต', description: 'บัตรเดบิตธนาคาร', isActive: true },
        { code: 'PM06', name: 'เครดิต (วางบิล)', description: 'ชำระภายหลัง (เฉพาะลูกค้านิติบุคคล/VIP)', isActive: true },
    ]

    for (const pt of paymentTypes) {
        await prisma.paymentType.create({ data: pt })
    }

    // ============================================
    // 8. MAINTENANCE TEMPLATES
    // ============================================
    console.log('📝 Seeding Maintenance Templates...')
    const template10k = await prisma.maintenanceTemplate.create({
        data: { name: 'บำรุงรักษา 10,000 km', description: 'การบำรุงรักษาประจำที่ 10,000 กิโลเมตร', mileageInterval: 10000, monthInterval: 6, isActive: true }
    })
    const template20k = await prisma.maintenanceTemplate.create({
        data: { name: 'บำรุงรักษา 20,000 km', description: 'การบำรุงรักษาประจำที่ 20,000 กิโลเมตร', mileageInterval: 20000, monthInterval: 12, isActive: true }
    })
    const template40k = await prisma.maintenanceTemplate.create({
        data: { name: 'บำรุงรักษา 40,000 km', description: 'การบำรุงรักษาหลัก 40,000 กิโลเมตร', mileageInterval: 40000, monthInterval: 24, isActive: true }
    })

    await prisma.maintenanceTemplateItem.createMany({
        data: [
            { maintenanceTemplateId: template10k.id, description: 'เปลี่ยนน้ำมันเครื่อง', isRequired: true, estimatedCost: 1500 },
            { maintenanceTemplateId: template10k.id, description: 'เปลี่ยนไส้กรองน้ำมันเครื่อง', isRequired: true, estimatedCost: 300 },
            { maintenanceTemplateId: template10k.id, description: 'ตรวจเช็คระบบเบรก', isRequired: true, estimatedCost: 0 },
            { maintenanceTemplateId: template20k.id, description: 'เปลี่ยนน้ำมันเครื่อง + ไส้กรอง', isRequired: true, estimatedCost: 1800 },
            { maintenanceTemplateId: template20k.id, description: 'เปลี่ยนไส้กรองอากาศ', isRequired: true, estimatedCost: 500 },
            { maintenanceTemplateId: template40k.id, description: 'บำรุงรักษาหลัก - เปลี่ยนน้ำมันเกียร์', isRequired: true, estimatedCost: 3500 },
        ]
    })

    // ============================================
    // 9. SERVICE JOBS & WORKFLOW
    // ============================================
    console.log('📝 Seeding Sample Service Jobs...')
    const serviceJob1 = await prisma.serviceJob.create({
        data: {
            jobNo: 'SJ-2026-0001',
            jobDate: new Date(),
            carId: car1.id,
            customerId: customer1.id,
            mileage: 45000,
            technicianId: empTech.id,
            status: 'APPROVED',
            priority: 'NORMAL',
            description: 'บำรุงรักษาประจำ 40,000 km',
            customerRequest: 'ต้องการเปลี่ยนน้ำมันเครื่องและตรวจสอบระบบต่างๆ',
            estimatedCompletionDays: 2,
            workshopBay: '1',
            appointmentDate: new Date(),
            inspectionChecklist: {
                fluids: { oilEngine: true, oilTransmission: true, oilBrake: true, coolant: false, washerFluid: false },
                brakes: { brakePadsFront: true, brakePadsRear: true, brakeSystemCheck: true },
                tires: { tireRotation: false, tireReplace: false, wheelAlignment: true },
                drivetrain: { engineCheck: true, transmissionCheck: false, suspension: false },
                electrical: { lightsCheck: true, battery: true, acSystem: true, wiper: false }
            },
            quotationNo: 'QT-2026-0001',
            quotationDate: new Date(),
            approvalStatus: 'APPROVED',
            approvedBy: customer1.fullName,
            approvedDate: new Date(),
            receivedDate: new Date(),
            estimatedCost: 7500,
            laborCost: 1500,
            partsCost: 6000,
            totalCost: 7500,
            vat: 7,
            vatAmount: 525,
            grandTotal: 8025,
            isPaid: false
        }
    })

    await prisma.serviceJobLabor.createMany({
        data: [
            { serviceJobId: serviceJob1.id, technicianId: empTech.id, description: 'เปลี่ยนถ่ายน้ำมันเครื่อง', hoursWorked: 1.5, laborRate: 500, laborCost: 750, notes: 'ใช้น้ำมันสังเคราะห์แท้ 100%' },
            { serviceJobId: serviceJob1.id, technicianId: empTech.id, description: 'ตรวจเช็คและบำรุงรักษาระบบเบรก', hoursWorked: 1.0, laborRate: 500, laborCost: 500, notes: 'ผ้าเบรกหน้ายังใช้ได้ 60%' }
        ]
    })

    await prisma.serviceJobQC.create({
        data: {
            serviceJobId: serviceJob1.id,
            qcChecklist: {
                exterior: { bodyCondition: true, paintCondition: true, lightsWorking: true, tiresCondition: true },
                interior: { cleanedInside: true, dashboardFunctional: true, acWorking: true },
                mechanical: { engineSound: true, brakeTest: true, transmissionTest: true },
                testDrive: { completed: true, distanceKm: 5, issues: null }
            },
            qcPassedAll: true,
            qcBy: empTech.name,
            qcDate: new Date(),
            qcNotes: 'ทุกอย่างปกติดี พร้อมส่งมอบ'
        }
    })

    await prisma.serviceJobRecommendation.createMany({
        data: [
            { serviceJobId: serviceJob1.id, description: 'แนะนำเปลี่ยนผ้าเบรกหน้า', reason: 'ผ้าเบรกหน้าเหลืออายุการใช้งาน 40% ควรเปลี่ยนภายใน 5,000 km', priority: 'RECOMMENDED', estimatedCost: 2500, dueAtMileage: 50000, isAccepted: false },
            { serviceJobId: serviceJob1.id, description: 'เปลี่ยนน้ำยาหล่อเย็น', reason: 'น้ำยาหล่อเย็นเริ่มเสื่อมสภาพ', priority: 'OPTIONAL', estimatedCost: 1200, isAccepted: false }
        ]
    })

    await prisma.maintenanceReminder.createMany({
        data: [
            { carId: car1.id, customerId: customer1.id, reminderType: 'MILEAGE_BASED', title: 'บำรุงรักษา 50,000 km', description: 'ถึงเวลาบำรุงรักษาประจำที่ 50,000 กิโลเมตร', dueAtMileage: 50000, notifyBeforeKm: 500, notifyVia: 'LINE', status: 'ACTIVE' },
            { carId: car1.id, customerId: customer1.id, reminderType: 'TIME_BASED', title: 'ตรวจสอบแบตเตอรี่', description: 'ตรวจสอบแบตเตอรี่และระบบไฟฟ้า', dueAtDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), notifyBeforeDays: 7, notifyVia: 'SMS', status: 'ACTIVE' },
            { carId: car2.id, customerId: customer2.id, reminderType: 'BOTH', title: 'บำรุงรักษา 70,000 km', description: 'บำรุงรักษาหลัก 70,000 km หรือ 6 เดือน', dueAtMileage: 70000, dueAtDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), notifyBeforeKm: 1000, notifyBeforeDays: 14, notifyVia: 'Email,LINE', status: 'ACTIVE' }
        ]
    })

    console.log('🎉 ✨ FULL DATABASE SEED COMPLETED SUCCESSFULLY!')
}

main()
    .catch((e) => {
        console.error('❌ Error in seed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
