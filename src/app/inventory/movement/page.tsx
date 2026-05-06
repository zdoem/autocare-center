'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'
import Link from 'next/link'

interface StockMovement {
    id: string
    movementNo: string
    movementDate: string
    movementType: 'IN' | 'OUT' | 'ADJUST' | 'RETURN'
    quantity: number
    beforeQty: number
    afterQty: number
    reference: string | null
    notes: string | null
    spare: {
        code: string
        name: string
        unit: string
    }
}

const MovementTypeBadge = ({ type }: { type: string }) => {
    const config: Record<string, { label: string; className: string; icon: string }> = {
        IN:     { label: 'รับเข้า',    className: 'bg-green',  icon: 'ti-arrow-bar-down' },
        OUT:    { label: 'เบิกออก',    className: 'bg-orange', icon: 'ti-arrow-bar-up' },
        ADJUST: { label: 'ปรับปรุง',   className: 'bg-gray',   icon: 'ti-adjustments' },
        RETURN: { label: 'คืนสินค้า',  className: 'bg-blue',   icon: 'ti-refresh' },
    }
    const c = config[type] || config.ADJUST
    return (
        <span className={`badge ${c.className}`}>
            <i className={`ti ${c.icon} me-1`}></i>{c.label}
        </span>
    )
}

export default function InventoryMovementPage() {
    const [movements, setMovements] = useState<StockMovement[]>([])
    const [loading, setLoading] = useState(true)
    const [filterType, setFilterType] = useState('')
    const [filterSearch, setFilterSearch] = useState('')

    useEffect(() => {
        fetchMovements()
    }, [filterType])

    const fetchMovements = async () => {
        try {
            setLoading(true)
            const query = new URLSearchParams()
            if (filterType) query.append('movementType', filterType)
            query.append('limit', '100')

            const res = await fetch(`/api/inventory/movement?${query.toString()}`)
            const json = await res.json()
            if (json.success) {
                setMovements(json.data)
            } else {
                showError('โหลดข้อมูลประวัติไม่สำเร็จ')
            }
        } catch (error) {
            showError('เกิดข้อผิดพลาด')
        } finally {
            setLoading(false)
        }
    }

    const filteredMovements = movements.filter(m =>
        !filterSearch ||
        m.spare.code.toLowerCase().includes(filterSearch.toLowerCase()) ||
        m.spare.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
        (m.reference || '').toLowerCase().includes(filterSearch.toLowerCase())
    )

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString('th-TH', { year: '2-digit', month: '2-digit', day: '2-digit' }) + 
               ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <MainLayout title={<><i className="ti ti-history me-2"></i>ประวัติความเคลื่อนไหว</>} pretitle="Inventory">
            <div className="row align-items-center mb-3">
                <div className="col-auto ms-auto btn-list">
                    <Link href="/inventory/stock" className="btn btn-outline-secondary">
                        <i className="ti ti-box me-1"></i>ดูรายการ Stock
                    </Link>
                    <Link href="/inventory/purchase" className="btn btn-primary">
                        <i className="ti ti-plus me-1"></i>สั่งซื้อสินค้า
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row mb-3">
                {(['IN', 'OUT', 'ADJUST'] as const).map(type => {
                    const typeMovements = movements.filter(m => m.movementType === type)
                    const totalQty = typeMovements.reduce((sum, m) => sum + m.quantity, 0)
                    const config = {
                        IN:     { label: 'รับเข้า',   icon: 'ti-arrow-bar-down', color: 'text-green' },
                        OUT:    { label: 'เบิกออก',   icon: 'ti-arrow-bar-up',   color: 'text-orange' },
                        ADJUST: { label: 'ปรับปรุง',  icon: 'ti-adjustments',    color: 'text-secondary' },
                    }
                    const c = config[type]
                    return (
                        <div className="col-sm-4" key={type}>
                            <div className="card mb-3">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <i className={`ti ${c.icon} fs-1 ${c.color}`}></i>
                                        </div>
                                        <div>
                                            <div className="text-muted">{c.label}</div>
                                            <div className="h2 mb-0">{typeMovements.length} รายการ</div>
                                            <div className="text-muted small">รวม {totalQty.toLocaleString()} หน่วย</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Filters */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="row">
                        <div className="col-lg-5 mb-3 mb-lg-0">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="ค้นหา รหัสอะไหล่ / ชื่ออะไหล่ / เลขอ้างอิง..."
                                value={filterSearch}
                                onChange={(e) => setFilterSearch(e.target.value)}
                            />
                        </div>
                        <div className="col-lg-3">
                            <select
                                className="form-select"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="">ทุกประเภท</option>
                                <option value="IN">รับเข้า</option>
                                <option value="OUT">เบิกออก</option>
                                <option value="ADJUST">ปรับปรุง</option>
                                <option value="RETURN">คืนสินค้า</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Movement Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">ประวัติการเข้า-ออก (Stock Card)</h3>
                    <div className="card-actions text-muted">{filteredMovements.length} รายการ</div>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th>วันที่/เวลา</th>
                                <th>ประเภท</th>
                                <th>รหัสอะไหล่</th>
                                <th>อะไหล่</th>
                                <th className="text-center">ก่อน</th>
                                <th className="text-center">เปลี่ยน</th>
                                <th className="text-center">หลัง</th>
                                <th>อ้างอิง</th>
                                <th>หมายเหตุ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : filteredMovements.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center text-muted py-5">
                                        <i className="ti ti-inbox fs-1 d-block mb-2"></i>
                                        ยังไม่มีประวัติความเคลื่อนไหว
                                    </td>
                                </tr>
                            ) : (
                                filteredMovements.map(m => (
                                    <tr key={m.id}>
                                        <td className="text-muted small">{formatDate(m.movementDate)}</td>
                                        <td><MovementTypeBadge type={m.movementType} /></td>
                                        <td><code>{m.spare.code}</code></td>
                                        <td>{m.spare.name}</td>
                                        <td className="text-center">{m.beforeQty}</td>
                                        <td className="text-center">
                                            <span className={
                                                m.movementType === 'IN' ? 'text-green fw-bold' :
                                                m.movementType === 'OUT' ? 'text-orange fw-bold' : ''
                                            }>
                                                {m.movementType === 'IN' || m.movementType === 'RETURN' ? '+' : 
                                                 m.movementType === 'OUT' ? '-' : '±'}
                                                {Number(m.quantity).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="text-center fw-bold">{m.afterQty}</td>
                                        <td><span className="text-muted small">{m.reference || '-'}</span></td>
                                        <td><span className="text-muted small">{m.notes || '-'}</span></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </MainLayout>
    )
}
