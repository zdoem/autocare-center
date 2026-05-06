import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema
const customerTypeSchema = z.object({
    name: z.string().min(2, 'ชื่อประเภทต้องมีอย่างน้อย 2 ตัวอักษร'),
    description: z.string().optional().nullable(),
    discount: z.number().min(0).max(100, 'ส่วนลดต้องอยู่ระหว่าง 0-100%').default(0),
    isActive: z.boolean().default(true),
})

// PUT - Update customer type
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const body = await request.json()
        const validatedData = customerTypeSchema.parse(body)

        const customerType = await prisma.customerType.update({
            where: { id: params.id },
            data: {
                name: validatedData.name,
                description: validatedData.description || null,
                discount: validatedData.discount,
                isActive: validatedData.isActive,
            }
        })

        return NextResponse.json({
            success: true,
            data: customerType,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: (error as any).errors[0].message },
                { status: 400 }
            )
        }

        console.error('Error updating customer type:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถอัพเดทข้อมูลได้' },
            { status: 500 }
        )
    }
}

// DELETE - Delete customer type
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // Check if any customers are using this type
        const customerCount = await prisma.customer.count({
            where: { customerTypeId: params.id }
        })

        if (customerCount > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: `ไม่สามารถลบได้ เนื่องจากมีลูกค้า ${customerCount} รายใช้งานประเภทนี้อยู่`
                },
                { status: 400 }
            )
        }

        // Hard delete
        await prisma.customerType.delete({
            where: { id: params.id }
        })

        return NextResponse.json({
            success: true,
        })
    } catch (error) {
        console.error('Error deleting customer type:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถลบข้อมูลได้' },
            { status: 500 }
        )
    }
}
