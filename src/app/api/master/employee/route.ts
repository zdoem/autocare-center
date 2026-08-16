/**
 * ไฟล์: app/api/master/employee/route.ts
 * จุดประสงค์: API endpoints สำหรับ Employee (GET all, POST create)
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { employeeSchema } from '@/lib/validations/hr'
import { ZodError } from 'zod'
import bcrypt from 'bcryptjs'

import { generateCode } from '@/lib/utils/codeGenerator'

// GET - ดึงรายการพนักงานทั้งหมด
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const departmentId = searchParams.get('departmentId')
        const isActive = searchParams.get('isActive')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        const sortBy = searchParams.get('sortBy') || 'createdAt'
        const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

        const where: any = {}

        if (search) {
            where.OR = [
                { code: { contains: search } },
                { name: { contains: search } },
                { nickname: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
            ]
        }

        if (departmentId) {
            where.departmentId = departmentId
        }

        if (isActive !== null && isActive !== '') {
            where.isActive = isActive === 'true'
        }

        // Count total
        const total = await prisma.employee.count({ where })

        // Determine orderBy
        let orderBy: any = {}
        if (sortBy === 'department') {
            orderBy = { department: { name: sortOrder } }
        } else if (sortBy === 'position') {
            orderBy = { position: { name: sortOrder } }
        } else if (sortBy === 'employeeType') {
            orderBy = { employeeType: { name: sortOrder } }
        } else {
            orderBy = { [sortBy]: sortOrder }
        }

        // Get paginated data
        const employees = await prisma.employee.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
            include: {
                department: {
                    select: { id: true, name: true }
                },
                position: {
                    select: { id: true, name: true }
                },
                employeeType: {
                    select: { id: true, name: true }
                }
            }
        })

        // Map ข้อมูลให้เหมาะกับ frontend
        const data = employees.map(emp => ({
            id: emp.id,
            code: emp.code || '-',
            name: emp.name,
            nickname: emp.nickname,
            departmentId: emp.departmentId,
            departmentName: emp.department?.name || '-',
            positionId: emp.positionId,
            positionName: emp.position?.name || '-',
            employeeTypeId: emp.employeeTypeId,
            employeeTypeName: emp.employeeType?.name || '-',
            phone: emp.phone,
            email: emp.email,
            startDate: emp.startDate,
            salary: emp.salary,
            username: emp.username,
            role: emp.role,
            isActive: emp.isActive,
            createdAt: emp.createdAt,
            updatedAt: emp.updatedAt,
        }))

        return NextResponse.json({
            success: true,
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        })
    } catch (error) {
        console.error('GET /api/master/employee error:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถดึงข้อมูลได้' },
            { status: 500 }
        )
    }
}

// POST - สร้างพนักงานใหม่
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = employeeSchema.parse(body)

        // Generate employee code
        const employeeCode = await generateCode('EMP-', 'employee', 3)

        // Check duplicate username (if provided)
        if (validatedData.username) {
            const existingUser = await prisma.employee.findFirst({
                where: { username: validatedData.username }
            })
            if (existingUser) {
                return NextResponse.json(
                    { success: false, error: 'Username นี้ถูกใช้แล้ว' },
                    { status: 400 }
                )
            }
        }

        // Hash password if provided, or default to username
        let hashedPassword = null
        if (validatedData.password) {
            hashedPassword = await bcrypt.hash(validatedData.password, 12)
        } else if (validatedData.username) {
            hashedPassword = await bcrypt.hash(validatedData.username, 12)
        }

        // Create employee
        const employee = await prisma.employee.create({
            data: {
                code: employeeCode,
                name: validatedData.name,
                nickname: validatedData.nickname || null,
                departmentId: validatedData.departmentId,
                positionId: validatedData.positionId,
                employeeTypeId: validatedData.employeeTypeId || null,
                phone: validatedData.phone,
                email: validatedData.email || null,
                startDate: validatedData.startDate ? new Date(validatedData.startDate) : new Date(), // Default to now if missing
                salary: validatedData.salary ?? 0, // Default to 0
                username: validatedData.username || null,
                password: hashedPassword,
                role: validatedData.role || null,
                isActive: true,
            }
        })

        return NextResponse.json({
            success: true,
            data: employee,
            message: 'เพิ่มพนักงานเรียบร้อยแล้ว'
        }, { status: 201 })

    } catch (error) {
        console.error('POST /api/master/employee error:', error)

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
