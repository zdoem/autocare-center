import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

// Connect to PostgreSQL (running on port 5432)
const pgPrisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://pgadmin:P@ssw0rd@localhost:5432/db_autocar'
        }
    }
})

async function exportComplete() {
    console.log('--- Connecting to PostgreSQL on 5432 for complete dump ---')

    const snapshot: any = {}

    const modelNames = [
        'department',
        'position',
        'employeeType',
        'employee',
        'user',
        'customerType',
        'customer',
        'carBrand',
        'carModel',
        'car',
        'vendor',
        'sparesCategory',
        'spare',
        'serviceCategory',
        'service',
        'paymentType',
        'payment',
        'cashReceipt',
        'serviceJob',
        'serviceJobItem',
        'stockMovement',
        'systemSetting',
        'auditLog',
        'apiUsageLog'
    ]

    for (const name of modelNames) {
        if ((pgPrisma as any)[name]) {
            try {
                snapshot[name] = await (pgPrisma as any)[name].findMany()
                console.log(` - ${name}: ${snapshot[name].length} records`)
            } catch (err: any) {
                console.warn(` - ${name} skipped or error: ${err.message}`)
            }
        }
    }

    const outputPath = path.join(__dirname, 'pg_backup_snapshot.json')
    fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), 'utf-8')
    console.log(`Saved complete snapshot to ${outputPath}`)
}

exportComplete()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await pgPrisma.$disconnect()
    })
