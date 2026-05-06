import { prisma } from '../src/lib/prisma'

async function updateFuelTypes() {
    console.log('🔄 Updating fuel types from Thai to English...')

    // Update เบนซิน → Gasoline
    await prisma.$executeRaw`
        UPDATE "car_models" 
        SET "fuelType" = 'Gasoline' 
        WHERE "fuelType" = 'เบนซิน'
    `

    // Update ดีเซล → Diesel
    await prisma.$executeRaw`
        UPDATE "car_models" 
        SET "fuelType" = 'Diesel' 
        WHERE "fuelType" = 'ดีเซล'
    `

    // Update ไฮบริด → Hybrid
    await prisma.$executeRaw`
        UPDATE "car_models" 
        SET "fuelType" = 'Hybrid' 
        WHERE "fuelType" = 'ไฮบริด'
    `

    console.log('✅ Successfully updated fuel types to English')

    // Verify
    const models = await prisma.$queryRaw`
        SELECT name, "fuelType" FROM "car_models"
    `
    console.log('Current fuel types:', models)

    await prisma.$disconnect()
}

updateFuelTypes().catch((error) => {
    console.error('Error:', error)
    process.exit(1)
})
