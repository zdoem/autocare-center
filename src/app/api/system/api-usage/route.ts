import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '30')
        const method = searchParams.get('method') || ''
        const statusCode = searchParams.get('statusCode') ? parseInt(searchParams.get('statusCode')!) : undefined
        const search = searchParams.get('search') || ''

        const where: any = {}
        if (method) where.method = method
        if (statusCode) where.statusCode = statusCode
        if (search) {
            where.OR = [
                { endpoint: { contains: search } },
                { ipAddress: { contains: search } },
                { errorMessage: { contains: search } },
            ]
        }

        const skip = (page - 1) * limit

        // Fetch logs
        const [total, logs] = await Promise.all([
            (prisma as any).apiUsageLog.count({ where }),
            (prisma as any).apiUsageLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            })
        ])

        // Aggregations
        const allLogs = await (prisma as any).apiUsageLog.findMany({
            select: {
                endpoint: true,
                method: true,
                statusCode: true,
                responseTime: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1000,
        })

        const totalAll = allLogs.length
        const totalLatency = allLogs.reduce((acc: number, l: any) => acc + l.responseTime, 0)
        const avgLatency = totalAll > 0 ? Math.round(totalLatency / totalAll) : 0

        const status2xx = allLogs.filter((l: any) => l.statusCode >= 200 && l.statusCode < 300).length
        const status4xx = allLogs.filter((l: any) => l.statusCode >= 400 && l.statusCode < 500).length
        const status5xx = allLogs.filter((l: any) => l.statusCode >= 500).length
        const successRate = totalAll > 0 ? Number(((status2xx / totalAll) * 100).toFixed(1)) : 100

        // Group by endpoint for top usage ranking
        const endpointMap: Record<string, { endpoint: string; method: string; count: number; totalTime: number; errors: number }> = {}
        allLogs.forEach((l: any) => {
            const key = `${l.method} ${l.endpoint}`
            if (!endpointMap[key]) {
                endpointMap[key] = { endpoint: l.endpoint, method: l.method, count: 0, totalTime: 0, errors: 0 }
            }
            endpointMap[key].count++
            endpointMap[key].totalTime += l.responseTime
            if (l.statusCode >= 400) endpointMap[key].errors++
        })

        const topEndpoints = Object.values(endpointMap)
            .map(item => ({
                endpoint: item.endpoint,
                method: item.method,
                count: item.count,
                avgLatency: Math.round(item.totalTime / item.count),
                errorRate: Number(((item.errors / item.count) * 100).toFixed(1)),
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)

        const slowestEndpoints = [...topEndpoints].sort((a, b) => b.avgLatency - a.avgLatency).slice(0, 5)

        return NextResponse.json({
            success: true,
            data: logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
            metrics: {
                totalRequests: totalAll,
                avgLatency,
                successRate,
                status2xx,
                status4xx,
                status5xx,
                topEndpoints,
                slowestEndpoints,
            }
        })
    } catch (error: any) {
        console.error('Error fetching API usage telemetry:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch API usage telemetry', details: error.message },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const log = await (prisma as any).apiUsageLog.create({
            data: {
                endpoint: body.endpoint || '/api/unknown',
                method: body.method || 'GET',
                statusCode: body.statusCode || 200,
                responseTime: body.responseTime || 50,
                ipAddress: body.ipAddress || request.headers.get('x-forwarded-for') || null,
                userAgent: body.userAgent || request.headers.get('user-agent') || null,
                userId: body.userId || null,
                errorMessage: body.errorMessage || null,
            }
        })
        return NextResponse.json({ success: true, data: log })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'Failed to record API usage', details: error.message },
            { status: 500 }
        )
    }
}
