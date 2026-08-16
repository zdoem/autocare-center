import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

/**
 * POST: Batch create multiple job items at once
 * Accepts an array of items and creates them in a transaction
 */

const batchItemSchema = z.object({
    serviceJobId: z.string().min(1),
    items: z.array(z.object({
        itemType: z.enum(['SERVICE', 'SPARE']),
        serviceId: z.string().optional(),
        spareId: z.string().optional(),
        description: z.string().min(1),
        quantity: z.number().min(0.01),
        unitPrice: z.number().min(0),
        discount: z.number().min(0).default(0),
    })).min(1, 'กรุณาเลือกอย่างน้อย 1 รายการ'),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validated = batchItemSchema.parse(body)

        const currentJob = await prisma.serviceJob.findUnique({
            where: { id: validated.serviceJobId },
            select: { status: true }
        })
        if (!currentJob) {
            return NextResponse.json({ error: 'ไม่พบงานซ่อมนี้' }, { status: 404 })
        }
        if (['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(currentJob.status)) {
            return NextResponse.json({ error: 'ไม่สามารถแก้ไขหรือเพิ่มรายการในงานซ่อมที่ปิดงานหรือยกเลิกแล้ว' }, { status: 400 })
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create all items
            const createdItems = []
            for (const item of validated.items) {
                const total = (item.quantity * item.unitPrice) - item.discount
                const created = await tx.serviceJobItem.create({
                    data: {
                        serviceJobId: validated.serviceJobId,
                        itemType: item.itemType,
                        serviceId: item.serviceId || null,
                        spareId: item.spareId || null,
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        discount: item.discount,
                        total,
                    },
                })
                createdItems.push(created)
            }

            // 2. Recalculate job totals
            const allItems = await tx.serviceJobItem.findMany({
                where: { serviceJobId: validated.serviceJobId },
            })

            let laborCost = 0
            let partsCost = 0

            allItems.forEach((item) => {
                const amount = Number(item.total)
                if (item.itemType === 'SERVICE') {
                    laborCost += amount
                } else {
                    partsCost += amount
                }
            })

            const totalCost = laborCost + partsCost
            const vatAmount = totalCost * 0.07
            const grandTotal = totalCost + vatAmount

            await tx.serviceJob.update({
                where: { id: validated.serviceJobId },
                data: {
                    laborCost,
                    partsCost,
                    totalCost,
                    vatAmount,
                    grandTotal,
                    vat: 7,
                },
            })

            return createdItems
        })

        return NextResponse.json({
            success: true,
            data: result,
            message: `เพิ่ม ${result.length} รายการแล้ว`,
        }, { status: 201 })

    } catch (error: any) {
        console.error('Error batch creating job items:', error)
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
        }
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด', details: error.message }, { status: 500 })
    }
}
