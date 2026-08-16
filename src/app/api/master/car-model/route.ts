/**
 * ไฟล์: app/api/master/car-model/route.ts
 * จุดประสงค์: API endpoints สำหรับ CarModel (GET all, POST create)
 * 
 * @author AutoCare Team
 * @created 2026-01-25
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { carModelSchema } from '@/lib/validations/vehicle'
import { ZodError } from 'zod'

// GET - ดึงรายการรุ่นรถทั้งหมด
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const isActive = searchParams.get('isActive')
        const carBrandId = searchParams.get('carBrandId')
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

        if (carBrandId) {
            where.carBrandId = carBrandId
        }

        // Determine orderBy
        const validSortFields = ['code', 'name', 'yearStart', 'yearEnd', 'vehicleType', 'fuelType', 'isActive', 'createdAt', 'updatedAt']
        let orderBy: any = { updatedAt: sortOrder }
        if (validSortFields.includes(sortBy)) {
            orderBy = { [sortBy]: sortOrder }
        } else if (sortBy === 'carBrand') {
            orderBy = { carBrand: { nameEnglish: sortOrder } }
        }

        const carModels = await prisma.carModel.findMany({
            where,
            orderBy,
            include: {
                carBrand: true,
                _count: {
                    select: { cars: true }
                }
            }
        })

        const data = carModels.map(model => ({
            id: model.id,
            code: model.code,
            name: model.name,
            carBrandId: model.carBrandId,
            carBrandName: model.carBrand?.nameEnglish || model.carBrand?.name || '',
            carBrand: model.carBrand,
            description: model.description,
            yearStart: model.yearStart,
            yearEnd: model.yearEnd,
            vehicleType: model.vehicleType,
            fuelType: model.fuelType,
            isActive: model.isActive,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt,
            carCount: model._count?.cars || 0,
        }))

        return NextResponse.json({
            success: true,
            data,
            total: data.length,
        })
    } catch (error: any) {
        console.error('GET /api/master/car-model error:', error)
        return NextResponse.json(
            { success: false, error: `ไม่สามารถดึงข้อมูลได้: ${error.message}` },
            { status: 500 }
        )
    }
}

// POST - สร้างรุ่นรถใหม่
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = carModelSchema.parse(body)

        // Check duplicate name in same brand
        const duplicate = await prisma.carModel.findFirst({
            where: {
                name: validatedData.name,
                carBrandId: validatedData.carBrandId,
            }
        })

        if (duplicate) {
            return NextResponse.json(
                { success: false, error: 'รุ่นรถนี้มีอยู่แล้วในยี่ห้อเดียวกัน' },
                { status: 400 }
            )
        }

        // Generate code
        const lastModel = await prisma.carModel.findFirst({
            orderBy: { code: 'desc' }
        })

        let nextId = 1
        if (lastModel && lastModel.code) {
            const match = lastModel.code.match(/MD(\d+)/)
            if (match) {
                nextId = parseInt(match[1]) + 1
            }
        }
        const code = `MD${String(nextId).padStart(3, '0')}`

        // Create car model with Prisma
        const carModel = await prisma.carModel.create({
            data: {
                code,
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
            message: 'เพิ่มรุ่นรถเรียบร้อยแล้ว'
        }, { status: 201 })

    } catch (error: any) {
        console.error('POST /api/master/car-model error:', error)

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
