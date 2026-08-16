import { z } from 'zod'

// Vendor validation schema
export const vendorSchema = z.object({
    name: z.string().min(1, 'กรุณาระบุชื่อ Vendor'),
    contactName: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z
        .string()
        .email('รูปแบบ email ไม่ถูกต้อง')
        .optional()
        .nullable()
        .or(z.literal('')),
    address: z.string().optional().nullable(),
    taxId: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
})

export type VendorFormData = z.infer<typeof vendorSchema>

export const vendorUpdateSchema = vendorSchema

export type VendorUpdateData = z.infer<typeof vendorUpdateSchema>
