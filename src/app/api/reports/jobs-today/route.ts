import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const dateParam = request.nextUrl.searchParams.get('date') || new Date().toISOString().slice(0, 10)
        const from = new Date(`${dateParam}T00:00:00.000Z`)
        const to = new Date(`${dateParam}T23:59:59.999Z`)

        const jobs = await prisma.serviceJob.findMany({
            where: { jobDate: { gte: from, lte: to } },
            include: {
                car: {
                    include: {
                        customer: true,
                        carBrand: true,
                        carModel: true
                    }
                },
                technician: { select: { name: true } },
                payments: { include: { paymentType: true } }
            },
            orderBy: { jobDate: 'asc' }
        })

        const statusCounts = {
            total: jobs.length,
            pending: jobs.filter(j => ['RECEIVED', 'INSPECTION', 'WAITING_APPROVAL', 'WAITING_PARTS'].includes(j.status)).length,
            inProgress: jobs.filter(j => ['APPROVED', 'IN_PROGRESS', 'QC_CHECK'].includes(j.status)).length,
            completed: jobs.filter(j => ['COMPLETED', 'DELIVERED', 'WAITING_PAYMENT'].includes(j.status)).length,
        }

        const jobList = jobs.map(j => ({
            id: j.id,
            jobNo: j.jobNo,
            licensePlate: j.car.licensePlate,
            carBrand: j.car.carBrand?.nameEnglish || '',
            carModel: j.car.carModel?.name || '',
            customerName: j.car.customer.fullName,
            description: j.notes || '',
            technicianName: j.technician?.name || '-',
            status: j.status,
            jobDate: j.jobDate,
            grandTotal: Number(j.grandTotal)
        }))

        return NextResponse.json({ success: true, data: { date: dateParam, statusCounts, jobs: jobList } })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
