import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { spareUpdateSchema } from '@/lib/validations/spare'

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

// GET: Get spare by ID
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params
        const spare = await prisma.spare.findUnique({
            where: { id },
            include: {
                sparesCategory: true,
                vendor: true,
            },
        })

        if (!spare) {
            return NextResponse.json(
                { error: 'Spare not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            ...spare,
            isLowStock: spare.currentStock < spare.minStock && spare.currentStock > 0,
            isOutOfStock: spare.currentStock === 0,
        })
    } catch (error: any) {
        console.error('Error fetching spare:', error)
        return NextResponse.json(
            { error: 'Failed to fetch spare', details: error.message },
            { status: 500 }
        )
    }
}

// PUT: Update spare
export async function PUT(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params
        const body = await request.json()

        // Validate input
        const validatedData = spareUpdateSchema.parse(body)

        // Check if spare exists
        const existingSpare = await prisma.spare.findUnique({
            where: { id },
        })

        if (!existingSpare) {
            return NextResponse.json(
                { error: 'Spare not found' },
                { status: 404 }
            )
        }

        // Update spare
        const spare = await prisma.spare.update({
            where: { id },
            data: validatedData as any,
            include: {
                sparesCategory: true,
                vendor: true,
            },
        })

        return NextResponse.json({
            ...spare,
            isLowStock: spare.currentStock < spare.minStock && spare.currentStock > 0,
            isOutOfStock: spare.currentStock === 0,
        })
    } catch (error: any) {
        console.error('Error updating spare:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: (error as any).errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to update spare', details: error.message },
            { status: 500 }
        )
    }
}

// DELETE: Delete spare
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params
        // Check if spare exists
        const existingSpare = await prisma.spare.findUnique({
            where: { id },
            include: {
                serviceJobItems: true,
                purchaseItems: true,
                stockMovements: true,
            },
        })

        if (!existingSpare) {
            return NextResponse.json(
                { error: 'Spare not found' },
                { status: 404 }
            )
        }

        // Check for related records
        const relatedCount =
            existingSpare.serviceJobItems.length +
            existingSpare.purchaseItems.length +
            existingSpare.stockMovements.length

        if (relatedCount > 0) {
            return NextResponse.json(
                {
                    error: 'Cannot delete spare',
                    details: `This spare has ${relatedCount} related record(s) (job items, purchases, or stock movements)`,
                },
                { status: 400 }
            )
        }

        // Delete spare
        await prisma.spare.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Spare deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting spare:', error)
        return NextResponse.json(
            { error: 'Failed to delete spare', details: error.message },
            { status: 500 }
        )
    }
}
