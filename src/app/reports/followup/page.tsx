'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { showCreateSuccess } from '@/components/ui'

interface FollowupItem {
    id: string
    customerName: string
    phone: string
    licensePlate: string
    carModel: string
    lastService: string
    dueDate: string
    status: 'OVERDUE' | 'TODAY' | 'IN_7_DAYS' | 'IN_30_DAYS'
    statusText: string
    notified: boolean
}

const initialItems: FollowupItem[] = [
    { id: '1', customerName: 'คุณสมหมาย ใจดี', phone: '081-111-2222', licensePlate: 'กก-1111', carModel: 'Toyota Camry', lastService: 'เช็คระยะ 10,000 km', dueDate: '10/01/67', status: 'OVERDUE', statusText: 'เลย 8 วัน', notified: false },
    { id: '2', customerName: 'คุณวิไล สุขสม', phone: '089-222-3333', licensePlate: 'ขข-2222', carModel: 'Honda Civic', lastService: 'เปลี่ยนน้ำมันเครื่อง', dueDate: '18/01/67', status: 'TODAY', statusText: 'วันนี้', notified: false },
    { id: '3', customerName: 'คุณประสิทธิ์ มั่นคง', phone: '086-333-4444', licensePlate: 'คค-3333', carModel: 'Mazda 3', lastService: 'เช็คระยะ 20,000 km', dueDate: '20/01/67', status: 'IN_7_DAYS', statusText: 'อีก 2 วัน', notified: true },
    { id: '4', customerName: 'คุณมานะ ใจสู้', phone: '082-444-5555', licensePlate: 'งง-4444', carModel: 'Nissan Almera', lastService: 'เปลี่ยนยาง 4 เส้น', dueDate: '25/01/67', status: 'IN_7_DAYS', statusText: 'อีก 7 วัน', notified: false },
]

