import { prisma } from './prisma'

export interface LogAuditParams {
    action: string // 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'CANCEL_ITEM' | 'STATUS_CHANGE' | 'PAYMENT' | 'BACKUP' | 'EXPORT'
    entity: string // 'ServiceJob' | 'ServiceJobItem' | 'Spare' | 'Payment' | 'Customer' | 'Car' | 'Employee' | 'Settings' | 'Auth'
    entityId?: string | null
    entityCode?: string | null
    details?: any
    ipAddress?: string | null
    userAgent?: string | null
    userId?: string | null
    userName?: string | null
    userEmail?: string | null
    userRole?: string | null
    status?: 'SUCCESS' | 'FAILED' | 'WARNING'
}

/**
 * Log an enterprise audit trail record asynchronously
 */
export async function logAudit(params: LogAuditParams) {
    try {
        await (prisma as any).auditLog.create({
            data: {
                action: params.action,
                entity: params.entity,
                entityId: params.entityId || null,
                entityCode: params.entityCode || null,
                details: params.details !== undefined ? params.details : null,
                ipAddress: params.ipAddress || null,
                userAgent: params.userAgent || null,
                userId: params.userId || null,
                userName: params.userName || null,
                userEmail: params.userEmail || null,
                userRole: params.userRole || null,
                status: params.status || 'SUCCESS',
            }
        })
    } catch (err) {
        console.error('Failed to write audit log:', err)
    }
}
