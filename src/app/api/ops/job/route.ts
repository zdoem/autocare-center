import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { serviceJobSchema } from '@/lib/validations/serviceJob'
import { generateCode } from '@/lib/utils/codeGenerator'

// GET: List Service Jobs
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit

        const where: any = {}

        if (search) {
            where.OR = [
                { jobNo: { contains: search, mode: 'insensitive' } },
                { car: { licensePlate: { contains: search, mode: 'insensitive' } } },
                { customer: { firstName: { contains: search, mode: 'insensitive' } } },
                { customer: { phone: { contains: search, mode: 'insensitive' } } },
            ]
        }

        if (status) {
            if (status.includes(',')) {
                where.status = { in: status.split(',') }
            } else {
                where.status = status
            }
        }

        const isPaid = searchParams.get('isPaid')
        if (isPaid !== null && isPaid !== undefined) {
            where.isPaid = isPaid === 'true'
        }

        const [total, jobs] = await Promise.all([
            prisma.serviceJob.count({ where }),
            prisma.serviceJob.findMany({
                where,
                include: {
                    car: {
                        include: {
                            carBrand: true,
                            carModel: true
                        }
                    },
                    customer: true,
                    technician: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            })
        ])

        return NextResponse.json({
            success: true,
            data: jobs,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })

    } catch (error: any) {
        console.error('Error fetching service jobs:', error)
        return NextResponse.json(
            { error: 'Failed to fetch jobs', details: error.message },
            { status: 500 }
        )
    }
}

// POST: Create New Service Job
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = serviceJobSchema.parse(body)

        // 1. Resolve Customer if not provided
        let customerId = validatedData.customerId
        if (!customerId) {
            const car = await prisma.car.findUnique({
                where: { id: validatedData.carId },
                select: { customerId: true }
            })
            if (!car) {
                return NextResponse.json({ error: 'ไม่พบข้อมูลรถยนต์' }, { status: 404 })
            }
            customerId = car.customerId
        }

        // 2. Resolve Status
        let status = 'RECEIVED' // Default
        if (validatedData.status === 'QUOTATION') {
            status = 'WAITING_APPROVAL' // Map QUOTATION to WAITING_APPROVAL
        }

        // 3. Calculate Labor Cost
        const laborCost = (validatedData.laborHours || 0) * (validatedData.laborRate || 0)

        // 4. Generate Job No: JOB-YYMM-XXXX
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const prefix = `JOB-${year}${month}-`

        const lastJob = await prisma.serviceJob.findFirst({
            where: { jobNo: { startsWith: prefix } },
            orderBy: { jobNo: 'desc' }
        })

        const runningNo = lastJob
            ? parseInt(lastJob.jobNo.split('-')[2]) + 1
            : 1
        const jobNo = `${prefix}${String(runningNo).padStart(4, '0')}`

        // 5. Create Job
        const job = await prisma.serviceJob.create({
            data: {
                jobNo,
                carId: validatedData.carId,
                customerId,
                mileage: validatedData.mileage,
                customerRequest: validatedData.customerRequest,
                notes: validatedData.notes,
                priority: validatedData.priority as any,
                technicianId: validatedData.technicianId || null,
                status: status as any,

                // New Fields
                inspectionChecklist: validatedData.inspectionChecklist ?? undefined,
                workshopBay: validatedData.workshopBay,
                appointmentDate: validatedData.appointmentDate ? new Date(validatedData.appointmentDate) : null,
                estimatedCompletionDays: validatedData.estimatedDays || 1,

                // Costs
                laborCost: laborCost,
                totalCost: laborCost, // Initially just labor
                grandTotal: laborCost * 1.07, // +VAT
                vatAmount: laborCost * 0.07,
            }
        })

        return NextResponse.json({ success: true, data: job }, { status: 201 })

    } catch (error: any) {
        console.error('Error creating service job:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'ข้อมูลไม่ถูกต้อง', details: (error as any).errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'บันทึกข้อมูลไม่สำเร็จ', details: error.message },
            { status: 500 }
        )
    }
}
