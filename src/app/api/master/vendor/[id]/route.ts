import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { vendorUpdateSchema } from '@/lib/validations/vendor'

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

// GET: Get vendor by ID
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params
        const vendor = await prisma.vendor.findUnique({
            where: { id },
        })

        if (!vendor) {
            return NextResponse.json(
                { error: 'Vendor not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(vendor)
    } catch (error: any) {
        console.error('Error fetching vendor:', error)
        return NextResponse.json(
            { error: 'Failed to fetch vendor', details: error.message },
            { status: 500 }
        )
    }
}

// PUT: Update vendor
export async function PUT(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params
        const body = await request.json()

        // Validate input
        const validatedData = vendorUpdateSchema.parse(body)

        // Check if vendor exists
        const existingVendor = await prisma.vendor.findUnique({
            where: { id },
        })

        if (!existingVendor) {
            return NextResponse.json(
                { error: 'Vendor not found' },
                { status: 404 }
            )
        }

        // Update vendor
        const vendor = await prisma.vendor.update({
            where: { id },
            data: validatedData,
        })

        return NextResponse.json(vendor)
    } catch (error: any) {
        console.error('Error updating vendor:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: (error as any).errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to update vendor', details: error.message },
            { status: 500 }
        )
    }
}

// DELETE: Delete vendor
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params
        // Check if vendor exists
        const existingVendor = await prisma.vendor.findUnique({
            where: { id },
            include: {
                purchases: true,
                spares: true,
            },
        })

        if (!existingVendor) {
            return NextResponse.json(
                { error: 'Vendor not found' },
                { status: 404 }
            )
        }

        // Check for related records
        const relatedCount = existingVendor.purchases.length + existingVendor.spares.length

        if (relatedCount > 0) {
            return NextResponse.json(
                {
                    error: 'Cannot delete vendor',
                    details: `This vendor has ${relatedCount} related record(s) (purchases or spares)`,
                },
                { status: 400 }
            )
        }

        // Delete vendor
        await prisma.vendor.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Vendor deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting vendor:', error)
        return NextResponse.json(
            { error: 'Failed to delete vendor', details: error.message },
            { status: 500 }
        )
    }
}
