import { prisma } from './prisma'

export interface TrackApiParams {
    endpoint: string
    method: string
    statusCode: number
    responseTime: number // in ms
    ipAddress?: string | null
    userAgent?: string | null
    userId?: string | null
    errorMessage?: string | null
}

/**
 * Log API usage telemetry asynchronously (fire-and-forget)
 */
export async function trackApiUsage(params: TrackApiParams) {
    try {
        await (prisma as any).apiUsageLog.create({
            data: {
                endpoint: params.endpoint,
                method: params.method,
                statusCode: params.statusCode,
                responseTime: params.responseTime,
                ipAddress: params.ipAddress || null,
                userAgent: params.userAgent || null,
                userId: params.userId || null,
                errorMessage: params.errorMessage || null,
            }
        })
    } catch (err) {
        // Non-blocking telemetry failure
        console.error('Failed to write API usage log:', err)
    }
}
