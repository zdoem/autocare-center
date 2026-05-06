import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation Schema
const jobItemSchema = z.object({
    serviceJobId: z.string().min(1),
    itemType: z.enum(['SERVICE', 'SPARE']),
    serviceId: z.string().optional(),
    spareId: z.string().optional(),
    description: z.string().min(1),
    quantity: z.number().min(0.01),
    unitPrice: z.number().min(0),
    discount: z.number().min(0).default(0),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = jobItemSchema.parse(body)

        // Calculate total
        const total = (validatedData.quantity * validatedData.unitPrice) - validatedData.discount

        const item = await prisma.serviceJobItem.create({
            data: {
                serviceJobId: validatedData.serviceJobId,
                itemType: validatedData.itemType,
                serviceId: validatedData.serviceId,
                spareId: validatedData.spareId,
                description: validatedData.description,
                quantity: validatedData.quantity,
                unitPrice: validatedData.unitPrice,
                discount: validatedData.discount,
                total: total
            }
        })

        // Trigger Service Job Totals Recalculation (or do it in frontend and update job?)
        // Ideally backend triggers it.
        // Let's do a simple recalc here for consistency

        await updateJobTotals(validatedData.serviceJobId)

        return NextResponse.json({ success: true, data: item }, { status: 201 })

    } catch (error: any) {
        console.error('Error creating job item:', error)
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation failed', details: (error as any).errors }, { status: 400 })
        }
        return NextResponse.json({ error: 'Failed to create item', details: error.message }, { status: 500 })
    }
}

async function updateJobTotals(jobId: string) {
    // Calculate sums
    const items = await prisma.serviceJobItem.findMany({
        where: { serviceJobId: jobId }
    })

    let laborCost = 0
    let partsCost = 0
    let totalCost = 0

    items.forEach(item => {
        const amount = Number(item.total) // Prisma Decimal to Number
        if (item.itemType === 'SERVICE') {
            laborCost += amount
        } else {
            partsCost += amount
        }
    })

    totalCost = laborCost + partsCost
    // Assume VAT 7%
    const vatRate = 0.07 // 7%
    const vatAmount = totalCost * vatRate
    const grandTotal = totalCost + vatAmount

    await prisma.serviceJob.update({
        where: { id: jobId },
        data: {
            laborCost,
            partsCost,
            totalCost,
            vatAmount,
            grandTotal,
            vat: 7 // default
            // discount on job level? let's ignore for now or keep existing
        }
    })
}
