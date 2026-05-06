import { z } from 'zod'

/**
 * Car Validation Schema
 * สำหรับการลงทะเบียนรถและแก้ไขข้อมูลรถ
 */
export const carSchema = z.object({
    licensePlate: z.string()
        .min(4, 'ทะเบียนรถต้องมีอย่างน้อย 4 ตัวอักษร')
        .max(20, 'ทะเบียนรถต้องไม่เกิน 20 ตัวอักษร')
        .regex(/^[ก-ฮะ-์a-zA-Z0-9\s\-]+$/, 'รูปแบบทะเบียนรถไม่ถูกต้อง'),

    province: z.string().optional().nullable(),

    carBrandId: z.string()
        .cuid('รหัสยี่ห้อรถไม่ถูกต้อง'),

    carModelId: z.string()
        .cuid('รหัสรุ่นรถไม่ถูกต้อง'),

    customerId: z.string()
        .cuid('รหัสลูกค้าไม่ถูกต้อง'),

    year: z.number()
        .int('ปีรถต้องเป็นจำนวนเต็ม')
        .min(1900, 'ปีรถต้องไม่น้อยกว่า 1900')
        .max(2100, 'ปีรถต้องไม่เกิน 2100')
        .optional()
        .nullable(),

    color: z.string()
        .max(50, 'สีรถต้องไม่เกิน 50 ตัวอักษร')
        .optional()
        .nullable(),

    mileage: z.number()
        .int('เลขไมล์ต้องเป็นจำนวนเต็ม')
        .min(0, 'เลขไมล์ต้องไม่น้อยกว่า 0')
        .optional()
        .nullable(),

    vin: z.string()
        .max(17, 'เลขตัวถังต้องไม่เกิน 17 ตัวอักษร')
        .regex(/^[A-HJ-NPR-Z0-9]*$/, 'รูปแบบเลขตัวถังไม่ถูกต้อง (ไม่มี I, O, Q)')
        .optional()
        .nullable(),

    engineNo: z.string()
        .max(20, 'เลขเครื่องต้องไม่เกิน 20 ตัวอักษร')
        .optional()
        .nullable(),

    isActive: z.boolean().default(true),
})

/**
 * Car Image Validation Schema
 * สำหรับการอัพโหลดรูปภาพรถ
 */
export const carImageSchema = z.object({
    carId: z.string()
        .cuid('รหัสรถไม่ถูกต้อง'),

    imageUrl: z.string()
        .url('URL รูปภาพไม่ถูกต้อง')
        .or(z.string().startsWith('/images/', 'รูปภาพต้องอยู่ใน /images/ directory')),
})

/**
 * Car Search Query Schema
 * สำหรับการค้นหารถและ filter
 */
export const carSearchSchema = z.object({
    search: z.string().optional(),
    brandId: z.string().cuid().optional(),
    customerId: z.string().cuid().optional(),
    status: z.enum(['in-service', 'pending', 'normal', 'all']).optional(),
    sortBy: z.enum(['code', 'licensePlate', 'brand', 'model', 'customer', 'lastService', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
})

// Type exports
export type CarFormData = z.infer<typeof carSchema>
export type CarImageData = z.infer<typeof carImageSchema>
export type CarSearchQuery = z.infer<typeof carSearchSchema>
