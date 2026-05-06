/**
 * ไฟล์: app/api/master/employee/[id]/route.ts
 * จุดประสงค์: API endpoints สำหรับ Employee by ID (GET, PUT, DELETE)
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { employeeSchema } from '@/lib/validations/hr'
import { ZodError } from 'zod'
import bcrypt from 'bcryptjs'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - ดึงข้อมูลพนักงานตาม ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID ไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        employeeType: true,
      }
    })

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลพนักงาน' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...employee,
        password: undefined, // Don't return password
      }
    })
  } catch (error) {
    console.error('GET /api/master/employee/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'ไม่สามารถดึงข้อมูลได้' },
      { status: 500 }
    )
  }
}

// PUT - แก้ไขข้อมูลพนักงาน
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
    const validatedData = employeeSchema.parse(body)

    // Check if exists
    const existing = await prisma.employee.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลพนักงาน' },
        { status: 404 }
      )
    }

    // Check duplicate username (exclude current)
    if (validatedData.username) {
      const duplicateUser = await prisma.employee.findFirst({
        where: {
          username: validatedData.username,
          id: { not: id }
        }
      })
      if (duplicateUser) {
        return NextResponse.json(
          { success: false, error: 'Username นี้ถูกใช้แล้ว' },
          { status: 400 }
        )
      }
    }

    // Update (don't update password here)
    // Hash password if provided
    let hashedPassword = undefined
    if (validatedData.password) {
      hashedPassword = await bcrypt.hash(validatedData.password, 12)
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        name: validatedData.name,
        nickname: validatedData.nickname || null,
        departmentId: validatedData.departmentId,
        positionId: validatedData.positionId,
        employeeTypeId: validatedData.employeeTypeId || null,
        phone: validatedData.phone,
        email: validatedData.email || null,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        salary: validatedData.salary ?? undefined,
        username: validatedData.username || null,
        role: validatedData.role || null,
        isActive: validatedData.isActive,
        ...(hashedPassword && { password: hashedPassword }),
      }
    })

    return NextResponse.json({
      success: true,
      data: employee,
      message: 'แก้ไขข้อมูลพนักงานเรียบร้อยแล้ว'
    })

  } catch (error) {
    console.error('PUT /api/master/employee/[id] error:', error)

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

// DELETE - ลบพนักงาน
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
    const existing = await prisma.employee.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลพนักงาน' },
        { status: 404 }
      )
    }

    // Check relations
    const [serviceJobsCount, userCount] = await Promise.all([
      prisma.serviceJob.count({ where: { technicianId: id } }),
      prisma.user.count({ where: { employeeId: id } })
    ])

    if (serviceJobsCount > 0) {
      return NextResponse.json(
        { success: false, error: `ไม่สามารถลบได้ เนื่องจากพนักงานนี้มีประวัติการซ่อม ${serviceJobsCount} รายการ` },
        { status: 400 }
      )
    }

    if (userCount > 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถลบได้ เนื่องจากพนักงานนี้มีการผูกบัญชีผู้ใช้งานระบบ (User Account)' },
        { status: 400 }
      )
    }

    // Delete
    await prisma.employee.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'ลบพนักงานเรียบร้อยแล้ว'
    })

  } catch (error) {
    console.error('DELETE /api/master/employee/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'ไม่สามารถลบข้อมูลได้' },
      { status: 500 }
    )
  }
}
