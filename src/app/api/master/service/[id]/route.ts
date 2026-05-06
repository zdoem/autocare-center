import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { serviceUpdateSchema } from '@/lib/validations/service'

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

// GET: Get service by ID
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params
        const service = await prisma.service.findUnique({
            where: { id },
            include: {
                serviceCategory: true,
            },
        })

        if (!service) {
            return NextResponse.json(
                { error: 'Service not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(service)
    } catch (error: any) {
        console.error('Error fetching service:', error)
        return NextResponse.json(
            { error: 'Failed to fetch service', details: error.message },
            { status: 500 }
        )
    }
}

// PUT: Update service
export async function PUT(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params
        const body = await request.json()

        console.log('[DEBUG] PUT Service ID:', id)
        console.log('[DEBUG] Request Body:', JSON.stringify(body, null, 2))

        // Validate input
        const validatedData = serviceUpdateSchema.parse(body)
        console.log('[DEBUG] Validated Data:', JSON.stringify(validatedData, null, 2))

        // Check if service exists
        const existingService = await prisma.service.findUnique({
            where: { id },
        })

        if (!existingService) {
            console.log('[DEBUG] Service not found')
            return NextResponse.json(
                { error: 'Service not found' },
                { status: 404 }
            )
        }

        // Update service
        const updateData: any = {
            name: validatedData.name,
            description: validatedData.description,
            isActive: validatedData.isActive,
            price: Number(validatedData.price),
            laborCost: validatedData.laborCost ? Number(validatedData.laborCost) : null,
            laborHours: validatedData.laborHours ? Number(validatedData.laborHours) : null,
        }

        if (validatedData.serviceCategoryId !== undefined) {
            updateData.serviceCategoryId = validatedData.serviceCategoryId
        }

        const service = await prisma.service.update({
            where: { id },
            data: updateData,
            include: {
                serviceCategory: true,
            },
        })

        console.log('[DEBUG] Service updated successfully')
        return NextResponse.json(service)
    } catch (error: any) {
        console.error('Error updating service:', error)
        console.error('Error Stack:', error.stack)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: (error as any).errors },
                { status: 400 }
            )
        }

        // Return the actual error message to the client for debugging
        return NextResponse.json(
            { error: 'Failed to update service', details: error.message, stack: error.stack },
            { status: 500 }
        )
    }
}

// DELETE: Delete service
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params
        // Check if service exists
        const existingService = await prisma.service.findUnique({
            where: { id },
            include: {
                serviceJobItems: true,
            },
        })

        if (!existingService) {
            return NextResponse.json(
                { error: 'Service not found' },
                { status: 404 }
            )
        }

        // Check for related records
        if (existingService.serviceJobItems.length > 0) {
            return NextResponse.json(
                {
                    error: 'Cannot delete service',
                    details: `This service is being used in ${existingService.serviceJobItems.length} service job(s)`,
                },
                { status: 400 }
            )
        }

        // Delete service
        await prisma.service.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Service deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting service:', error)
        return NextResponse.json(
            { error: 'Failed to delete service', details: error.message },
            { status: 500 }
        )
    }
}
