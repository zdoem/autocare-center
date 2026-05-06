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
            include

                : {
                carBrand: true
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
            data: carModel
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

        // Check duplicate name in same brand (exclude current) - Use Raw Query
        const duplicates: any[] = await prisma.$queryRaw`
            SELECT id FROM "car_models"
            WHERE name = ${validatedData.name}
            AND "carBrandId" = ${validatedData.carBrandId}
            AND id != ${id}
            LIMIT 1
        `

        if (duplicates.length > 0) {
            return NextResponse.json(
                { success: false, error: 'รุ่นรถนี้มีอยู่แล้วในยี่ห้อเดียวกัน' },
                { status: 400 }
            )
        }

        // Update with Raw Query
        await prisma.$executeRaw`
            UPDATE "car_models"
            SET 
                name = ${validatedData.name},
                "carBrandId" = ${validatedData.carBrandId},
                description = ${validatedData.description || null},
                "yearStart" = ${validatedData.yearStart || null},
                "yearEnd" = ${validatedData.yearEnd || null},
                "vehicleType" = ${validatedData.vehicleType || null},
                "fuelType" = ${validatedData.fuelType || null},
                "isActive" = ${validatedData.isActive ?? true},
                "updatedAt" = NOW()
            WHERE id = ${id}
        `

        // Fetch updated data
        const updatedRows = await prisma.$queryRaw`
            SELECT * FROM "car_models" WHERE id = ${id}
        `
        const carModel = (updatedRows as any[])[0]

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

        // Hard Delete with Raw Query
        const result = await prisma.$executeRaw`
            DELETE FROM "car_models" WHERE id = ${id}
        `

        if (result === 0) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบข้อมูลรุ่นรถ' },
                { status: 404 }
            )
        }

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
