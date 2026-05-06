/**
 * ไฟล์: app/api/master/car-model/route.ts
 * จุดประสงค์: API endpoints สำหรับ CarModel (GET all, POST create)
 * 
 * @author AutoCare Team
 * @created 2026-01-25
 */

import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
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
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (isActive !== null && isActive !== '') {
            where.isActive = isActive === 'true'
        }

        if (carBrandId) {
            where.carBrandId = carBrandId
        }

        // Determine ORDER BY field (map sortBy to actual column names)
        let orderByField = 'cm."updatedAt"'
        if (sortBy === 'code') orderByField = 'cm.code'
        else if (sortBy === 'name') orderByField = 'cm.name'
        else if (sortBy === 'carBrand') orderByField = 'cb."nameEnglish"'
        else if (sortBy === 'vehicleType') orderByField = 'cm."vehicleType"'
        else if (sortBy === 'fuelType') orderByField = 'cm."fuelType"'
        else if (sortBy === 'isActive') orderByField = 'cm."isActive"'
        else if (sortBy === 'updatedAt') orderByField = 'cm."updatedAt"'

        const orderDirection = sortOrder.toUpperCase()

        // Use raw query with Prisma.sql for dynamic ORDER BY
        const carModels = await prisma.$queryRaw(
            Prisma.sql([`
                SELECT 
                    cm.id,
                    cm.code,
                    cm.name,
                    cm."carBrandId",
                    cm.description,
                    cm."yearStart",
                    cm."yearEnd",
                    cm."vehicleType",
                    cm."fuelType",
                    cm."isActive",
                    cm."createdAt",
                    cm."updatedAt",
                    cb."nameEnglish" as "carBrandNameEnglish",
                    cb."nameThai" as "carBrandNameThai",
                    cb.name as "carBrandName"
                FROM "car_models" cm
                LEFT JOIN "car_brands" cb ON cm."carBrandId" = cb.id
                ORDER BY ${orderByField} ${orderDirection}
            `])
        )

        // Map Raw Data
        const data = (carModels as any[]).map(model => ({
            id: model.id,
            code: model.code,
            name: model.name,
            carBrandId: model.carBrandId,
            carBrandName: model.carBrandNameEnglish || model.carBrandName,
            description: model.description,
            yearStart: model.yearStart,
            yearEnd: model.yearEnd,
            vehicleType: model.vehicleType,
            fuelType: model.fuelType,
            isActive: model.isActive,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt,
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

        // Check duplicate name in same brand - Use Raw Query
        const duplicates: any[] = await prisma.$queryRaw`
            SELECT id FROM "car_models"
            WHERE name = ${validatedData.name}
            AND "carBrandId" = ${validatedData.carBrandId}
            LIMIT 1
        `

        if (duplicates.length > 0) {
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
        const carModelId = require('crypto').randomUUID()

        // Create car model with Raw Query
        await prisma.$executeRaw`
            INSERT INTO "car_models" (
                id, code, name, "carBrandId", description, "yearStart", "yearEnd", 
                "vehicleType", "fuelType", "isActive", "createdAt", "updatedAt"
            ) VALUES (
                ${carModelId},
                ${code},
                ${validatedData.name},
                ${validatedData.carBrandId},
                ${validatedData.description || null},
                ${validatedData.yearStart || null},
                ${validatedData.yearEnd || null},
                ${validatedData.vehicleType || null},
                ${validatedData.fuelType || null},
                ${validatedData.isActive ?? true},
                NOW(),
                NOW()
            )
        `

        // Fetch created data
        const createdRows = await prisma.$queryRaw`
            SELECT * FROM "car_models" WHERE id = ${carModelId}
        `
        const carModel = (createdRows as any[])[0]

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
