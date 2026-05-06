/**
 * ไฟล์: app/api/master/car-brand/route.ts
 * จุดประสงค์: API endpoints สำหรับ CarBrand (GET all, POST create)
 * 
 * @author AutoCare Team
 * @created 2026-01-25
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { carBrandSchema } from '@/lib/validations/vehicle'
import { ZodError } from 'zod'

// GET - ดึงรายการยี่ห้อรถทั้งหมด
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const isActive = searchParams.get('isActive')
        const sortBy = searchParams.get('sortBy') || 'updatedAt'
        const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

        const where: any = {}

        if (search) {
            where.OR = [
                { nameThai: { contains: search, mode: 'insensitive' } },
                { nameEnglish: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (isActive !== null && isActive !== '') {
            where.isActive = isActive === 'true'
        }

        // Determine orderBy
        const orderBy: any = { [sortBy]: sortOrder }

        // Use raw query to bypass outdated Prisma Client runtime cache
        const carBrands = await prisma.$queryRaw`
            SELECT 
                cb.id, 
                cb.code, 
                cb."nameThai", 
                cb."nameEnglish", 
                cb.name, 
                cb.description, 
                cb."logoUrl", 
                cb."isActive", 
                cb."createdAt", 
                cb."updatedAt"
            FROM "car_brands" cb
            ORDER BY cb."updatedAt" DESC
        `

        // Map Raw Data (Postgres returns field names exactly as in DB)
        const data = (carBrands as any[]).map(brand => ({
            id: brand.id,
            code: brand.code,
            nameThai: brand.nameThai,
            nameEnglish: brand.nameEnglish,
            name: brand.name,
            description: brand.description,
            logoUrl: brand.logoUrl,
            isActive: brand.isActive,
            createdAt: brand.createdAt,
            updatedAt: brand.updatedAt,
        }))

        return NextResponse.json({
            success: true,
            data,
            total: data.length,
        })
    } catch (error) {
        console.error('GET /api/master/car-brand error:', error)
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถดึงข้อมูลได้' },
            { status: 500 }
        )
    }
}

// POST - สร้างยี่ห้อรถใหม่
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = carBrandSchema.parse(body)

        // Check duplicate nameEnglish with Raw Query
        const duplicates: any[] = await prisma.$queryRaw`
            SELECT id FROM "car_brands" 
            WHERE "nameEnglish" = ${validatedData.nameEnglish} 
            LIMIT 1
        `

        if (duplicates.length > 0) {
            return NextResponse.json(
                { success: false, error: 'ยี่ห้อนี้มีอยู่แล้ว' },
                { status: 400 }
            )
        }

        // Generate code
        const lastBrand = await prisma.carBrand.findFirst({
            orderBy: { code: 'desc' }
        })

        let nextId = 1
        if (lastBrand && lastBrand.code) {
            const match = lastBrand.code.match(/BR(\d+)/)
            if (match) {
                nextId = parseInt(match[1]) + 1
            }
        }
        const code = `BR${String(nextId).padStart(3, '0')}`
        const carBrandId = require('crypto').randomUUID() // Create UUID manually

        // Create car brand with Raw Query
        await prisma.$executeRaw`
            INSERT INTO "car_brands" (
                id, code, "nameThai", "nameEnglish", name, description, "logoUrl", "isActive", "createdAt", "updatedAt"
            ) VALUES (
                ${carBrandId},
                ${code},
                ${validatedData.nameThai},
                ${validatedData.nameEnglish},
                ${validatedData.nameEnglish},
                ${validatedData.description || null},
                ${validatedData.logoUrl || null},
                ${validatedData.isActive ?? true},
                NOW(),
                NOW()
            )
        `

        // Fetch created data
        const createdRows = await prisma.$queryRaw`
            SELECT * FROM "car_brands" WHERE id = ${carBrandId}
        `
        const carBrand = (createdRows as any[])[0]

        return NextResponse.json({
            success: true,
            data: carBrand,
            message: 'เพิ่มยี่ห้อรถเรียบร้อยแล้ว'
        }, { status: 201 })


    } catch (error) {
        console.error('POST /api/master/car-brand error:', error)

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
