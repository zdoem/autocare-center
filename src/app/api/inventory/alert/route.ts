import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const allSpares = await prisma.spare.findMany({
            where: {
                isActive: true
            },
            include: {
                sparesCategory: true,
                vendor: true
            },
            orderBy: {
                currentStock: 'asc'
            }
        })

        const lowStockSpares = allSpares.filter(s => s.currentStock <= s.minStock)

        const mapped = lowStockSpares.map(s => ({
            ...s,
            isOutOfStock: s.currentStock <= 0,
            isLowStock: s.currentStock > 0 && s.currentStock <= s.minStock
        }))

        return NextResponse.json({ success: true, data: mapped })
    } catch (error: any) {
        console.error('Error fetching inventory alerts:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch inventory alerts', details: error.message },
            { status: 500 }
        )
    }
}
