import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedModule6() {
    console.log('🔧 Seeding Module 6: Services & Parts...')

    // ============================================
    // 1. VENDORS (ต้องสร้างก่อนเพราะ Spare ต้องอ้างอิง)
    // ============================================
    console.log('📝 Seeding Vendors...')

    const vendor1 = await prisma.vendor.create({
        data: {
            code: 'V001',
            name: 'บจก.น้ำมันไทย',
            contactName: 'คุณสมชาย',
            phone: '02-111-1111',
            email: 'sales@namman.co.th',
            address: '123 ถ.พระราม 4',
            taxId: '0105536001234',
            isActive: true,
        },
    })

    const vendor2 = await prisma.vendor.create({
        data: {
            code: 'V002',
            name: 'บจก.อะไหล่แท้',
            contactName: 'คุณวิภา',
            phone: '02-222-2222',
            email: 'order@genuine.co.th',
            address: '456 ถ.วิภาวดี',
            taxId: '0105536005678',
            isActive: true,
        },
    })

    const vendor3 = await prisma.vendor.create({
        data: {
            code: 'V003',
            name: 'Brake Center',
            contactName: 'Mr.John',
            phone: '02-333-3333',
            email: 'john@brakecenter.com',
            address: '789 ถ.รัชดา',
            taxId: '0105536009012',
            isActive: true,
        },
    })

    const vendor4 = await prisma.vendor.create({
        data: {
            code: 'V004',
            name: 'ยางดี',
            contactName: 'คุณมานะ',
            phone: '02-444-4444',
            email: 'mana@yangdee.co.th',
            address: '101 ถ.พหลโยธิน',
            taxId: '0105536003456',
            isActive: true,
        },
    })

    const vendor5 = await prisma.vendor.create({
        data: {
            code: 'V005',
            name: 'ไฟฟ้ารถยนต์',
            contactName: 'คุณนิดา',
            phone: '02-555-5555',
            email: 'nida@carelectric.com',
            address: '200 ถ.บางนา',
            taxId: '0105536007890',
            isActive: true,
        },
    })

    // ============================================
    // 2. SERVICES (ไม่มี ServiceCategory ใน mockup)
    // ============================================
    console.log('📝 Seeding Services...')

    await prisma.service.createMany({
        data: [
            {
                code: 'SV01',
                name: 'เปลี่ยนถ่ายน้ำมันเครื่อง',
                description: 'เปลี่ยนน้ำมันเครื่อง + กรองน้ำมัน',
                price: 2400,
                laborCost: 500,
                laborHours: 1,
                isActive: true,
            },
            {
                code: 'SV02',
                name: 'เช็คระยะ 10,000 กม.',
                description: 'ตรวจเช็คตามระยะ พร้อมเปลี่ยนน้ำมัน',
                price: 4000,
                laborCost: 1000,
                laborHours: 2,
                isActive: true,
            },
            {
                code: 'SV03',
                name: 'เช็คระยะ 20,000 กม.',
                description: 'ตรวจเช็คตามระยะพร้อมเปลี่ยนกรอง',
                price: 5500,
                laborCost: 1500,
                laborHours: 2.5,
                isActive: true,
            },
            {
                code: 'SV04',
                name: 'เปลี่ยนผ้าเบรก',
                description: 'เปลี่ยนผ้าเบรก (ราคา/ล้อ)',
                price: 2500,
                laborCost: 500,
                laborHours: 1,
                isActive: true,
            },
            {
                code: 'SV05',
                name: 'เปลี่ยนยาง',
                description: 'เปลี่ยนยาง + ถ่วงล้อ (ราคา/เส้น)',
                price: 3000,
                laborCost: 300,
                laborHours: 0.5,
                isActive: true,
            },
            {
                code: 'SV06',
                name: 'ซ่อมแอร์',
                description: 'ตรวจ/ซ่อมระบบปรับอากาศ',
                price: 5000,
                laborCost: 2000,
                laborHours: 3,
                isActive: true,
            },
        ],
    })

    // ============================================
    // 3. SPARES CATEGORIES
    // ============================================
    console.log('📝 Seeding Spares Categories...')

    const catOil = await prisma.sparesCategory.create({
        data: {
            code: 'SC01',
            name: 'น้ำมัน/ของเหลว',
            description: 'น้ำมันเครื่อง, น้ำมันเกียร์, น้ำยาหล่อเย็น',
            isActive: true,
        },
    })

    const catFilter = await prisma.sparesCategory.create({
        data: {
            code: 'SC02',
            name: 'กรอง',
            description: 'กรองน้ำมัน, กรองอากาศ, กรองแอร์',
            isActive: true,
        },
    })

    const catBrake = await prisma.sparesCategory.create({
        data: {
            code: 'SC03',
            name: 'ระบบเบรก',
            description: 'ผ้าเบรก, จานเบรก, น้ำมันเบรก',
            isActive: true,
        },
    })

    const catTire = await prisma.sparesCategory.create({
        data: {
            code: 'SC04',
            name: 'ยาง/ล้อ',
            description: 'ยางรถยนต์, ล้อแม็ก',
            isActive: true,
        },
    })

    const catElectric = await prisma.sparesCategory.create({
        data: {
            code: 'SC05',
            name: 'ระบบไฟฟ้า',
            description: 'แบตเตอรี่, หลอดไฟ, ฟิวส์',
            isActive: true,
        },
    })

    const catIgnition = await prisma.sparesCategory.create({
        data: {
            code: 'SC06',
            name: 'จุดระเบิด',
            description: 'หัวเทียน, คอยล์จุดระเบิด',
            isActive: true,
        },
    })

    const catSuspension = await prisma.sparesCategory.create({
        data: {
            code: 'SC07',
            name: 'ช่วงล่าง',
            description: 'โช๊คอัพ, ลูกหมาก, บุชยาง',
            isActive: true,
        },
    })

    // ============================================
    // 4. SPARES (Sample data matching mockup)
    // ============================================
    console.log('📝 Seeding Spares...')

    await prisma.spare.create({
        data: {
            code: 'SP001',
            name: 'น้ำมันเครื่อง Castrol 5W-40 4L',
            description: 'น้ำมันเครื่องสังเคราะห์แท้',
            sparesCategoryId: catOil.id,
            vendorId: vendor1.id,
            unit: 'ขวด',
            costPrice: 900,
            sellingPrice: 1200,
            minStock: 10,
            maxStock: 100,
            currentStock: 45,
            reorderPoint: 10,
            isActive: true,
        },
    })

    await prisma.spare.create({
        data: {
            code: 'SP002',
            name: 'กรองน้ำมันเครื่อง Toyota',
            description: 'กรองน้ำมันเครื่องแท้ Toyota',
            sparesCategoryId: catFilter.id,
            vendorId: vendor2.id,
            unit: 'ชิ้น',
            costPrice: 250,
            sellingPrice: 350,
            minStock: 10,
            maxStock: 100,
            currentStock: 2, // LOW STOCK
            reorderPoint: 10,
            isActive: true,
        },
    })

    await prisma.spare.create({
        data: {
            code: 'SP003',
            name: 'ผ้าเบรกหน้า Brembo',
            description: 'ผ้าเบรกหน้า Brembo คุณภาพสูง',
            sparesCategoryId: catBrake.id,
            vendorId: vendor3.id,
            unit: 'ชุด',
            costPrice: 2200,
            sellingPrice: 2800,
            minStock: 5,
            maxStock: 50,
            currentStock: 15,
            reorderPoint: 5,
            isActive: true,
        },
    })

    await prisma.spare.create({
        data: {
            code: 'SP004',
            name: 'ยาง Bridgestone Turanza 195/65R15',
            description: 'ยางรถยนท์ Bridgestone Turanza',
            sparesCategoryId: catTire.id,
            vendorId: vendor4.id,
            unit: 'เส้น',
            costPrice: 2200,
            sellingPrice: 2800,
            minStock: 8,
            maxStock: 40,
            currentStock: 12,
            reorderPoint: 8,
            isActive: true,
        },
    })

    await prisma.spare.create({
        data: {
            code: 'SP005',
            name: 'แบตเตอรี่ GS 55B24L',
            description: 'แบตเตอรี่ GS MF 55B24L',
            sparesCategoryId: catElectric.id,
            vendorId: vendor5.id,
            unit: 'ลูก',
            costPrice: 1800,
            sellingPrice: 2400,
            minStock: 5,
            maxStock: 30,
            currentStock: 8,
            reorderPoint: 5,
            isActive: true,
        },
    })

    await prisma.spare.create({
        data: {
            code: 'SP006',
            name: 'กรองอากาศ Honda',
            description: 'กรองอากาศแท้ Honda',
            sparesCategoryId: catFilter.id,
            vendorId: vendor2.id,
            unit: 'ชิ้น',
            costPrice: 280,
            sellingPrice: 380,
            minStock: 8,
            maxStock: 80,
            currentStock: 22,
            reorderPoint: 8,
            isActive: true,
        },
    })

    await prisma.spare.create({
        data: {
            code: 'SP007',
            name: 'หัวเทียน Denso Iridium',
            description: 'หัวเทียน Denso Iridium แท้',
            sparesCategoryId: catIgnition.id,
            vendorId: vendor2.id,
            unit: 'ชิ้น',
            costPrice: 180,
            sellingPrice: 250,
            minStock: 12,
            maxStock: 100,
            currentStock: 35,
            reorderPoint: 12,
            isActive: true,
        },
    })

    await prisma.spare.create({
        data: {
            code: 'SP008',
            name: 'โช๊คอัพหน้า KYB',
            description: 'โช๊คอัพหน้า KYB Excel-G',
            sparesCategoryId: catSuspension.id,
            vendorId: vendor2.id,
            unit: 'คู่',
            costPrice: 3200,
            sellingPrice: 4200,
            minStock: 4,
            maxStock: 20,
            currentStock: 6,
            reorderPoint: 4,
            isActive: true,
        },
    })

    console.log('✅ Module 6 Seeding completed!')
    console.log('   - Vendors: 5')
    console.log('   - Services: 6')
    console.log('   - Spares Categories: 7')
    console.log('   - Spares: 8')
}

async function main() {
    try {
        await seedModule6()
    } catch (e: any) {
        console.error('Error seeding Module 6:', e)
        throw e
    } finally {
        await prisma.$disconnect()
    }
}

main()
