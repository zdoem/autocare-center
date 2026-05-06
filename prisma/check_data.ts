import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Checking Database Content...')

    try {
        const brandCount = await prisma.carBrand.count()
        console.log(`✅ CarBrands count: ${brandCount}`)

        if (brandCount > 0) {
            const brands = await prisma.carBrand.findMany({
                include: { models: true },
                take: 3
            })
            console.log('Sample Brands:', JSON.stringify(brands, null, 2))
        }

        const modelCount = await prisma.carModel.count()
        console.log(`✅ CarModels count: ${modelCount}`)

        const userCount = await prisma.user.count()
        console.log(`✅ Users count: ${userCount}`)

        if (userCount > 0) {
            const users = await prisma.user.findMany({
                select: { username: true, role: true, isActive: true }
            })
            console.log('Users found:', JSON.stringify(users, null, 2))
        } else {
            console.error('❌ NO USERS FOUND! Login will fail.')
        }
    } catch (error) {
        console.error('❌ Database Connection Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
