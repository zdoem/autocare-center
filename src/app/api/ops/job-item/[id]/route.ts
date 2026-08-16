import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { trackApiUsage } from '@/lib/apiTracker'

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
    const startTime = Date.now()
    try {
        const { id } = await params

        const item = await prisma.serviceJobItem.findUnique({
            where: { id }
        })

        if (!item) {
            trackApiUsage({ endpoint: '/api/ops/job-item/[id]', method: 'DELETE', statusCode: 404, responseTime: Date.now() - startTime })
            return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }

        const job = await prisma.serviceJob.findUnique({
            where: { id: item.serviceJobId },
            select: { id: true, jobNo: true, status: true }
        })
        if (job && ['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(job.status)) {
            trackApiUsage({ endpoint: '/api/ops/job-item/[id]', method: 'DELETE', statusCode: 400, responseTime: Date.now() - startTime })
            return NextResponse.json({ error: 'ไม่สามารถลบรายการในงานซ่อมที่ปิดงานหรือยกเลิกแล้ว' }, { status: 400 })
        }

        const jobId = item.serviceJobId

        await prisma.serviceJobItem.delete({
            where: { id }
        })

        // Audit Log
        await logAudit({
            action: 'DELETE',
            entity: 'ServiceJobItem',
            entityId: id,
            entityCode: job?.jobNo || jobId,
            details: { item: item.description, total: Number(item.total), unitPrice: Number(item.unitPrice) },
            userName: 'ผู้ใช้งานระบบ',
        })

        // Recalculate totals
        await updateJobTotals(jobId)

        trackApiUsage({ endpoint: '/api/ops/job-item/[id]', method: 'DELETE', statusCode: 200, responseTime: Date.now() - startTime })
        return NextResponse.json({ success: true, message: 'Item deleted' })

    } catch (error: any) {
        console.error('Error deleting job item:', error)
        trackApiUsage({ endpoint: '/api/ops/job-item/[id]', method: 'DELETE', statusCode: 500, responseTime: Date.now() - startTime, errorMessage: error.message })
        return NextResponse.json(
            { error: 'Failed to delete item', details: error.message },
            { status: 500 }
        )
    }
}

// PATCH: Cancel item with reason or restore item
export async function PATCH(
    request: NextRequest,
    { params }: RouteParams
) {
    const startTime = Date.now()
    try {
        const { id } = await params
        const body = await request.json()
        const { action, reason } = body

        const item = await prisma.serviceJobItem.findUnique({
            where: { id }
        })

        if (!item) {
            trackApiUsage({ endpoint: '/api/ops/job-item/[id]', method: 'PATCH', statusCode: 404, responseTime: Date.now() - startTime })
            return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }

        const job = await prisma.serviceJob.findUnique({
            where: { id: item.serviceJobId },
            select: { id: true, jobNo: true, status: true }
        })
        if (job && ['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(job.status)) {
            trackApiUsage({ endpoint: '/api/ops/job-item/[id]', method: 'PATCH', statusCode: 400, responseTime: Date.now() - startTime })
            return NextResponse.json({ error: 'ไม่สามารถแก้ไขรายการในงานซ่อมที่ปิดงานหรือยกเลิกแล้ว' }, { status: 400 })
        }

        if (action === 'CANCEL') {
            await prisma.serviceJobItem.update({
                where: { id },
                data: {
                    isModified: true,
                    modifiedReason: reason || 'ลูกค้ายกเลิกรายการ',
                    total: 0,
                    quantity: 0,
                }
            })
            // Audit Log
            await logAudit({
                action: 'CANCEL_ITEM',
                entity: 'ServiceJobItem',
                entityId: id,
                entityCode: job?.jobNo || item.serviceJobId,
                details: { item: item.description, reason: reason || 'ลูกค้ายกเลิกรายการ', previousTotal: Number(item.total), newTotal: 0 },
                userName: 'ผู้ใช้งานระบบ',
            })
        } else if (action === 'RESTORE') {
            const qty = Number(item.estimatedQty) > 0 ? Number(item.estimatedQty) : 1
            const normalTotal = (qty * Number(item.unitPrice)) - Number(item.discount)
            await prisma.serviceJobItem.update({
                where: { id },
                data: {
                    isModified: false,
                    modifiedReason: null,
                    quantity: qty,
                    total: normalTotal,
                }
            })
            // Audit Log
            await logAudit({
                action: 'UPDATE',
                entity: 'ServiceJobItem',
                entityId: id,
                entityCode: job?.jobNo || item.serviceJobId,
                details: { item: item.description, action: 'RESTORE', restoredTotal: normalTotal },
                userName: 'ผู้ใช้งานระบบ',
            })
        }

        await updateJobTotals(item.serviceJobId)

        trackApiUsage({ endpoint: '/api/ops/job-item/[id]', method: 'PATCH', statusCode: 200, responseTime: Date.now() - startTime })
        return NextResponse.json({ success: true, message: 'Item status updated' })

    } catch (error: any) {
        console.error('Error updating job item status:', error)
        trackApiUsage({ endpoint: '/api/ops/job-item/[id]', method: 'PATCH', statusCode: 500, responseTime: Date.now() - startTime, errorMessage: error.message })
        return NextResponse.json(
            { error: 'Failed to update item status', details: error.message },
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
