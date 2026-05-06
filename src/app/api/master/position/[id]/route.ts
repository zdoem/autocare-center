/**
 * ไฟล์: app/api/master/position/[id]/route.ts
 * จุดประสงค์: API endpoints สำหรับ Position by ID (GET, PUT, DELETE)
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { positionSchema } from '@/lib/validations/hr'
import { ZodError } from 'zod'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - ดึงข้อมูลตำแหน่งงานตาม ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID ไม่ถูกต้อง' },
                { status: 400 }
            )
        }

        const position = await prisma.position.findUnique({
            where: { id },
            include: {
                department: true,
                _count: {
                    select: { employees: true }
                }
            }
        })

        if (!position) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบข้อมูลตำแหน่งงาน' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                ...position,
                code: position.code,
                employeeCount: position._count.employees,
            }
        })
    } catch (error) {
        console.error('GET /api/master/position/[id] error:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถดึงข้อมูลได้' },
            { status: 500 }
        )
    }
}

// PUT - แก้ไขข้อมูลตำแหน่งงาน
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID ไม่ถูกต้อง' },
                { status: 400 }
            )
        }

        const body = await request.json()
        const validatedData = positionSchema.parse(body)

        // Check if exists
        const existing = await prisma.position.findUnique({
            where: { id }
        })

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบข้อมูลตำแหน่งงาน' },
                { status: 404 }
            )
        }

        // Check duplicate name in same department (exclude current)
        const duplicate = await prisma.position.findFirst({
            where: {
                name: validatedData.name,
                departmentId: validatedData.departmentId,
                id: { not: id }
            }
        })

        if (duplicate) {
            return NextResponse.json(
                { success: false, error: 'ตำแหน่งนี้มีอยู่แล้วในแผนกเดียวกัน' },
                { status: 400 }
            )
        }

        // Update
        const position = await prisma.position.update({
            where: { id },
            data: {
                name: validatedData.name,
                departmentId: validatedData.departmentId,
                baseSalary: validatedData.baseSalary || null,
                isActive: validatedData.isActive,
            }
        })

        return NextResponse.json({
            success: true,
            data: position,
            message: 'แก้ไขตำแหน่งงานเรียบร้อยแล้ว'
        })

    } catch (error) {
        console.error('PUT /api/master/position/[id] error:', error)

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

// DELETE - ลบตำแหน่งงาน
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID ไม่ถูกต้อง' },
                { status: 400 }
            )
        }

        // Check if exists
        const existing = await prisma.position.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { employees: true }
                }
            }
        })

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบข้อมูลตำแหน่งงาน' },
                { status: 404 }
            )
        }

        // Check if has employees
        if (existing._count.employees > 0) {
            return NextResponse.json(
                { success: false, error: `ไม่สามารถลบได้ เนื่องจากมีพนักงานตำแหน่งนี้ ${existing._count.employees} คน` },
                { status: 400 }
            )
        }

        // Delete
        await prisma.position.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'ลบตำแหน่งงานเรียบร้อยแล้ว'
        })

    } catch (error) {
        console.error('DELETE /api/master/position/[id] error:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถลบข้อมูลได้' },
            { status: 500 }
        )
    }
}
