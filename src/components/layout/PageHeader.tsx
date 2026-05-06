/**
 * ไฟล์: components/layout/PageHeader.tsx
 * จุดประสงค์: Page header component สำหรับแสดง Title
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import React from 'react'

interface PageHeaderProps {
    title: React.ReactNode
    pretitle?: string
    actions?: React.ReactNode
}

export default function PageHeader({ title, pretitle, actions }: PageHeaderProps) {
    return (
        <div className="page-header d-print-none">
            <div className="container-xl">
                <div className="row align-items-center">
                    <div className="col-auto">
                        {pretitle && <div className="page-pretitle">{pretitle}</div>}
                        <h2 className="page-title">{title}</h2>
                    </div>
                    {actions && (
                        <div className="col-auto ms-auto">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
