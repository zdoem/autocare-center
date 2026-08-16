import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function exportAll() {
    console.log('--- Starting PostgreSQL Data Snapshot ---')

    const snapshot: any = {}

    // 1. Master Organizations & Core
    snapshot.department = await (prisma as any).department.findMany()
    snapshot.position = await (prisma as any).position.findMany()
    snapshot.employeeType = await (prisma as any).employeeType.findMany()
    snapshot.employee = await (prisma as any).employee.findMany()
    snapshot.user = await (prisma as any).user.findMany()

    // 2. Customers & Cars
    snapshot.customerType = await (prisma as any).customerType.findMany()
    snapshot.customer = await (prisma as any).customer.findMany()
    snapshot.carModel = await (prisma as any).carModel.findMany()
    snapshot.car = await (prisma as any).car.findMany()

    // 3. Spares & Services
    snapshot.vendor = await (prisma as any).vendor.findMany()
    snapshot.sparesCategory = await (prisma as any).sparesCategory.findMany()
    snapshot.spare = await (prisma as any).spare.findMany()
    snapshot.serviceCategory = await (prisma as any).serviceCategory.findMany()
    snapshot.service = await (prisma as any).service.findMany()
    snapshot.paymentType = await (prisma as any).paymentType.findMany()

    // 4. Operations & Transactions
    snapshot.serviceJob = await (prisma as any).serviceJob.findMany()
    snapshot.serviceJobItem = await (prisma as any).serviceJobItem.findMany()
    snapshot.stockMovement = await (prisma as any).stockMovement.findMany()
    snapshot.systemSetting = await (prisma as any).systemSetting.findMany()
    snapshot.auditLog = await (prisma as any).auditLog.findMany()
    snapshot.apiUsageLog = await (prisma as any).apiUsageLog.findMany()

    const outputPath = path.join(__dirname, 'pg_backup_snapshot.json')
    fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), 'utf-8')

    console.log(`Snapshot saved successfully to ${outputPath}`)
    console.log('Data Summary:')
    for (const [key, val] of Object.entries(snapshot)) {
        console.log(` - ${key}: ${(val as any[]).length} records`)
    }
}

exportAll()
    .catch(err => {
        console.error('Export error:', err)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
