/**
 * ไฟล์: lib/validations/vehicle.ts
 * จุดประสงค์: Zod schemas สำหรับ validation ข้อมูล Vehicle (CarBrand, CarModel)
 * 
 * @author AutoCare Team
 * @created 2026-01-25
 */

import { z } from 'zod'

// Car Brand Schema
export const carBrandSchema = z.object({
    nameThai: z.string().min(1, 'กรุณากรอกชื่อยี่ห้อ (ไทย)'),
    nameEnglish: z.string().min(1, 'กรุณากรอกชื่อยี่ห้อ (EN)'),
    name: z.string().min(1, 'กรุณากรอกชื่อยี่ห้อ').optional().nullable(), // backward compatibility
    description: z.string().optional().nullable(),
    logoUrl: z.preprocess(
        (val) => (val === '' || val === null || val === undefined) ? undefined : val,
        z.string().url('URL ไม่ถูกต้อง').optional().nullable()
    ),
    isActive: z.boolean().optional(),
})

export type CarBrandInput = z.infer<typeof carBrandSchema>

// Car Model Schema
export const carModelSchema = z.object({
    name: z.string().min(1, 'กรุณากรอกชื่อรุ่นรถ'),
    carBrandId: z.string().min(1, 'กรุณาเลือกยี่ห้อรถ'),
    description: z.string().optional().nullable(),
    yearStart: z.number().int().min(1900).max(2100).optional().or(z.null()),
    yearEnd: z.number().int().min(1900).max(2100).optional().or(z.null()),
    vehicleType: z.string().optional().nullable(),
    fuelType: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
})

export type CarModelInput = z.infer<typeof carModelSchema>
