/**
 * ไฟล์: app/api/master/position/route.ts
 * จุดประสงค์: API endpoints สำหรับ Position (GET all, POST create)
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { positionSchema } from '@/lib/validations/hr'
import { ZodError } from 'zod'

// GET - ดึงรายการตำแหน่งงานทั้งหมด
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const departmentId = searchParams.get('departmentId')
        const isActive = searchParams.get('isActive')
        const sortBy = searchParams.get('sortBy') || 'updatedAt'
        const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

        const where: any = {}

        if (search) {
            where.name = { contains: search }
        }

        if (departmentId) {
            where.departmentId = departmentId
        }

        if (isActive !== null && isActive !== '') {
            where.isActive = isActive === 'true'
        }

        // Determine orderBy
        let orderBy: any = {}
        if (sortBy === 'department') {
            orderBy = { department: { name: sortOrder } }
        } else {
            orderBy = { [sortBy]: sortOrder }
        }

        const positions = await prisma.position.findMany({
            where,
            orderBy,
            include: {
                department: {
                    select: { id: true, name: true }
                },
                _count: {
                    select: { employees: true }
                }
            }
        })

        // Map ข้อมูลให้เหมาะกับ frontend
        const data = positions.map(pos => ({
            id: pos.id,
            code: pos.code,
            name: pos.name,
            departmentId: pos.departmentId,
            departmentName: pos.department?.name || '-',
            baseSalary: pos.baseSalary,
            employeeCount: pos._count.employees,
            isActive: pos.isActive,
            createdAt: pos.createdAt,
            updatedAt: pos.updatedAt,
        }))

        return NextResponse.json({
            success: true,
            data,
            total: data.length,
        })
    } catch (error) {
        console.error('GET /api/master/position error:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถดึงข้อมูลได้' },
            { status: 500 }
        )
    }
}

// POST - สร้างตำแหน่งงานใหม่
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = positionSchema.parse(body)

        // Check duplicate name in same department
        const existing = await prisma.position.findFirst({
            where: {
                name: validatedData.name,
                departmentId: validatedData.departmentId
            }
        })

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'ตำแหน่งนี้มีอยู่แล้วในแผนกเดียวกัน' },
                { status: 400 }
            )
        }

        // Generate code
        const lastPos = await prisma.position.findFirst({
            orderBy: { code: 'desc' }
        })

        let nextId = 1
        if (lastPos && lastPos.code) {
            const currentId = parseInt(lastPos.code)
            if (!isNaN(currentId)) {
                nextId = currentId + 1
            }
        }
        const code = String(nextId).padStart(2, '0')

        // Create position
        const position = await prisma.position.create({
            data: {
                code,
                name: validatedData.name,
                departmentId: validatedData.departmentId,
                baseSalary: validatedData.baseSalary || null,
                isActive: validatedData.isActive ?? true,
            }
        })

        return NextResponse.json({
            success: true,
            data: position,
            message: 'เพิ่มตำแหน่งงานเรียบร้อยแล้ว'
        }, { status: 201 })

    } catch (error) {
        console.error('POST /api/master/position error:', error)

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
