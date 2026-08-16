import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '25')
        const action = searchParams.get('action') || ''
        const entity = searchParams.get('entity') || ''
        const status = searchParams.get('status') || ''
        const search = searchParams.get('search') || ''
        const startDate = searchParams.get('startDate') || ''
        const endDate = searchParams.get('endDate') || ''

        const where: any = {}

        if (action) {
            where.action = action
        }
        if (entity) {
            where.entity = entity
        }
        if (status) {
            where.status = status
        }
        if (startDate || endDate) {
            where.createdAt = {}
            if (startDate) where.createdAt.gte = new Date(startDate)
            if (endDate) where.createdAt.lte = new Date(endDate)
        }
        if (search) {
            where.OR = [
                { entityCode: { contains: search } },
                { userName: { contains: search } },
                { userEmail: { contains: search } },
                { ipAddress: { contains: search } },
            ]
        }

        const skip = (page - 1) * limit

        const [total, logs] = await Promise.all([
            (prisma as any).auditLog.count({ where }),
            (prisma as any).auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            })
        ])

        // Summary counts
        const [totalCreates, totalUpdates, totalDeletes] = await Promise.all([
            (prisma as any).auditLog.count({ where: { action: 'CREATE' } }),
            (prisma as any).auditLog.count({ where: { action: { in: ['UPDATE', 'STATUS_CHANGE', 'CANCEL_ITEM'] } } }),
            (prisma as any).auditLog.count({ where: { action: 'DELETE' } }),
        ])

        return NextResponse.json({
            success: true,
            data: logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
            summary: {
                total,
                totalCreates,
                totalUpdates,
                totalDeletes,
            }
        })
    } catch (error: any) {
        console.error('Error fetching audit logs:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch audit logs', details: error.message },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const log = await (prisma as any).auditLog.create({
            data: {
                action: body.action || 'CUSTOM',
                entity: body.entity || 'System',
                entityId: body.entityId || null,
                entityCode: body.entityCode || null,
                details: body.details || null,
                ipAddress: body.ipAddress || request.headers.get('x-forwarded-for') || null,
                userAgent: body.userAgent || request.headers.get('user-agent') || null,
                userId: body.userId || null,
                userName: body.userName || 'System User',
                userEmail: body.userEmail || null,
                userRole: body.userRole || null,
                status: body.status || 'SUCCESS',
            }
        })
        return NextResponse.json({ success: true, data: log })
    } catch (error: any) {
        console.error('Error creating audit log:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create audit log', details: error.message },
            { status: 500 }
        )
    }
}
