/**
 * ไฟล์: app/service/jobs/page.tsx
 * จุดประสงค์: รายการงานซ่อมทั้งหมด (Service Job List)
 * - Card View แสดงงานแต่ละรายการ
 * - Filter ตามสถานะ (tabs)
 * - ค้นหาด้วย Job No / ทะเบียน / ชื่อลูกค้า
 * - คลิก card → ไปหน้า /ops/job/[id]
 * 
 * Ref: svc-job-list.html mockup
 * 
 * @author AutoCare Team
 * @created 2026-02-15
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'
import Swal from 'sweetalert2'

// --- Interfaces ---
interface ServiceJob {
    id: string
    jobNo: string
    jobDate: string
    status: string
    priority: string
    customerRequest: string | null
    mileage: number | null
    isPaid: boolean
    grandTotal: number
    laborCost: number
    partsCost: number
    totalCost: number
    car: {
        licensePlate: string
        province: string | null
        carBrand: { nameEnglish: string; nameThai: string }
        carModel: { name: string }
    }
    customer: {
        fullName: string
        firstName: string
        phone: string
    }
    technician: {
        firstName: string
        lastName: string
    } | null
    createdAt: string
}

// --- Status Config ---
const STATUS_TABS = [
    { key: 'all', label: 'ทั้งหมด', color: 'secondary', icon: 'ti-list', statuses: [] as string[] },
    { key: 'received', label: 'รอรับรถ', color: 'yellow', icon: 'ti-clock', statuses: ['RECEIVED', 'APPROVED'] },
    { key: 'in_progress', label: 'กำลังซ่อม', color: 'blue', icon: 'ti-tool', statuses: ['IN_PROGRESS', 'INSPECTION', 'WAITING_PARTS', 'QC_CHECK'] },
    { key: 'waiting_payment', label: 'รอชำระ', color: 'orange', icon: 'ti-cash', statuses: ['WAITING_PAYMENT'] },
    { key: 'completed', label: 'เสร็จแล้ว', color: 'green', icon: 'ti-check', statuses: ['COMPLETED', 'DELIVERED'] },
]

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
    RECEIVED: { label: 'รอรับรถ', color: 'yellow', icon: 'ti-clock' },
    INSPECTION: { label: 'ตรวจเช็ค', color: 'cyan', icon: 'ti-search' },
    WAITING_APPROVAL: { label: 'รออนุมัติ', color: 'purple', icon: 'ti-hourglass' },
    APPROVED: { label: 'อนุมัติแล้ว', color: 'indigo', icon: 'ti-check' },
    IN_PROGRESS: { label: 'กำลังซ่อม', color: 'blue', icon: 'ti-tool' },
    WAITING_PARTS: { label: 'รออะไหล่', color: 'pink', icon: 'ti-package' },
    QC_CHECK: { label: 'QC', color: 'teal', icon: 'ti-shield-check' },
    WAITING_PAYMENT: { label: 'รอชำระเงิน', color: 'orange', icon: 'ti-cash' },
    COMPLETED: { label: 'เสร็จแล้ว', color: 'green', icon: 'ti-check' },
    DELIVERED: { label: 'ส่งมอบแล้ว', color: 'lime', icon: 'ti-car' },
    CANCELLED: { label: 'ยกเลิก', color: 'red', icon: 'ti-x' },
}

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
    LOW: { label: 'ต่ำ', color: 'secondary' },
    NORMAL: { label: 'ปกติ', color: 'primary' },
    HIGH: { label: 'สูง', color: 'warning' },
    URGENT: { label: 'ด่วน', color: 'danger' },
}

// --- Helper ---
const formatDateThai = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

const formatTimeThai = (dateString: string) => {
    return formatDateThai(dateString)
}

// --- Page Component ---
export default function ServiceJobsPage() {
    const router = useRouter()
    const [jobs, setJobs] = useState<ServiceJob[]>([])
    const [loading, setLoading] = useState(true)
    const [searchText, setSearchText] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})

    // Pagination
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    useEffect(() => {
        fetchJobs()
    }, [activeTab, page, searchText])

    useEffect(() => {
        fetchStatusCounts()
    }, [])

    const fetchStatusCounts = async () => {
        try {
            const res = await fetch('/api/ops/job?limit=999')
            const json = await res.json()
            if (json.success && json.data) {
                const counts: Record<string, number> = { all: json.total || json.data.length }
                
                STATUS_TABS.forEach(tab => {
                    if (tab.key !== 'all') counts[tab.key] = 0;
                });

                json.data.forEach((job: ServiceJob) => {
                    STATUS_TABS.forEach(tab => {
                        if (tab.statuses.includes(job.status)) {
                            counts[tab.key] = (counts[tab.key] || 0) + 1;
                        }
                    })
                })
                setStatusCounts(counts)
            }
        } catch (error) {
            console.error('Error fetching status counts:', error)
        }
    }

    const fetchJobs = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
            })

            if (activeTab !== 'all') {
                const tab = STATUS_TABS.find(t => t.key === activeTab);
                if (tab && tab.statuses.length > 0) {
                    params.set('status', tab.statuses.join(','));
                } else {
                    params.set('status', activeTab);
                }
            }
            if (searchText.trim()) {
                params.set('search', searchText.trim())
            }

            const res = await fetch(`/api/ops/job?${params}`)
            const json = await res.json()

            if (json.success) {
                setJobs(json.data || [])
                setTotal(json.total || 0)
                setTotalPages(json.totalPages || 1)
            }
        } catch (error) {
            console.error('Error fetching jobs:', error)
            showError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
        } finally {
            setLoading(false)
        }
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        setPage(1)
    }

    const handleCancelJob = async (jobId: string) => {
        const result = await Swal.fire({
            title: 'ยืนยันการยกเลิก?',
            text: "คุณต้องการยกเลิกงานนี้ใช่หรือไม่",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ยกเลิกงาน',
            cancelButtonText: 'ปิด'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/ops/job/${jobId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'CANCELLED' })
                });
                
                const json = await res.json();
                if (json.success) {
                    Swal.fire('ยกเลิกสำเร็จ!', 'งานถูกยกเลิกแล้ว', 'success');
                    fetchJobs();
                    fetchStatusCounts();
                } else {
                    showError(json.error || 'ไม่สามารถยกเลิกได้');
                }
            } catch (error) {
                console.error('Error cancelling job:', error);
                showError('เกิดข้อผิดพลาดในการยกเลิก');
            }
        }
    }

    const getStatusInfo = (status: string) => {
        return STATUS_MAP[status] || { label: status, color: 'secondary', icon: 'ti-help' }
    }

    const getPriorityInfo = (priority: string) => {
        return PRIORITY_MAP[priority] || { label: priority, color: 'secondary' }
    }

    const getCardStatusColor = (status: string) => {
        return STATUS_MAP[status]?.color || 'secondary'
    }

    const getActionButton = (job: ServiceJob) => {
        switch (job.status) {
            case 'RECEIVED':
            case 'APPROVED':
                return (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/ops/job/${job.id}`)
                        }}
                    >
                        <i className="ti ti-player-play me-1"></i>เริ่มงาน
                    </button>
                )
            case 'IN_PROGRESS':
            case 'INSPECTION':
            case 'WAITING_PARTS':
            case 'QC_CHECK':
                return (
                    <button
                        className="btn btn-success btn-sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/ops/job/${job.id}`)
                        }}
                    >
                        <i className="ti ti-check me-1"></i>เสร็จสิ้น
                    </button>
                )
            case 'WAITING_PAYMENT':
                return (
                    <button
                        className="btn btn-orange btn-sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/cash/payment?jobId=${job.id}`)
                        }}
                    >
                        <i className="ti ti-cash me-1"></i>รับชำระ
                    </button>
                )
            case 'COMPLETED':
            case 'DELIVERED':
                return (
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            window.open(`/ops/job/print/${job.id}?type=receipt`, '_blank')
                        }}
                    >
                        <i className="ti ti-receipt me-1"></i>ใบเสร็จ
                    </button>
                )
            default:
                return (
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/ops/job/${job.id}`)
                        }}
                    >
                        <i className="ti ti-eye me-1"></i>ดู
                    </button>
                )
        }
    }

    const getFooterStatusText = (job: ServiceJob) => {
        switch (job.status) {
            case 'WAITING_PAYMENT':
                return <><i className="ti ti-phone me-1"></i>แจ้งลูกค้าแล้ว</>
            case 'COMPLETED':
            case 'DELIVERED':
                return <><i className="ti ti-check me-1"></i>{job.isPaid ? 'ชำระแล้ว' : 'รอชำระ'}</>
            case 'IN_PROGRESS':
            case 'INSPECTION':
            case 'WAITING_PARTS':
            case 'QC_CHECK':
                return <><i className="ti ti-tool me-1"></i>กำลังดำเนินการ</>
            default:
                return <><i className="ti ti-calendar me-1"></i>{formatTimeThai(job.jobDate)}</>
        }
    }

    return (
        <MainLayout
            title={<><i className="ti ti-clipboard-list me-2"></i>รายการงานซ่อม</>}
            pretitle="บริการ"
            actions={
                <button className="btn btn-primary" onClick={() => router.push('/ops/receive')}>
                    <i className="ti ti-plus me-1"></i>รับรถใหม่
                </button>
            }
        >
            <div className="container-xl">
                {/* Status Tabs + Search */}
                <div className="card mb-3">
                    <div className="card-body">
                        <div className="row g-3 align-items-center">
                            <div className="col-auto">
                                <div className="btn-group" role="group">
                                    {STATUS_TABS.map((tab) => (
                                        <button
                                            key={tab.key}
                                            type="button"
                                            className={`btn ${activeTab === tab.key
                                                ? `btn-${tab.color}`
                                                : 'btn-outline-secondary'
                                                }`}
                                            onClick={() => handleTabChange(tab.key)}
                                        >
                                            {tab.label}
                                            {statusCounts[tab.key] !== undefined && (
                                                <span className={`badge ${activeTab === tab.key
                                                    ? 'bg-white text-dark'
                                                    : 'bg-secondary'
                                                    } ms-1`}>
                                                    {statusCounts[tab.key] || 0}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="col-auto ms-auto">
                                <div className="input-icon">
                                    <span className="input-icon-addon">
                                        <i className="ti ti-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="ค้นหา Job No, ทะเบียน, ลูกค้า..."
                                        value={searchText}
                                        onChange={(e) => {
                                            setSearchText(e.target.value)
                                            setPage(1)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">กำลังโหลด...</span>
                        </div>
                        <div className="mt-3 text-muted">กำลังโหลดข้อมูล...</div>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <div className="mb-3">
                                <i className="ti ti-file-off" style={{ fontSize: '48px', color: '#999' }}></i>
                            </div>
                            <h3 className="text-muted">ไม่พบงานซ่อม</h3>
                            <p className="text-muted">
                                {activeTab !== 'all'
                                    ? `ไม่มีงานในสถานะ "${STATUS_MAP[activeTab]?.label || activeTab}"`
                                    : 'ยังไม่มีงานซ่อมในระบบ'}
                            </p>
                            <button className="btn btn-primary" onClick={() => router.push('/ops/receive')}>
                                <i className="ti ti-plus me-1"></i>รับรถใหม่
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Job Cards */}
                        <div className="row row-cards">
                            {jobs.map((job) => {
                                const statusInfo = getStatusInfo(job.status)
                                const priorityInfo = getPriorityInfo(job.priority)

                                return (
                                    <div key={job.id} className="col-md-6 col-lg-4">
                                        <div
                                            className="card"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => router.push(`/ops/job/${job.id}`)}
                                        >
                                            <div className={`card-status-start bg-${statusInfo.color}`}></div>
                                            <div className="card-body">
                                                {/* Header: Status Badge + Job No + Menu */}
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div>
                                                        <span className={`badge bg-${statusInfo.color} mb-2`}>
                                                            <i className={`ti ${statusInfo.icon} me-1`}></i>
                                                            {statusInfo.label}
                                                        </span>
                                                        {job.priority !== 'NORMAL' && (
                                                            <span className={`badge bg-${priorityInfo.color} ms-1 mb-2`}>
                                                                {priorityInfo.label}
                                                            </span>
                                                        )}
                                                        <h3 className="mb-0">{job.jobNo}</h3>
                                                    </div>
                                                    <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                                                        <button className="btn btn-ghost-secondary btn-icon" data-bs-toggle="dropdown">
                                                            <i className="ti ti-dots-vertical"></i>
                                                        </button>
                                                        <div className="dropdown-menu dropdown-menu-end">
                                                            <a className="dropdown-item" href="#" onClick={(e) => {
                                                                e.preventDefault()
                                                                router.push(`/ops/job/${job.id}`)
                                                            }}>
                                                                <i className="ti ti-eye me-2"></i>ดูรายละเอียด
                                                            </a>
                                                            
                                                            {(job.status === 'RECEIVED' || job.status === 'APPROVED') && (
                                                                <>
                                                                    <a className="dropdown-item" href="#" onClick={(e) => {
                                                                        e.preventDefault()
                                                                        window.open(`/ops/job/print/${job.id}?type=job-order`, '_blank')
                                                                    }}>
                                                                        <i className="ti ti-printer me-2"></i>พิมพ์ใบงาน
                                                                    </a>
                                                                    <div className="dropdown-divider"></div>
                                                                    <a className="dropdown-item text-danger" href="#" onClick={(e) => {
                                                                        e.preventDefault()
                                                                        handleCancelJob(job.id)
                                                                    }}>
                                                                        <i className="ti ti-x me-2"></i>ยกเลิก
                                                                    </a>
                                                                </>
                                                            )}

                                                            {(job.status === 'IN_PROGRESS' || job.status === 'WAITING_PARTS' || job.status === 'INSPECTION' || job.status === 'QC_CHECK') && (
                                                                <a className="dropdown-item" href="#" onClick={(e) => {
                                                                    e.preventDefault()
                                                                    router.push(`/ops/job/${job.id}/parts`)
                                                                }}>
                                                                    <i className="ti ti-package me-2"></i>เบิกอะไหล่
                                                                </a>
                                                            )}

                                                            {job.status === 'WAITING_PAYMENT' && (
                                                                <>
                                                                    <a className="dropdown-item" href="#" onClick={(e) => {
                                                                        e.preventDefault()
                                                                        router.push(`/cash/payment?jobId=${job.id}`)
                                                                    }}>
                                                                        <i className="ti ti-cash me-2"></i>รับชำระ
                                                                    </a>
                                                                    <a className="dropdown-item" href="#" onClick={(e) => {
                                                                        e.preventDefault()
                                                                        window.open(`/ops/job/print/${job.id}?type=quotation`, '_blank')
                                                                    }}>
                                                                        <i className="ti ti-printer me-2"></i>พิมพ์ใบเสนอราคา
                                                                    </a>
                                                                </>
                                                            )}

                                                            {(job.status === 'COMPLETED' || job.status === 'DELIVERED') && (
                                                                <a className="dropdown-item" href="#" onClick={(e) => {
                                                                    e.preventDefault()
                                                                    window.open(`/ops/job/print/${job.id}?type=receipt`, '_blank')
                                                                }}>
                                                                    <i className="ti ti-receipt me-2"></i>ใบเสร็จ
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Info Grid */}
                                                <div className="datagrid">
                                                    <div className="datagrid-item">
                                                        <div className="datagrid-title">ทะเบียน</div>
                                                        <div className="datagrid-content">
                                                            <span className="badge bg-blue-lt">
                                                                {job.car.licensePlate}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="datagrid-item">
                                                        <div className="datagrid-title">รถ</div>
                                                        <div className="datagrid-content">
                                                            {job.car.carBrand.nameThai || job.car.carBrand.nameEnglish} {job.car.carModel.name}
                                                        </div>
                                                    </div>
                                                    <div className="datagrid-item">
                                                        <div className="datagrid-title">ลูกค้า</div>
                                                        <div className="datagrid-content">
                                                            {job.customer.fullName}
                                                        </div>
                                                    </div>
                                                    <div className="datagrid-item">
                                                        <div className="datagrid-title">
                                                            {job.customerRequest ? 'งาน' : 'เลขไมล์'}
                                                        </div>
                                                        <div className="datagrid-content text-truncate" style={{ maxWidth: '150px' }}>
                                                            {job.customerRequest || (job.mileage ? `${job.mileage.toLocaleString()} km` : '-')}
                                                        </div>
                                                    </div>
                                                    {job.technician && job.technician.firstName && (
                                                        <div className="datagrid-item">
                                                            <div className="datagrid-title">ช่าง</div>
                                                            <div className="datagrid-content">
                                                                <span className="avatar avatar-xs bg-green-lt me-1">
                                                                    {job.technician.firstName.charAt(0)}
                                                                </span>
                                                                {job.technician.firstName}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {(job.status === 'WAITING_PAYMENT' || job.status === 'COMPLETED' || job.status === 'DELIVERED') && (
                                                        <div className="datagrid-item">
                                                            <div className="datagrid-title">ยอดรวม</div>
                                                            <div className={`datagrid-content fw-bold ${job.isPaid ? 'text-success' : 'text-primary'}`}>
                                                                ฿{Number(job.grandTotal).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <hr />

                                                {/* Footer: Date + Action */}
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="text-muted small">
                                                        {getFooterStatusText(job)}
                                                    </div>
                                                    {getActionButton(job)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="card mt-3">
                                <div className="card-footer d-flex align-items-center">
                                    <p className="m-0 text-muted">
                                        แสดง <span>{((page - 1) * 12) + 1}</span> ถึง <span>{Math.min(page * 12, total)}</span> จาก <span>{total}</span> งาน
                                    </p>
                                    <ul className="pagination m-0 ms-auto">
                                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>
                                                <i className="ti ti-chevron-left"></i>
                                                ก่อนหน้า
                                            </button>
                                        </li>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <li key={i + 1} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => setPage(i + 1)}>
                                                    {i + 1}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                                                ถัดไป
                                                <i className="ti ti-chevron-right"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    )
}
