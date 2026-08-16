/**
 * ไฟล์: app/api/master/department/route.ts
 * จุดประสงค์: API endpoints สำหรับ Department (GET all, POST create)
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { departmentSchema } from '@/lib/validations/hr'
import { ZodError } from 'zod'

// GET - ดึงรายการแผนกทั้งหมด
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
                { name: { contains: search } },
                { description: { contains: search } },
            ]
        }

        if (isActive !== null && isActive !== '') {
            where.isActive = isActive === 'true'
        }

        // Determine orderBy
        const orderBy: any = { [sortBy]: sortOrder }

        const departments = await prisma.department.findMany({
            where,
            orderBy,
            include: {
                _count: {
                    select: { employees: true }
                }
            }
        })

        // Map ข้อมูลให้เหมาะกับ frontend
        const data = departments.map(dept => ({
            id: dept.id,
            code: dept.code,
            name: dept.name,
            description: dept.description,
            employeeCount: dept.employeeCount,
            isActive: dept.isActive,
            createdAt: dept.createdAt,
            updatedAt: dept.updatedAt,
        }))

        return NextResponse.json({
            success: true,
            data,
            total: data.length,
        })
    } catch (error) {
        console.error('GET /api/master/department error:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถดึงข้อมูลได้' },
            { status: 500 }
        )
    }
}

// POST - สร้างแผนกใหม่
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = departmentSchema.parse(body)

        // Check duplicate name
        const existing = await prisma.department.findFirst({
            where: { name: validatedData.name }
        })

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'ชื่อแผนกนี้มีอยู่แล้ว' },
                { status: 400 }
            )
        }

        // Generate unique department code in format: 01, 02, 03, etc.
        // Generate unique department code in format: 01, 02, 03, etc.
        const lastDepartment = await prisma.department.findFirst({
            orderBy: { code: 'desc' }
        })

        let codeNumber = 1
        if (lastDepartment && lastDepartment.code) {
            const currentCode = parseInt(lastDepartment.code)
            if (!isNaN(currentCode)) {
                codeNumber = currentCode + 1
            }
        }

        const code = String(codeNumber).padStart(2, '0')

        // Create department
        const department = await prisma.department.create({
            data: {
                code,
                name: validatedData.name,
                description: validatedData.description || null,
                employeeCount: validatedData.employeeCount || 0,
                isActive: validatedData.isActive ?? true,
            }
        })

        return NextResponse.json({
            success: true,
            data: department,
            message: 'เพิ่มแผนกเรียบร้อยแล้ว'
        }, { status: 201 })

    } catch (error) {
        console.error('POST /api/master/department error:', error)

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
