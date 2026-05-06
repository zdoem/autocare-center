import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: List Payment Types
export async function GET() {
    try {
        const paymentTypes = await prisma.paymentType.findMany({
            where: { isActive: true },
            orderBy: { code: 'asc' },
        })

        return NextResponse.json({
            success: true,
            data: paymentTypes,
        })
    } catch (error: any) {
        console.error('Error fetching payment types:', error)
        return NextResponse.json(
            { error: 'Failed to fetch payment types', details: error.message },
            { status: 500 }
        )
    }
}