export default function FollowupReportPage() {
    const [items, setItems] = useState<FollowupItem[]>(initialItems)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [filterStatus, setFilterStatus] = useState<string>('ALL')

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(items.map(i => i.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelectOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    const handleSendNotification = (id: string, type: 'SMS' | 'LINE') => {
        setItems(items.map(item => item.id === id ? { ...item, notified: true } : item))
        showCreateSuccess(`ส่ง ${type} แจ้งเตือนลูกค้าเรียบร้อย`)
    }

    const handleSendBulk = (type: 'SMS' | 'LINE') => {
        if (selectedIds.length === 0) return
        setItems(items.map(item => selectedIds.includes(item.id) ? { ...item, notified: true } : item))
        showCreateSuccess(`ส่ง ${type} แจ้งเตือน ${selectedIds.length} รายการเรียบร้อย`)
    }

    const filteredItems = items.filter(item => {
        if (filterStatus === 'OVERDUE') return item.status === 'OVERDUE'
        if (filterStatus === 'TODAY') return item.status === 'TODAY'
        if (filterStatus === '7DAYS') return item.status === 'IN_7_DAYS'
        return true
    })

    const overdueCount = items.filter(i => i.status === 'OVERDUE').length
    const todayCount = items.filter(i => i.status === 'TODAY').length
    const in7DaysCount = items.filter(i => i.status === 'IN_7_DAYS').length
    const in30DaysCount = items.filter(i => i.status === 'IN_30_DAYS').length

    return (
        <MainLayout
            title={<><i className="ti ti-calendar-due me-2 text-orange"></i>ลูกค้าครบกำหนดเซอร์วิส (Follow-up)</>}
            pretitle="รายงานลูกค้า"
        >
            <div className="row align-items-center mb-3">
                <div className="col-auto ms-auto btn-list">
                    <button className="btn btn-success" onClick={() => handleSendBulk('SMS')}>
                        <i className="ti ti-send me-1"></i>ส่ง SMS ทั้งหมด
                    </button>
                    <button className="btn btn-primary" onClick={() => handleSendBulk('LINE')}>
                        <i className="ti ti-brand-line me-1"></i>ส่ง LINE ทั้งหมด
                    </button>
                </div>
            </div>

            <div className="alert alert-warning mb-3">
                <div className="d-flex">
                    <div className="me-3"><i className="ti ti-bell-ringing fs-1"></i></div>
                    <div>
                        <h4 className="alert-title">📅 มีลูกค้า {overdueCount + todayCount + in7DaysCount} ราย ที่ครบกำหนดเซอร์วิสในเร็วๆ นี้!</h4>
                        <div className="text-muted">ควรติดต่อแจ้งเตือนลูกค้าเพื่อนัดหมายเข้ามาใช้บริการเช็คระยะตามกำหนด</div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row row-deck row-cards mb-3">
                <div className="col-sm-6 col-lg-3">
                    <div className="card bg-danger-lt">
                        <div className="card-body">
                            <div className="text-muted">เลยกำหนด</div>
                            <div className="h2 mb-0 text-danger">{overdueCount}</div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                    <div className="card bg-orange-lt">
                        <div className="card-body">
                            <div className="text-muted">ครบกำหนดวันนี้</div>
                            <div className="h2 mb-0 text-orange">{todayCount}</div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                    <div className="card bg-yellow-lt">
                        <div className="card-body">
                            <div className="text-muted">ภายใน 7 วัน</div>
                            <div className="h2 mb-0 text-yellow">{in7DaysCount}</div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                    <div className="card bg-green-lt">
                        <div className="card-body">
                            <div className="text-muted">ภายใน 30 วัน</div>
                            <div className="h2 mb-0 text-green">{in30DaysCount}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Followup Table */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title">รายการลูกค้าครบกำหนด</h3>
                    <div className="card-actions">
                        <select
                            className="form-select form-select-sm"
                            style={{ width: '150px' }}
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">ทั้งหมด</option>
                            <option value="OVERDUE">เลยกำหนด</option>
                            <option value="TODAY">วันนี้</option>
                            <option value="7DAYS">7 วัน</option>
                        </select>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={selectedIds.length === items.length && items.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>ลูกค้า</th>
                                <th>ทะเบียน</th>
                                <th>รถ</th>
                                <th>บริการล่าสุด</th>
                                <th>วันที่ครบกำหนด</th>
                                <th>สถานะ</th>
                                <th>การแจ้งเตือน</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item.id} className={item.status === 'OVERDUE' ? 'bg-danger-lt' : item.status === 'TODAY' ? 'bg-orange-lt' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => handleSelectOne(item.id)}
                                        />
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <span className="avatar avatar-sm bg-blue-lt me-2">{item.customerName.charAt(3)}</span>
                                            <div>
                                                <div className="fw-bold">{item.customerName}</div>
                                                <small className="text-muted">{item.phone}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge bg-blue-lt">{item.licensePlate}</span></td>
                                    <td>{item.carModel}</td>
                                    <td>{item.lastService}</td>
                                    <td>
                                        <span className={item.status === 'OVERDUE' ? 'text-danger fw-bold' : item.status === 'TODAY' ? 'text-orange fw-bold' : ''}>
                                            {item.dueDate}
                                        </span>
                                    </td>
                                    <td>
                                        {item.status === 'OVERDUE' && <span className="badge bg-danger"><i className="ti ti-alert-circle me-1"></i>{item.statusText}</span>}
                                        {item.status === 'TODAY' && <span className="badge bg-orange"><i className="ti ti-clock me-1"></i>{item.statusText}</span>}
                                        {item.status === 'IN_7_DAYS' && <span className="badge bg-yellow"><i className="ti ti-clock me-1"></i>{item.statusText}</span>}
                                        {item.status === 'IN_30_DAYS' && <span className="badge bg-green"><i className="ti ti-clock me-1"></i>{item.statusText}</span>}
                                    </td>
                                    <td>
                                        {item.notified ? (
                                            <span className="badge bg-green">แจ้งแล้ว</span>
                                        ) : (
                                            <span className="badge bg-secondary">ยังไม่แจ้ง</span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleSendNotification(item.id, 'LINE')}
                                        >
                                            <i className="ti ti-send"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="card-footer">
                    <div className="d-flex align-items-center">
                        <span className="me-3">เลือกไว้ {selectedIds.length} รายการ</span>
                        <button
                            className="btn btn-success btn-sm me-2"
                            disabled={selectedIds.length === 0}
                            onClick={() => handleSendBulk('SMS')}
                        >
                            <i className="ti ti-send me-1"></i>ส่ง SMS ที่เลือก
                        </button>
                        <button
                            className="btn btn-primary btn-sm"
                            disabled={selectedIds.length === 0}
                            onClick={() => handleSendBulk('LINE')}
                        >
                            <i className="ti ti-brand-line me-1"></i>ส่ง LINE ที่เลือก
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
