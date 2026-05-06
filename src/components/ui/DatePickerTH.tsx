
import React, { forwardRef } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { th } from 'date-fns/locale/th'

// Register locale
registerLocale('th', th)

interface DatePickerTHProps {
    label?: string
    selected: Date | null
    onChange: (date: Date | null) => void
    error?: string
    placeholder?: string
    required?: boolean
}

// Custom Input to display BE Date
const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick, onChange, placeholder, className, disabled, required }, ref) => {
    let displayValue = ''
    if (value) {
        // value is formatted by DatePicker (usually dd/MM/yyyy) if passing dateFormat
        // But we want to ensure Year is BE.
        // Actually, React DatePicker processes value internally based on Date.
        // We can parse it regex or pass formatted value from parent.
        // Easier: Let DatePicker handle AD date, we just transform string.

        // E.g. value "23/01/2026" -> "23/01/2569"
        const parts = value.split('/')
        if (parts.length === 3) {
            const day = parts[0]
            const month = parts[1]
            const yearAD = parseInt(parts[2])
            if (!isNaN(yearAD)) {
                displayValue = `${day}/${month}/${yearAD + 543}`
            } else {
                displayValue = value
            }
        } else {
            displayValue = value
        }
    }

    return (
        <div onClick={onClick} className="input-icon">
            <input
                ref={ref}
                type="text"
                className={className}
                value={displayValue}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                readOnly // Make readOnly to prevent manual typing confusion, force picker
            />
            <span className="input-icon-addon">
                <i className="ti ti-calendar"></i>
            </span>
        </div>
    )
})

CustomInput.displayName = 'CustomInput'

export const DatePickerTH: React.FC<DatePickerTHProps> = ({
    label,
    selected,
    onChange,
    error,
    placeholder = "เลือกวันที่",
    required
}) => {
    return (
        <div className="mb-3">
            {label && (
                <label className="form-label">
                    {label} {required && <span className="text-danger">*</span>}
                </label>
            )}
            <DatePicker
                selected={selected}
                onChange={onChange}
                locale="th"
                dateFormat="dd/MM/yyyy"
                customInput={<CustomInput className={`form-control ${error ? 'is-invalid' : ''}`} required={required} placeholder={placeholder} />}
                renderCustomHeader={({
                    date,
                    changeYear,
                    changeMonth,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                }) => (
                    <div className="d-flex align-items-center justify-content-between px-2 py-2">
                        <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} type="button" className="btn btn-sm btn-icon btn-ghost-secondary">
                            <i className="ti ti-chevron-left"></i>
                        </button>

                        <div className="d-flex gap-1">
                            <select
                                value={date.getFullYear()}
                                onChange={({ target: { value } }) => changeYear(parseInt(value))}
                                className="form-select form-select-sm"
                                style={{ width: '100px' }}
                            >
                                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i).map((option) => (
                                    <option key={option} value={option}>
                                        {option + 543}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={thaiMonths[date.getMonth()]}
                                onChange={({ target: { value } }) =>
                                    changeMonth(thaiMonths.indexOf(value))
                                }
                                className="form-select form-select-sm"
                                style={{ width: '120px' }}
                            >
                                {thaiMonths.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button onClick={increaseMonth} disabled={nextMonthButtonDisabled} type="button" className="btn btn-sm btn-icon btn-ghost-secondary">
                            <i className="ti ti-chevron-right"></i>
                        </button>
                    </div>
                )}
            />
            {error && <div className="invalid-feedback d-block">{error}</div>}
        </div>
    )
}

const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];
