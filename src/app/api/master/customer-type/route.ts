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

// GET - Fetch all customer types
export async function GET(request: NextRequest) {
    try {
        const customerTypes = await prisma.customerType.findMany({
            orderBy: { code: 'asc' },
            include: {
                _count: {
                    select: { customers: true }
                }
            }
        })

        return NextResponse.json({
            success: true,
            data: customerTypes,
        })
    } catch (error) {
        console.error('Error fetching customer types:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถโหลดข้อมูลได้' },
            { status: 500 }
        )
    }
}

// POST - Create new customer type
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = customerTypeSchema.parse(body)

        // Auto-generate code
        const lastType = await prisma.customerType.findFirst({
            orderBy: { code: 'desc' }
        })

        let newCode = 'CT01'
        if (lastType?.code) {
            const lastNum = parseInt(lastType.code.replace('CT', ''))
            newCode = `CT${String(lastNum + 1).padStart(2, '0')}`
        }

        //Create customer type
        const customerType = await prisma.customerType.create({
            data: {
                code: newCode,
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

        console.error('Error creating customer type:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถบันทึกข้อมูลได้' },
            { status: 500 }
        )
    }
}
