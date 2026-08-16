import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const purchase = await prisma.purchase.findUnique({
            where: { id },
            include: {
                vendor: true,
                items: {
                    include: {
                        spare: true
                    }
                }
            }
        })

        if (!purchase) {
            return NextResponse.json({ success: false, error: 'ไม่พบใบสั่งซื้อ' }, { status: 404 })
        }

        const serialized = {
            ...purchase,
            totalAmount: Number(purchase.totalAmount),
            vatAmount: Number(purchase.vatAmount),
            grandTotal: Number(purchase.grandTotal),
            items: purchase.items.map(item => ({
                ...item,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                total: Number(item.total)
            }))
        }

        return NextResponse.json({ success: true, data: serialized })
    } catch (error: any) {
        console.error('Error fetching purchase:', error)
        return NextResponse.json(
            { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูล', details: error.message },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const body = await request.json()
        const { status } = body

        if (!status) {
            return NextResponse.json({ success: false, error: 'Missing status' }, { status: 400 })
        }

        const purchase = await prisma.purchase.findUnique({
            where: { id },
            include: { items: true }
        })

        if (!purchase) {
            return NextResponse.json({ success: false, error: 'ไม่พบใบสั่งซื้อ' }, { status: 404 })
        }

        if (purchase.status !== 'PENDING' && status === 'RECEIVED') {
            return NextResponse.json({ success: false, error: 'ใบสั่งซื้อนี้รับเข้าแล้ว หรือถูกยกเลิกไปแล้ว' }, { status: 400 })
        }

        if (status === 'RECEIVED') {
            const result = await prisma.$transaction(async (tx) => {
                // Update purchase
                const updatedPurchase = await tx.purchase.update({
                    where: { id },
                    data: {
                        status: 'RECEIVED',
                        receivedDate: new Date()
                    }
                })

                // Update stock & movements
                for (const item of purchase.items) {
                    const spare = await tx.spare.findUnique({ where: { id: item.spareId } })
                    if (!spare) continue

                    const beforeQty = spare.currentStock
                    const quantity = Number(item.quantity)
                    const afterQty = beforeQty + quantity

                    await tx.spare.update({
                        where: { id: item.spareId },
                        data: {
                            currentStock: afterQty,
                            costPrice: item.unitPrice
                        }
                    })

                    await tx.stockMovement.create({
                        data: {
                            movementNo: `IN-${purchase.purchaseNo}-${item.spareId.slice(-4)}`,
                            movementType: 'IN',
                            spareId: item.spareId,
                            quantity: quantity,
                            beforeQty,
                            afterQty,
                            reference: purchase.purchaseNo,
                            notes: 'รับสินค้าเข้าจากการสั่งซื้อ (PO)'
                        }
                    })
                }

                return updatedPurchase
            })

            return NextResponse.json({ success: true, data: result })
        }

        // Handle other status updates
        const result = await prisma.purchase.update({
            where: { id },
            data: { status }
        })

        return NextResponse.json({ success: true, data: result })

    } catch (error: any) {
        console.error('Error updating purchase:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update purchase', details: error.message },
            { status: 500 }
        )
    }
}
