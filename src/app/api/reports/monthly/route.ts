import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const monthParam = request.nextUrl.searchParams.get('month') || new Date().toISOString().slice(0, 7)
        const [year, month] = monthParam.split('-').map(Number)
        const from = new Date(year, month - 1, 1)
        const to = new Date(year, month, 0, 23, 59, 59)
        const daysInMonth = new Date(year, month, 0).getDate()

        const jobs = await prisma.serviceJob.findMany({
            where: { isPaid: true, jobDate: { gte: from, lte: to } },
            select: { jobDate: true, grandTotal: true, laborCost: true, partsCost: true }
        })

        // Build daily rows
        const dailyMap = new Map<number, { jobs: number; service: number; parts: number; labor: number; total: number }>()
        for (let d = 1; d <= daysInMonth; d++) {
            dailyMap.set(d, { jobs: 0, service: 0, parts: 0, labor: 0, total: 0 })
        }
        for (const j of jobs) {
            const d = new Date(j.jobDate).getDate()
            const row = dailyMap.get(d)!
            row.jobs += 1
            row.service += Number(j.laborCost) // service fee
            row.parts += Number(j.partsCost)
            row.labor += Number(j.laborCost)
            row.total += Number(j.grandTotal)
        }

        const dailyRows = Array.from(dailyMap.entries()).map(([day, v]) => ({
            day,
            date: new Date(year, month - 1, day).toISOString(),
            jobCount: v.jobs,
            serviceRevenue: v.service,
            partsRevenue: v.parts,
            laborRevenue: v.labor,
            total: v.total
        }))

        const totalRevenue = jobs.reduce((s, j) => s + Number(j.grandTotal), 0)
        const totalJobs = jobs.length
        const maxDayRevenue = Math.max(...dailyRows.map(r => r.total), 1)

        // Revenue proportion for progress bars
        const serviceTotal = jobs.reduce((s, j) => s + Number(j.laborCost), 0)
        const partsTotal = jobs.reduce((s, j) => s + Number(j.partsCost), 0)
        const laborTotal = jobs.reduce((s, j) => s + Number(j.laborCost), 0)

        // Purchases (expenses) for the month
        const purchases = await prisma.purchase.findMany({
            where: { purchaseDate: { gte: from, lte: to } }
        })
        const expenseTotal = purchases.reduce((s, p) => s + Number(p.grandTotal), 0)
        const netProfit = totalRevenue - expenseTotal

        return NextResponse.json({
            success: true,
            data: {
                month: monthParam,
                summary: { totalRevenue, totalJobs, expenseTotal, netProfit },
                proportions: { serviceTotal, partsTotal, laborTotal },
                dailyRows,
                maxDayRevenue
            }
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
