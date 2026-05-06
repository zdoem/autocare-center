/**
 * ไฟล์: app/api/master/department/[id]/route.ts
 * จุดประสงค์: API endpoints สำหรับ Department by ID (GET, PUT, DELETE)
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { departmentSchema } from '@/lib/validations/hr'
import { ZodError } from 'zod'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - ดึงข้อมูลแผนกตาม ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const department = await prisma.department.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { employees: true }
                }
            }
        })

        if (!department) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบข้อมูลแผนก' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                ...department,
                code: department.code,
                employeeCount: department.employeeCount,
            }
        })
    } catch (error) {
        console.error('GET /api/master/department/[id] error:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถดึงข้อมูลได้' },
            { status: 500 }
        )
    }
}

// PUT - แก้ไขข้อมูลแผนก
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const body = await request.json()
        const validatedData = departmentSchema.parse(body)

        // Check if department exists
        const existing = await prisma.department.findUnique({
            where: { id }
        })

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบข้อมูลแผนก' },
                { status: 404 }
            )
        }

        // Check duplicate name (exclude current)
        const duplicate = await prisma.department.findFirst({
            where: {
                name: validatedData.name,
                id: { not: id }
            }
        })

        if (duplicate) {
            return NextResponse.json(
                { success: false, error: 'ชื่อแผนกนี้มีอยู่แล้ว' },
                { status: 400 }
            )
        }

        // Update department
        const department = await prisma.department.update({
            where: { id },
            data: {
                name: validatedData.name,
                description: validatedData.description || null,
                employeeCount: validatedData.employeeCount || 0,
                isActive: validatedData.isActive,
            }
        })

        return NextResponse.json({
            success: true,
            data: department,
            message: 'แก้ไขแผนกเรียบร้อยแล้ว'
        })

    } catch (error) {
        console.error('PUT /api/master/department/[id] error:', error)

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

// DELETE - ลบแผนก
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        // Check if department exists
        const existing = await prisma.department.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { employees: true }
                }
            }
        })

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบข้อมูลแผนก' },
                { status: 404 }
            )
        }

        // Check if has employees
        if (existing._count.employees > 0) {
            return NextResponse.json(
                { success: false, error: `ไม่สามารถลบได้ เนื่องจากมีพนักงานในแผนกนี้ ${existing._count.employees} คน` },
                { status: 400 }
            )
        }

        // Delete department
        await prisma.department.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'ลบแผนกเรียบร้อยแล้ว'
        })

    } catch (error) {
        console.error('DELETE /api/master/department/[id] error:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถลบข้อมูลได้' },
            { status: 500 }
        )
    }
}
