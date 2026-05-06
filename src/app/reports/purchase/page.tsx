'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'

interface Purchase {
    id: string
    purchaseNo: string
    purchaseDate: string
    receivedDate: string | null
    status: 'PENDING' | 'RECEIVED' | 'CANCELLED'
    grandTotal: number
    totalAmount: number
    vatAmount: number
    vendor: { name: string }
    items: { id: string }[]
}

const formatMoney = (v: number) => v.toLocaleString('th-TH', { minimumFractionDigits: 2 })
const formatDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' })

const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'RECEIVED') return <span className="badge bg-green"><i className="ti ti-check me-1"></i>รับแล้ว</span>
    if (status === 'PENDING') return <span className="badge bg-yellow"><i className="ti ti-clock me-1"></i>รอรับ</span>
    return <span className="badge bg-secondary"><i className="ti ti-x me-1"></i>ยกเลิก</span>
}

export default function ReportPurchasePage() {
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [loading, setLoading] = useState(true)
    const [filterMonth, setFilterMonth] = useState(() => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    })

    useEffect(() => { fetchData() }, [filterMonth])

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/inventory/purchase')
            const json = await res.json()
            if (json.success) {
                const [year, month] = filterMonth.split('-').map(Number)
                const filtered = (json.data as Purchase[]).filter(p => {
                    const d = new Date(p.purchaseDate)
                    return d.getFullYear() === year && d.getMonth() + 1 === month
                })
                setPurchases(filtered)
            }
        } catch { showError('โหลดข้อมูลไม่สำเร็จ') }
        finally { setLoading(false) }
    }

    const summary = {
        total: purchases.length,
        totalAmount: purchases.reduce((s, p) => s + p.grandTotal, 0),
        received: purchases.filter(p => p.status === 'RECEIVED').length,
        pending: purchases.filter(p => p.status === 'PENDING').length,
    }

    // Generate month options (12 months back)
    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
        return { val, label }
    })

    return (
        <MainLayout title={<><i className="ti ti-truck me-2"></i>รายงานประวัติการสั่งซื้อ</>} pretitle="รายงาน Inventory">
            <div className="row align-items-center mb-3">
                <div className="col-auto ms-auto btn-list">
                    <select className="form-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                        {monthOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                    </select>
                    <button className="btn btn-primary" onClick={() => window.print()}>
                        <i className="ti ti-printer me-1"></i>พิมพ์
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row row-deck row-cards mb-3">
                <div className="col-sm-6 col-lg-3">
                    <div className="card">
                        <div className="card-body">
                            <div className="text-muted">จำนวน PO</div>
                            <div className="h2 mb-0">{summary.total} ฉบับ</div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                    <div className="card bg-danger-lt">
                        <div className="card-body">
                            <div className="text-muted">มูลค่ารวม</div>
                            <div className="h2 mb-0 text-danger">฿{formatMoney(summary.totalAmount)}</div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                    <div className="card bg-green-lt">
                        <div className="card-body">
                            <div className="text-muted">รับของแล้ว</div>
                            <div className="h2 mb-0">{summary.received} ฉบับ</div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                    <div className="card bg-yellow-lt">
                        <div className="card-body">
                            <div className="text-muted">รอรับ</div>
                            <div className="h2 mb-0">{summary.pending} ฉบับ</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PO List */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">รายการ Purchase Order</h3>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th>PO No.</th>
                                <th>วันที่</th>
                                <th>Vendor</th>
                                <th className="text-center">รายการ</th>
                                <th className="text-end">ยอดรวม</th>
                                <th>สถานะ</th>
                                <th>วันที่รับ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-4"><div className="spinner-border text-primary"></div></td></tr>
                            ) : purchases.length === 0 ? (
                                <tr><td colSpan={7} className="text-center text-muted py-4">ไม่มีข้อมูลในช่วงเวลานี้</td></tr>
                            ) : (
                                purchases.map(p => (
                                    <tr key={p.id}>
                                        <td><span className="fw-bold text-primary">{p.purchaseNo}</span></td>
                                        <td>{formatDate(p.purchaseDate)}</td>
                                        <td><span className="badge bg-blue-lt">{p.vendor.name}</span></td>
                                        <td className="text-center">{p.items.length}</td>
                                        <td className="text-end fw-bold">฿{formatMoney(p.grandTotal)}</td>
                                        <td><StatusBadge status={p.status} /></td>
                                        <td>{p.receivedDate ? formatDate(p.receivedDate) : '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {!loading && purchases.length > 0 && (
                            <tfoot className="bg-light">
                                <tr>
                                    <th colSpan={4}>รวม</th>
                                    <th className="text-end h4 text-danger">฿{formatMoney(summary.totalAmount)}</th>
                                    <th colSpan={2}></th>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </MainLayout>
    )
}
