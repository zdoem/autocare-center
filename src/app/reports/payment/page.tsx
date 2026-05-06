'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'

const fmt = (v: number) => v.toLocaleString('th-TH', { minimumFractionDigits: 2 })
const fmtTime = (d: string | null) => d ? new Date(d).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'

interface Payment {
    paymentNo: string; licensePlate: string; customerName: string; jobDescription: string
    paymentTypeName: string; paymentTypeCode: string; totalAmount: number; vatAmount: number
    amount: number; paymentTime: string; receivedBy: string
}
interface PaymentGroup { label: string; amount: number; count: number; color: string }
interface PaymentData { date: string; totalAmount: number; paymentGroups: PaymentGroup[]; payments: Payment[] }

const PT_COLOR: Record<string, string> = {
    CASH: 'bg-success', TRANSFER: 'bg-primary', PROMPTPAY: 'bg-primary', CREDIT_CARD: 'bg-purple'
}

export default function ReportPaymentPage() {
    const todayStr = new Date().toISOString().slice(0, 10)
    const [date, setDate] = useState(todayStr)
    const [data, setData] = useState<PaymentData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [date])

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/reports/payment?date=${date}`)
            const json = await res.json()
            if (json.success) setData(json.data)
            else showError('โหลดข้อมูลไม่สำเร็จ')
        } catch { showError('เกิดข้อผิดพลาด') }
        finally { setLoading(false) }
    }

    const CARD_COLORS = ['bg-success-lt', 'bg-primary-lt', 'bg-purple-lt', 'bg-azure-lt']
    const AVATAR_COLORS = ['bg-success', 'bg-primary', 'bg-purple', 'bg-azure']
    const ICONS = ['ti-cash', 'ti-qrcode', 'ti-credit-card', 'ti-sum']

    return (
        <MainLayout title={<><i className="ti ti-cash me-2"></i>รายงานการรับชำระเงิน</>} pretitle="รายงาน">
            <div className="row align-items-center mb-3">
                <div className="col-auto ms-auto btn-list">
                    <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
                    <button className="btn btn-primary" onClick={fetchData}><i className="ti ti-file-export me-1"></i>Export</button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row row-deck row-cards mb-3">
                {(data?.paymentGroups || []).slice(0, 3).map((g, i) => (
                    <div key={i} className="col-sm-6 col-lg-3">
                        <div className={`card ${CARD_COLORS[i]}`}>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <span className={`avatar ${AVATAR_COLORS[i]} me-3`}><i className={`ti ${ICONS[i]}`}></i></span>
                                    <div>
                                        <div className="text-muted">{g.label}</div>
                                        <div className="h2 mb-0">฿{fmt(g.amount)}</div>
                                        <small className="text-muted">{g.count} รายการ</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                <div className="col-sm-6 col-lg-3">
                    <div className="card bg-azure-lt">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <span className="avatar bg-azure me-3"><i className="ti ti-sum"></i></span>
                                <div>
                                    <div className="text-muted">รวมทั้งหมด</div>
                                    <div className="h2 mb-0">฿{fmt(data?.totalAmount || 0)}</div>
                                    <small className="text-muted">{(data?.payments || []).length} รายการ</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Table */}
            <div className="card">
                <div className="card-header"><h3 className="card-title">รายละเอียดการรับชำระ</h3></div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th>เลขที่ใบเสร็จ</th><th>ทะเบียน</th><th>ลูกค้า</th><th>รายการ</th>
                                <th>วิธีชำระ</th><th className="text-end">ก่อน VAT</th>
                                <th className="text-end">VAT</th><th className="text-end">ยอดสุทธิ</th>
                                <th>เวลา</th><th>ผู้รับเงิน</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={10} className="text-center py-4"><div className="spinner-border text-primary"></div></td></tr>
                            ) : (data?.payments || []).length === 0 ? (
                                <tr><td colSpan={10} className="text-center text-muted py-4">ไม่มีข้อมูลวันนี้</td></tr>
                            ) : (data?.payments || []).map((p, i) => (
                                <tr key={i}>
                                    <td><span className="fw-bold text-primary">{p.paymentNo}</span></td>
                                    <td><span className="badge bg-blue-lt">{p.licensePlate}</span></td>
                                    <td>{p.customerName}</td>
                                    <td className="text-muted small">{p.jobDescription}</td>
                                    <td><span className={`badge ${PT_COLOR[p.paymentTypeCode] || 'bg-secondary'}`}>{p.paymentTypeName}</span></td>
                                    <td className="text-end">฿{fmt(p.totalAmount - p.vatAmount)}</td>
                                    <td className="text-end">฿{fmt(p.vatAmount)}</td>
                                    <td className="text-end fw-bold">฿{fmt(p.amount)}</td>
                                    <td>{fmtTime(p.paymentTime)}</td>
                                    <td>{p.receivedBy}</td>
                                </tr>
                            ))}
                        </tbody>
                        {!loading && (data?.payments || []).length > 0 && (
                            <tfoot className="bg-light">
                                <tr>
                                    <th colSpan={5}>รวมทั้งหมด</th>
                                    <th className="text-end">฿{fmt((data?.payments || []).reduce((s, p) => s + (p.totalAmount - p.vatAmount), 0))}</th>
                                    <th className="text-end">฿{fmt((data?.payments || []).reduce((s, p) => s + p.vatAmount, 0))}</th>
                                    <th className="text-end h4 text-primary">฿{fmt(data?.totalAmount || 0)}</th>
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
