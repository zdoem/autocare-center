import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateCode } from '@/lib/utils/codeGenerator'

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

// GET - Fetch customers with search, filter, pagination
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''
        const customerTypeId = searchParams.get('customerTypeId') || ''

        // Sorting params
        const sortBy = searchParams.get('sortBy') || 'code'
        const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc'

        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}

        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
                { email: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (customerTypeId) {
            where.customerTypeId = customerTypeId
        }

        // Determine order by
        let orderBy: any = { code: 'asc' } // Default

        if (sortBy === 'updatedAt') {
            // For "Latest Date" - we use updatedAt
            orderBy = { updatedAt: sortOrder }
        } else if (sortBy === 'fullName') {
            orderBy = { fullName: sortOrder }
        } else if (sortBy === 'phone') {
            orderBy = { phone: sortOrder }
        } else if (sortBy === 'code') {
            orderBy = { code: sortOrder }
        }

        // Get total count
        const total = await prisma.customer.count({ where })

        // Get customers
        const customers = await prisma.customer.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include: {
                customerType: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                _count: {
                    select: { cars: true }
                }
            }
        })

        return NextResponse.json({
            success: true,
            data: customers,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        })
    } catch (error) {
        console.error('Error fetching customers:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถโหลดข้อมูลได้' },
            { status: 500 }
        )
    }
}

// POST - Create new customer
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = customerSchema.parse(body)

        // Auto-generate code
        const newCode = await generateCode('CUS-', 'customer', 3)
        console.log('Generating New Customer Code:', newCode)

        // Generate fullName
        const fullName = `${validatedData.firstName} ${validatedData.lastName}`

        // Create customer
        const customer = await prisma.customer.create({
            data: {
                code: newCode,
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
            console.error('❌ Validation Error:', JSON.stringify(error.flatten(), null, 2))
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
                    { success: false, error: 'ระบบสร้างรหัสลูกค้าซ้ำ กรุณาลองใหม่อีกครั้ง' },
                    { status: 409 }
                )
            }
        }

        console.error('Error creating customer:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'ไม่สามารถบันทึกข้อมูลได้' },
            { status: 500 }
        )
    }
}
