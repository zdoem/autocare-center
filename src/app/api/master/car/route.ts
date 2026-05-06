import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { carSchema, carSearchSchema } from '@/lib/validations/car'
import { generateCarCode } from '@/lib/utils/codeGenerator'

/**
 * GET /api/master/car
 * List all cars with search, filter, pagination, and sorting
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams

        // Parse and validate query params
        const queryResult = carSearchSchema.safeParse({
            search: searchParams.get('search'),
            brandId: searchParams.get('brandId'),
            customerId: searchParams.get('customerId'),
            status: searchParams.get('status') || 'all',
            sortBy: searchParams.get('sortBy') || 'createdAt',
            sortOrder: searchParams.get('sortOrder') || 'desc',
            page: searchParams.get('page') || '1',
            limit: searchParams.get('limit') || '20',
        })

        if (!queryResult.success) {
            return NextResponse.json(
                { error: 'Invalid query parameters', details: (queryResult.error as any).errors },
                { status: 400 }
            )
        }

        const { search, brandId, customerId, status, sortBy, sortOrder, page, limit } = queryResult.data
        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}

        if (search) {
            where.OR = [
                { licensePlate: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { customer: { fullName: { contains: search, mode: 'insensitive' } } },
                { customer: { phone: { contains: search } } },
            ]
        }

        if (brandId) {
            where.carBrandId = brandId
        }

        if (customerId) {
            where.customerId = customerId
        }

        // Status filter (requires ServiceJob relation)
        if (status && status !== 'all') {
            switch (status) {
                case 'in-service':
                    where.serviceJobs = {
                        some: {
                            status: { in: ['PENDING', 'IN_PROGRESS', 'WAITING_PARTS'] }
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
                            status: { in: ['PENDING', 'IN_PROGRESS', 'WAITING_PARTS'] }
                        }
                    }
                    break
            }
        }

        // Build orderBy clause
        let orderBy: any = {}

        switch (sortBy) {
            case 'brand':
                orderBy = { carBrand: { name: sortOrder } }
                break
            case 'model':
                orderBy = { carModel: { name: sortOrder } }
                break
            case 'customer':
                orderBy = { customer: { fullName: sortOrder } }
                break
            case 'lastService':
                // This requires a more complex query with serviceJobs
                orderBy = { createdAt: sortOrder }
                break
            default:
                orderBy = { [sortBy]: sortOrder }
        }

        // Fetch cars with relations
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
                                    name: true,
                                    code: true
                                }
                            }
                        }
                    },
                    carBrand: {
                        select: {
                            id: true,
                            code: true,
                            nameEnglish: true,
                            nameThai: true
                        }
                    },
                    carModel: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                            fuelType: true,
                            vehicleType: true
                        }
                    },
                    images: {
                        select: {
                            id: true,
                            imageUrl: true,
                            createdAt: true
                        },
                        take: 1,
                        orderBy: { createdAt: 'asc' }
                    },
                    serviceJobs: {
                        select: {
                            id: true,
                            jobDate: true,
                            status: true,
                            isPaid: true
                        },
                        orderBy: { jobDate: 'desc' },
                        take: 1
                    }
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.car.count({ where }),
        ])

        return NextResponse.json({
            data: cars,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })

    } catch (error) {
        console.error('Error fetching cars:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch cars' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/master/car
 * Create new car
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate request body
        const validationResult = carSchema.safeParse(body)
        if (!validationResult.success) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: (validationResult.error as any).errors },
                { status: 400 }
            )
        }

        const data = validationResult.data

        // Check if license plate already exists
        const existing = await prisma.car.findUnique({
            where: { licensePlate: data.licensePlate }
        })

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'ทะเบียนรถนี้มีในระบบแล้ว' },
                { status: 409 }
            )
        }

        // Generate car code
        const code = await generateCarCode()

        // Create car
        const car = await prisma.car.create({
            data: {
                code,
                licensePlate: data.licensePlate,
                province: data.province,
                carBrandId: data.carBrandId,
                carModelId: data.carModelId,
                customerId: data.customerId,
                year: data.year,
                color: data.color,
                mileage: data.mileage,
                vin: data.vin,
                engineNo: data.engineNo,
                isActive: data.isActive ?? true,
            },
            include: {
                customer: {
                    select: {
                        fullName: true,
                        phone: true
                    }
                },
                carBrand: {
                    select: {
                        nameEnglish: true,
                        nameThai: true
                    }
                },
                carModel: {
                    select: {
                        name: true,
                        fuelType: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            data: car
        }, { status: 201 })

    } catch (error) {
        console.error('Error creating car:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create car' },
            { status: 500 }
        )
    }
}
