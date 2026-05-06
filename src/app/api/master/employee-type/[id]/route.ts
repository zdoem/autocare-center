/**
 * ไฟล์: app/api/master/employee-type/[id]/route.ts
 * จุดประสงค์: API endpoints สำหรับ EmployeeType by ID (GET, PUT, DELETE)
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { employeeTypeSchema } from '@/lib/validations/hr'
import { ZodError } from 'zod'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - ดึงข้อมูลประเภทพนักงานตาม ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID ไม่ถูกต้อง' },
                { status: 400 }
            )
        }

        const employeeType = await prisma.employeeType.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { employees: true }
                }
            }
        })

        if (!employeeType) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบข้อมูลประเภทพนักงาน' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                ...employeeType,
                code: employeeType.code,
                employeeCount: employeeType._count.employees,
            }
        })
    } catch (error) {
        console.error('GET /api/master/employee-type/[id] error:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถดึงข้อมูลได้' },
            { status: 500 }
        )
    }
}

// PUT - แก้ไขข้อมูลประเภทพนักงาน
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
        const validatedData = employeeTypeSchema.parse(body)

        // Check if exists
        const existing = await prisma.employeeType.findUnique({
            where: { id }
        })

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบข้อมูลประเภทพนักงาน' },
                { status: 404 }
            )
        }

        // Check duplicate name (exclude current)
        const duplicate = await prisma.employeeType.findFirst({
            where: {
                name: validatedData.name,
                id: { not: id }
            }
        })

        if (duplicate) {
            return NextResponse.json(
                { success: false, error: 'ชื่อประเภทนี้มีอยู่แล้ว' },
                { status: 400 }
            )
        }

        // Update
        const employeeType = await prisma.employeeType.update({
            where: { id },
            data: {
                name: validatedData.name,
                description: validatedData.description || null,
                leaveEntitlement: validatedData.leaveEntitlement || null,
                employeeCount: validatedData.employeeCount || 0,
                isActive: validatedData.isActive,
            }
        })

        return NextResponse.json({
            success: true,
            data: employeeType,
            message: 'แก้ไขประเภทพนักงานเรียบร้อยแล้ว'
        })

    } catch (error) {
        console.error('PUT /api/master/employee-type/[id] error:', error)

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

// DELETE - ลบประเภทพนักงาน
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
        const existing = await prisma.employeeType.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { employees: true }
                }
            }
        })

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบข้อมูลประเภทพนักงาน' },
                { status: 404 }
            )
        }

        // Check if has employees
        if (existing._count.employees > 0) {
            return NextResponse.json(
                { success: false, error: `ไม่สามารถลบได้ เนื่องจากมีพนักงานประเภทนี้ ${existing._count.employees} คน` },
                { status: 400 }
            )
        }

        // Delete
        await prisma.employeeType.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'ลบประเภทพนักงานเรียบร้อยแล้ว'
        })

    } catch (error) {
        console.error('DELETE /api/master/employee-type/[id] error:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถลบข้อมูลได้' },
            { status: 500 }
        )
    }
}
