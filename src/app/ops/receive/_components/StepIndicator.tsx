'use client'

interface StepIndicatorProps {
    currentStep: number
    completedSteps: Set<number>
    steps: string[]
}

export function StepIndicator({ currentStep, completedSteps, steps }: StepIndicatorProps) {
    return (
        <div className="card mb-3">
            <div className="card-body">
                <ul className="steps steps-green steps-counter">
                    {steps.map((stepName, index) => {
                        const stepNumber = index + 1
                        const isActive = currentStep === stepNumber
                        const isCompleted = completedSteps.has(stepNumber)

                        return (
                            <li
                                key={stepNumber}
                                className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                            >
                                {stepName}
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}
