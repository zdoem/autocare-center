
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Testing Service Creation directly via Prisma...')
    try {
        const code = 'TEST-' + Math.floor(Math.random() * 1000)
        const service = await prisma.service.create({
            data: {
                code: code,
                name: 'Test Service ' + code,
                price: 100,
                isActive: true,
            },
        })
        console.log('Successfully created service:', service)

        // Clean up
        await prisma.service.delete({ where: { id: service.id } })
        console.log('Successfully deleted test service')

    } catch (e) {
        console.error('Error in direct Prisma test:', e)
        throw e
    }
}

main()
    .catch((e) => process.exit(1))
    .finally(async () => await prisma.$disconnect())
