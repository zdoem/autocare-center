'use client'

import type { SearchResult } from '../_types/wizard.types'

interface CustomerInfoPanelProps {
    customer: SearchResult['customer'] | null
    className?: string
}

export function CustomerInfoPanel({ customer, className = '' }: CustomerInfoPanelProps) {
    if (!customer) {
        return (
            <div className={`card ${className}`}>
                <div className="card-header">
                    <h3 className="card-title">
                        <i className="ti ti-user me-2"></i>ข้อมูลลูกค้า
                    </h3>
                </div>
                <div className="card-body">
                    <div className="text-muted text-center py-4">
                        <i className="ti ti-user-off fs-1 mb-2 d-block"></i>
                        ยังไม่ได้เลือกลูกค้า
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`card ${className}`}>
            <div className="card-header">
                <h3 className="card-title">
                    <i className="ti ti-user me-2"></i>ข้อมูลลูกค้า
                </h3>
            </div>
            <div className="card-body">
                <div className="datagrid">
                    <div className="datagrid-item">
                        <div className="datagrid-title">รหัส</div>
                        <div className="datagrid-content">{customer.code}</div>
                    </div>
                    <div className="datagrid-item">
                        <div className="datagrid-title">ชื่อลูกค้า</div>
                        <div className="datagrid-content">{customer.name}</div>
                    </div>
                    <div className="datagrid-item">
                        <div className="datagrid-title">โทรศัพท์</div>
                        <div className="datagrid-content">
                            <a href={`tel:${customer.phone}`}>{customer.phone}</a>
                        </div>
                    </div>
                    {customer.email && (
                        <div className="datagrid-item">
                            <div className="datagrid-title">Email</div>
                            <div className="datagrid-content">{customer.email}</div>
                        </div>
                    )}
                    <div className="datagrid-item">
                        <div className="datagrid-title">ประเภทลูกค้า</div>
                        <div className="datagrid-content">
                            <span className={`badge ${customer.customerType === 'VIP' ? 'bg-gold-lt' : 'bg-secondary-lt'
                                }`}>
                                {customer.customerType}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
