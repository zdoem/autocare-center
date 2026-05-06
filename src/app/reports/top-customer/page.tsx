'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'

interface TopCustomer {
    customerId: string
    fullName: string
    phone: string
    customerTypeName: string
    totalAmount: number
    jobCount: number
}

const formatMoney = (v: number) => v.toLocaleString('th-TH', { minimumFractionDigits: 2 })

const PERIOD_OPTIONS = [
    { val: 'month', label: 'รายเดือน (30 วันล่าสุด)' },
    { val: 'quarter', label: 'รายไตรมาส (90 วันล่าสุด)' },
    { val: 'year', label: 'รายปี (365 วันล่าสุด)' },
]

const medalColor = (rank: number) => {
    if (rank === 1) return 'bg-warning'
    if (rank === 2) return 'bg-secondary'
    if (rank === 3) return 'bg-orange'
    return ''
}

const medalIcon = (rank: number) => {
    if (rank === 1) return 'ti-trophy'
    if (rank === 2) return 'ti-medal'
    if (rank === 3) return 'ti-medal'
    return ''
}

const avatarColors = ['bg-blue-lt', 'bg-pink-lt', 'bg-green-lt', 'bg-orange-lt', 'bg-cyan-lt', 'bg-purple-lt', 'bg-red-lt']

export default function ReportTopCustomerPage() {
    const [customers, setCustomers] = useState<TopCustomer[]>([])
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month')

    useEffect(() => { fetchData() }, [period])

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/reports/top-customer?period=${period}&limit=20`)
            const json = await res.json()
            if (json.success) {
                setCustomers(json.data)
            } else {
                showError('โหลดข้อมูลไม่สำเร็จ')
            }
        } catch { showError('เกิดข้อผิดพลาด') }
        finally { setLoading(false) }
    }

    const top3 = customers.slice(0, 3)
    const rest = customers.slice(3)

    return (
        <MainLayout title={<><i className="ti ti-trophy me-2 text-warning"></i>ลูกค้าใช้บริการมากที่สุด (Top 20)</>} pretitle="รายงานลูกค้า">
            {/* Period Filter */}
            <div className="row align-items-center mb-3">
                <div className="col-auto ms-auto">
                    <div className="btn-group">
                        {PERIOD_OPTIONS.map(o => (
                            <button
                                key={o.val}
                                className={`btn ${period === o.val ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setPeriod(o.val as typeof period)}
                            >
                                {o.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top 3 Podium */}
            {!loading && top3.length > 0 && (
                <div className="row row-deck row-cards mb-4">
                    {top3.map((c, i) => (
                        <div className="col-md-4" key={c.customerId}>
                            <div className={`card ${i === 0 ? 'border-warning' : ''}`} style={i === 0 ? { borderWidth: 2 } : {}}>
                                <div className="card-body text-center py-4">
                                    <div className="mb-2">
                                        <i className={`ti ${medalIcon(i + 1)} fs-1 ${i === 0 ? 'text-warning' : i === 1 ? 'text-secondary' : 'text-orange'}`}></i>
                                    </div>
                                    <span className={`avatar avatar-xl ${avatarColors[i % avatarColors.length]} mb-2`}>
                                        {c.fullName.charAt(4) || c.fullName.charAt(0)}
                                    </span>
                                    <h3 className="mb-1">{c.fullName}</h3>
                                    <div className="text-muted mb-2">{c.phone}</div>
                                    <div className="display-6 fw-bold text-success">฿{formatMoney(c.totalAmount)}</div>
                                    <div className="text-muted">{c.jobCount} ครั้ง</div>
                                    <span className={`badge ${medalColor(i + 1)} mt-2`}>
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} อันดับ {i + 1}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Full Ranking Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Top 20 ลูกค้า (เรียงตามยอดใช้บริการ)</h3>
                    <div className="card-actions text-muted small">
                        {period === 'month' ? '30 วันล่าสุด' : period === 'quarter' ? '90 วันล่าสุด' : '365 วันล่าสุด'}
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th>อันดับ</th>
                                <th>ลูกค้า</th>
                                <th>โทรศัพท์</th>
                                <th className="text-center">จำนวนครั้ง</th>
                                <th className="text-end">ยอดสะสม</th>
                                <th>ประเภท</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : customers.length === 0 ? (
                                <tr><td colSpan={6} className="text-center text-muted py-5">
                                    <i className="ti ti-users fs-1 d-block mb-2"></i>ยังไม่มีข้อมูลในช่วงเวลานี้
                                </td></tr>
                            ) : (
                                customers.map((c, i) => (
                                    <tr key={c.customerId} className={i === 0 ? 'bg-warning-lt' : i === 1 ? 'bg-secondary-lt' : i === 2 ? 'bg-orange-lt' : ''}>
                                        <td>
                                            {i < 3 ? (
                                                <span className={`badge ${medalColor(i + 1)}`}>{i + 1}</span>
                                            ) : (
                                                <span className="text-muted">{i + 1}</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <span className={`avatar avatar-sm ${avatarColors[i % avatarColors.length]} me-2`}>
                                                    {c.fullName.charAt(4) || c.fullName.charAt(0)}
                                                </span>
                                                {c.fullName}
                                            </div>
                                        </td>
                                        <td>{c.phone}</td>
                                        <td className="text-center"><strong>{c.jobCount}</strong></td>
                                        <td className="text-end fw-bold text-success">฿{formatMoney(c.totalAmount)}</td>
                                        <td>
                                            <span className={`badge ${c.customerTypeName?.toLowerCase().includes('vip') ? 'bg-warning' : 'bg-secondary'}`}>
                                                {c.customerTypeName || 'ทั่วไป'}
                                            </span>
                                        </td>
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
