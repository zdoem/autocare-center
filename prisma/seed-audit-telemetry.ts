import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding Audit Logs and API Telemetry...')

    const now = new Date()

    // 1. Audit Logs
    const sampleAuditLogs = [
        {
            action: 'LOGIN',
            entity: 'Auth',
            entityId: 'usr_001',
            entityCode: 'ADM-01',
            details: { method: 'credentials', role: 'ADMIN', ip: '192.168.1.10' },
            ipAddress: '192.168.1.10',
            userName: 'ผู้ดูแลระบบ (Admin)',
            userEmail: 'admin@autocare.com',
            userRole: 'ADMIN',
            status: 'SUCCESS',
            createdAt: new Date(now.getTime() - 1000 * 60 * 180),
        },
        {
            action: 'CREATE',
            entity: 'ServiceJob',
            entityId: 'cmsvd41sc0001rp80hv07011r',
            entityCode: 'JOB-202608-0013',
            details: { licensePlate: '1กข-9999', customer: 'คุณสมชาย ใจดี', mileage: 45000, initialStatus: 'RECEIVED' },
            ipAddress: '192.168.1.25',
            userName: 'สมศักดิ์ ช่างยนต์',
            userEmail: 'somsak@autocare.com',
            userRole: 'SERVICE_ADVISOR',
            status: 'SUCCESS',
            createdAt: new Date(now.getTime() - 1000 * 60 * 140),
        },
        {
            action: 'UPDATE',
            entity: 'ServiceJob',
            entityId: 'cmsvd41sc0001rp80hv07011r',
            entityCode: 'JOB-202608-0013',
            details: { previousStatus: 'RECEIVED', newStatus: 'IN_PROGRESS', technician: 'ช่างสมหมาย เก่งช่าง' },
            ipAddress: '192.168.1.25',
            userName: 'สมศักดิ์ ช่างยนต์',
            userEmail: 'somsak@autocare.com',
            userRole: 'SERVICE_ADVISOR',
            status: 'SUCCESS',
            createdAt: new Date(now.getTime() - 1000 * 60 * 110),
        },
        {
            action: 'CANCEL_ITEM',
            entity: 'ServiceJobItem',
            entityId: 'item_091',
            entityCode: 'JOB-202608-0013',
            details: { item: 'เปลี่ยนผ้าเบรกหน้า', reason: 'ตรวจเช็คแล้วยังไม่จำเป็นต้องเปลี่ยน (ผ้าเบรกเหลือ 70%)', previousTotal: 1850, newTotal: 0 },
            ipAddress: '192.168.1.30',
            userName: 'ช่างสมหมาย เก่งช่าง',
            userEmail: 'sommai@autocare.com',
            userRole: 'TECHNICIAN',
            status: 'SUCCESS',
            createdAt: new Date(now.getTime() - 1000 * 60 * 75),
        },
        {
            action: 'PAYMENT',
            entity: 'Payment',
            entityId: 'pay_502',
            entityCode: 'REC-202608-0088',
            details: { jobNo: 'JOB-202608-0013', amount: 3250.00, method: 'PROMPTPAY', receivedBy: 'แคชเชียร์ นภัส' },
            ipAddress: '192.168.1.15',
            userName: 'นภัสสร แคชเชียร์',
            userEmail: 'naphat@autocare.com',
            userRole: 'CASHIER',
            status: 'SUCCESS',
            createdAt: new Date(now.getTime() - 1000 * 60 * 45),
        },
        {
            action: 'BACKUP',
            entity: 'Settings',
            entityId: 'sys_backup_01',
            entityCode: 'BACKUP-20260816',
            details: { format: 'JSON/PostgreSQL', fileSize: '248.5 MB', tablesCount: 14, checksum: 'SHA256-8a9d0f...' },
            ipAddress: '127.0.0.1',
            userName: 'ผู้ดูแลระบบ (Admin)',
            userEmail: 'admin@autocare.com',
            userRole: 'ADMIN',
            status: 'SUCCESS',
            createdAt: new Date(now.getTime() - 1000 * 60 * 20),
        },
    ]

    for (const log of sampleAuditLogs) {
        await (prisma as any).auditLog.create({ data: log })
    }

    // 2. API Usage Telemetry Logs
    const sampleApiLogs = [
        { endpoint: '/api/master/spare', method: 'GET', statusCode: 200, responseTime: 85, ipAddress: '192.168.1.10' },
        { endpoint: '/api/master/spares-category', method: 'GET', statusCode: 200, responseTime: 42, ipAddress: '192.168.1.10' },
        { endpoint: '/api/ops/job/cmsvd41sc0001rp80hv07011r', method: 'GET', statusCode: 200, responseTime: 65, ipAddress: '192.168.1.25' },
        { endpoint: '/api/ops/job-item/batch', method: 'POST', statusCode: 200, responseTime: 120, ipAddress: '192.168.1.25' },
        { endpoint: '/api/inventory/movement', method: 'GET', statusCode: 200, responseTime: 95, ipAddress: '192.168.1.30' },
        { endpoint: '/api/cash/payment', method: 'POST', statusCode: 200, responseTime: 150, ipAddress: '192.168.1.15' },
        { endpoint: '/api/master/employee', method: 'GET', statusCode: 200, responseTime: 55, ipAddress: '192.168.1.10' },
        { endpoint: '/api/reports/daily', method: 'GET', statusCode: 200, responseTime: 180, ipAddress: '192.168.1.10' },
        { endpoint: '/api/master/spare', method: 'GET', statusCode: 200, responseTime: 78, ipAddress: '192.168.1.20' },
        { endpoint: '/api/ops/receive', method: 'POST', statusCode: 201, responseTime: 210, ipAddress: '192.168.1.25' },
        { endpoint: '/api/system/audit-logs', method: 'GET', statusCode: 200, responseTime: 48, ipAddress: '127.0.0.1' },
    ]

    for (const log of sampleApiLogs) {
        await (prisma as any).apiUsageLog.create({ data: log })
    }

    console.log('Seeding completed successfully!')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
