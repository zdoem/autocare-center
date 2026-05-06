import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const spareId = searchParams.get('spareId')
        const movementType = searchParams.get('movementType') // IN, OUT, ADJUST, RETURN
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string, 10) : 50

        const where: any = {}
        if (spareId) where.spareId = spareId
        if (movementType) where.movementType = movementType

        const movements = await prisma.stockMovement.findMany({
            where,
            include: {
                spare: {
                    select: {
                        code: true,
                        name: true,
                        unit: true
                    }
                }
            },
            orderBy: {
                movementDate: 'desc'
            },
            take: limit
        })

        // Serialize Decimals for JSON
        const serialized = movements.map(m => ({
            ...m,
            quantity: Number(m.quantity)
        }))

        return NextResponse.json({ success: true, data: serialized })
    } catch (error: any) {
        console.error('Error fetching stock movements:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stock movements', details: error.message },
            { status: 500 }
        )
    }
}
