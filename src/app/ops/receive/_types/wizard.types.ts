import { JobPriority } from "@prisma/client"

export interface SearchResult {
    id: string
    type: 'car' | 'customer'
    car?: {
        id: string
        code: string
        licensePlate: string
        province: string
        brand: string
        model: string
        year: number
        color: string
        mileage: number
        vin?: string
        engineNo?: string
    }
    customer?: {
        id: string
        code: string
        name: string
        phone: string
        email?: string
        address?: string
        customerType: string
        lineId?: string
    }
    serviceHistory?: {
        totalVisits: number
        totalSpent: number
        lastVisit?: Date
        recentJobs: Array<{
            jobNo: string
            date: Date
            description: string
            total: number
        }>
    }
}

export interface PhotoUpload {
    file: File
    preview: string
    angle: 'front' | 'rear' | 'left' | 'right' | 'extra'
    uploaded?: boolean
    url?: string
}

export interface InspectionChecklist {
    fluids: {
        engineOil: boolean
        transmission: boolean
        brake: boolean
        coolant: boolean
        washer: boolean
    }
    brakes: {
        frontPads: boolean
        rearPads: boolean
        system: boolean
    }
    tires: {
        pressure: boolean
        tread: boolean
        alignment: boolean
    }
    drivetrain: {
        engineSound: boolean
        transmission: boolean
        suspension: boolean
    }
    electrical: {
        lights: boolean
        battery: boolean
        ac: boolean
        wipers: boolean
    }
}

export interface ServiceRecommendation {
    id: string
    serviceId?: string
    templateId?: string
    title: string
    description: string
    priority: 'URGENT' | 'RECOMMENDED' | 'OPTIONAL'
    estimatedCost: number
    reason: string
    dueAtMileage?: number
    dueAtDate?: Date
    isSelected: boolean
}

export interface JobInfo {
    mileage: number
    priority: JobPriority
    jobDate: Date
    estimatedDays: number
    workshopBay?: string
    appointmentDate?: Date
}

export interface TechnicianAssignment {
    technicianId: string
    technicianName?: string
    laborHours: number
    laborRate: number
    laborCost: number
    workload?: number
}

export interface OpsReceiveState {
    // Step 1: Search
    selectedCar: SearchResult['car'] | null
    selectedCustomer: SearchResult['customer'] | null
    searchResults: SearchResult[]

    // Step 2: Car Info
    jobInfo: JobInfo

    // Step 3: Photos
    photos: PhotoUpload[]

    // Step 4: Inspection
    inspectionChecklist: InspectionChecklist
    inspectionNotes: string

    // Step 5: Symptoms
    customerRequest: string

    // Step 6: Recommendations
    recommendations: ServiceRecommendation[]

    // Step 7: Technician
    technician: TechnicianAssignment | null

    // Navigation
    currentStep: number
    completedSteps: Set<number>
}

export type StepComponentProps = {
    onNext: () => void
    onBack: () => void
}
