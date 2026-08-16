import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { serviceCategorySchema } from '@/lib/validations/service'
import { generateCode } from '@/lib/utils/codeGenerator'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const search = searchParams.get('search')
        const sortBy = searchParams.get('sortBy') || 'updatedAt'
        const sortOrder = searchParams.get('sortOrder') || 'desc'
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        const where: any = {}
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } }
            ]
        }

        const [categories, total] = await Promise.all([
            prisma.serviceCategory.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
                include: {
                    _count: {
                        select: { services: true }
                    }
                }
            }),
            prisma.serviceCategory.count({ where })
        ])

        return NextResponse.json({
            success: true,
            data: categories,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching service categories:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch data' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validation = serviceCategorySchema.safeParse(body)
        
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validation.error.format() },
                { status: 400 }
            )
        }

        // Generate Code: e.g. SC-0001
        // We'll just generate simple id for now or use the standard utility
        const latest = await prisma.serviceCategory.findFirst({
            orderBy: { createdAt: 'desc' }
        })
        let newCode = 'SC-001'
        if (latest && latest.code.startsWith('SC-')) {
            const num = parseInt(latest.code.replace('SC-', ''))
            if (!isNaN(num)) {
                newCode = `SC-${String(num + 1).padStart(3, '0')}`
            }
        }

        const category = await prisma.serviceCategory.create({
            data: {
                code: newCode,
                name: validation.data.name,
                description: validation.data.description,
                isActive: validation.data.isActive
            }
        })

        return NextResponse.json({ success: true, data: category })
    } catch (error) {
        console.error('Error creating service category:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create data' },
            { status: 500 }
        )
    }
}
