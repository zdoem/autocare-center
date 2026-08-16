import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function importAll() {
    console.log('--- Starting Data Migration from Snapshot into MariaDB 11.8 ---')

    const snapshotPath = path.join(__dirname, 'pg_backup_snapshot.json')
    if (!fs.existsSync(snapshotPath)) {
        throw new Error(`Snapshot file not found at ${snapshotPath}`)
    }

    const data = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'))

    // Helper for batch inserting
    async function insertMany(modelName: string, items: any[]) {
        if (!items || items.length === 0) {
            console.log(` - ${modelName}: 0 records to insert`)
            return
        }

        console.log(` - Inserting ${items.length} records into ${modelName}...`)
        const model = (prisma as any)[modelName]

        for (const item of items) {
            // Convert ISO strings back to Date objects if needed
            const cleanedItem: any = { ...item }
            for (const [k, v] of Object.entries(cleanedItem)) {
                if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
                    cleanedItem[k] = new Date(v)
                }
            }

            await model.upsert({
                where: { id: cleanedItem.id },
                create: cleanedItem,
                update: cleanedItem,
            })
        }
        console.log(`   ✓ ${modelName} completed (${items.length} records)`)
    }

    // 1. Master Organizations & Core Hierarchy
    await insertMany('department', data.department)
    await insertMany('position', data.position)
    await insertMany('employeeType', data.employeeType)
    await insertMany('employee', data.employee)
    await insertMany('user', data.user)

    // 2. Customers & Cars
    await insertMany('customerType', data.customerType)
    await insertMany('customer', data.customer)
    await insertMany('carModel', data.carModel)
    await insertMany('car', data.car)

    // 3. Spares & Services
    await insertMany('vendor', data.vendor)
    await insertMany('sparesCategory', data.sparesCategory)
    await insertMany('spare', data.spare)
    await insertMany('serviceCategory', data.serviceCategory)
    await insertMany('service', data.service)
    await insertMany('paymentType', data.paymentType)

    // 4. Operations & Transactions
    await insertMany('serviceJob', data.serviceJob)
    await insertMany('serviceJobItem', data.serviceJobItem)
    await insertMany('stockMovement', data.stockMovement)
    await insertMany('systemSetting', data.systemSetting)
    await insertMany('auditLog', data.auditLog)
    await insertMany('apiUsageLog', data.apiUsageLog)

    console.log('--- Data Migration to MariaDB 11.8 Completed Successfully! ---')
}

importAll()
    .catch(err => {
        console.error('Import error:', err)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
