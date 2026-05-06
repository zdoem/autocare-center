import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const monthParam = request.nextUrl.searchParams.get('month') || new Date().toISOString().slice(0, 7)
        const [year, month] = monthParam.split('-').map(Number)
        const from = new Date(year, month - 1, 1)
        const to = new Date(year, month, 0, 23, 59, 59)

        // Get all jobs with technician info
        const jobs = await prisma.serviceJob.findMany({
            where: { jobDate: { gte: from, lte: to }, technicianId: { not: null } },
            include: {
                technician: { select: { id: true, name: true, position: { select: { name: true } } } },
                laborRecords: { select: { hoursWorked: true, laborCost: true } }
            }
        })

        const map = new Map<string, {
            techId: string; name: string; position: string
            totalJobs: number; completedJobs: number; pendingJobs: number
            totalHours: number; totalLaborCost: number
        }>()

        for (const job of jobs) {
            if (!job.technician) continue
            const id = job.technician.id
            if (!map.has(id)) {
                map.set(id, {
                    techId: id,
                    name: job.technician.name,
                    position: job.technician.position?.name || 'ช่าง',
                    totalJobs: 0, completedJobs: 0, pendingJobs: 0,
                    totalHours: 0, totalLaborCost: 0
                })
            }
            const g = map.get(id)!
            g.totalJobs += 1
            if (['COMPLETED', 'DELIVERED'].includes(job.status)) g.completedJobs += 1
            else g.pendingJobs += 1
            // Labor hours from records
            for (const lr of job.laborRecords) {
                g.totalHours += Number(lr.hoursWorked)
                g.totalLaborCost += Number(lr.laborCost)
            }
            // Fallback labor cost from job
            if (job.laborRecords.length === 0) {
                g.totalLaborCost += Number(job.laborCost)
            }
        }

        const technicians = Array.from(map.values())
            .map(t => ({
                ...t,
                completionRate: t.totalJobs > 0 ? Math.round((t.completedJobs / t.totalJobs) * 100) : 0,
                avgHoursPerJob: t.totalJobs > 0 ? Math.round((t.totalHours / t.totalJobs) * 10) / 10 : 0
            }))
            .sort((a, b) => b.totalJobs - a.totalJobs)

        const overall = {
            totalJobs: technicians.reduce((s, t) => s + t.totalJobs, 0),
            completedJobs: technicians.reduce((s, t) => s + t.completedJobs, 0),
            pendingJobs: technicians.reduce((s, t) => s + t.pendingJobs, 0),
            totalHours: technicians.reduce((s, t) => s + t.totalHours, 0),
            totalLaborCost: technicians.reduce((s, t) => s + t.totalLaborCost, 0),
        }

        return NextResponse.json({ success: true, data: { month: monthParam, technicians, overall } })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
