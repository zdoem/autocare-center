/**
 * ไฟล์: app/api/master/employee-type/route.ts
 * จุดประสงค์: API endpoints สำหรับ EmployeeType (GET all, POST create)
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { employeeTypeSchema } from '@/lib/validations/hr'
import { ZodError } from 'zod'

// GET - ดึงรายการประเภทพนักงานทั้งหมด
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const isActive = searchParams.get('isActive')
        const sortBy = searchParams.get('sortBy') || 'updatedAt'
        const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (isActive !== null && isActive !== '') {
            where.isActive = isActive === 'true'
        }

        // Determine orderBy
        const orderBy: any = { [sortBy]: sortOrder }

        const employeeTypes = await prisma.employeeType.findMany({
            where,
            orderBy,
            include: {
                _count: {
                    select: { employees: true }
                }
            }
        })

        // Map ข้อมูลให้เหมาะกับ frontend
        const data = employeeTypes.map(et => ({
            id: et.id,
            code: et.code,
            name: et.name,
            description: et.description,
            leaveEntitlement: et.leaveEntitlement,
            employeeCount: et.employeeCount,
            isActive: et.isActive,
            createdAt: et.createdAt,
            updatedAt: et.updatedAt,
        }))

        return NextResponse.json({
            success: true,
            data,
            total: data.length,
        })
    } catch (error) {
        console.error('GET /api/master/employee-type error:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถดึงข้อมูลได้' },
            { status: 500 }
        )
    }
}

// POST - สร้างประเภทพนักงานใหม่
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = employeeTypeSchema.parse(body)

        // Check duplicate name
        const existing = await prisma.employeeType.findFirst({
            where: { name: validatedData.name }
        })

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'ชื่อประเภทนี้มีอยู่แล้ว' },
                { status: 400 }
            )
        }

        // Generate code
        const lastType = await prisma.employeeType.findFirst({
            orderBy: { code: 'desc' }
        })

        let nextId = 1
        if (lastType && lastType.code) {
            const currentId = parseInt(lastType.code)
            if (!isNaN(currentId)) {
                nextId = currentId + 1
            }
        }
        const code = String(nextId).padStart(2, '0')

        // Create employee type
        const employeeType = await prisma.employeeType.create({
            data: {
                code,
                name: validatedData.name,
                description: validatedData.description || null,
                leaveEntitlement: validatedData.leaveEntitlement || null,
                employeeCount: validatedData.employeeCount || 0,
                isActive: validatedData.isActive ?? true,
            }
        })

        return NextResponse.json({
            success: true,
            data: employeeType,
            message: 'เพิ่มประเภทพนักงานเรียบร้อยแล้ว'
        }, { status: 201 })

    } catch (error) {
        console.error('POST /api/master/employee-type error:', error)

        if (error instanceof ZodError) {
            return NextResponse.json(
                { success: false, error: 'ข้อมูลไม่ถูกต้อง', details: (error as any).errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { success: false, error: 'ไม่สามารถบันทึกข้อมูลได้' },
            { status: 500 }
        )
    }
}
