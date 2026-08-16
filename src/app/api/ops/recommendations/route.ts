import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const carId = searchParams.get('carId')
        const mileage = parseInt(searchParams.get('mileage') || '0')

        if (!carId) {
            return NextResponse.json({ error: 'carId is required' }, { status: 400 })
        }

        // Get car details
        const car = await prisma.car.findUnique({
            where: { id: carId },
            include: {
                carBrand: true,
                carModel: true,
            },
        })

        if (!car) {
            return NextResponse.json({ error: 'Car not found' }, { status: 404 })
        }

        // Get active maintenance templates
        const templates = await prisma.maintenanceTemplate.findMany({
            where: {
                isActive: true,
            },
            include: {
                items: {
                    include: {
                        service: true
                    }
                }
            },
            orderBy: {
                mileageInterval: 'asc',
            },
        })

        // Map recommendations based on mileageInterval
        const recommendations: any[] = []

        for (const template of templates) {
            const targetMileage = template.mileageInterval || 0
            if (targetMileage <= 0) continue

            const mileageDiff = mileage - targetMileage
            // Filter: recommend if within range (-5000 to +10000 km)
            if (mileageDiff >= -5000 && mileageDiff <= 10000) {
                let priority: 'URGENT' | 'RECOMMENDED' | 'OPTIONAL' = 'OPTIONAL'
                let reason = ''

                if (mileageDiff > 0) {
                    priority = mileageDiff > 5000 ? 'URGENT' : 'RECOMMENDED'
                    reason = `เกินกำหนดแล้ว ${mileageDiff.toLocaleString()} กม.`
                } else if (mileageDiff > -2000) {
                    priority = 'RECOMMENDED'
                    reason = `ใกล้ถึงกำหนดแล้ว (อีก ${Math.abs(mileageDiff).toLocaleString()} กม.)`
                } else {
                    reason = `อีก ${Math.abs(mileageDiff).toLocaleString()} กม.`
                }

                for (const item of template.items) {
                    recommendations.push({
                        id: `${template.id}-${item.id}`,
                        title: `${template.name}: ${item.description}`,
                        description: template.description || item.description,
                        priority,
                        reason,
                        estimatedCost: item.estimatedCost ? Number(item.estimatedCost) : 0,
                        serviceId: item.serviceId,
                        service: item.service,
                    })
                }
            }
        }

        // Sort by priority: URGENT > RECOMMENDED > OPTIONAL
        const priorityOrder = { URGENT: 0, RECOMMENDED: 1, OPTIONAL: 2 }
        recommendations.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder])

        return NextResponse.json(recommendations)
    } catch (error) {
        console.error('Error fetching recommendations:', error)
        return NextResponse.json(
            { error: 'Failed to fetch recommendations' },
            { status: 500 }
        )
    }
}
