import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sparesCategorySchema } from '@/lib/validations/spare'
import { generateCode } from '@/lib/utils/codeGenerator'

// GET: List all spares categories with spare count
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
                { code: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (isActive !== null && isActive !== '') {
            where.isActive = isActive === 'true'
        }

        // Fetch categories with spare count
        const categories = await prisma.sparesCategory.findMany({
            where,
            include: {
                _count: {
                    select: { spares: true }
                },
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
        })

        // Transform to include spareCount
        const categoriesWithCount = categories.map(cat => ({
            ...cat,
            spareCount: cat._count.spares,
            _count: undefined,
        }))

        return NextResponse.json(categoriesWithCount)
    } catch (error: any) {
        console.error('Error fetching spares categories:', error)
        return NextResponse.json(
            { error: 'Failed to fetch spares categories', details: error.message },
            { status: 500 }
        )
    }
}

// POST: Create new spares category
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = sparesCategorySchema.parse(body)

        // Generate unique code
        const code = await generateCode('SC', 'sparesCategory', 2)

        // Create category
        const category = await prisma.sparesCategory.create({
            data: {
                code,
                ...validatedData,
            },
            include: {
                _count: {
                    select: { spares: true }
                },
            },
        })

        return NextResponse.json({
            ...category,
            spareCount: category._count.spares,
        }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating spares category:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: (error as any).errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to create spares category', details: error.message },
            { status: 500 }
        )
    }
}
