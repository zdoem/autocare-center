'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'

const fmt = (v: number) => v.toLocaleString('th-TH', { minimumFractionDigits: 2 })
const fmtTime = (d: string | null) => d ? new Date(d).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'

interface DailyData {
    date: string
    summary: { totalRevenue: number; serviceRevenue: number; partsRevenue: number; laborRevenue: number; jobCount: number; receiptCount: number; expenseTotal: number; grossProfit: number }
    paymentGroups: { label: string; amount: number; count: number }[]
    receipts: { jobNo: string; licensePlate: string; customerName: string; paymentType: string; grandTotal: number; paidTime: string | null }[]
    purchases: { purchaseNo: string; vendorName: string; grandTotal: number }[]
}

export default function ReportDailyPage() {
    const todayStr = new Date().toISOString().slice(0, 10)
    const [date, setDate] = useState(todayStr)
    const [data, setData] = useState<DailyData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [date])

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/reports/daily?date=${date}`)
            const json = await res.json()
            if (json.success) setData(json.data)
            else showError('โหลดข้อมูลไม่สำเร็จ')
        } catch { showError('เกิดข้อผิดพลาด') }
        finally { setLoading(false) }
    }

    const s = data?.summary

    return (
        <MainLayout title={<><i className="ti ti-calendar-stats me-2"></i>รายงานสรุปรายวัน</>} pretitle="รายงาน">
            <div className="row align-items-center mb-3">
                <div className="col-auto ms-auto btn-list">
                    <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
                    <button className="btn btn-outline-secondary" onClick={() => window.print()}>
                        <i className="ti ti-printer me-1"></i>พิมพ์
                    </button>
                    <button className="btn btn-primary" onClick={fetchData}>
                        <i className="ti ti-refresh me-1"></i>รีเฟรช
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row row-deck row-cards mb-3">
                {[
                    { label: 'รายได้วันนี้', value: s?.totalRevenue || 0, color: 'bg-success', icon: 'ti-currency-baht' },
                    { label: 'ค่าใช้จ่าย', value: s?.expenseTotal || 0, color: 'bg-danger', icon: 'ti-shopping-cart' },
                    { label: 'งานซ่อม', value: s?.jobCount || 0, color: 'bg-primary', icon: 'ti-car', isMoney: false, suffix: ' คัน' },
                    { label: 'ใบเสร็จ', value: s?.receiptCount || 0, color: 'bg-azure', icon: 'ti-receipt', isMoney: false, suffix: ' ใบ' },
                ].map((card, i) => (
                    <div key={i} className={`col-sm-6 col-lg-3`}>
                        <div className={`card ${i === 0 ? 'bg-success-lt' : i === 1 ? 'bg-danger-lt' : i === 2 ? 'bg-primary-lt' : 'bg-azure-lt'}`}>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <span className={`avatar ${card.color} me-3`}><i className={`ti ${card.icon}`}></i></span>
                                    <div>
                                        <div className="text-muted">{card.label}</div>
                                        <div className="h2 mb-0">
                                            {card.isMoney !== false ? `฿${fmt(card.value)}` : `${card.value.toLocaleString()}${card.suffix || ''}`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Revenue & Expense Detail */}
            <div className="row mb-3">
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-arrow-up me-2 text-success"></i>รายได้</h3>
                        </div>
                        <table className="table table-vcenter card-table">
                            <thead><tr><th>รายการ</th><th className="text-end">จำนวน</th><th className="text-end">ยอด</th></tr></thead>
                            <tbody>
                                <tr><td>ค่าบริการ</td><td className="text-end">{s?.jobCount || 0}</td><td className="text-end">฿{fmt(s?.serviceRevenue || 0)}</td></tr>
                                <tr><td>ค่าอะไหล่</td><td className="text-end">-</td><td className="text-end">฿{fmt(s?.partsRevenue || 0)}</td></tr>
                                <tr><td>ค่าแรง</td><td className="text-end">-</td><td className="text-end">฿{fmt(s?.laborRevenue || 0)}</td></tr>
                            </tbody>
                            <tfoot className="bg-success-lt">
                                <tr><th>รวมรายได้</th><th></th><th className="text-end h4">฿{fmt(s?.totalRevenue || 0)}</th></tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-arrow-down me-2 text-danger"></i>ค่าใช้จ่าย</h3>
                        </div>
                        <table className="table table-vcenter card-table">
                            <thead><tr><th>รายการ</th><th className="text-end">จำนวน</th><th className="text-end">ยอด</th></tr></thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={3} className="text-center py-2"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                                ) : (data?.purchases || []).length === 0 ? (
                                    <tr><td colSpan={3} className="text-center text-muted">ไม่มีค่าใช้จ่าย</td></tr>
                                ) : (data?.purchases || []).map((p, i) => (
                                    <tr key={i}><td>สั่งซื้อ {p.purchaseNo}</td><td className="text-end">{p.vendorName}</td><td className="text-end">฿{fmt(p.grandTotal)}</td></tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-danger-lt">
                                <tr><th>รวมค่าใช้จ่าย</th><th></th><th className="text-end h4">฿{fmt(s?.expenseTotal || 0)}</th></tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            {/* Payment Receipt List */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title"><i className="ti ti-cash me-2"></i>สรุปการรับชำระ</h3>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th>Job No.</th><th>ทะเบียน</th><th>ลูกค้า</th><th>วิธีชำระ</th>
                                <th className="text-end">ยอด</th><th>เวลา</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-4"><div className="spinner-border text-primary"></div></td></tr>
                            ) : (data?.receipts || []).length === 0 ? (
                                <tr><td colSpan={6} className="text-center text-muted py-4">ไม่มีข้อมูลวันนี้</td></tr>
                            ) : (data?.receipts || []).map((r, i) => (
                                <tr key={i}>
                                    <td><span className="fw-bold text-primary">{r.jobNo}</span></td>
                                    <td><span className="badge bg-blue-lt">{r.licensePlate}</span></td>
                                    <td>{r.customerName}</td>
                                    <td>
                                        <span className={`badge ${r.paymentType === 'เงินสด' ? 'bg-success' : r.paymentType.includes('โอน') || r.paymentType.includes('QR') ? 'bg-primary' : 'bg-purple'}`}>
                                            {r.paymentType}
                                        </span>
                                    </td>
                                    <td className="text-end">฿{fmt(r.grandTotal)}</td>
                                    <td>{fmtTime(r.paidTime)}</td>
                                </tr>
                            ))}
                        </tbody>
                        {!loading && (data?.receipts || []).length > 0 && (
                            <tfoot className="bg-light">
                                <tr>
                                    <th colSpan={4}>รวมทั้งหมด</th>
                                    <th className="text-end h4 text-primary">฿{fmt(s?.totalRevenue || 0)}</th>
                                    <th></th>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </MainLayout>
    )
}
