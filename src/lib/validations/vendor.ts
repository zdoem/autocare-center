import { z } from 'zod'

// Vendor validation schema
export const vendorSchema = z.object({
    name: z.string().min(1, 'กรุณาระบุชื่อ Vendor'),
    contactName: z.string().optional(),
    phone: z.string().optional(),
    email: z
        .string()
        .email('รูปแบบ email ไม่ถูกต้อง')
        .optional()
        .or(z.literal('')),
    address: z.string().optional(),
    taxId: z.string().optional(),
    isActive: z.boolean().default(true),
})

export type VendorFormData = z.infer<typeof vendorSchema>

export const vendorUpdateSchema = vendorSchema

export type VendorUpdateData = z.infer<typeof vendorUpdateSchema>
