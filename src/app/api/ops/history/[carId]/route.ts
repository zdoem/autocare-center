import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
    params: Promise<{
        carId: string
    }>
}

// GET: Get Service History by Car ID
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { carId } = await params

        const jobs = await prisma.serviceJob.findMany({
            where: {
                carId,
                status: {
                    in: ['COMPLETED', 'DELIVERED', 'CANCELLED'] // History typically shows finished jobs
                }
            },
            include: {
                technician: true,
                items: true
            },
            orderBy: {
                jobDate: 'desc'
            }
        })

        return NextResponse.json({ success: true, data: jobs })

    } catch (error: any) {
        console.error('Error fetching service history:', error)
        return NextResponse.json(
            { error: 'Failed to fetch history', details: error.message },
            { status: 500 }
        )
    }
}
