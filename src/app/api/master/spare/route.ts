import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { spareSchema } from '@/lib/validations/spare'
import { generateCode } from '@/lib/utils/codeGenerator'

// GET: List all spares with filters
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const search = searchParams.get('search') || ''
        const categoryId = searchParams.get('categoryId') || ''
        const vendorId = searchParams.get('vendorId') || ''
        const stockStatus = searchParams.get('stockStatus') || '' // all|low|out
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

        if (categoryId) {
            where.sparesCategoryId = categoryId
        }

        if (vendorId) {
            where.vendorId = vendorId
        }

        if (isActive !== null && isActive !== '') {
            where.isActive = isActive === 'true'
        }

        // Fetch spares
        // Build orderBy clause
        let orderBy: any
        if (sortBy === 'sparesCategoryId') {
            // Sort by category name
            orderBy = {
                sparesCategory: {
                    name: sortOrder,
                },
            }
        } else {
            // Default sorting
            orderBy = {
                [sortBy]: sortOrder,
            }
        }

        let spares = await prisma.spare.findMany({
            where,
            include: {
                sparesCategory: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                vendor: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
            },
            orderBy,
        })

        // Apply stock status filter (post-query)
        if (stockStatus === 'low') {
            spares = spares.filter(s => s.currentStock > 0 && s.currentStock < s.minStock)
        } else if (stockStatus === 'out') {
            spares = spares.filter(s => s.currentStock === 0)
        }

        // Add stock alert flag
        const sparesWithAlert = spares.map(spare => ({
            ...spare,
            sellingPrice: Number(spare.sellingPrice),
            costPrice: spare.costPrice ? Number(spare.costPrice) : null,
            isLowStock: spare.currentStock < spare.minStock && spare.currentStock > 0,
            isOutOfStock: spare.currentStock === 0,
        }))

        return NextResponse.json(sparesWithAlert)
    } catch (error: any) {
        console.error('Error fetching spares:', error)
        return NextResponse.json(
            { error: 'Failed to fetch spares', details: error.message },
            { status: 500 }
        )
    }
}

// POST: Create new spare
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = spareSchema.parse(body)

        // Generate unique code
        const code = await generateCode('SP', 'spare', 3)

        // Extract relation IDs and costPrice
        const { sparesCategoryId, vendorId, costPrice, ...rest } = validatedData

        // Create spare
        const spare = await prisma.spare.create({
            data: {
                code,
                ...rest as any,
                costPrice: costPrice ?? 0,
                currentStock: validatedData.currentStock || 0,
                ...(sparesCategoryId ? { sparesCategory: { connect: { id: sparesCategoryId } } } : {}),
                ...(vendorId ? { vendor: { connect: { id: vendorId } } } : {}),
            },
            include: {
                sparesCategory: true,
                vendor: true,
            },
        })

        return NextResponse.json({
            ...spare,
            isLowStock: spare.currentStock < spare.minStock && spare.currentStock > 0,
            isOutOfStock: spare.currentStock === 0,
        }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating spare:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: (error as any).errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to create spare', details: error.message },
            { status: 500 }
        )
    }
}
