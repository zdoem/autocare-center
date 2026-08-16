import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/ops/search
 * Combined search for cars and customers
 * Optimized for ops-receive and ops-search pages
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const q = searchParams.get('q') || '' // search query
        const brandId = searchParams.get('brandId')
        const status = searchParams.get('status') || 'all'
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}

        if (q) {
            where.OR = [
                { licensePlate: { contains: q, mode: 'insensitive' } },
                { code: { contains: q, mode: 'insensitive' } },
                { customer: { fullName: { contains: q, mode: 'insensitive' } } },
                { customer: { phone: { contains: q } } },
                { customer: { firstName: { contains: q, mode: 'insensitive' } } },
                { customer: { lastName: { contains: q, mode: 'insensitive' } } },
            ]
        }

        if (brandId) {
            where.carBrandId = brandId
        }

        // Status filter
        if (status !== 'all') {
            switch (status) {
                case 'in-service':
                    where.serviceJobs = {
                        some: {
                            status: { in: ['RECEIVED', 'INSPECTION', 'IN_PROGRESS', 'WAITING_PARTS'] }
                        }
                    }
                    break
                case 'pending':
                    where.serviceJobs = {
                        some: {
                            isPaid: false,
                            status: { notIn: ['CANCELLED'] }
                        }
                    }
                    break
                case 'normal':
                    where.serviceJobs = {
                        none: {
                            status: { in: ['RECEIVED', 'INSPECTION', 'IN_PROGRESS', 'WAITING_PARTS'] }
                        }
                    }
                    break
            }
        }

        // Fetch cars with customer and last service info
        const [cars, total] = await Promise.all([
            prisma.car.findMany({
                where,
                include: {
                    customer: {
                        select: {
                            id: true,
                            code: true,
                            fullName: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                            email: true,
                            customerType: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    carBrand: {
                        select: {
                            id: true,
                            nameEnglish: true,
                            nameThai: true
                        }
                    },
                    carModel: {
                        select: {
                            id: true,
                            name: true,
                            fuelType: true
                        }
                    },
                    images: {
                        select: {
                            imageUrl: true
                        },
                        take: 1,
                        orderBy: { createdAt: 'asc' }
                    },
                    serviceJobs: {
                        select: {
                            id: true,
                            jobNo: true,
                            jobDate: true,
                            status: true,
                            isPaid: true,
                            grandTotal: true
                        },
                        orderBy: { jobDate: 'desc' },
                        take: 5 // Last 5 service jobs for quick reference
                    }
                },
                orderBy: [
                    { updatedAt: 'desc' },
                    { createdAt: 'desc' }
                ],
                skip,
                take: limit
            }),
            prisma.car.count({ where })
        ])

        // Add computed status to each car
        const carsWithStatus = cars.map(car => {
            let carStatus = 'normal'

            const activeJobs = car.serviceJobs.filter(job =>
                ['RECEIVED', 'INSPECTION', 'IN_PROGRESS', 'WAITING_PARTS'].includes(job.status)
            )

            const unpaidJobs = car.serviceJobs.filter(job => !job.isPaid)

            if (activeJobs.length > 0) {
                carStatus = 'in-service'
            } else if (unpaidJobs.length > 0) {
                carStatus = 'pending'
            }

            return {
                ...car,
                status: carStatus,
                lastServiceDate: car.serviceJobs[0]?.jobDate || null,
                hasActiveJob: activeJobs.length > 0,
                hasUnpaidJob: unpaidJobs.length > 0
            }
        })

        return NextResponse.json({
            data: carsWithStatus,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Error searching cars:', error)
        return NextResponse.json(
            { error: 'Failed to search cars' },
            { status: 500 }
        )
    }
}
