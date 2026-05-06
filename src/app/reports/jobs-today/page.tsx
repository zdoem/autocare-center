'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'

const fmt = (v: number) => v.toLocaleString('th-TH', { minimumFractionDigits: 2 })

const STATUS_MAP: Record<string, { label: string; cls: string; icon: string }> = {
    RECEIVED: { label: 'รับรถ', cls: 'bg-blue', icon: 'ti-car' },
    INSPECTION: { label: 'ตรวจ', cls: 'bg-cyan', icon: 'ti-zoom-check' },
    WAITING_APPROVAL: { label: 'รออนุมัติ', cls: 'bg-yellow', icon: 'ti-clock' },
    APPROVED: { label: 'อนุมัติ', cls: 'bg-teal', icon: 'ti-check' },
    IN_PROGRESS: { label: 'กำลังซ่อม', cls: 'bg-azure', icon: 'ti-tool' },
    WAITING_PARTS: { label: 'รออะไหล่', cls: 'bg-orange', icon: 'ti-package' },
    QC_CHECK: { label: 'QC', cls: 'bg-purple', icon: 'ti-eye' },
    WAITING_PAYMENT: { label: 'รอชำระ', cls: 'bg-pink', icon: 'ti-cash' },
    COMPLETED: { label: 'เสร็จ', cls: 'bg-green', icon: 'ti-check' },
    DELIVERED: { label: 'ส่งคืน', cls: 'bg-success', icon: 'ti-car-garage' },
    CANCELLED: { label: 'ยกเลิก', cls: 'bg-secondary', icon: 'ti-x' },
}

interface Job {
    id: string; jobNo: string; licensePlate: string; carBrand: string; carModel: string
    customerName: string; description: string; technicianName: string
    status: string; jobDate: string; grandTotal: number
}

interface JobsData {
    date: string
    statusCounts: { total: number; pending: number; inProgress: number; completed: number }
    jobs: Job[]
}

export default function ReportJobsTodayPage() {
    const todayStr = new Date().toISOString().slice(0, 10)
    const [date, setDate] = useState(todayStr)
    const [data, setData] = useState<JobsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [date])

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/reports/jobs-today?date=${date}`)
            const json = await res.json()
            if (json.success) setData(json.data)
            else showError('โหลดข้อมูลไม่สำเร็จ')
        } catch { showError('เกิดข้อผิดพลาด') }
        finally { setLoading(false) }
    }

    const rowCls = (status: string) => {
        if (['COMPLETED', 'DELIVERED'].includes(status)) return 'bg-success-lt'
        return ''
    }

    const todayDisplay = new Date(date).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })
    const c = data?.statusCounts

    return (
        <MainLayout title={<><i className="ti ti-car me-2"></i>งานซ่อมวันนี้</>} pretitle="รายงาน">
            <div className="row align-items-center mb-3">
                <div className="col-auto ms-auto btn-list">
                    <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
                    <span className="badge bg-blue fs-5">{todayDisplay}</span>
                    <button className="btn btn-primary" onClick={fetchData}>
                        <i className="ti ti-refresh me-1"></i>รีเฟรช
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row row-deck row-cards mb-3">
                {[
                    { label: 'งานทั้งหมด', value: c?.total || 0, color: 'bg-blue', icon: 'ti-clipboard-list' },
                    { label: 'รอดำเนินการ', value: c?.pending || 0, color: 'bg-yellow', icon: 'ti-clock' },
                    { label: 'กำลังซ่อม', value: c?.inProgress || 0, color: 'bg-azure', icon: 'ti-tool' },
                    { label: 'เสร็จแล้ว', value: c?.completed || 0, color: 'bg-green', icon: 'ti-check' },
                ].map((card, i) => (
                    <div key={i} className="col-sm-6 col-lg-3">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <span className={`avatar ${card.color} me-3`}><i className={`ti ${card.icon}`}></i></span>
                                    <div>
                                        <div className="text-muted">{card.label}</div>
                                        <div className="h2 mb-0">{card.value}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Jobs Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">รายการงานซ่อมวันนี้</h3>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th>#</th><th>Job No.</th><th>ทะเบียน</th><th>ยี่ห้อ/รุ่น</th>
                                <th>ลูกค้า</th><th>งาน</th><th>ช่าง</th><th>สถานะ</th><th>เวลารับ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="text-center py-4"><div className="spinner-border text-primary"></div></td></tr>
                            ) : (data?.jobs || []).length === 0 ? (
                                <tr><td colSpan={9} className="text-center text-muted py-4">
                                    <i className="ti ti-car-off fs-1 d-block mb-2"></i>ไม่มีงานวันนี้
                                </td></tr>
                            ) : (data?.jobs || []).map((job, i) => {
                                const s = STATUS_MAP[job.status] || { label: job.status, cls: 'bg-secondary', icon: 'ti-circle' }
                                return (
                                    <tr key={job.id} className={rowCls(job.status)}>
                                        <td>{i + 1}</td>
                                        <td><span className="fw-bold text-primary">{job.jobNo}</span></td>
                                        <td><span className="badge bg-blue-lt">{job.licensePlate}</span></td>
                                        <td>{job.carBrand} {job.carModel}</td>
                                        <td>{job.customerName}</td>
                                        <td><span className="text-muted small">{job.description || '-'}</span></td>
                                        <td>{job.technicianName}</td>
                                        <td>
                                            <span className={`badge ${s.cls}`}>
                                                <i className={`ti ${s.icon} me-1`}></i>{s.label}
                                            </span>
                                        </td>
                                        <td>{new Date(job.jobDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </MainLayout>
    )
}
