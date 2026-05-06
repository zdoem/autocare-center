import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedJobs() {
    console.log('Seeding jobs...')
    const car = await prisma.car.findFirst()
    const customer = await prisma.customer.findFirst()
    const technician = await prisma.employee.findFirst({ where: { role: 'TECHNICIAN' } })

    if (!car || !customer || !technician) {
        console.error('Missing required related data (car, customer, tech)')
        return
    }

    const baseJob = {
        carId: car.id,
        customerId: customer.id,
        technicianId: technician.id,
        jobDate: new Date(),
        mileage: 50000,
        estimatedCompletionDays: 1,
        workshopBay: '1',
        totalCost: 1000,
        grandTotal: 1070,
        laborCost: 1000,
        partsCost: 0,
        vat: 7,
        vatAmount: 70,
        isPaid: false
    }

    // 2 x RECEIVED
    for (let i = 1; i <= 2; i++) {
        await prisma.serviceJob.create({
            data: { ...baseJob, jobNo: `SJ-2026-REC-00${i}`, status: 'RECEIVED' }
        })
    }

    // 3 x IN_PROGRESS
    for (let i = 1; i <= 3; i++) {
        await prisma.serviceJob.create({
            data: { ...baseJob, jobNo: `SJ-2026-INP-00${i}`, status: 'IN_PROGRESS' }
        })
    }

    // 3 x WAITING_PAYMENT
    for (let i = 1; i <= 3; i++) {
        await prisma.serviceJob.create({
            data: { ...baseJob, jobNo: `SJ-2026-PAY-00${i}`, status: 'WAITING_PAYMENT' }
        })
    }

    // 1 x COMPLETED
    await prisma.serviceJob.create({
        data: { ...baseJob, jobNo: `SJ-2026-COM-001`, status: 'COMPLETED', isPaid: true }
    })

    console.log('Seed completed successfully.')
}

seedJobs()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
