/**
 * ไฟล์: app/api/master/car-brand/[id]/route.ts
 * จุดประสงค์: API endpoints สำหรับ CarBrand by ID (GET, PUT, DELETE)
 * 
 * @author AutoCare Team
 * @created 2026-01-25
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { carBrandSchema } from '@/lib/validations/vehicle'
import { ZodError } from 'zod'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - ดึงข้อมูลยี่ห้อรถตาม ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID ไม่ถูกต้อง' },
                { status: 400 }
            )
        }

        const carBrand = await prisma.carBrand.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { models: true }
                }
            }
        })

        if (!carBrand) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบข้อมูลยี่ห้อรถ' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                ...carBrand,
                modelCount: carBrand._count.models,
            }
        })
    } catch (error) {
        console.error('GET /api/master/car-brand/[id] error:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถดึงข้อมูลได้' },
            { status: 500 }
        )
    }
}

// PUT - แก้ไขข้อมูลยี่ห้อรถ
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
        const validatedData = carBrandSchema.parse(body)

        // Check if exists
        const existing = await prisma.carBrand.findUnique({
            where: { id }
        })

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบข้อมูลยี่ห้อรถ' },
                { status: 404 }
            )
        }

        // Check duplicate nameEnglish (exclude current)
        // Check duplicate nameEnglish (exclude current) - Use Raw Query
        const duplicates: any[] = await prisma.$queryRaw`
            SELECT id FROM "car_brands" 
            WHERE "nameEnglish" = ${validatedData.nameEnglish} 
            AND id != ${id}
            LIMIT 1
        `

        if (duplicates.length > 0) {
            return NextResponse.json(
                { success: false, error: 'ยี่ห้อนี้มีอยู่แล้ว' },
                { status: 400 }
            )
        }

        // Update
        // Use executeRaw to bypass outdated Prisma Runtime Schema
        await prisma.$executeRaw`
            UPDATE "car_brands"
            SET 
                "nameThai" = ${validatedData.nameThai},
                "nameEnglish" = ${validatedData.nameEnglish},
                "name" = ${validatedData.nameEnglish},
                "description" = ${validatedData.description || null},
                "logoUrl" = ${validatedData.logoUrl || null},
                "isActive" = ${validatedData.isActive ?? true},
                "updatedAt" = NOW()
            WHERE id = ${id}
        `

        // Fetch updated record to return
        const updatedRows = await prisma.$queryRaw`
            SELECT * FROM "car_brands" WHERE id = ${id}
        `
        const carBrand = (updatedRows as any[])[0]

        return NextResponse.json({
            success: true,
            data: carBrand,
            message: 'แก้ไขยี่ห้อรถเรียบร้อยแล้ว'
        })

    } catch (error: any) {
        console.error('PUT /api/master/car-brand/[id] error:', error)

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

// DELETE - ลบยี่ห้อรถ
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
        const existing = await prisma.carBrand.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { models: true }
                }
            }
        })

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบข้อมูลยี่ห้อรถ' },
                { status: 404 }
            )
        }

        // Check if has models
        if (existing._count.models > 0) {
            return NextResponse.json(
                { success: false, error: `ไม่สามารถลบได้ เนื่องจากมีรุ่นรถในยี่ห้อนี้ ${existing._count.models} รุ่น` },
                { status: 400 }
            )
        }

        // Hard Delete
        await prisma.carBrand.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'ลบยี่ห้อรถเรียบร้อยแล้ว'
        })

    } catch (error) {
        console.error('DELETE /api/master/car-brand/[id] error:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถลบข้อมูลได้' },
            { status: 500 }
        )
    }
}
