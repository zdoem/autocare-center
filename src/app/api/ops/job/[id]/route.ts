import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { serviceJobUpdateSchema } from '@/lib/validations/serviceJob'

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

// GET: Get Service Job Detail
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params
        const job = await prisma.serviceJob.findUnique({
            where: { id },
            include: {
                car: {
                    include: {
                        carBrand: true,
                        carModel: true
                    }
                },
                customer: true,
                technician: true,
                items: {
                    include: {
                        service: true,
                        spare: true
                    }
                },
                payments: true
            }
        })

        if (!job) {
            return NextResponse.json(
                { error: 'Service Job not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: job })

    } catch (error: any) {
        console.error('Error fetching service job:', error)
        return NextResponse.json(
            { error: 'Failed to fetch job', details: error.message },
            { status: 500 }
        )
    }
}

// PUT: Update Service Job
export async function PUT(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params
        const body = await request.json()
        const validatedData = serviceJobUpdateSchema.parse(body)

        const currentJob = await prisma.serviceJob.findUnique({
            where: { id },
            select: { status: true }
        })
        if (!currentJob) {
            return NextResponse.json({ error: 'ไม่พบข้อมูลงานซ่อม' }, { status: 404 })
        }
        if (currentJob.status === 'CANCELLED') {
            return NextResponse.json({ error: 'ไม่สามารถแก้ไขงานซ่อมที่ถูกยกเลิกแล้ว' }, { status: 400 })
        }
        if (currentJob.status === 'DELIVERED') {
            return NextResponse.json({ error: 'ไม่สามารถแก้ไขงานซ่อมที่ส่งมอบรถเรียบร้อยแล้ว' }, { status: 400 })
        }
        if (currentJob.status === 'COMPLETED' && validatedData.status && validatedData.status !== 'DELIVERED' && validatedData.status !== 'COMPLETED') {
            return NextResponse.json({ error: 'งานซ่อมที่ปิดงานแล้ว สามารถเปลี่ยนเป็นสถานะส่งมอบรถ (DELIVERED) ได้เท่านั้น' }, { status: 400 })
        }

        const job = await prisma.serviceJob.update({
            where: { id },
            data: {
                ...validatedData,
                status: validatedData.status as any
            }
        })

        return NextResponse.json({ success: true, data: job })

    } catch (error: any) {
        console.error('Error updating service job:', error)
        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation failed', details: (error as any).errors },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to update job', details: error.message },
            { status: 500 }
        )
    }
}
