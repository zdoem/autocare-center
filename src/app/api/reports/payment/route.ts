import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const date = request.nextUrl.searchParams.get('date') || new Date().toISOString().slice(0, 10)
        const from = new Date(`${date}T00:00:00.000Z`)
        const to = new Date(`${date}T23:59:59.999Z`)

        const payments = await prisma.payment.findMany({
            where: { paymentDate: { gte: from, lte: to } },
            include: {
                paymentType: true,
                serviceJob: {
                    include: { car: { include: { customer: true } }, user: true }
                }
            },
            orderBy: { paymentDate: 'asc' }
        })

        // Group by payment type
        const groups: Record<string, { label: string; amount: number; count: number; color: string }> = {}
        for (const p of payments) {
            const key = p.paymentType.code || p.paymentType.name
            if (!groups[key]) {
                const colorMap: Record<string, string> = { CASH: 'bg-success', TRANSFER: 'bg-primary', PROMPTPAY: 'bg-primary', CREDIT_CARD: 'bg-purple' }
                groups[key] = { label: p.paymentType.name, amount: 0, count: 0, color: colorMap[key] || 'bg-azure' }
            }
            groups[key].amount += Number(p.amount)
            groups[key].count += 1
        }

        const totalAmount = payments.reduce((s, p) => s + Number(p.amount), 0)

        const list = payments.map(p => ({
            paymentNo: p.paymentNo,
            licensePlate: p.serviceJob?.car.licensePlate || '-',
            customerName: p.serviceJob?.car.customer.fullName || '-',
            jobDescription: p.serviceJob?.notes || '-',
            paymentTypeName: p.paymentType.name,
            paymentTypeCode: p.paymentType.code || p.paymentType.name,
            totalAmount: Number(p.serviceJob?.grandTotal || 0),
            vatAmount: Number(p.serviceJob?.vatAmount || 0),
            amount: Number(p.amount),
            paymentTime: p.paymentDate,
            receivedBy: p.serviceJob?.user?.name || '-'
        }))

        return NextResponse.json({
            success: true,
            data: { date, totalAmount, paymentGroups: Object.values(groups), payments: list }
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
