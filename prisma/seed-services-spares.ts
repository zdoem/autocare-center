
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // ============================================
    // บริการ (Service)
    // ============================================
    const services = [
        { code: 'SV001', name: 'เปลี่ยนถ่ายน้ำมันเครื่อง', description: 'เปลี่ยนน้ำมันเครื่อง + กรองน้ำมัน', price: 500 },
        { code: 'SV002', name: 'เปลี่ยนผ้าเบรค (หน้า)', description: 'เปลี่ยนผ้าเบรคล้อหน้า ซ้าย-ขวา', price: 1200 },
        { code: 'SV003', name: 'เปลี่ยนผ้าเบรค (หลัง)', description: 'เปลี่ยนผ้าเบรคล้อหลัง ซ้าย-ขวา', price: 1000 },
        { code: 'SV004', name: 'ตั้งศูนย์ถ่วงล้อ', description: 'ตั้งศูนย์ล้อ + ถ่วงล้อทั้ง 4 ล้อ', price: 800 },
        { code: 'SV005', name: 'เช็คระยะ 10,000 km', description: 'เช็คระยะตามคู่มือ ทุก 10,000 กม.', price: 1500 },
        { code: 'SV006', name: 'เช็คระยะ 20,000 km', description: 'เช็คระยะตามคู่มือ ทุก 20,000 กม.', price: 2500 },
        { code: 'SV007', name: 'เปลี่ยนน้ำมันเกียร์', description: 'ถ่ายน้ำมันเกียร์ออโต้/ธรรมดา', price: 800 },
        { code: 'SV008', name: 'เปลี่ยนสายพานไทม์มิ่ง', description: 'เปลี่ยนสายพาน + ลูกรอก + ปั๊มน้ำ', price: 3500 },
        { code: 'SV009', name: 'ล้างแอร์ เติมน้ำยา', description: 'ล้างระบบแอร์ + เติมน้ำยาแอร์', price: 1200 },
        { code: 'SV010', name: 'เปลี่ยนโช้คอัพ (คู่)', description: 'เปลี่ยนโช้คอัพ 1 คู่ (หน้าหรือหลัง)', price: 2000 },
        { code: 'SV011', name: 'ตรวจเช็คสภาพรถ', description: 'ตรวจเช็คทั่วไป 30 จุด', price: 300 },
        { code: 'SV012', name: 'เปลี่ยนแบตเตอรี่', description: 'ค่าบริการเปลี่ยนแบตเตอรี่ (ไม่รวมแบต)', price: 200 },
        { code: 'SV013', name: 'ซ่อมระบบไฟ', description: 'ตรวจเช็ค/ซ่อมระบบไฟฟ้ารถยนต์', price: 500 },
        { code: 'SV014', name: 'เปลี่ยนหัวเทียน', description: 'เปลี่ยนหัวเทียน 4 หัว', price: 400 },
        { code: 'SV015', name: 'ล้างหัวฉีด', description: 'ล้างหัวฉีดน้ำมัน', price: 1500 },
    ]

    console.log('🔧 Seeding Services...')
    for (const svc of services) {
        const result = await prisma.service.upsert({
            where: { code: svc.code },
            update: { name: svc.name, description: svc.description, price: svc.price },
            create: { ...svc, isActive: true },
        })
        console.log(`  ✅ ${result.code} - ${result.name}`)
    }

    // ============================================
    // อะไหล่ (Spare Parts)
    // ============================================

    // ต้องหา/สร้าง SparesCategory ก่อน
    const categories = [
        { code: 'SC01', name: 'น้ำมันหล่อลื่น', description: 'น้ำมันเครื่อง, เกียร์, เพาเวอร์' },
        { code: 'SC02', name: 'กรอง', description: 'กรองน้ำมัน, กรองอากาศ, กรองแอร์' },
        { code: 'SC03', name: 'ระบบเบรค', description: 'ผ้าเบรค, จานเบรค, น้ำมันเบรค' },
        { code: 'SC04', name: 'ระบบไฟ', description: 'หลอดไฟ, แบตเตอรี่, หัวเทียน' },
        { code: 'SC05', name: 'สายพาน', description: 'สายพานต่างๆ' },
    ]

    console.log('\n📦 Seeding Spare Categories...')
    const categoryMap: Record<string, string> = {}
    for (const cat of categories) {
        const result = await prisma.sparesCategory.upsert({
            where: { code: cat.code },
            update: { name: cat.name, description: cat.description },
            create: { ...cat, isActive: true },
        })
        categoryMap[cat.code] = result.id
        console.log(`  ✅ ${result.code} - ${result.name}`)
    }

    const spares = [
        { code: 'SP001', name: 'น้ำมันเครื่อง 0W-20 (4L)', catCode: 'SC01', unit: 'ขวด', costPrice: 650, sellingPrice: 950 },
        { code: 'SP002', name: 'น้ำมันเครื่อง 5W-30 (4L)', catCode: 'SC01', unit: 'ขวด', costPrice: 550, sellingPrice: 850 },
        { code: 'SP003', name: 'น้ำมันเครื่อง 5W-40 (4L)', catCode: 'SC01', unit: 'ขวด', costPrice: 700, sellingPrice: 1050 },
        { code: 'SP004', name: 'น้ำมันเกียร์ ATF (1L)', catCode: 'SC01', unit: 'ขวด', costPrice: 180, sellingPrice: 280 },
        { code: 'SP005', name: 'กรองน้ำมันเครื่อง (ทั่วไป)', catCode: 'SC02', unit: 'ชิ้น', costPrice: 80, sellingPrice: 150 },
        { code: 'SP006', name: 'กรองอากาศ (ทั่วไป)', catCode: 'SC02', unit: 'ชิ้น', costPrice: 120, sellingPrice: 250 },
        { code: 'SP007', name: 'กรองแอร์ (ทั่วไป)', catCode: 'SC02', unit: 'ชิ้น', costPrice: 100, sellingPrice: 200 },
        { code: 'SP008', name: 'ผ้าเบรคหน้า (ชุด)', catCode: 'SC03', unit: 'ชุด', costPrice: 500, sellingPrice: 900 },
        { code: 'SP009', name: 'ผ้าเบรคหลัง (ชุด)', catCode: 'SC03', unit: 'ชุด', costPrice: 400, sellingPrice: 750 },
        { code: 'SP010', name: 'น้ำมันเบรค DOT4 (0.5L)', catCode: 'SC03', unit: 'ขวด', costPrice: 90, sellingPrice: 180 },
        { code: 'SP011', name: 'หัวเทียน NGK (1 หัว)', catCode: 'SC04', unit: 'หัว', costPrice: 60, sellingPrice: 120 },
        { code: 'SP012', name: 'หลอดไฟหน้า H4', catCode: 'SC04', unit: 'หลอด', costPrice: 80, sellingPrice: 180 },
        { code: 'SP013', name: 'แบตเตอรี่ 65Ah', catCode: 'SC04', unit: 'ลูก', costPrice: 1800, sellingPrice: 2800 },
        { code: 'SP014', name: 'สายพานไทม์มิ่ง (ทั่วไป)', catCode: 'SC05', unit: 'เส้น', costPrice: 800, sellingPrice: 1500 },
        { code: 'SP015', name: 'สายพานแอร์ + พาวเวอร์', catCode: 'SC05', unit: 'ชุด', costPrice: 400, sellingPrice: 750 },
    ]

    console.log('\n🔩 Seeding Spare Parts...')
    for (const sp of spares) {
        const result = await prisma.spare.upsert({
            where: { code: sp.code },
            update: { name: sp.name, costPrice: sp.costPrice, sellingPrice: sp.sellingPrice },
            create: {
                code: sp.code,
                name: sp.name,
                unit: sp.unit,
                costPrice: sp.costPrice,
                sellingPrice: sp.sellingPrice,
                sparesCategoryId: categoryMap[sp.catCode],
                currentStock: Math.floor(Math.random() * 50) + 5,
                minStock: 3,
                maxStock: 100,
                reorderPoint: 10,
                isActive: true,
            },
        })
        console.log(`  ✅ ${result.code} - ${result.name}`)
    }

    console.log('\n✨ Seed completed!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
