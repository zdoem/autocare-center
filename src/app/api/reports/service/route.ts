import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const monthParam = request.nextUrl.searchParams.get('month') || new Date().toISOString().slice(0, 7)
        const [year, month] = monthParam.split('-').map(Number)
        const from = new Date(year, month - 1, 1)
        const to = new Date(year, month, 0, 23, 59, 59)

        // Get all service job items with service info for the month
        const items = await prisma.serviceJobItem.findMany({
            where: {
                itemType: 'SERVICE',
                serviceJob: { jobDate: { gte: from, lte: to }, isPaid: true }
            },
            include: {
                service: { select: { name: true } },
                serviceJob: { select: { grandTotal: true, laborCost: true, partsCost: true } }
            }
        })

        // Group by service name
        const map = new Map<string, { name: string; count: number; serviceRev: number; partsRev: number; laborRev: number; total: number }>()
        for (const item of items) {
            const name = item.service?.name || item.description || 'อื่นๆ'
            if (!map.has(name)) map.set(name, { name, count: 0, serviceRev: 0, partsRev: 0, laborRev: 0, total: 0 })
            const g = map.get(name)!
            g.count += 1
            g.serviceRev += Number(item.unitPrice)
            g.total += Number(item.total)
        }

        const services = Array.from(map.values()).sort((a, b) => b.count - a.count)
        const maxCount = Math.max(...services.map(s => s.count), 1)

        // Overall summary
        const jobs = await prisma.serviceJob.findMany({
            where: { isPaid: true, jobDate: { gte: from, lte: to } },
            select: { grandTotal: true, laborCost: true, partsCost: true }
        })
        const summary = {
            totalJobs: jobs.length,
            serviceRevenue: jobs.reduce((s, j) => s + Number(j.laborCost), 0),
            partsRevenue: jobs.reduce((s, j) => s + Number(j.partsCost), 0),
            laborRevenue: jobs.reduce((s, j) => s + Number(j.laborCost), 0),
            totalRevenue: jobs.reduce((s, j) => s + Number(j.grandTotal), 0)
        }

        return NextResponse.json({
            success: true,
            data: { month: monthParam, summary, services: services.slice(0, 10), maxCount, allServices: services }
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
