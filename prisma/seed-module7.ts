/**
 * Seed Module 7: Car Registration & Operations
 * - Thai provinces
 * - Sample cars with images
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Thai provinces (สำคัญ 15 จังหวัด)
const provinces = [
    'กรุงเทพมหานคร',
    'นนทบุรี',
    'ปทุมธานี',
    'สมุทรปราการ',
    'นครปฐม',
    'เชียงใหม่',
    'ภูเก็ต',
    'ชลบุรี',
    'ระยอง',
    'นครราชสีมา',
    'ขอนแก่น',
    'อุดรธานี',
    'สงขลา',
    'สุราษฎร์ธานี',
    'กระบี่'
]

// Sample license plates (Thai format)
const sampleCars = [
    { plate: 'กข-1234', province: 'กรุงเทพมหานคร', brand: 'Toyota', model: 'Camry', year: 2567, color: 'ขาว', mileage: 52345 },
    { plate: 'กข-5678', province: 'กรุงเทพมหานคร', brand: 'Honda', model: 'Civic', year: 2566, color: 'ดำ', mileage: 38200 },
    { plate: 'กข-9999', province: 'กรุงเทพมหานคร', brand: 'Mazda', model: 'Mazda3', year: 2565, color: 'แดง', mileage: 45800 },
    { plate: 'กข-1111', province: 'กรุงเทพมหานคร', brand: 'Toyota', model: 'Yaris', year: 2564, color: 'เงิน', mileage: 68900 },
    { plate: 'กข-2222', province: 'กรุงเทพมหานคร', brand: 'Nissan', model: 'Almera', year: 2563, color: 'ฟ้า', mileage: 72300 },
    { plate: '1กก-1234', province: 'นนทบุรี', brand: 'Toyota', model: 'Fortuner', year: 2566, color: 'ขาว', mileage: 28500 },
    { plate: '2กข-5678', province: 'ปทุมธานี', brand: 'Honda', model: 'CR-V', year: 2565, color: 'เทา', mileage: 41200 },
    { plate: '3กก-9876', province: 'สมุทรปราการ', brand: 'Mazda', model: 'CX-5', year: 2567, color: 'ดำ', mileage: 15600 },
    { plate: '4กข-1111', province: 'นครปฐม', brand: 'Toyota', model: 'Vios', year: 2564, color: 'เงิน', mileage: 58700 },
    { plate: '5กก-2222', province: 'เชียงใหม่', brand: 'Honda', model: 'City', year: 2565, color: 'ขาว', mileage: 35400 },
    { plate: 'กข-7777', province: 'กรุงเทพมหานคร', brand: 'Toyota', model: 'Corolla Altis', year: 2566, color: 'เทา', mileage: 31200 },
    { plate: 'กข-888', province: 'กรุงเทพมหานคร', brand: 'Honda', model: 'Accord', year: 2567, color: 'ดำ', mileage: 8500 },
    { plate: '6กก-3456', province: 'ภูเก็ต', brand: 'Mazda', model: 'CX-30', year: 2566, color: 'ฟ้า', mileage: 22100 },
    { plate: '7กข-7890', province: 'ชลบุรี', brand: 'Toyota', model: 'Hilux Revo', year: 2565, color: 'เทา', mileage: 48300 },
    { plate: '8กก-4567', province: 'ระยอง', brand: 'Nissan', model: 'Navara', year: 2564, color: 'ขาว', mileage: 65200 },
    { plate: 'กข-3333', province: 'กรุงเทพมหานคร', brand: 'Honda', model: 'Jazz', year: 2565, color: 'แดง', mileage: 42800 },
    { plate: '9กก-8888', province: 'นครราชสีมา', brand: 'Toyota', model: 'Innova', year: 2566, color: 'เงิน', mileage: 29500 },
    { plate: 'กค-1212', province: 'กรุงเทพมหานคร', brand: 'Mazda', model: 'Mazda2', year: 2564, color: 'ขาว', mileage: 51700 },
    { plate: 'กง-3434', province: 'กรุงเทพมหานคร', brand: 'Honda', model: 'HR-V', year: 2567, color: 'ดำ', mileage: 12300 },
    { plate: 'กจ-5656', province: 'กรุงเทพมหานคร', brand: 'Toyota', model: 'C-HR', year: 2566, color: 'เทา', mileage: 25800 }
]

async function main() {
    console.log('🚗 Starting Module 7 seed...')

    try {
        // Get existing data
        const customers = await prisma.customer.findMany({
            take: 20,
            orderBy: { createdAt: 'asc' }
        })

        const carBrands = await prisma.carBrand.findMany()
        const carModels = await prisma.carModel.findMany()

        if (customers.length === 0) {
            console.warn('⚠️  No customers found. Please seed Module 4 first.')
            return
        }

        if (carBrands.length === 0 || carModels.length === 0) {
            console.warn('⚠️  No car brands/models found. Please seed Module 5 first.')
            return
        }

        console.log(`📊 Found ${customers.length} customers, ${carBrands.length} brands, ${carModels.length} models`)

        // Create a map for quick brand lookup
        const brandMap = new Map()
        carBrands.forEach((b: any) => {
            brandMap.set(b.nameEnglish.toLowerCase(), b.id)
            brandMap.set(b.nameThai, b.id)
        })

        // Create a map for quick model lookup
        const modelMap = new Map()
        carModels.forEach((m: any) => {
            modelMap.set(m.name.toLowerCase(), m)
        })

        // Generate car codes
        let carCount = 0
        const today = new Date()
        const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '') // "20260208"

        for (let i = 0; i < sampleCars.length && i < customers.length; i++) {
            const carData = sampleCars[i]
            const customer = customers[i]

            // Find brand
            const brandId = brandMap.get(carData.brand.toLowerCase())
            if (!brandId) {
                console.warn(`⚠️  Brand not found: ${carData.brand}`)
                continue
            }

            // Find model
            const model = modelMap.get(carData.model.toLowerCase())
            if (!model) {
                console.warn(`⚠️  Model not found: ${carData.model}`)
                continue
            }

            // Generate car code
            const runningNumber = i + 1
            const carCode = `${datePrefix}-${String(runningNumber).padStart(3, '0')}`

            // Check if car already exists
            const existing = await prisma.car.findUnique({
                where: { licensePlate: carData.plate }
            })

            if (existing) {
                console.log(`⏭️  Car already exists: ${carData.plate}`)
                continue
            }

            // Create car
            const car = await prisma.car.create({
                data: {
                    code: carCode,
                    licensePlate: carData.plate,
                    province: carData.province,
                    carBrandId: brandId,
                    carModelId: model.id,
                    customerId: customer.id,
                    year: carData.year,
                    color: carData.color,
                    mileage: carData.mileage,
                    isActive: true
                }
            })

            carCount++
            console.log(`✅ Created car: ${car.code} - ${car.licensePlate} (${carData.brand} ${carData.model})`)

            // Create sample car images (mock paths)
            const imageCount = Math.floor(Math.random() * 3) + 1 // 1-3 images per car
            for (let j = 0; j < imageCount; j++) {
                const yearFolder = carData.year || new Date().getFullYear()
                const imagePath = `/images/car/${yearFolder}/${carData.plate}/image_${j + 1}.jpg`

                await prisma.carImage.create({
                    data: {
                        carId: car.id,
                        imageUrl: imagePath
                    }
                })
            }
            console.log(`   📸 Added ${imageCount} sample images`)
        }

        console.log(`\n✨ Module 7 seed completed!`)
        console.log(`   - Created ${carCount} cars`)
        console.log(`   - Provinces available: ${provinces.length}`)
        console.log(`\n🚀 Ready to test car registration and operations!`)

    } catch (error) {
        console.error('❌ Error seeding Module 7:', error)
        throw error
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
