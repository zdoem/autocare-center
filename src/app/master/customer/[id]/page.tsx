/**
 * ไฟล์: app/master/customer/[id]/page.tsx
 * จุดประสงค์: หน้าแสดงรายละเอียดลูกค้า (Customer Detail)
 * 
 * Features:
 * - Header card: avatar, ชื่อ, ประเภทลูกค้า, สถิติ
 * - ข้อมูลติดต่อ: โทร, Email, LINE, ที่อยู่, เลขภาษี
 * - Tab: รายการรถ / ประวัติการซ่อม 10 รายการล่าสุด
 * - ปุ่ม Back / Edit ผ่าน actions prop ของ MainLayout
 * 
 * @author AutoCare Team
 * @created 2026-08-15
 */

'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'

// ─── TypeScript Interfaces ────────────────────────────────────────────
interface CustomerType {
    id: string
    name: string
    discount: number
}

interface CarBrand {
    id: string
    nameEnglish: string
    nameThai: string
}

interface CarModel {
    id: string
    name: string
}

interface Car {
    id: string
    code: string
    licensePlate: string
    province: string | null
    carBrand: CarBrand
    carModel: CarModel
    year: number | null
    color: string | null
    mileage: number | null
    isActive: boolean
    updatedAt: string
}

interface ServiceJob {
    id: string
    jobNo: string
    jobDate: string
    status: string
    car: {
        licensePlate: string
        carBrand: CarBrand
        carModel: CarModel
    }
    technician: { id: string; name: string } | null
    grandTotal: number
    isPaid: boolean
    description: string | null
}

interface CustomerDetail {
    id: string
    code: string
    firstName: string
    lastName: string
    fullName: string
    phone: string
    email: string | null
    lineId: string | null
    address: string | null
    taxId: string | null
    customerType: CustomerType
    isActive: boolean
    createdAt: string
    updatedAt: string
    cars: Car[]
    serviceJobs: ServiceJob[]
    _count: { cars: number; serviceJobs: number }
}

// ─── Helpers ──────────────────────────────────────────────────────────
const avatarColors = [
    'bg-blue-lt', 'bg-pink-lt', 'bg-green-lt',
    'bg-orange-lt', 'bg-cyan-lt', 'bg-purple-lt'
]
const getAvatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length]
const getFirstLetter = (name: string) => name.charAt(0)

const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('th-TH', { year: '2-digit', month: '2-digit', day: '2-digit' })
}

const formatNumber = (n: number | null | undefined) => {
    if (n === null || n === undefined) return '-'
    return n.toLocaleString('th-TH')
}

const jobStatusLabel: Record<string, { label: string; color: string }> = {
    RECEIVED:         { label: 'รับรถเข้า',  color: 'bg-blue-lt text-blue' },
    INSPECTION:       { label: 'ตรวจเช็ค',   color: 'bg-cyan-lt text-cyan' },
    WAITING_APPROVAL: { label: 'รออนุมัติ',  color: 'bg-yellow-lt text-yellow' },
    APPROVED:         { label: 'อนุมัติแล้ว', color: 'bg-teal-lt text-teal' },
    IN_PROGRESS:      { label: 'กำลังซ่อม',  color: 'bg-orange-lt text-orange' },
    WAITING_PARTS:    { label: 'รออะไหล่',   color: 'bg-red-lt text-red' },
    QC_CHECK:         { label: 'QC',          color: 'bg-purple-lt text-purple' },
    WAITING_PAYMENT:  { label: 'รอชำระ',     color: 'bg-pink-lt text-pink' },
    COMPLETED:        { label: 'เสร็จสิ้น',   color: 'bg-green-lt text-green' },
    DELIVERED:        { label: 'ส่งมอบแล้ว',  color: 'bg-lime-lt text-lime' },
    CANCELLED:        { label: 'ยกเลิก',      color: 'bg-secondary text-muted' },
}

const customerTypeBadgeColor: Record<string, string> = {
    'VIP':       'bg-warning',
    'นิติบุคคล': 'bg-info',
}

