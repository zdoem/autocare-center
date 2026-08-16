import { z } from 'zod'

// Service validation schema
export const serviceSchema = z.object({
    name: z.string().min(1, 'กรุณาระบุชื่อบริการ'),
    description: z.string().optional().nullable(),
    serviceCategoryId: z.string().optional().nullable(),
    price: z
        .number()
        .min(0, 'ราคาต้องไม่ต่ำกว่า 0')
        .default(0),
    laborCost: z
        .number()
        .min(0, 'ค่าแรงต้องไม่ต่ำกว่า 0')
        .optional()
        .nullable(),
    laborHours: z
        .number()
        .min(0, 'เวลาซ่อมต้องไม่ต่ำกว่า 0')
        .optional()
        .nullable(),
    isActive: z.boolean().default(true),
})

export type ServiceFormData = z.infer<typeof serviceSchema>

// Service update schema (same as create for now)
export const serviceUpdateSchema = serviceSchema

export type ServiceUpdateData = z.infer<typeof serviceUpdateSchema>

export const serviceCategorySchema = z.object({
    name: z.string().min(1, 'กรุณาระบุชื่อหมวดหมู่'),
    description: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
})
