import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sparesCategoryUpdateSchema } from '@/lib/validations/spare'

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

// GET: Get spares category by ID
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params
        const category = await prisma.sparesCategory.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { spares: true }
                },
            },
        })

        if (!category) {
            return NextResponse.json(
                { error: 'Spares category not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            ...category,
            spareCount: category._count.spares,
        })
    } catch (error: any) {
        console.error('Error fetching spares category:', error)
        return NextResponse.json(
            { error: 'Failed to fetch spares category', details: error.message },
            { status: 500 }
        )
    }
}

// PUT: Update spares category
export async function PUT(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params
        const body = await request.json()

        // Validate input
        const validatedData = sparesCategoryUpdateSchema.parse(body)

        // Check if category exists
        const existingCategory = await prisma.sparesCategory.findUnique({
            where: { id },
        })

        if (!existingCategory) {
            return NextResponse.json(
                { error: 'Spares category not found' },
                { status: 404 }
            )
        }

        // Update category
        const category = await prisma.sparesCategory.update({
            where: { id },
            data: validatedData,
            include: {
                _count: {
                    select: { spares: true }
                },
            },
        })

        return NextResponse.json({
            ...category,
            spareCount: category._count.spares,
        })
    } catch (error: any) {
        console.error('Error updating spares category:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: (error as any).errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to update spares category', details: error.message },
            { status: 500 }
        )
    }
}

// DELETE: Delete spares category
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params
        // Check if category exists
        const existingCategory = await prisma.sparesCategory.findUnique({
            where: { id },
            include: {
                spares: true,
            },
        })

        if (!existingCategory) {
            return NextResponse.json(
                { error: 'Spares category not found' },
                { status: 404 }
            )
        }

        // Check for related records
        if (existingCategory.spares.length > 0) {
            return NextResponse.json(
                {
                    error: 'Cannot delete category',
                    details: `This category is being used by ${existingCategory.spares.length} spare(s)`,
                },
                { status: 400 }
            )
        }

        // Delete category
        await prisma.sparesCategory.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Spares category deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting spares category:', error)
        return NextResponse.json(
            { error: 'Failed to delete spares category', details: error.message },
            { status: 500 }
        )
    }
}
