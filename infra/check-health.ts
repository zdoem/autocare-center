import { PrismaClient } from '@prisma/client'
import net from 'net'

const prisma = new PrismaClient()

// Helper to check TCP connection
function checkConnection(host: string, port: number) {
    return new Promise((resolve) => {
        const socket = new net.Socket()
        socket.setTimeout(2000)

        socket.on('connect', () => {
            socket.destroy()
            resolve(true)
        })

        socket.on('timeout', () => {
            socket.destroy()
            resolve(false)
        })

        socket.on('error', () => {
            resolve(false)
        })

        socket.connect(port, host)
    })
}

// Parse DATABASE_URL
// postgresql://postgres:postgres@localhost:5432/autocare_db?schema=public
function parseDbUrl(url: string) {
    try {
        const match = url.match(/postgresql:\/\/.*@(.*):(\d+)\/.*$/)
        if (match) {
            return { host: match[1], port: parseInt(match[2]) }
        }
        return { host: 'localhost', port: 5432 } // Default fallback
    } catch (e) {
        return { host: 'localhost', port: 5432 }
    }
}

async function main() {
    console.log('\n🏥 SYSTEM HEALTH CHECK')
    console.log('=============================================')

    // 1. Check Database Infrastructure
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
        console.error('❌ CONFIG: DATABASE_URL is missing in .env')
        process.exit(1)
    }

    const { host, port } = parseDbUrl(dbUrl)
    console.log(`🔌 Connecting to Database Host: ${host}:${port}...`)

    const isDbReachable = await checkConnection(host, port)
    if (isDbReachable) {
        console.log('✅ INFRA: Database Service is REACHABLE (TCP Connected)')
    } else {
        console.error('❌ INFRA: Database Service is UNREACHABLE')
        console.error('   👉 Check if Docker is running')
        console.error('   👉 Check if Postgres container is up (port 5432)')
        process.exit(1)
    }

    // 2. Check Prisma Connection & Schema
    try {
        await prisma.$connect()
        console.log('✅ PRISMA: Connection Authenticated')
    } catch (e: any) {
        console.error('❌ PRISMA: Authentication Failed')
        console.error('   👉 Check Username/Password in DATABASE_URL')
        console.error('   👉 Check Database Name')
        console.error(e.message)
        process.exit(1)
    }

    // 3. Check Data Requirements
    try {
        const userCount = await prisma.user.count()
        if (userCount > 0) {
            console.log(`✅ DATA: Found ${userCount} Users in system`)
        } else {
            console.error('❌ DATA: No Users found!')
            console.error('   👉 Run: npx prisma db seed')
            process.exit(1)
        }

        // Optional: Check other masters
        const brandCount = await prisma.carBrand.count()
        console.log(`✅ DATA: Found ${brandCount} Car Brands`)

    } catch (e: any) {
        console.error('❌ DATA: Failed to query data')
        console.error('   👉 Database might be empty or schema mismatch')
        console.error(e.message)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }

    console.log('=============================================')
    console.log('✨ SYSTEM READY TO START')
    console.log('   👉 Run: npm run dev\n')
}

// Execute main if run directly
if (require.main === module) {
    main().catch((e) => {
        console.error(e)
        process.exit(1)
    })
}

export { main }
