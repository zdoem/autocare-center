import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { serviceCategorySchema } from '@/lib/validations/service'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const category = await prisma.serviceCategory.findUnique({
            where: { id },
            include: {
                _count: { select: { services: true } }
            }
        })

        if (!category) {
            return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, data: category })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const validation = serviceCategorySchema.safeParse(body)
        
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validation.error.format() },
                { status: 400 }
            )
        }

        const category = await prisma.serviceCategory.update({
            where: { id },
            data: {
                name: validation.data.name,
                description: validation.data.description,
                isActive: validation.data.isActive
            }
        })

        return NextResponse.json({ success: true, data: category })
    } catch (error) {
        console.error('Error updating service category:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update data' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        
        // check related services
        const category = await prisma.serviceCategory.findUnique({
            where: { id },
            include: { _count: { select: { services: true } } }
        })

        if (!category) {
            return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
        }

        if (category._count.services > 0) {
            return NextResponse.json(
                { success: false, error: 'ไม่สามารถลบได้เนื่องจากมีการผูกกับบริการอยู่' },
                { status: 400 }
            )
        }

        await prisma.serviceCategory.delete({ where: { id } })
        
        return NextResponse.json({ success: true, message: 'Deleted successfully' })
    } catch (error) {
        console.error('Error deleting service category:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete data' },
            { status: 500 }
        )
    }
}
