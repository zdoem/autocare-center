import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { carSchema } from '@/lib/validations/car'

/**
 * GET /api/master/car/[id]
 * Get car details with full relations and statistics
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const car = await prisma.car.findUnique({
            where: { id },
            include: {
                customer: {
                    select: {
                        id: true,
                        code: true,
                        fullName: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        email: true,
                        lineId: true,
                        address: true,
                        taxId: true,
                        createdAt: true,
                        customerType: {
                            select: {
                                name: true,
                                code: true,
                                discount: true
                            }
                        }
                    }
                },
                carBrand: {
                    select: {
                        id: true,
                        code: true,
                        nameEnglish: true,
                        nameThai: true,
                        logoUrl: true
                    }
                },
                carModel: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        fuelType: true,
                        vehicleType: true,
                        yearStart: true,
                        yearEnd: true
                    }
                },
                images: {
                    select: {
                        id: true,
                        imageUrl: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'asc' }
                },
                serviceJobs: {
                    select: {
                        id: true,
                        jobNo: true,
                        jobDate: true,
                        status: true,
                        priority: true,
                        description: true,
                        mileage: true,
                        totalCost: true,
                        grandTotal: true,
                        isPaid: true,
                        technician: {
                            select: {
                                name: true,
                                code: true
                            }
                        }
                    },
                    orderBy: { jobDate: 'desc' },
                    take: 50 // Last 50 service jobs
                }
            }
        })

        if (!car) {
            return NextResponse.json(
                { error: 'Car not found' },
                { status: 404 }
            )
        }

        // Calculate statistics safely
        const serviceJobsList = car.serviceJobs || []
        const stats = {
            totalVisits: serviceJobsList.length,
            totalSpent: serviceJobsList.reduce((sum, job) => sum + Number(job.grandTotal || 0), 0),
            lastServiceDate: serviceJobsList[0]?.jobDate || null,
            customerSince: car.customer?.createdAt || null,
            unpaidJobs: serviceJobsList.filter(job => !job.isPaid).length,
            inProgressJobs: serviceJobsList.filter(job =>
                ['PENDING', 'IN_PROGRESS', 'WAITING_PARTS'].includes(job.status)
            ).length
        }

        // Calculate maintenance schedule (simplified)
        const maintenanceSchedule = calculateMaintenanceSchedule(car.mileage || 0, serviceJobsList)

        return NextResponse.json({
            ...car,
            serviceJobs: serviceJobsList.map(job => ({
                ...job,
                totalAmount: Number(job.grandTotal || 0)
            })),
            stats,
            maintenanceSchedule
        })

    } catch (error) {
        console.error('Error fetching car:', error)
        return NextResponse.json(
            { error: 'Failed to fetch car details' },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/master/car/[id]
 * Update car details
 * Only ADMIN/MANAGER can update
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        // Validate request body
        const validationResult = carSchema.safeParse(body)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: (validationResult.error as any).errors },
                { status: 400 }
            )
        }

        const data = validationResult.data

        // Check if car exists
        const existing = await prisma.car.findUnique({
            where: { id }
        })

        if (!existing) {
            return NextResponse.json(
                { error: 'Car not found' },
                { status: 404 }
            )
        }

        // Check if license plate is being changed and already exists
        if (data.licensePlate !== existing.licensePlate) {
            const duplicate = await prisma.car.findUnique({
                where: { licensePlate: data.licensePlate }
            })

            if (duplicate) {
                return NextResponse.json(
                    { error: 'ทะเบียนรถนี้มีในระบบแล้ว' },
                    { status: 409 }
                )
            }
        }

        // Update car
        const car = await prisma.car.update({
            where: { id },
            data: {
                licensePlate: data.licensePlate,
                province: data.province,
                carBrandId: data.carBrandId,
                carModelId: data.carModelId,
                customerId: data.customerId,
                year: data.year,
                color: data.color,
                mileage: data.mileage,
                vin: data.vin,
                engineNo: data.engineNo,
                isActive: data.isActive,
            },
            include: {
                customer: {
                    select: {
                        fullName: true,
                        phone: true
                    }
                },
                carBrand: {
                    select: {
                        nameEnglish: true,
                        nameThai: true
                    }
                },
                carModel: {
                    select: {
                        name: true,
                        fuelType: true
                    }
                }
            }
        })

        return NextResponse.json(car)

    } catch (error) {
        console.error('Error updating car:', error)
        return NextResponse.json(
            { error: 'Failed to update car' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/master/car/[id]
 * Delete car (soft delete by setting isActive = false)
 * Only ADMIN can delete
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Check if car exists
        const existing = await prisma.car.findUnique({
            where: { id },
            include: {
                serviceJobs: {
                    select: { id: true }
                }
            }
        })

        if (!existing) {
            return NextResponse.json(
                { error: 'Car not found' },
                { status: 404 }
            )
        }

        // Check if car has service jobs
        if (existing.serviceJobs.length > 0) {
            return NextResponse.json(
                { error: 'ไม่สามารถลบรถที่มีประวัติการซ่อมได้ (ใช้ปิดการใช้งานแทน)' },
                { status: 400 }
            )
        }

        // Hard delete if no service jobs
        await prisma.car.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Car deleted successfully' })

    } catch (error) {
        console.error('Error deleting car:', error)
        return NextResponse.json(
            { error: 'Failed to delete car' },
            { status: 500 }
        )
    }
}

/**
 * Helper function to calculate maintenance schedule
 * Based on mileage and service history
 */
function calculateMaintenanceSchedule(currentMileage: number, serviceJobs: any[]) {
    // Find last oil change
    const lastOilChange = serviceJobs.find(job =>
        job.description?.toLowerCase().includes('น้ำมัน') ||
        job.description?.toLowerCase().includes('oil')
    )

    const mileageSinceOilChange = lastOilChange
        ? currentMileage - (lastOilChange.mileage || 0)
        : currentMileage

    // Standard intervals (can be customized)
    const oilChangeInterval = 10000 // km
    const inspectionInterval = 20000 // km

    return {
        oilChange: {
            lastMileage: lastOilChange?.mileage || 0,
            lastDate: lastOilChange?.jobDate || null,
            nextMileage: (lastOilChange?.mileage || 0) + oilChangeInterval,
            remainingKm: oilChangeInterval - mileageSinceOilChange,
            isOverdue: mileageSinceOilChange >= oilChangeInterval
        },
        inspection: {
            lastMileage: currentMileage,
            nextMileage: Math.ceil(currentMileage / inspectionInterval) * inspectionInterval,
            remainingKm: (Math.ceil(currentMileage / inspectionInterval) * inspectionInterval) - currentMileage,
            isOverdue: false
        }
    }
}
