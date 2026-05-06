import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const period = searchParams.get('period') || 'month'
        const limit = parseInt(searchParams.get('limit') || '20', 10)

        const now = new Date()
        const daysBack = period === 'year' ? 365 : period === 'quarter' ? 90 : 30
        const fromDate = new Date(now)
        fromDate.setDate(fromDate.getDate() - daysBack)

        // Aggregate completed jobs by customer
        const jobs = await prisma.serviceJob.findMany({
            where: {
                status: { in: ['COMPLETED', 'DELIVERED'] },
                jobDate: { gte: fromDate },
                isPaid: true
            },
            include: {
                customer: {
                    include: {
                        customerType: { select: { name: true } }
                    }
                }
            }
        })

        // Group by customer
        const map = new Map<string, { fullName: string; phone: string; customerTypeName: string; totalAmount: number; jobCount: number }>()
        for (const job of jobs) {
            const existing = map.get(job.customerId)
            if (existing) {
                existing.totalAmount += Number(job.grandTotal)
                existing.jobCount += 1
            } else {
                map.set(job.customerId, {
                    fullName: job.customer.fullName,
                    phone: job.customer.phone,
                    customerTypeName: job.customer.customerType.name,
                    totalAmount: Number(job.grandTotal),
                    jobCount: 1
                })
            }
        }

        const sorted = Array.from(map.entries())
            .map(([customerId, data]) => ({ customerId, ...data }))
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, limit)

        return NextResponse.json({ success: true, data: sorted })
    } catch (error: any) {
        console.error('Error fetching top customers:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch top customers', details: error.message },
            { status: 500 }
        )
    }
}
