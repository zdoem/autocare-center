'use client'

import type { SearchResult } from '../_types/wizard.types'

interface CarInfoPanelProps {
    car: SearchResult['car'] | null
    className?: string
}

export function CarInfoPanel({ car, className = '' }: CarInfoPanelProps) {
    if (!car) {
        return (
            <div className={`card ${className}`}>
                <div className="card-header">
                    <h3 className="card-title">
                        <i className="ti ti-car me-2"></i>ข้อมูลรถ
                    </h3>
                </div>
                <div className="card-body">
                    <div className="text-muted text-center py-4">
                        <i className="ti ti-car-off fs-1 mb-2 d-block"></i>
                        ยังไม่ได้เลือกรถ
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`card ${className}`}>
            <div className="card-header">
                <h3 className="card-title">
                    <i className="ti ti-car me-2"></i>ข้อมูลรถ
                </h3>
            </div>
            <div className="card-body">
                <div className="datagrid">
                    <div className="datagrid-item">
                        <div className="datagrid-title">ทะเบียน</div>
                        <div className="datagrid-content fw-bold">{car.licensePlate}</div>
                    </div>
                    <div className="datagrid-item">
                        <div className="datagrid-title">จังหวัด</div>
                        <div className="datagrid-content">{car.province}</div>
                    </div>
                    <div className="datagrid-item">
                        <div className="datagrid-title">ยี่ห้อ/รุ่น</div>
                        <div className="datagrid-content">
                            {car.brand} {car.model}
                        </div>
                    </div>
                    <div className="datagrid-item">
                        <div className="datagrid-title">ปี</div>
                        <div className="datagrid-content">{car.year}</div>
                    </div>
                    <div className="datagrid-item">
                        <div className="datagrid-title">สี</div>
                        <div className="datagrid-content">{car.color}</div>
                    </div>
                    <div className="datagrid-item">
                        <div className="datagrid-title">เลขไมล์ล่าสุด</div>
                        <div className="datagrid-content">
                            {car.mileage?.toLocaleString()} km
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
