/**
 * ไฟล์: app/api/master/car-model/[id]/route.ts
 * จุดประสงค์: API endpoints สำหรับ CarModel by ID (GET, PUT, DELETE)
 * 
 * @author AutoCare Team
 * @created 2026-01-25
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { carModelSchema } from '@/lib/validations/vehicle'
import { ZodError } from 'zod'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - ดึงข้อมูลรุ่นรถตาม ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID ไม่ถูกต้อง' },
                { status: 400 }
            )
        }

        const carModel = await prisma.carModel.findUnique({
            where: { id },
            include: {
                carBrand: true,
                _count: {
                    select: { cars: true }
                }
            }
        })

        if (!carModel) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบข้อมูลรุ่นรถ' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                ...carModel,
                carCount: carModel._count.cars,
            }
        })
    } catch (error) {
        console.error('GET /api/master/car-model/[id] error:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถดึงข้อมูลได้' },
            { status: 500 }
        )
    }
}

// PUT - แก้ไขข้อมูลรุ่นรถ
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
        const validatedData = carModelSchema.parse(body)

        // Check duplicate name in same brand (exclude current)
        const duplicate = await prisma.carModel.findFirst({
            where: {
                name: validatedData.name,
                carBrandId: validatedData.carBrandId,
                NOT: { id }
            }
        })

        if (duplicate) {
            return NextResponse.json(
                { success: false, error: 'รุ่นรถนี้มีอยู่แล้วในยี่ห้อเดียวกัน' },
                { status: 400 }
            )
        }

        // Update with Prisma
        const carModel = await prisma.carModel.update({
            where: { id },
            data: {
                name: validatedData.name,
                carBrandId: validatedData.carBrandId,
                description: validatedData.description || null,
                yearStart: validatedData.yearStart || null,
                yearEnd: validatedData.yearEnd || null,
                vehicleType: validatedData.vehicleType || null,
                fuelType: validatedData.fuelType || null,
                isActive: validatedData.isActive ?? true,
            },
            include: {
                carBrand: true,
            }
        })

        return NextResponse.json({
            success: true,
            data: carModel,
            message: 'แก้ไขรุ่นรถเรียบร้อยแล้ว'
        })

    } catch (error: any) {
        console.error('PUT /api/master/car-model/[id] error:', error)

        if (error instanceof ZodError) {
            return NextResponse.json(
                { success: false, error: 'ข้อมูลไม่ถูกต้อง', details: (error as any).errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { success: false, error: `ไม่สามารถบันทึกข้อมูลได้: ${error.message}` },
            { status: 500 }
        )
    }
}

// DELETE - ลบรุ่นรถ (Hard Delete)
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
        const existing = await prisma.carModel.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { cars: true }
                }
            }
        })

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบข้อมูลรุ่นรถ' },
                { status: 404 }
            )
        }

        // Check if in use
        if (existing._count.cars > 0) {
            return NextResponse.json(
                { success: false, error: `ไม่สามารถลบได้ เนื่องจากมีรถยนต์ที่ใช้รุ่นนี้อยู่ ${existing._count.cars} คัน` },
                { status: 400 }
            )
        }

        await prisma.carModel.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'ลบรุ่นรถเรียบร้อยแล้ว'
        })

    } catch (error: any) {
        console.error('DELETE /api/master/car-model/[id] error:', error)
        return NextResponse.json(
            { success: false, error: `ไม่สามารถลบข้อมูลได้: ${error.message}` },
            { status: 500 }
        )
    }
}
