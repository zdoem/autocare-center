import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const date = request.nextUrl.searchParams.get('date') || new Date().toISOString().slice(0, 10)
        const from = new Date(`${date}T00:00:00.000Z`)
        const to = new Date(`${date}T23:59:59.999Z`)

        // Paid jobs for the day
        const jobs = await prisma.serviceJob.findMany({
            where: { isPaid: true, jobDate: { gte: from, lte: to } },
            include: {
                car: { include: { customer: true } },
                payments: { include: { paymentType: true } }
            }
        })

        // Revenue breakdown
        const serviceRevenue = jobs.reduce((s, j) => s + Number(j.laborCost), 0)
        const partsRevenue = jobs.reduce((s, j) => s + Number(j.partsCost), 0)
        const laborRevenue = jobs.reduce((s, j) => s + Number(j.laborCost), 0)
        const totalRevenue = jobs.reduce((s, j) => s + Number(j.grandTotal), 0)

        // Payment breakdown
        const payments = jobs.flatMap(j => j.payments)
        const paymentGroups: Record<string, { label: string; amount: number; count: number }> = {}
        for (const p of payments) {
            const key = p.paymentType.name
            if (!paymentGroups[key]) paymentGroups[key] = { label: key, amount: 0, count: 0 }
            paymentGroups[key].amount += Number(p.amount)
            paymentGroups[key].count += 1
        }

        // Purchases (expenses) for the day
        const purchases = await prisma.purchase.findMany({
            where: { purchaseDate: { gte: from, lte: to } },
            include: { vendor: true }
        })
        const purchaseTotal = purchases.reduce((s, p) => s + Number(p.grandTotal), 0)

        // Receipt list
        const receipts = jobs.map(j => ({
            jobNo: j.jobNo,
            licensePlate: j.car.licensePlate,
            customerName: j.car.customer.fullName,
            paymentType: j.payments[0]?.paymentType.name || '-',
            grandTotal: Number(j.grandTotal),
            paidTime: j.payments[0]?.paymentDate || null
        }))

        return NextResponse.json({
            success: true,
            data: {
                date,
                summary: {
                    totalRevenue,
                    serviceRevenue,
                    partsRevenue,
                    laborRevenue,
                    jobCount: jobs.length,
                    receiptCount: jobs.length,
                    expenseTotal: purchaseTotal,
                    grossProfit: totalRevenue - purchaseTotal
                },
                paymentGroups: Object.values(paymentGroups),
                receipts,
                purchases: purchases.map(p => ({
                    purchaseNo: p.purchaseNo,
                    vendorName: p.vendor.name,
                    grandTotal: Number(p.grandTotal)
                }))
            }
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
