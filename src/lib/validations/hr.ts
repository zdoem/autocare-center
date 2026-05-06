/**
 * ไฟล์: lib/validations/hr.ts
 * จุดประสงค์: Zod validation schemas สำหรับ HR module
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { z } from 'zod'

// =========================================
// Department Schema (แผนก)
// =========================================
export const departmentSchema = z.object({
    name: z
        .string()
        .min(2, 'ชื่อแผนกต้องมีอย่างน้อย 2 ตัวอักษร')
        .max(100, 'ชื่อแผนกต้องไม่เกิน 100 ตัวอักษร'),
    description: z
        .string()
        .max(255, 'คำอธิบายต้องไม่เกิน 255 ตัวอักษร')
        .optional()
        .nullable(),
    employeeCount: z
        .number()
        .int()
        .min(0, 'จำนวนพนักงานต้องไม่ต่ำกว่า 0')
        .optional()
        .default(0),
    isActive: z.boolean().default(true),
})

export type DepartmentInput = z.infer<typeof departmentSchema>

// =========================================
// Employee Type Schema (ประเภทพนักงาน)
// =========================================
export const employeeTypeSchema = z.object({
    name: z
        .string()
        .min(2, 'ชื่อประเภทต้องมีอย่างน้อย 2 ตัวอักษร')
        .max(100, 'ชื่อประเภทต้องไม่เกิน 100 ตัวอักษร'),
    description: z
        .string()
        .max(255, 'คำอธิบายต้องไม่เกิน 255 ตัวอักษร')
        .optional()
        .nullable(),
    leaveEntitlement: z
        .string()
        .max(255, 'สิทธิ์การหยุดต้องไม่เกิน 255 ตัวอักษร')
        .optional()
        .nullable(),
    employeeCount: z
        .number()
        .min(0, 'จำนวนพนักงานต้องไม่ต่ำกว่า 0')
        .optional()
        .default(0),
    isActive: z.boolean().default(true),
})

export type EmployeeTypeInput = z.infer<typeof employeeTypeSchema>

// =========================================
// Position Schema (ตำแหน่งงาน)
// =========================================
export const positionSchema = z.object({
    name: z
        .string()
        .min(2, 'ชื่อตำแหน่งต้องมีอย่างน้อย 2 ตัวอักษร')
        .max(100, 'ชื่อตำแหน่งต้องไม่เกิน 100 ตัวอักษร'),
    departmentId: z
        .string()
        .min(1, 'กรุณาเลือกแผนก'),
    baseSalary: z
        .number()
        .min(0, 'เงินเดือนต้องไม่ต่ำกว่า 0')
        .optional()
        .nullable(),
    isActive: z.boolean().default(true),
})

export type PositionInput = z.infer<typeof positionSchema>

// =========================================
// Employee Schema (พนักงาน)
// =========================================
export const employeeSchema = z.object({
    // ข้อมูลส่วนตัว
    code: z
        .string()
        .max(20, 'รหัสพนักงานต้องไม่เกิน 20 ตัวอักษร')
        .optional()
        .nullable(),
    name: z
        .string()
        .min(2, 'ชื่อ-นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร')
        .max(100, 'ชื่อ-นามสกุลต้องไม่เกิน 100 ตัวอักษร'),
    nickname: z
        .string()
        .max(50, 'ชื่อเล่นต้องไม่เกิน 50 ตัวอักษร')
        .optional()
        .nullable(),

    // ตำแหน่งงาน
    departmentId: z
        .string()
        .min(1, 'กรุณาเลือกแผนก'),
    positionId: z
        .string()
        .min(1, 'กรุณาเลือกตำแหน่ง'),
    employeeTypeId: z
        .string()
        .min(1, 'กรุณาเลือกประเภทพนักงาน')
        .optional()
        .nullable(),

    // ติดต่อ
    phone: z
        .string()
        .regex(/^0\d{2}-?\d{3}-?\d{4}$/, 'รูปแบบเบอร์โทร: 0XX-XXX-XXXX'),
    email: z
        .string()
        .email('รูปแบบอีเมลไม่ถูกต้อง')
        .optional()
        .nullable()
        .or(z.literal('')),

    // การจ้างงาน
    startDate: z
        .string()
        .optional()
        .nullable(),
    salary: z
        .number()
        .min(0, 'เงินเดือนต้องไม่ต่ำกว่า 0')
        .optional()
        .nullable(),

    // ระบบ
    username: z
        .string()
        .min(4, 'Username ต้องมีอย่างน้อย 4 ตัวอักษร')
        .max(50, 'Username ต้องไม่เกิน 50 ตัวอักษร')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ เท่านั้น')
        .optional()
        .nullable()
        .or(z.literal('')),
    password: z
        .string()
        .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
        .max(100, 'รหัสผ่านต้องไม่เกิน 100 ตัวอักษร')
        .optional()
        .nullable()
        .or(z.literal('')),
    role: z
        .enum(['ADMIN', 'MANAGER', 'CASHIER', 'TECHNICIAN'])
        .optional()
        .nullable(),

    isActive: z.boolean().default(true),
})

export type EmployeeInput = z.infer<typeof employeeSchema>

// =========================================
// Query Parameters Schema
// =========================================
export const listQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    departmentId: z.string().optional(),
    isActive: z.coerce.boolean().optional(),
})

export type ListQueryInput = z.infer<typeof listQuerySchema>
