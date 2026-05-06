import { z } from 'zod'

export const paymentTypeSchema = z.object({
    name: z.string().min(1, 'กรุณาระบุชื่อประเภทการชำระเงิน'),
    description: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
})

export type PaymentTypeFormData = z.infer<typeof paymentTypeSchema>

export const paymentTypeUpdateSchema = paymentTypeSchema

export type PaymentTypeUpdateData = z.infer<typeof paymentTypeUpdateSchema>
