'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'

const fmt = (v: number) => v.toLocaleString('th-TH', { minimumFractionDigits: 2 })

interface ServiceData {
    month: string
    summary: { totalJobs: number; serviceRevenue: number; partsRevenue: number; laborRevenue: number; totalRevenue: number }
    services: { name: string; count: number; serviceRev: number; total: number }[]
    maxCount: number
}

export default function ReportServicePage() {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const [month, setMonth] = useState(currentMonth)
    const [data, setData] = useState<ServiceData | null>(null)
    const [loading, setLoading] = useState(true)

    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(); d.setMonth(d.getMonth() - i)
        return { val: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }) }
    })

    useEffect(() => { fetchData() }, [month])

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/reports/service?month=${month}`)
            const json = await res.json()
            if (json.success) setData(json.data)
            else showError('โหลดข้อมูลไม่สำเร็จ')
        } catch { showError('เกิดข้อผิดพลาด') }
        finally { setLoading(false) }
    }

    const s = data?.summary

    return (
        <MainLayout title={<><i className="ti ti-chart-bar me-2"></i>รายงานสรุปบริการ</>} pretitle="รายงาน">
            <div className="row align-items-center mb-3">
                <div className="col-auto ms-auto btn-list">
                    <select className="form-select" value={month} onChange={e => setMonth(e.target.value)}>
                        {monthOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                    </select>
                    <button className="btn btn-primary"><i className="ti ti-file-export me-1"></i>Export</button>
                </div>
            </div>

            <div className="row mb-3">
                {/* Top Services Progress */}
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header"><h3 className="card-title">บริการยอดนิยม (Top 10)</h3></div>
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-3"><div className="spinner-border text-primary"></div></div>
                            ) : (data?.services || []).length === 0 ? (
                                <div className="text-center text-muted py-3">ไม่มีข้อมูล</div>
                            ) : (data?.services || []).map((svc, i) => {
                                const width = data?.maxCount ? Math.round((svc.count / data.maxCount) * 100) : 0
                                return (
                                    <div key={i} className="mb-3">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>{svc.name}</span>
                                            <span className="fw-bold">{svc.count} ครั้ง</span>
                                        </div>
                                        <div className="progress"><div className="progress-bar bg-primary" style={{ width: `${width}%` }}></div></div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
                {/* Summary Datagrid */}
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header"><h3 className="card-title">สรุปภาพรวม</h3></div>
                        <div className="card-body">
                            <div className="datagrid">
                                <div className="datagrid-item"><div className="datagrid-title">จำนวนงานทั้งหมด</div><div className="datagrid-content h2">{s?.totalJobs || 0}</div></div>
                                <div className="datagrid-item"><div className="datagrid-title">รายได้ค่าบริการ</div><div className="datagrid-content h4 text-success">฿{fmt(s?.serviceRevenue || 0)}</div></div>
                                <div className="datagrid-item"><div className="datagrid-title">รายได้ค่าอะไหล่</div><div className="datagrid-content h4 text-success">฿{fmt(s?.partsRevenue || 0)}</div></div>
                                <div className="datagrid-item"><div className="datagrid-title">รายได้ค่าแรง</div><div className="datagrid-content h4 text-success">฿{fmt(s?.laborRevenue || 0)}</div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Table */}
            <div className="card">
                <div className="card-header"><h3 className="card-title">รายละเอียดบริการ</h3></div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th>#</th><th>ประเภทบริการ</th><th className="text-center">จำนวน</th>
                                <th className="text-end">รายได้บริการ</th><th className="text-end">รวม</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-4"><div className="spinner-border text-primary"></div></td></tr>
                            ) : (data?.services || []).map((svc, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td>{svc.name}</td>
                                    <td className="text-center">{svc.count}</td>
                                    <td className="text-end">฿{fmt(svc.serviceRev)}</td>
                                    <td className="text-end fw-bold">฿{fmt(svc.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-light">
                            <tr>
                                <th colSpan={2}>รวมทั้งหมด</th>
                                <th className="text-center">{s?.totalJobs || 0}</th>
                                <th className="text-end">฿{fmt(s?.serviceRevenue || 0)}</th>
                                <th className="text-end h4 text-primary">฿{fmt(s?.totalRevenue || 0)}</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </MainLayout>
    )
}
