import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
    console.log('🔍 Testing Database Connection...')
    try {
        // 1. Try to fetch one spare
        const count = await prisma.spare.count()
        console.log(`✅ Connection OK! Found ${count} spares.`)

        // 2. Try to fetch a spare with relations to test query engine
        const spare = await prisma.spare.findFirst({
            include: {
                vendor: true,
                sparesCategory: true
            }
        })

        if (spare) {
            console.log('✅ Query Engine OK!')
            console.log('Sample Spare:', JSON.stringify(spare, null, 2))
        } else {
            console.log('⚠️ No spares found to test deep query.')
        }

    } catch (error) {
        console.error('❌ Database Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

testConnection()
