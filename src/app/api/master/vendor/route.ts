import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { vendorSchema } from '@/lib/validations/vendor'
import { generateCode } from '@/lib/utils/codeGenerator'

// GET: List all vendors
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
                { contactName: { contains: search } },
            ]
        }

        if (isActive !== null && isActive !== '') {
            where.isActive = isActive === 'true'
        }

        // Fetch vendors
        const vendors = await prisma.vendor.findMany({
            where,
            orderBy: {
                [sortBy]: sortOrder,
            },
        })

        return NextResponse.json(vendors)
    } catch (error: any) {
        console.error('Error fetching vendors:', error)
        return NextResponse.json(
            { error: 'Failed to fetch vendors', details: error.message },
            { status: 500 }
        )
    }
}

// POST: Create new vendor
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = vendorSchema.parse(body)

        // Generate unique code
        const code = await generateCode('V', 'vendor', 3)

        // Create vendor
        const vendor = await prisma.vendor.create({
            data: {
                code,
                ...validatedData,
            },
        })

        return NextResponse.json(vendor, { status: 201 })
    } catch (error: any) {
        console.error('Error creating vendor:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: (error as any).errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to create vendor', details: error.message },
            { status: 500 }
        )
    }
}
