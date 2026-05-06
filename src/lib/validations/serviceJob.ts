import { z } from 'zod'

// Service Job Validation Schema
export const serviceJobSchema = z.object({
    carId: z.string().min(1, 'กรุณาระบุรถยนต์'),
    customerId: z.string().optional(), // Can be derived from carId
    mileage: z.number().min(0, 'เลขไมล์ต้องไม่ติดลบ').optional(),
    customerRequest: z.string().optional(),
    notes: z.string().optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
    technicianId: z.string().optional(),
    appointmentDate: z.string().optional(),
    workshopBay: z.string().optional(),
    estimatedDays: z.number().optional(),
    status: z.string().optional(),
    inspectionChecklist: z.any().optional(),
    inspectionNotes: z.string().optional(),
    laborHours: z.number().optional(),
    laborRate: z.number().optional(),
})

export type ServiceJobFormData = z.infer<typeof serviceJobSchema>

export const serviceJobUpdateSchema = serviceJobSchema.partial().extend({
    status: z.enum(['RECEIVED', 'INSPECTION', 'WAITING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'WAITING_PARTS', 'QC_CHECK', 'WAITING_PAYMENT', 'COMPLETED', 'DELIVERED', 'CANCELLED']).optional(),
    estimatedCost: z.number().min(0).optional(),
})

export type ServiceJobUpdateData = z.infer<typeof serviceJobUpdateSchema>
