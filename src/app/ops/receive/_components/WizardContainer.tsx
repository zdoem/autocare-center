'use client'

import { useOpsReceive } from '../_context/OpsReceiveContext'
import { StepIndicator } from './StepIndicator'
import { Step1Search } from './Step1Search'

const STEPS = [
    'ค้นหาลูกค้า/รถ',
    'ข้อมูลรถ',
    'ถ่ายรูปรถ',
    'ตรวจสอบ',
    'อาการที่แจ้ง',
    'งานแนะนำ',
    'มอบหมายช่าง',
    'ยืนยัน',
]

export function WizardContainer() {
    const { state, goToStep, markStepComplete } = useOpsReceive()

    const handleNext = () => {
        markStepComplete(state.currentStep)
        goToStep(state.currentStep + 1)
    }

    const handleBack = () => {
        goToStep(state.currentStep - 1)
    }

    const renderStep = () => {
        switch (state.currentStep) {
            case 1:
                return <Step1Search onNext={handleNext} onBack={handleBack} />
            case 2:
                return <div className="alert alert-info">Step 2: Coming soon...</div>
            case 3:
                return <div className="alert alert-info">Step 3: Coming soon...</div>
            case 4:
                return <div className="alert alert-info">Step 4: Coming soon...</div>
            case 5:
                return <div className="alert alert-info">Step 5: Coming soon...</div>
            case 6:
                return <div className="alert alert-info">Step 6: Coming soon...</div>
            case 7:
                return <div className="alert alert-info">Step 7: Coming soon...</div>
            case 8:
                return <div className="alert alert-info">Step 8: Coming soon...</div>
            default:
                return null
        }
    }

    return (
        <div className="container-xl">
            <StepIndicator
                currentStep={state.currentStep}
                completedSteps={state.completedSteps}
                steps={STEPS}
            />
            {renderStep()}
        </div>
    )
}
