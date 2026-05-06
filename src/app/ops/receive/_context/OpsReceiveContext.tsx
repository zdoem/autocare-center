'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { JobPriority } from '@prisma/client'
import type {
    OpsReceiveState,
    SearchResult,
    PhotoUpload,
    InspectionChecklist,
    ServiceRecommendation,
    JobInfo,
    TechnicianAssignment
} from '../_types/wizard.types'

interface OpsReceiveContextType {
    state: OpsReceiveState
    updateState: (updates: Partial<OpsReceiveState>) => void
    resetState: () => void
    goToStep: (step: number) => void
    markStepComplete: (step: number) => void
}

const initialInspectionChecklist: InspectionChecklist = {
    fluids: {
        engineOil: false,
        transmission: false,
        brake: false,
        coolant: false,
        washer: false,
    },
    brakes: {
        frontPads: false,
        rearPads: false,
        system: false,
    },
    tires: {
        pressure: false,
        tread: false,
        alignment: false,
    },
    drivetrain: {
        engineSound: false,
        transmission: false,
        suspension: false,
    },
    electrical: {
        lights: false,
        battery: false,
        ac: false,
        wipers: false,
    },
}

const initialState: OpsReceiveState = {
    selectedCar: null,
    selectedCustomer: null,
    searchResults: [],
    jobInfo: {
        mileage: 0,
        priority: JobPriority.NORMAL,
        jobDate: new Date(),
        estimatedDays: 2,
        workshopBay: undefined,
        appointmentDate: undefined,
    },
    photos: [],
    inspectionChecklist: initialInspectionChecklist,
    inspectionNotes: '',
    customerRequest: '',
    recommendations: [],
    technician: null,
    currentStep: 1,
    completedSteps: new Set<number>(),
}

const OpsReceiveContext = createContext<OpsReceiveContextType | undefined>(undefined)

export function OpsReceiveProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<OpsReceiveState>(initialState)

    const updateState = (updates: Partial<OpsReceiveState>) => {
        setState(prev => ({ ...prev, ...updates }))
    }

    const resetState = () => {
        setState(initialState)
    }

    const goToStep = (step: number) => {
        setState(prev => ({ ...prev, currentStep: step }))
    }

    const markStepComplete = (step: number) => {
        setState(prev => ({
            ...prev,
            completedSteps: new Set([...prev.completedSteps, step])
        }))
    }

    return (
        <OpsReceiveContext.Provider
            value={{
                state,
                updateState,
                resetState,
                goToStep,
                markStepComplete,
            }}
        >
            {children}
        </OpsReceiveContext.Provider>
    )
}

export function useOpsReceive() {
    const context = useContext(OpsReceiveContext)
    if (context === undefined) {
        throw new Error('useOpsReceive must be used within OpsReceiveProvider')
    }
    return context
}
