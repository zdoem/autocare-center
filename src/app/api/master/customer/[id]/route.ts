import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET - Get single customer with relations
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const customer = await prisma.customer.findUnique({
            where: { id: params.id },
            include: {
                customerType: true,
                cars: {
                    include: {
                        carBrand: true,
                        carModel: true,
                    },
                    where: { isActive: true },
                    orderBy: { updatedAt: 'desc' },
                },
                serviceJobs: {
                    include: {
                        car: {
                            include: {
                                carBrand: true,
                                carModel: true,
                            }
                        },
                        technician: { select: { id: true, name: true } },
                    },
                    orderBy: { jobDate: 'desc' },
                    take: 10,
                },
                _count: {
                    select: { cars: true, serviceJobs: true }
                }
            }
        })

        if (!customer) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบข้อมูลลูกค้า' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: customer })
    } catch (error) {
        console.error('Error fetching customer:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถโหลดข้อมูลได้' },
            { status: 500 }
        )
    }
}

// Validation schema
const customerSchema = z.object({
    firstName: z.string().min(2, 'กรุณากรอกชื่อ'),
    lastName: z.string().min(2, 'กรุณากรอกนามสกุล'),
    phone: z.string().refine((val) => !val || /^0\d{2}-?\d{3}-?\d{4}$/.test(val), {
        message: 'รูปแบบเบอร์โทรไม่ถูกต้อง (0XX-XXX-XXXX)'
    }),
    email: z.string().refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: 'รูปแบบ Email ไม่ถูกต้อง'
    }).optional().nullable(),
    lineId: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    taxId: z.string().refine((val) => !val || /^\d{13}$/.test(val), {
        message: 'เลขผู้เสียภาษีต้องมี 13 หลัก'
    }).optional().nullable(),
    customerTypeId: z.string().min(1, 'กรุณาเลือกประเภทลูกค้า'),
    isActive: z.boolean().default(true),
})

// PUT - Update customer
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const body = await request.json()
        const validatedData = customerSchema.parse(body)

        // Re-generate fullName if name changed
        const fullName = `${validatedData.firstName} ${validatedData.lastName}`

        const customer = await prisma.customer.update({
            where: { id: params.id },
            data: {
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                fullName: fullName,
                phone: validatedData.phone,
                email: validatedData.email || null,
                lineId: validatedData.lineId || null,
                address: validatedData.address || null,
                taxId: validatedData.taxId || null,
                customerTypeId: validatedData.customerTypeId,
                isActive: validatedData.isActive,
            },
            include: {
                customerType: true
            }
        })

        return NextResponse.json({
            success: true,
            data: customer,
        })
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: (error as any).errors?.[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
                { status: 400 }
            )
        }

        // Handle Prisma Unique Constraint Error (P2002)
        if (error.code === 'P2002') {
            const target = (error.meta?.target as string[]) || []
            if (target.includes('code')) {
                return NextResponse.json(
                    { success: false, error: 'รหัสลูกค้าซ้ำ' },
                    { status: 409 }
                )
            }
        }

        console.error('Error updating customer:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'ไม่สามารถอัพเดทข้อมูลได้' },
            { status: 500 }
        )
    }
}

// DELETE - Delete customer
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // Check if customer has service jobs
        const jobCount = await prisma.serviceJob.count({
            where: { customerId: params.id }
        })

        if (jobCount > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: `ไม่สามารถลบได้ เนื่องจากลูกค้ามีประวัติการใช้บริการ ${jobCount} รายการ`
                },
                { status: 400 }
            )
        }

        // Check if customer has cars
        const carCount = await prisma.car.count({
            where: { customerId: params.id }
        })

        if (carCount > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: `ไม่สามารถลบได้ เนื่องจากลูกค้ามีรถจดทะเบียนในระบบ ${carCount} คัน`
                },
                { status: 400 }
            )
        }

        // Hard delete
        await prisma.customer.delete({
            where: { id: params.id }
        })

        return NextResponse.json({
            success: true,
        })
    } catch (error) {
        console.error('Error deleting customer:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถลบข้อมูลได้' },
            { status: 500 }
        )
    }
}
