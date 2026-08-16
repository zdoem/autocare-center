import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

// DELETE: Remove Item
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params

        const item = await prisma.serviceJobItem.findUnique({
            where: { id }
        })

        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }

        const job = await prisma.serviceJob.findUnique({
            where: { id: item.serviceJobId },
            select: { status: true }
        })
        if (job && ['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(job.status)) {
            return NextResponse.json({ error: 'ไม่สามารถลบรายการในงานซ่อมที่ปิดงานหรือยกเลิกแล้ว' }, { status: 400 })
        }

        const jobId = item.serviceJobId

        await prisma.serviceJobItem.delete({
            where: { id }
        })

        // Recalculate totals
        await updateJobTotals(jobId)

        return NextResponse.json({ success: true, message: 'Item deleted' })

    } catch (error: any) {
        console.error('Error deleting job item:', error)
        return NextResponse.json(
            { error: 'Failed to delete item', details: error.message },
            { status: 500 }
        )
    }
}

async function updateJobTotals(jobId: string) {
    // Re-use logic from POST (Ideally move to shared lib/services)
    // Duplicate code for now to be self-contained in API
    const items = await prisma.serviceJobItem.findMany({
        where: { serviceJobId: jobId }
    })

    let laborCost = 0
    let partsCost = 0

    items.forEach(item => {
        const amount = Number(item.total)
        if (item.itemType === 'SERVICE') {
            laborCost += amount
        } else {
            partsCost += amount
        }
    })

    const totalCost = laborCost + partsCost
    const vatRate = 0.07
    const vatAmount = totalCost * vatRate
    const grandTotal = totalCost + vatAmount

    await prisma.serviceJob.update({
        where: { id: jobId },
        data: {
            laborCost,
            partsCost,
            totalCost,
            vatAmount,
            grandTotal
        }
    })
}
