/**
 * ไฟล์: components/ui/FormSelect.tsx
 * จุดประสงค์: Select component พร้อม validation error display
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import { SelectHTMLAttributes, forwardRef } from 'react'

interface Option {
    value: string | number
    label: string
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string
    options: Option[]
    error?: string
    required?: boolean
    placeholder?: string
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
    ({ label, options, error, required, placeholder = '-- เลือก --', className = '', ...props }, ref) => {
        return (
            <div className="mb-3">
                <label className={`form-label ${required ? 'required' : ''}`}>
                    {label}
                </label>
                <select
                    ref={ref}
                    className={`form-select ${error ? 'is-invalid' : ''} ${className}`}
                    {...props}
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <div className="invalid-feedback">{error}</div>
                )}
            </div>
        )
    }
)

FormSelect.displayName = 'FormSelect'

export default FormSelect
