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

        // Get car brand and model
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

        // Get maintenance templates for this brand/model
        const templates = await prisma.maintenanceTemplate.findMany({
            where: {
                OR: [
                    { carBrandId: car.carBrandId, carModelId: car.carModelId },
                    { carBrandId: car.carBrandId, carModelId: null },
                    { carBrandId: null, carModelId: null }, // Universal templates
                ],
                isActive: true,
            },
            include: {
                service: true,
            },
            orderBy: {
                recommendedMileage: 'asc',
            },
        })

        // Filter templates based on mileage and convert to recommendations
        const recommendations = templates
            .filter(template => {
                // Check if mileage is within range
                if (template.recommendedMileage) {
                    const diff = mileage - template.recommendedMileage
                    // Recommend if within ±5000 km or overdue
                    return diff >= -5000 && diff <= 10000
                }
                return true
            })
            .map(template => {
                const mileageDiff = template.recommendedMileage ? mileage - template.recommendedMileage : 0
                let priority: 'URGENT' | 'RECOMMENDED' | 'OPTIONAL' = 'OPTIONAL'
                let reason = ''

                if (template.recommendedMileage) {
                    if (mileageDiff > 0) {
                        priority = mileageDiff > 5000 ? 'URGENT' : 'RECOMMENDED'
                        reason = `เกินกำหนดแล้ว ${mileageDiff.toLocaleString()} กม.`
                    } else if (mileageDiff > -2000) {
                        priority = 'RECOMMENDED'
                        reason = `ใกล้ถึงกำหนดแล้ว (อีก ${Math.abs(mileageDiff).toLocaleString()} กม.)`
                    } else {
                        reason = `อีก ${Math.abs(mileageDiff).toLocaleString()} กม.`
                    }
                }

                return {
                    id: template.id,
                    title: template.title,
                    description: template.description || '',
                    priority,
                    reason,
                    estimatedCost: template.estimatedCost || 0,
                    serviceId: template.serviceId,
                    service: template.service,
                }
            })
            .sort((a, b) => {
                // Sort by priority: URGENT > RECOMMENDED > OPTIONAL
                const priorityOrder = { URGENT: 0, RECOMMENDED: 1, OPTIONAL: 2 }
                return priorityOrder[a.priority] - priorityOrder[b.priority]
            })

        return NextResponse.json(recommendations)
    } catch (error) {
        console.error('Error fetching recommendations:', error)
        return NextResponse.json(
            { error: 'Failed to fetch recommendations' },
            { status: 500 }
        )
    }
}
