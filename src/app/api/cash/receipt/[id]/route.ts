import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        
        const receipt = await prisma.cashReceipt.findUnique({
            where: { id },
            include: {
                serviceJob: {
                    include: {
                        customer: true,
                        car: {
                            include: {
                                carBrand: true,
                                carModel: true,
                            }
                        },
                        items: {
                            include: {
                                service: true,
                                spare: true,
                            }
                        }
                    }
                },
                user: true,
            }
        })

        if (!receipt) {
            return NextResponse.json({ success: false, error: 'ไม่พบข้อมูลใบเสร็จ' }, { status: 404 })
        }

        return NextResponse.json({ success: true, data: receipt })
    } catch (error: any) {
        console.error('Error fetching receipt:', error)
        return NextResponse.json(
            { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล', details: error.message },
            { status: 500 }
        )
    }
}
