'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'

// --- Interfaces ---
interface ServiceJob {
    id: string
    jobNo: string
    jobDate: string
    status: string
    isPaid: boolean
    grandTotal: number
    totalCost: number
    laborCost: number
    partsCost: number
    vatAmount: number
    discount: number
    customerRequest: string | null
    mileage: number | null
    car: {
        licensePlate: string
        province: string | null
        carBrand: { nameEnglish: string; nameThai: string }
        carModel: { name: string }
    }
    customer: {
        fullName: string
        phone: string
    }
    items: {
        id: string
        description: string
        unitPrice: number
        quantity: number
        totalPrice: number
    }[]
}

const formatMoney = (amount: number | string) => {
    return Number(amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

export default function PendingPaymentPage() {
    const router = useRouter()
    const [pendingJobs, setPendingJobs] = useState<ServiceJob[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/ops/job?isPaid=false&limit=100')
            const json = await res.json()
            if (json.success) {
                setPendingJobs(json.data || [])
            } else {
                showError(json.error || 'โหลดข้อมูลไม่สำเร็จ')
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            showError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
        } finally {
            setLoading(false)
        }
    }

    const totalAmount = pendingJobs.reduce((sum, job) => sum + Number(job.grandTotal), 0)

    return (
        <MainLayout
            title={<><i className="ti ti-clock me-2"></i>รายการรอชำระเงิน</>}
            pretitle="แคชเชียร์"
        >
            {/* Summary Cards */}
            <div className="row row-deck row-cards mb-3">
                <div className="col-sm-4">
                    <div className="card bg-warning text-white">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <span className="avatar avatar-lg bg-white-lt me-3">
                                    <i className="ti ti-clock text-white"></i>
                                </span>
                                <div>
                                    <div className="h2 mb-0">{loading ? '-' : pendingJobs.length}</div>
                                    <div>รอชำระ (บิล)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-4">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <span className="avatar avatar-lg bg-white-lt me-3">
                                    <i className="ti ti-currency-baht text-white"></i>
                                </span>
                                <div>
                                    <div className="h2 mb-0">{loading ? '-' : `฿${formatMoney(totalAmount)}`}</div>
                                    <div>ยอดรอชำระรวม</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending List Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">รายการงานที่รอชำระเงิน</h3>
                </div>
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-vcenter card-table table-hover">
                            <thead>
                                <tr>
                                    <th>งาน</th>
                                    <th>ทะเบียน</th>
                                    <th>ลูกค้า</th>
                                    <th>โทรศัพท์</th>
                                    <th className="text-end">ยอดรวม</th>
                                    <th>สถานะ</th>
                                    <th className="text-end">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingJobs.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-5 text-muted">
                                            <i className="ti ti-check-circle" style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}></i>
                                            <h4 className="text-muted">ไม่มีงานรอชำระ</h4>
                                            <p className="text-muted mb-0">ยอดเยี่ยม! ลูกค้าทุกคนชำระเงินแล้ว</p>
                                        </td>
                                    </tr>
                                ) : (
                                    pendingJobs.map(job => (
                                        <tr key={job.id}>
                                            <td>
                                                <a href={`/ops/job/${job.id}`} className="fw-bold">{job.jobNo}</a>
                                                <div className="text-muted small">
                                                    {new Date(job.jobDate).toLocaleDateString('th-TH')}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-blue fs-5">{job.car.licensePlate}</span>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <i className="ti ti-user text-muted me-2"></i>
                                                    {job.customer.fullName}
                                                </div>
                                            </td>
                                            <td>
                                                <a href={`tel:${job.customer.phone}`}>{job.customer.phone}</a>
                                            </td>
                                            <td className="text-end fw-bold fs-4 text-primary">
                                                ฿{formatMoney(job.grandTotal)}
                                            </td>
                                            <td>
                                                <span className="badge bg-warning">รอชำระ</span>
                                            </td>
                                            <td className="text-end">
                                                <button 
                                                    className="btn btn-success"
                                                    onClick={() => router.push(`/cash/payment?jobId=${job.id}`)}
                                                >
                                                    <i className="ti ti-cash me-1"></i>รับชำระ
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </MainLayout>
    )
}
