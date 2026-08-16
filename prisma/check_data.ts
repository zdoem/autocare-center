import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Checking Database Content...')

    try {
        const counts = {
            users: await prisma.user.count(),
            employees: await prisma.employee.count(),
            customers: await prisma.customer.count(),
            customerTypes: await prisma.customerType.count(),
            cars: await prisma.car.count(),
            carBrands: await prisma.carBrand.count(),
            carModels: await prisma.carModel.count(),
            services: await prisma.service.count(),
            serviceCategories: await prisma.serviceCategory.count(),
            spares: await prisma.spare.count(),
            sparesCategories: await prisma.sparesCategory.count(),
            serviceJobs: await prisma.serviceJob.count(),
            departments: await prisma.department.count(),
            positions: await prisma.position.count(),
            employeeTypes: await prisma.employeeType.count(),
            paymentTypes: await prisma.paymentType.count(),
        }
        console.log('📊 Table Counts:\n', JSON.stringify(counts, null, 2))

        const users = await prisma.user.findMany({
            select: { id: true, username: true, email: true, name: true, role: true, isActive: true, password: true }
        })
        console.log('👥 Users in DB:\n', JSON.stringify(users, null, 2))

    } catch (error) {
        console.error('❌ Database Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