// ─── Component ────────────────────────────────────────────────────────
export default function CustomerDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params)
    const router = useRouter()

    const [customer, setCustomer] = useState<CustomerDetail | null>(null)
    const [loading, setLoading]   = useState(true)
    const [activeTab, setActiveTab] = useState<'cars' | 'jobs'>('cars')

    // ── Fetch Data ────────────────────────────────────────────────────
    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                setLoading(true)
                const res  = await fetch(`/api/master/customer/${params.id}`)
                const json = await res.json()
                if (json.success) {
                    setCustomer(json.data)
                } else {
                    showError(json.error || 'ไม่พบข้อมูลลูกค้า')
                    router.push('/master/customer')
                }
            } catch {
                showError('ไม่สามารถโหลดข้อมูลได้')
                router.push('/master/customer')
            } finally {
                setLoading(false)
            }
        }
        fetchCustomer()
    }, [params.id, router])

    // ── Derived values ────────────────────────────────────────────────
    const typeBadgeColor = customer
        ? (customerTypeBadgeColor[customer.customerType?.name] || 'bg-secondary')
        : 'bg-secondary'

    // ── Actions for PageHeader ────────────────────────────────────────
    const actions = customer ? (
        <div className="d-flex gap-2">
            <button
                id="btn-back-customer"
                className="btn btn-outline-secondary"
                onClick={() => router.push('/master/customer')}
            >
                <i className="ti ti-arrow-left me-1" />
                กลับ
            </button>
            <button
                id="btn-edit-customer"
                className="btn btn-primary"
                onClick={() => router.push(`/master/customer?edit=${customer.id}`)}
            >
                <i className="ti ti-edit me-1" />
                แก้ไข
            </button>
        </div>
    ) : undefined

    // ── Render ────────────────────────────────────────────────────────
    return (
        <MainLayout
            title={
                loading ? 'กำลังโหลด...' : (
                    <><i className="ti ti-user-circle me-2" />รายละเอียดลูกค้า</>
                )
            }
            pretitle="Master Data / ลูกค้า"
            actions={actions}
        >
            {/* Loading State */}
            {loading && (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status" />
                        <div className="text-muted">กำลังโหลดข้อมูล...</div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {!loading && customer && (
                <div className="row g-4">

                    {/* ── Left Column: Profile Card ───────────── */}
                    <div className="col-lg-4">

                        {/* Profile Card */}
                        <div className="card mb-4">
                            <div className="card-body text-center py-4">
                                <span
                                    className={`avatar avatar-xl mb-3 ${getAvatarColor(customer.fullName)}`}
                                    style={{ fontSize: '2rem' }}
                                >
                                    {getFirstLetter(customer.fullName)}
                                </span>
                                <h3 className="mb-1">{customer.fullName}</h3>
                                <div className="mb-2">
                                    <span className={`badge ${typeBadgeColor}`}>
                                        {customer.customerType?.name}
                                    </span>
                                    {!customer.isActive && (
                                        <span className="badge bg-danger ms-1">ไม่ใช้งาน</span>
                                    )}
                                </div>
                                <code className="text-muted">{customer.code}</code>
                            </div>

                            {/* Stats Row */}
                            <div className="card-footer p-0">
                                <div className="row g-0 text-center">
                                    <div className="col-6 border-end py-3">
                                        <div className="h3 mb-0">{customer._count.cars}</div>
                                        <div className="text-muted small">รถที่ลงทะเบียน</div>
                                    </div>
                                    <div className="col-6 py-3">
                                        <div className="h3 mb-0">{customer._count.serviceJobs}</div>
                                        <div className="text-muted small">ประวัติซ่อม</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info Card */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">
                                    <i className="ti ti-address-book me-2 text-primary" />
                                    ข้อมูลติดต่อ
                                </h3>
                            </div>
                            <div className="card-body">
                                <ul className="list-unstyled mb-0">
                                    <li className="d-flex align-items-start mb-3">
                                        <i className="ti ti-phone me-3 mt-1 text-muted" />
                                        <div>
                                            <div className="text-muted small mb-0">โทรศัพท์</div>
                                            <a href={`tel:${customer.phone}`} className="fw-medium">
                                                {customer.phone}
                                            </a>
                                        </div>
                                    </li>
                                    <li className="d-flex align-items-start mb-3">
                                        <i className="ti ti-mail me-3 mt-1 text-muted" />
                                        <div>
                                            <div className="text-muted small mb-0">Email</div>
                                            {customer.email
                                                ? <a href={`mailto:${customer.email}`} className="fw-medium">{customer.email}</a>
                                                : <span className="text-muted">-</span>
                                            }
                                        </div>
                                    </li>
                                    <li className="d-flex align-items-start mb-3">
                                        <i className="ti ti-brand-line me-3 mt-1" style={{ color: '#06C755' }} />
                                        <div>
                                            <div className="text-muted small mb-0">LINE ID</div>
                                            <span className="fw-medium">{customer.lineId || '-'}</span>
                                        </div>
                                    </li>
                                    {customer.taxId && (
                                        <li className="d-flex align-items-start mb-3">
                                            <i className="ti ti-file-invoice me-3 mt-1 text-muted" />
                                            <div>
                                                <div className="text-muted small mb-0">เลขผู้เสียภาษี</div>
                                                <span className="fw-medium">{customer.taxId}</span>
                                            </div>
                                        </li>
                                    )}
                                    {customer.address && (
                                        <li className="d-flex align-items-start mb-3">
                                            <i className="ti ti-map-pin me-3 mt-1 text-muted" />
                                            <div>
                                                <div className="text-muted small mb-0">ที่อยู่</div>
                                                <span className="fw-medium">{customer.address}</span>
                                            </div>
                                        </li>
                                    )}
                                    {Number(customer.customerType?.discount) > 0 && (
                                        <li className="d-flex align-items-start">
                                            <i className="ti ti-discount me-3 mt-1 text-warning" />
                                            <div>
                                                <div className="text-muted small mb-0">ส่วนลด</div>
                                                <span className="fw-medium text-warning">
                                                    {Number(customer.customerType.discount)}%
                                                </span>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            </div>
                            <div className="card-footer text-muted small">
                                <div className="d-flex justify-content-between">
                                    <span>สมัครวันที่: {formatDate(customer.createdAt)}</span>
                                    <span>อัพเดท: {formatDate(customer.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column: Cars + Jobs ───────────── */}
                    <div className="col-lg-8">
                        {/* Tab Navigation */}
                        <ul className="nav nav-tabs mb-3">
                            <li className="nav-item">
                                <button
                                    id="tab-cars"
                                    className={`nav-link ${activeTab === 'cars' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('cars')}
                                >
                                    <i className="ti ti-car me-1" />
                                    รถที่ลงทะเบียน
                                    <span className="badge bg-primary ms-2">{customer._count.cars}</span>
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    id="tab-jobs"
                                    className={`nav-link ${activeTab === 'jobs' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('jobs')}
                                >
                                    <i className="ti ti-tools me-1" />
                                    ประวัติการซ่อม
                                    <span className="badge bg-primary ms-2">{customer._count.serviceJobs}</span>
                                </button>
                            </li>
                        </ul>

                        {/* Tab: Cars */}
                        {activeTab === 'cars' && (
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">รายการรถของลูกค้า</h3>
                                    <div className="card-actions">
                                        <button
                                            id="btn-add-car"
                                            className="btn btn-sm btn-primary"
                                            onClick={() => router.push('/master/car')}
                                        >
                                            <i className="ti ti-plus me-1" />
                                            เพิ่มรถ
                                        </button>
                                    </div>
                                </div>
                                {customer.cars.length === 0 ? (
                                    <div className="card-body text-center py-5">
                                        <i className="ti ti-car-off text-muted mb-3" style={{ fontSize: '3rem' }} />
                                        <p className="text-muted">ยังไม่มีรถที่ลงทะเบียนในระบบ</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-vcenter card-table">
                                            <thead>
                                                <tr>
                                                    <th>ทะเบียน</th>
                                                    <th>ยี่ห้อ / รุ่น</th>
                                                    <th>ปี</th>
                                                    <th>สี</th>
                                                    <th>ไมล์ล่าสุด</th>
                                                    <th>อัพเดท</th>
                                                    <th />
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customer.cars.map(car => (
                                                    <tr key={car.id}>
                                                        <td>
                                                            <span className="fw-bold text-primary">{car.licensePlate}</span>
                                                            {car.province && (
                                                                <div className="text-muted small">{car.province}</div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="fw-medium">{car.carBrand?.nameEnglish}</div>
                                                            <div className="text-muted small">{car.carModel?.name}</div>
                                                        </td>
                                                        <td>{car.year || '-'}</td>
                                                        <td>
                                                            {car.color
                                                                ? <span className="badge bg-secondary-lt">{car.color}</span>
                                                                : '-'
                                                            }
                                                        </td>
                                                        <td>{car.mileage !== null ? `${formatNumber(car.mileage)} กม.` : '-'}</td>
                                                        <td className="text-muted small">{formatDate(car.updatedAt)}</td>
                                                        <td className="text-end">
                                                            <button
                                                                id={`btn-view-car-${car.id}`}
                                                                className="btn btn-ghost-primary btn-icon btn-sm"
                                                                title="ดูประวัติรถ"
                                                                onClick={() => router.push(`/ops/car-detail/${car.id}`)}
                                                            >
                                                                <i className="ti ti-eye" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: Service Jobs */}
                        {activeTab === 'jobs' && (
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">ประวัติการซ่อม (10 รายการล่าสุด)</h3>
                                </div>
                                {customer.serviceJobs.length === 0 ? (
                                    <div className="card-body text-center py-5">
                                        <i className="ti ti-tools-off text-muted mb-3" style={{ fontSize: '3rem' }} />
                                        <p className="text-muted">ยังไม่มีประวัติการซ่อม</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-vcenter card-table">
                                            <thead>
                                                <tr>
                                                    <th>เลขงาน</th>
                                                    <th>วันที่</th>
                                                    <th>รถ</th>
                                                    <th>ช่าง</th>
                                                    <th>ยอดรวม</th>
                                                    <th>สถานะ</th>
                                                    <th />
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customer.serviceJobs.map(job => {
                                                    const status = jobStatusLabel[job.status] || { label: job.status, color: 'bg-secondary' }
                                                    return (
                                                        <tr key={job.id}>
                                                            <td>
                                                                <span className="fw-bold">{job.jobNo}</span>
                                                            </td>
                                                            <td className="text-muted small">
                                                                {formatDate(job.jobDate)}
                                                            </td>
                                                            <td>
                                                                <div className="fw-medium">{job.car?.licensePlate}</div>
                                                                <div className="text-muted small">
                                                                    {job.car?.carBrand?.nameEnglish} {job.car?.carModel?.name}
                                                                </div>
                                                            </td>
                                                            <td className="text-muted small">
                                                                {job.technician?.name || '-'}
                                                            </td>
                                                            <td className="fw-medium">
                                                                {job.grandTotal
                                                                    ? `฿${Number(job.grandTotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`
                                                                    : '-'
                                                                }
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${status.color}`}>
                                                                    {status.label}
                                                                </span>
                                                            </td>
                                                            <td className="text-end">
                                                                <button
                                                                    id={`btn-view-job-${job.id}`}
                                                                    className="btn btn-ghost-primary btn-icon btn-sm"
                                                                    title="ดูรายละเอียดงาน"
                                                                    onClick={() => router.push(`/ops/job/${job.id}`)}
                                                                >
                                                                    <i className="ti ti-eye" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                {customer._count.serviceJobs > 10 && (
                                    <div className="card-footer text-center">
                                        <span className="text-muted small">
                                            แสดง 10 รายการล่าสุด จากทั้งหมด {customer._count.serviceJobs} รายการ
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </MainLayout>
    )
}
