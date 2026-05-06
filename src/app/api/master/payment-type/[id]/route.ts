import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { paymentTypeUpdateSchema } from '@/lib/validations/paymentType'

interface Props {
    params: Promise<{
        id: string
    }>
}

// GET: Get single payment type
export async function GET(
    request: NextRequest,
    { params }: Props
) {
    try {
        const { id } = await params
        const paymentType = await prisma.paymentType.findUnique({
            where: { id },
        })

        if (!paymentType) {
            return NextResponse.json(
                { error: 'Payment type not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(paymentType)
    } catch (error: any) {
        console.error('Error fetching payment type:', error)
        return NextResponse.json(
            { error: 'Failed to fetch payment type', details: error.message },
            { status: 500 }
        )
    }
}

// PUT: Update payment type
export async function PUT(
    request: NextRequest,
    { params }: Props
) {
    try {
        const { id } = await params
        const body = await request.json()

        // Validate input
        const validatedData = paymentTypeUpdateSchema.parse(body)

        // Check if exists
        const existingPaymentType = await prisma.paymentType.findUnique({
            where: { id },
        })

        if (!existingPaymentType) {
            return NextResponse.json(
                { error: 'Payment type not found' },
                { status: 404 }
            )
        }

        // Update payment type
        const updatedPaymentType = await prisma.paymentType.update({
            where: { id },
            data: validatedData,
        })

        return NextResponse.json(updatedPaymentType)
    } catch (error: any) {
        console.error('Error updating payment type:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: (error as any).errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to update payment type', details: error.message },
            { status: 500 }
        )
    }
}

// DELETE: Delete payment type
export async function DELETE(
    request: NextRequest,
    { params }: Props
) {
    try {
        const { id } = await params
        // Check if exists
        const existingPaymentType = await prisma.paymentType.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { payments: true },
                },
            },
        })

        if (!existingPaymentType) {
            return NextResponse.json(
                { error: 'Payment type not found' },
                { status: 404 }
            )
        }

        // Check relations
        if (existingPaymentType._count.payments > 0) {
            return NextResponse.json(
                {
                    error: 'Cannot delete payment type',
                    details: 'This payment type is used in payment records.',
                },
                { status: 400 }
            )
        }

        // Delete payment type
        await prisma.paymentType.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Payment type deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting payment type:', error)
        return NextResponse.json(
            { error: 'Failed to delete payment type', details: error.message },
            { status: 500 }
        )
    }
}
