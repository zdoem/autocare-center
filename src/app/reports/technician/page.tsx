'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'

const fmt = (v: number) => v.toLocaleString('th-TH', { minimumFractionDigits: 2 })

const AVATAR_COLORS = ['bg-green-lt', 'bg-azure-lt', 'bg-orange-lt', 'bg-pink-lt', 'bg-cyan-lt']
const RANK_BADGE = ['bg-warning', 'bg-secondary', 'bg-orange', 'bg-muted', 'bg-muted']

interface Technician {
    techId: string; name: string; position: string
    totalJobs: number; completedJobs: number; pendingJobs: number
    totalHours: number; totalLaborCost: number
    completionRate: number; avgHoursPerJob: number
}
interface TechData {
    month: string
    technicians: Technician[]
    overall: { totalJobs: number; completedJobs: number; pendingJobs: number; totalHours: number; totalLaborCost: number }
}

export default function ReportTechnicianPage() {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const [month, setMonth] = useState(currentMonth)
    const [data, setData] = useState<TechData | null>(null)
    const [loading, setLoading] = useState(true)

    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(); d.setMonth(d.getMonth() - i)
        return { val: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }) }
    })

    useEffect(() => { fetchData() }, [month])

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/reports/technician?month=${month}`)
            const json = await res.json()
            if (json.success) setData(json.data)
            else showError('โหลดข้อมูลไม่สำเร็จ')
        } catch { showError('เกิดข้อผิดพลาด') }
        finally { setLoading(false) }
    }

    const o = data?.overall

    return (
        <MainLayout title={<><i className="ti ti-user-check me-2"></i>รายงานผลงานช่าง</>} pretitle="รายงาน">
            <div className="row align-items-center mb-3">
                <div className="col-auto ms-auto btn-list">
                    <select className="form-select" value={month} onChange={e => setMonth(e.target.value)}>
                        {monthOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                    </select>
                    <button className="btn btn-primary"><i className="ti ti-file-export me-1"></i>Export</button>
                </div>
            </div>

            {/* Technician Cards */}
            {!loading && (data?.technicians || []).length > 0 && (
                <div className="row row-deck row-cards mb-3">
                    {(data?.technicians || []).map((tech, i) => (
                        <div key={tech.techId} className="col-md-6 col-lg-4">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center mb-3">
                                        <span className={`avatar avatar-lg ${AVATAR_COLORS[i % AVATAR_COLORS.length]} me-3`}>
                                            {tech.name.charAt(0)}
                                        </span>
                                        <div>
                                            <h3 className="mb-0">{tech.name}</h3>
                                            <div className="text-muted">{tech.position}</div>
                                        </div>
                                        <div className="ms-auto">
                                            <span className={`badge ${RANK_BADGE[i] || 'bg-muted'} fs-5`}>#{i + 1}</span>
                                        </div>
                                    </div>
                                    <div className="row text-center">
                                        <div className="col border-end"><div className="h2 mb-0">{tech.totalJobs}</div><small className="text-muted">งาน</small></div>
                                        <div className="col border-end"><div className="h2 mb-0">{tech.totalHours.toFixed(1)}</div><small className="text-muted">ชม.</small></div>
                                        <div className="col"><div className="h2 mb-0 text-success">฿{fmt(tech.totalLaborCost)}</div><small className="text-muted">ค่าแรง</small></div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>Completion Rate</span>
                                            <span className="text-green">{tech.completionRate}%</span>
                                        </div>
                                        <div className="progress progress-sm">
                                            <div className="progress-bar bg-green" style={{ width: `${tech.completionRate}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Table */}
            <div className="card">
                <div className="card-header"><h3 className="card-title">รายละเอียดผลงาน</h3></div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th>ช่าง</th><th className="text-center">งานรับ</th><th className="text-center">งานเสร็จ</th>
                                <th className="text-center">งานค้าง</th><th className="text-center">ชม.งาน</th>
                                <th className="text-center">เฉลี่ย/งาน</th><th className="text-center">Rate</th>
                                <th className="text-end">ค่าแรง</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="text-center py-4"><div className="spinner-border text-primary"></div></td></tr>
                            ) : (data?.technicians || []).length === 0 ? (
                                <tr><td colSpan={8} className="text-center text-muted py-4">ไม่มีข้อมูล</td></tr>
                            ) : (data?.technicians || []).map((tech, i) => (
                                <tr key={tech.techId}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <span className={`avatar avatar-sm ${AVATAR_COLORS[i % AVATAR_COLORS.length]} me-2`}>{tech.name.charAt(0)}</span>
                                            {tech.name}
                                        </div>
                                    </td>
                                    <td className="text-center">{tech.totalJobs}</td>
                                    <td className="text-center">{tech.completedJobs}</td>
                                    <td className="text-center"><span className={`badge ${tech.pendingJobs > 0 ? 'bg-yellow' : 'bg-success'}`}>{tech.pendingJobs}</span></td>
                                    <td className="text-center">{tech.totalHours.toFixed(1)}</td>
                                    <td className="text-center">{tech.avgHoursPerJob}</td>
                                    <td className="text-center"><span className={`badge ${tech.completionRate >= 95 ? 'bg-green' : tech.completionRate >= 80 ? 'bg-yellow' : 'bg-red'}`}>{tech.completionRate}%</span></td>
                                    <td className="text-end fw-bold">฿{fmt(tech.totalLaborCost)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-light">
                            <tr>
                                <th>รวม</th>
                                <th className="text-center">{o?.totalJobs || 0}</th>
                                <th className="text-center">{o?.completedJobs || 0}</th>
                                <th className="text-center">{o?.pendingJobs || 0}</th>
                                <th className="text-center">{(o?.totalHours || 0).toFixed(1)}</th>
                                <th className="text-center">-</th>
                                <th className="text-center">{o && o.totalJobs > 0 ? Math.round((o.completedJobs / o.totalJobs) * 100) : 0}%</th>
                                <th className="text-end h4 text-primary">฿{fmt(o?.totalLaborCost || 0)}</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </MainLayout>
    )
}
