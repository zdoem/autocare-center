/**
 * ไฟล์: components/ui/FormInput.tsx
 * จุดประสงค์: Input component พร้อม validation error display
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: string
    required?: boolean
    helpText?: string
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, required, helpText, className = '', ...props }, ref) => {
        return (
            <div className="mb-3">
                <label className={`form-label ${required ? 'required' : ''}`}>
                    {label}
                </label>
                <input
                    ref={ref}
                    className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
                    {...props}
                />
                {error && (
                    <div className="invalid-feedback">{error}</div>
                )}
                {helpText && !error && (
                    <small className="form-hint">{helpText}</small>
                )}
            </div>
        )
    }
)

FormInput.displayName = 'FormInput'

export default FormInput
