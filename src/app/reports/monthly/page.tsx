'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'

const fmt = (v: number) => v.toLocaleString('th-TH', { minimumFractionDigits: 2 })

interface MonthlyData {
    month: string
    summary: { totalRevenue: number; totalJobs: number; expenseTotal: number; netProfit: number }
    proportions: { serviceTotal: number; partsTotal: number; laborTotal: number }
    dailyRows: { day: number; date: string; jobCount: number; serviceRevenue: number; partsRevenue: number; laborRevenue: number; total: number }[]
    maxDayRevenue: number
}

export default function ReportMonthlyPage() {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const [month, setMonth] = useState(currentMonth)
    const [data, setData] = useState<MonthlyData | null>(null)
    const [loading, setLoading] = useState(true)

    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(); d.setMonth(d.getMonth() - i)
        return {
            val: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            label: d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
        }
    })

    useEffect(() => { fetchData() }, [month])

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/reports/monthly?month=${month}`)
            const json = await res.json()
            if (json.success) setData(json.data)
            else showError('โหลดข้อมูลไม่สำเร็จ')
        } catch { showError('เกิดข้อผิดพลาด') }
        finally { setLoading(false) }
    }

    const s = data?.summary
    const p = data?.proportions
    const totalProp = (p?.serviceTotal || 0) + (p?.partsTotal || 0) + (p?.laborTotal || 0) || 1
    const pct = (v: number) => Math.round((v / totalProp) * 100)
    const monthLabel = monthOptions.find(o => o.val === month)?.label || month

    return (
        <MainLayout title={<><i className="ti ti-report-analytics me-2"></i>รายงานสรุปรายเดือน</>} pretitle="รายงาน">
            <div className="row align-items-center mb-3">
                <div className="col-auto ms-auto btn-list">
                    <select className="form-select" value={month} onChange={e => setMonth(e.target.value)}>
                        {monthOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                    </select>
                    <button className="btn btn-outline-secondary" onClick={() => window.print()}><i className="ti ti-printer me-1"></i>พิมพ์</button>
                    <button className="btn btn-primary"><i className="ti ti-file-type-pdf me-1"></i>PDF</button>
                </div>
            </div>

            {/* Print header */}
            <div className="card mb-3 d-print-block">
                <div className="card-body text-center">
                    <h2 className="mb-1">AUTOCAR SERVICE CENTER</h2>
                    <p className="text-muted mb-2">123 ถ.สุขุมวิท แขวงพระโขนง เขตคลองเตย กรุงเทพฯ 10110 | โทร. 02-123-4567</p>
                    <h3 className="text-primary">รายงานสรุปรายเดือน : {monthLabel}</h3>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row row-deck row-cards mb-3">
                {[
                    { label: 'รายได้รวม', value: s?.totalRevenue || 0, cls: 'bg-success-lt', avatarCls: 'bg-success', icon: 'ti-currency-baht' },
                    { label: 'ค่าใช้จ่าย', value: s?.expenseTotal || 0, cls: 'bg-danger-lt', avatarCls: 'bg-danger', icon: 'ti-shopping-cart' },
                    { label: 'กำไรสุทธิ', value: s?.netProfit || 0, cls: 'bg-primary-lt', avatarCls: 'bg-primary', icon: 'ti-plus-minus' },
                    { label: 'งานซ่อม', value: s?.totalJobs || 0, cls: 'bg-azure-lt', avatarCls: 'bg-azure', icon: 'ti-car', isNum: true },
                ].map((card, i) => (
                    <div key={i} className="col-sm-6 col-lg-3">
                        <div className={`card ${card.cls}`}>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <span className={`avatar ${card.avatarCls} me-3`}><i className={`ti ${card.icon}`}></i></span>
                                    <div>
                                        <div className="text-muted">{card.label}</div>
                                        <div className="h2 mb-0">{card.isNum ? `${card.value} คัน` : `฿${fmt(card.value)}`}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="row row-deck row-cards mb-3">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header"><h3 className="card-title">รายได้รายวัน</h3></div>
                        <div className="card-body">
                            <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 3 }}>
                                {(data?.dailyRows || []).map(row => {
                                    const h = data?.maxDayRevenue ? Math.max((row.total / data.maxDayRevenue) * 100, row.total > 0 ? 5 : 0) : 0
                                    const isWeekend = [0, 6].includes(new Date(row.date).getDay())
                                    return (
                                        <div key={row.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div
                                                title={`วันที่ ${row.day}: ฿${fmt(row.total)}`}
                                                style={{
                                                    width: '100%',
                                                    height: `${h}%`,
                                                    background: isWeekend ? 'linear-gradient(to top, #f59f00, #ffc078)' : 'linear-gradient(to top, #206bc4, #4dabf7)',
                                                    borderRadius: '4px 4px 0 0',
                                                    minHeight: row.total > 0 ? 4 : 0
                                                }}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="d-flex justify-content-between text-muted small mt-1">
                                <span>1</span><span>5</span><span>10</span><span>15</span><span>20</span><span>25</span>
                                <span>{(data?.dailyRows || []).length}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header"><h3 className="card-title">สัดส่วนรายได้</h3></div>
                        <div className="card-body">
                            {[
                                { label: 'ค่าบริการ', value: p?.serviceTotal || 0, cls: 'bg-primary' },
                                { label: 'ค่าอะไหล่', value: p?.partsTotal || 0, cls: 'bg-success' },
                                { label: 'ค่าแรง', value: p?.laborTotal || 0, cls: 'bg-warning' },
                            ].map((item, i) => (
                                <div key={i} className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span>{item.label}</span><span className="text-muted">{pct(item.value)}%</span>
                                    </div>
                                    <div className="progress progress-sm">
                                        <div className={`progress-bar ${item.cls}`} style={{ width: `${pct(item.value)}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Table */}
            <div className="card">
                <div className="card-header"><h3 className="card-title">รายละเอียดรายได้</h3></div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th>วันที่</th><th className="text-end">จำนวนงาน</th>
                                <th className="text-end">ค่าบริการ</th><th className="text-end">ค่าอะไหล่</th>
                                <th className="text-end">ค่าแรง</th><th className="text-end">รวม</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-4"><div className="spinner-border text-primary"></div></td></tr>
                            ) : (data?.dailyRows || []).filter(r => r.total > 0).map(row => (
                                <tr key={row.day}>
                                    <td>{new Date(row.date).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' })}</td>
                                    <td className="text-end">{row.jobCount}</td>
                                    <td className="text-end">฿{fmt(row.serviceRevenue)}</td>
                                    <td className="text-end">฿{fmt(row.partsRevenue)}</td>
                                    <td className="text-end">฿{fmt(row.laborRevenue)}</td>
                                    <td className="text-end fw-bold">฿{fmt(row.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                        {!loading && (
                            <tfoot className="bg-light">
                                <tr>
                                    <th>รวมทั้งเดือน</th>
                                    <th className="text-end">{s?.totalJobs || 0}</th>
                                    <th className="text-end">฿{fmt(p?.serviceTotal || 0)}</th>
                                    <th className="text-end">฿{fmt(p?.partsTotal || 0)}</th>
                                    <th className="text-end">฿{fmt(p?.laborTotal || 0)}</th>
                                    <th className="text-end h4 text-primary">฿{fmt(s?.totalRevenue || 0)}</th>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </MainLayout>
    )
}
