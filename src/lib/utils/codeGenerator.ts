import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Generate unique code with prefix and auto-increment number
 * @param prefix - Code prefix (e.g., 'SV', 'SC', 'SP', 'V')
 * @param modelName - Prisma model name (e.g., 'service', 'sparesCategory', 'spare', 'vendor')
 * @param length - Total length of numeric part (default: 3)
 * @returns Generated unique code (e.g., 'SV001', 'SC01', 'SP001', 'V001')
 */
export async function generateCode(
    prefix: string,
    modelName: string,
    length: number = 3
): Promise<string> {
    try {
        // Get the latest code from database
        const result = await (prisma as any)[modelName].findFirst({
            where: {
                code: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                code: 'desc',
            },
            select: {
                code: true,
            },
        })

        if (!result) {
            // No existing code, start from 1
            return `${prefix}${String(1).padStart(length, '0')}`
        }

        // Extract number from existing code
        const numericPart = result.code.substring(prefix.length)
        const nextNumber = parseInt(numericPart, 10) + 1

        // Return new code with padding
        return `${prefix}${String(nextNumber).padStart(length, '0')}`
    } catch (error) {
        console.error('Error generating code:', error)
        // Fallback: return prefix + random number
        const randomNum = Math.floor(Math.random() * 1000)
        return `${prefix}${String(randomNum).padStart(length, '0')}`
    }
}

/**
 * Generate unique car code with date-based format: YYYYMMDD-XXX
 * @returns Generated unique car code (e.g., '20260208-001')
 */
export async function generateCarCode(): Promise<string> {
    try {
        // Get today's date in YYYYMMDD format (convert to CE year)
        const today = new Date()
        const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '') // "20260208"

        // Find last car code for today
        const lastCar = await prisma.car.findFirst({
            where: {
                code: {
                    startsWith: datePrefix
                }
            },
            orderBy: {
                code: 'desc'
            },
            select: {
                code: true
            }
        })

        // Generate running number
        const runningNumber = lastCar
            ? parseInt(lastCar.code.split('-')[1]) + 1
            : 1

        // Return new code with 3-digit padding
        return `${datePrefix}-${String(runningNumber).padStart(3, '0')}`
    } catch (error) {
        console.error('Error generating car code:', error)
        // Fallback: use date + random 3-digit number
        const today = new Date()
        const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '')
        const randomNum = Math.floor(Math.random() * 1000)
        return `${datePrefix}-${String(randomNum).padStart(3, '0')}`
    }
}

/**
 * Check if code already exists
 */
export async function codeExists(
    modelName: string,
    code: string,
    excludeId?: string
): Promise<boolean> {
    const where: any = { code }

    if (excludeId) {
        where.id = { not: excludeId }
    }

    const count = await (prisma as any)[modelName].count({ where })
    return count > 0
}
