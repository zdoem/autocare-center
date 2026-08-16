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
                { nameThai: { contains: search } },
                { nameEnglish: { contains: search } },
                { name: { contains: search } },
            ]
        }

        if (isActive !== null && isActive !== '') {
            where.isActive = isActive === 'true'
        }

        // Determine orderBy
        const validSortFields = ['code', 'nameThai', 'nameEnglish', 'name', 'isActive', 'createdAt', 'updatedAt']
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'updatedAt'
        const orderBy = { [sortField]: sortOrder }

        const carBrands = await prisma.carBrand.findMany({
            where,
            orderBy,
            include: {
                _count: {
                    select: { models: true }
                }
            }
        })

        const data = carBrands.map(brand => ({
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
            modelCount: brand._count?.models || 0,
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

        // Check duplicate nameEnglish
        const existing = await prisma.carBrand.findFirst({
            where: {
                OR: [
                    { nameEnglish: validatedData.nameEnglish },
                    { name: validatedData.nameEnglish }
                ]
            }
        })

        if (existing) {
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

        // Create car brand with Prisma
        const carBrand = await prisma.carBrand.create({
            data: {
                code,
                nameThai: validatedData.nameThai,
                nameEnglish: validatedData.nameEnglish,
                name: validatedData.nameEnglish,
                description: validatedData.description || null,
                logoUrl: validatedData.logoUrl || null,
                isActive: validatedData.isActive ?? true,
            }
        })

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
