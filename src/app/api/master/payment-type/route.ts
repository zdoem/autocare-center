import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { paymentTypeSchema } from '@/lib/validations/paymentType'
import { generateCode } from '@/lib/utils/codeGenerator'

// GET: List all payment types with filters
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const search = searchParams.get('search') || ''
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

        if (isActive !== null && isActive !== '') {
            where.isActive = isActive === 'true'
        }

        // Fetch payment types
        const paymentTypes = await prisma.paymentType.findMany({
            where,
            orderBy: {
                [sortBy]: sortOrder,
            },
        })

        return NextResponse.json(paymentTypes)
    } catch (error: any) {
        console.error('Error fetching payment types:', error)
        return NextResponse.json(
            { error: 'Failed to fetch payment types', details: error.message },
            { status: 500 }
        )
    }
}

// POST: Create new payment type
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = paymentTypeSchema.parse(body)

        // Generate unique code
        const code = await generateCode('PT', 'paymentType', 2)

        // Create payment type
        const paymentType = await prisma.paymentType.create({
            data: {
                code,
                ...validatedData,
            },
        })

        return NextResponse.json(paymentType, { status: 201 })
    } catch (error: any) {
        console.error('Error creating payment type:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to create payment type', details: error.message },
            { status: 500 }
        )
    }
}
