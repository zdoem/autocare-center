import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateCode } from '@/lib/utils/codeGenerator'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status')
        const vendorId = searchParams.get('vendorId')

        const where: any = {}
        if (status) where.status = status
        if (vendorId) where.vendorId = vendorId

        const purchases = await prisma.purchase.findMany({
            where,
            include: {
                vendor: true,
                items: {
                    include: {
                        spare: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Serialize Decimals for JSON
        const serialized = purchases.map(p => ({
            ...p,
            totalAmount: Number(p.totalAmount),
            vatAmount: Number(p.vatAmount),
            grandTotal: Number(p.grandTotal),
            items: p.items.map(item => ({
                ...item,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                total: Number(item.total)
            }))
        }))

        return NextResponse.json({ success: true, data: serialized })
    } catch (error: any) {
        console.error('Error fetching purchases:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch purchases', details: error.message },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { vendorId, items, status, notes, vatRate = 7 } = body

        if (!vendorId || !items || !items.length) {
            return NextResponse.json({ success: false, error: 'Missing vendor or items' }, { status: 400 })
        }

        // Generate PO number (e.g., PO-240101-001)
        const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '') // YYMMDD
        const latestPo = await prisma.purchase.findFirst({
            where: { purchaseNo: { startsWith: `PO-${dateStr}` } },
            orderBy: { purchaseNo: 'desc' }
        })
        let sequence = 1
        if (latestPo) {
            const lastSeq = parseInt(latestPo.purchaseNo.split('-')[2], 10)
            if (!isNaN(lastSeq)) sequence = lastSeq + 1
        }
        const purchaseNo = `PO-${dateStr}-${sequence.toString().padStart(3, '0')}`

        // Calculate totals
        let totalAmount = 0
        const purchaseItems = items.map((item: any) => {
            const qty = Number(item.quantity)
            const price = Number(item.unitPrice)
            const total = qty * price
            totalAmount += total
            return {
                spareId: item.spareId,
                quantity: qty,
                unitPrice: price,
                total: total
            }
        })

        const vatAmount = totalAmount * (Number(vatRate) / 100)
        const grandTotal = totalAmount + vatAmount

        // Transaction to save PO, update stock, and create movement if received
        const isReceived = status === 'RECEIVED'
        
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Purchase
            const purchase = await tx.purchase.create({
                data: {
                    purchaseNo,
                    vendorId,
                    totalAmount,
                    vat: Number(vatRate),
                    vatAmount,
                    grandTotal,
                    status: isReceived ? 'RECEIVED' : 'PENDING',
                    receivedDate: isReceived ? new Date() : null,
                    notes,
                    items: {
                        create: purchaseItems
                    }
                },
                include: {
                    items: true
                }
            })

            // 2. If Received, update stock and log movements
            if (isReceived) {
                for (const item of purchaseItems) {
                    // Get current spare
                    const spare = await tx.spare.findUnique({ where: { id: item.spareId } })
                    if (!spare) continue

                    const beforeQty = spare.currentStock
                    const afterQty = beforeQty + item.quantity

                    // Update Spare Stock and Cost Price
                    await tx.spare.update({
                        where: { id: item.spareId },
                        data: {
                            currentStock: afterQty,
                            costPrice: item.unitPrice // Update to latest cost price (or could be moving average)
                        }
                    })

                    // Create Stock Movement
                    await tx.stockMovement.create({
                        data: {
                            movementNo: `IN-${purchaseNo}-${item.spareId.slice(-4)}`,
                            movementType: 'IN',
                            spareId: item.spareId,
                            quantity: item.quantity,
                            beforeQty,
                            afterQty,
                            reference: purchaseNo,
                            notes: 'รับสินค้าเข้าจากการสั่งซื้อ'
                        }
                    })
                }
            }

            return purchase
        })

        return NextResponse.json({ success: true, data: result }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating purchase:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create purchase', details: error.message },
            { status: 500 }
        )
    }
}
