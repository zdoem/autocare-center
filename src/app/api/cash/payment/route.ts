import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST: Process Payment for a Service Job
 * - Creates a Payment record
 * - Creates a CashReceipt  
 * - Updates the ServiceJob isPaid = true, status = COMPLETED
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { serviceJobId, paymentTypeId, amount, reference, bankName, accountNo, notes } = body

        if (!serviceJobId) {
            return NextResponse.json({ error: 'กรุณาระบุงานซ่อม' }, { status: 400 })
        }
        if (!paymentTypeId) {
            return NextResponse.json({ error: 'กรุณาเลือกประเภทการชำระ' }, { status: 400 })
        }
        if (!amount || Number(amount) <= 0) {
            return NextResponse.json({ error: 'กรุณาระบุจำนวนเงิน' }, { status: 400 })
        }

        // Verify the service job is in a payable state
        const serviceJob = await prisma.serviceJob.findUnique({
            where: { id: serviceJobId },
            select: { id: true, status: true, isPaid: true, grandTotal: true, jobNo: true },
        })

        if (!serviceJob) {
            return NextResponse.json({ error: 'ไม่พบงานซ่อม' }, { status: 404 })
        }

        if (serviceJob.isPaid) {
            return NextResponse.json({ error: 'งานนี้ชำระเงินแล้ว' }, { status: 400 })
        }

        // Generate Payment No: PAY-YYYYMM-XXXX
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const paymentPrefix = `PAY-${year}${month}-`

        const lastPayment = await prisma.payment.findFirst({
            where: { paymentNo: { startsWith: paymentPrefix } },
            orderBy: { paymentNo: 'desc' },
        })

        const payRunningNo = lastPayment
            ? parseInt(lastPayment.paymentNo.split('-')[2]) + 1
            : 1
        const paymentNo = `${paymentPrefix}${String(payRunningNo).padStart(4, '0')}`

        // Generate Receipt No: RCT-YYYYMM-XXXX
        const receiptPrefix = `RCT-${year}${month}-`
        const lastReceipt = await prisma.cashReceipt.findFirst({
            where: { receiptNo: { startsWith: receiptPrefix } },
            orderBy: { receiptNo: 'desc' },
        })

        const rctRunningNo = lastReceipt
            ? parseInt(lastReceipt.receiptNo.split('-')[2]) + 1
            : 1
        const receiptNo = `${receiptPrefix}${String(rctRunningNo).padStart(4, '0')}`

        const paymentAmount = Number(amount)
        const vatRate = 7
        const vatAmount = Math.round((paymentAmount * vatRate) / (100 + vatRate) * 100) / 100
        const amountBeforeVat = paymentAmount - vatAmount

        // Transaction: Create Payment + Receipt + Update Job
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Payment
            const payment = await tx.payment.create({
                data: {
                    paymentNo,
                    serviceJobId,
                    paymentTypeId,
                    amount: paymentAmount,
                    reference: reference || null,
                    bankName: bankName || null,
                    accountNo: accountNo || null,
                    notes: notes || null,
                },
            })

            // 2. Create Cash Receipt
            const receipt = await tx.cashReceipt.create({
                data: {
                    receiptNo,
                    serviceJobId,
                    amount: amountBeforeVat,
                    vat: vatAmount,
                    total: paymentAmount,
                    notes: `ชำระจากงาน ${serviceJob.jobNo}`,
                },
            })

            // 3. Update Service Job
            await tx.serviceJob.update({
                where: { id: serviceJobId },
                data: {
                    isPaid: true,
                    status: 'COMPLETED',
                },
            })

            return { payment, receipt }
        })

        return NextResponse.json({
            success: true,
            data: result,
            message: 'บันทึกการชำระเงินเรียบร้อย',
        }, { status: 201 })

    } catch (error: any) {
        console.error('Error processing payment:', error)
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', details: error.message },
            { status: 500 }
        )
    }
}
