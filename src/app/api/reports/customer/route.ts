import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const search = request.nextUrl.searchParams.get('search') || ''
        const customerType = request.nextUrl.searchParams.get('type') || ''
        const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10)
        const limit = 20

        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        const where: any = {}
        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
                { code: { contains: search, mode: 'insensitive' } }
            ]
        }
        if (customerType) where.customerType = { name: { contains: customerType, mode: 'insensitive' } }

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                include: {
                    customerType: true,
                    cars: { select: { id: true } },
                    serviceJobs: {
                        where: { isPaid: true },
                        select: { grandTotal: true, jobDate: true },
                        orderBy: { jobDate: 'desc' }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.customer.count({ where })
        ])

        // Summary counts
        const allCustomers = await prisma.customer.findMany({
            include: { customerType: true, cars: { select: { id: true } } }
        })
        const newThisMonth = await prisma.customer.count({ where: { createdAt: { gte: startOfMonth } } })
        const vipCount = allCustomers.filter(c => c.customerType.name.toLowerCase().includes('vip')).length
        const totalCars = allCustomers.reduce((s, c) => s + c.cars.length, 0)

        const list = customers.map(c => ({
            id: c.id,
            code: c.code,
            fullName: c.fullName,
            phone: c.phone,
            email: c.email || '',
            customerTypeName: c.customerType.name,
            carCount: c.cars.length,
            jobCount: c.serviceJobs.length,
            totalSpend: c.serviceJobs.reduce((s, j) => s + Number(j.grandTotal), 0),
            lastJobDate: c.serviceJobs[0]?.jobDate || null
        }))

        return NextResponse.json({
            success: true,
            data: {
                customers: list,
                pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
                summary: { totalCustomers: total, vipCount, newThisMonth, totalCars }
            }
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
