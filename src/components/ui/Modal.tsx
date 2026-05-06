/**
 * ไฟล์: components/ui/Modal.tsx
 * จุดประสงค์: Modal wrapper component ตาม Tabler UI
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    children: ReactNode
    footer?: ReactNode
}

export default function Modal({
    isOpen,
    onClose,
    title,
    size = 'md',
    children,
    footer
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null)

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    if (!isOpen) return null

    const sizeClass = size === 'lg' ? 'modal-lg' : size === 'xl' ? 'modal-xl' : size === 'sm' ? 'modal-sm' : ''

    return (
        <>
            {/* Backdrop */}
            <div
                className="modal-backdrop fade show"
                onClick={onClose}
                style={{ zIndex: 1050 }}
            />

            {/* Modal */}
            <div
                className="modal fade show"
                style={{ display: 'block', zIndex: 1055 }}
                ref={modalRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
            >
                <div className={`modal-dialog modal-dialog-centered ${sizeClass}`}>
                    <div className="modal-content">
                        {/* Header */}
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                                aria-label="Close"
                            />
                        </div>

                        {/* Body */}
                        <div className="modal-body">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="modal-footer">
                                {footer}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
