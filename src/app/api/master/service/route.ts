import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { serviceSchema } from '@/lib/validations/service'
import { generateCode } from '@/lib/utils/codeGenerator'

// GET: List all services with filters
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const search = searchParams.get('search') || ''
        const categoryId = searchParams.get('categoryId') || ''
        const isActive = searchParams.get('isActive')
        const sortBy = searchParams.get('sortBy') || 'code'
        const sortOrder = searchParams.get('sortOrder') || 'asc'

        // Build where clause
        const where: any = {}

        if (search) {
            where.OR = [
                { code: { contains: search } },
                { name: { contains: search } },
                { description: { contains: search } },
            ]
        }

        if (categoryId) {
            where.serviceCategoryId = categoryId
        }

        if (isActive !== null && isActive !== '') {
            where.isActive = isActive === 'true'
        }

        // Fetch services
        const services = await prisma.service.findMany({
            where,
            include: {
                serviceCategory: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
        })

        // Transform response
        const servicesWithNumber = services.map(service => ({
            ...service,
            price: Number(service.price),
            laborCost: service.laborCost ? Number(service.laborCost) : null,
            laborHours: service.laborHours ? Number(service.laborHours) : null,
        }))

        return NextResponse.json(servicesWithNumber)
    } catch (error: any) {
        console.error('Error fetching services:', error)
        return NextResponse.json(
            { error: 'Failed to fetch services', details: error.message },
            { status: 500 }
        )
    }
}

// POST: Create new service
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        console.log('[DEBUG] POST Service Body:', JSON.stringify(body, null, 2))

        // Validate input
        const validatedData = serviceSchema.parse(body)
        console.log('[DEBUG] Validated Data:', JSON.stringify(validatedData, null, 2))

        // Generate unique code
        const code = await generateCode('SV', 'service', 2)

        const createData: any = {
            code,
            name: validatedData.name,
            description: validatedData.description,
            isActive: validatedData.isActive,
            price: Number(validatedData.price),
            laborCost: validatedData.laborCost ? Number(validatedData.laborCost) : null,
            laborHours: validatedData.laborHours ? Number(validatedData.laborHours) : null,
        }

        if (validatedData.serviceCategoryId) {
            createData.serviceCategoryId = validatedData.serviceCategoryId
        }

        // Create service
        const service = await prisma.service.create({
            data: createData,
            include: {
                serviceCategory: true,
            },
        })

        return NextResponse.json(service, { status: 201 })
    } catch (error: any) {
        console.error('Error creating service:', error)
        console.error('Error Stack:', error.stack)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: (error as any).errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to create service', details: error.message, stack: error.stack },
            { status: 500 }
        )
    }
}
