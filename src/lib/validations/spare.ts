import { z } from 'zod'

// ============================================
// SPARES CATEGORY SCHEMAS
// ============================================

export const sparesCategorySchema = z.object({
    name: z.string().min(1, 'กรุณาระบุชื่อหมวดหมู่'),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
})

export type SparesCategoryFormData = z.infer<typeof sparesCategorySchema>

export const sparesCategoryUpdateSchema = sparesCategorySchema

export type SparesCategoryUpdateData = z.infer<typeof sparesCategoryUpdateSchema>

// ============================================
// SPARE SCHEMAS
// ============================================

export const spareSchema = z.object({
    name: z.string().min(1, 'กรุณาระบุชื่ออะไหล่'),
    description: z.string().optional(),
    sparesCategoryId: z.string().optional().nullable(),
    vendorId: z.string().optional().nullable(),
    unit: z.string().default('ชิ้น'),
    sellingPrice: z
        .number({ invalid_type_error: 'กรุณาระบุราคาขายเป็นตัวเลข' })
        .min(0, 'ราคาขายต้องไม่ต่ำกว่า 0'),
    costPrice: z
        .number({ invalid_type_error: 'กรุณาระบุต้นทุนเป็นตัวเลข' })
        .min(0, 'ต้นทุนต้องไม่ต่ำกว่า 0')
        .optional()
        .nullable(),
    minStock: z
        .number({ invalid_type_error: 'กรุณาระบุจำนวน Min เป็นตัวเลข' })
        .int('จำนวน Min ต้องเป็นจำนวนเต็ม')
        .min(0, 'จำนวน Min ต้องไม่ต่ำกว่า 0')
        .default(10),
    maxStock: z
        .number({ invalid_type_error: 'กรุณาระบุจำนวน Max เป็นตัวเลข' })
        .int('จำนวน Max ต้องเป็นจำนวนเต็ม')
        .min(0, 'จำนวน Max ต้องไม่ต่ำกว่า 0')
        .optional()
        .nullable(),
    currentStock: z
        .number({ invalid_type_error: 'กรุณาระบุจำนวนคงเหลือเป็นตัวเลข' })
        .int('จำนวนคงเหลือต้องเป็นจำนวนเต็ม')
        .min(0, 'จำนวนคงเหลือต้องไม่ต่ำกว่า 0')
        .default(0)
        .optional(),
    reorderPoint: z
        .number()
        .int()
        .min(0)
        .default(10)
        .optional(),
    isActive: z.boolean().default(true),
})

export type SpareFormData = z.infer<typeof spareSchema>

export const spareUpdateSchema = spareSchema

export type SpareUpdateData = z.infer<typeof spareUpdateSchema>
