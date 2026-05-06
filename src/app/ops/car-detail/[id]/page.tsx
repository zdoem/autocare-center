/**
 * ไฟล์: app/ops/car-detail/[id]/page.tsx
 * จุดประสงค์: หน้าแสดงรายละเอียดรถและประวัติการซ่อม
 * 
 * @author AutoCare Team
 * @created 2026-02-14
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'

interface CarDetail {
    id: string
    code: string
    licensePlate: string
    province: string | null
    year: number | null
    color: string | null
    mileage: number | null
    vinNumber: string | null
    engineNumber: string | null
    customer: {
        id: string
        code: string
        fullName: string
        firstName: string
        phone: string
        email: string | null
        lineId: string | null
        address: string | null
        createdAt: string
        customerType: {
            name: string
        }
    }
    carBrand: {
        nameThai: string
        nameEnglish: string
    }
    carModel: {
        name: string
        fuelType: string | null
    }
    serviceJobs: Array<{
        id: string
        jobNo: string
        jobDate: string
        status: string
        mileage: number | null
        totalAmount: number
        isPaid: boolean
    }>
    _count: {
        serviceJobs: number
    }
}

// Avatar color generator
const avatarColors = [
    'bg-blue-lt', 'bg-pink-lt', 'bg-green-lt',
    'bg-orange-lt', 'bg-cyan-lt', 'bg-purple-lt'
]

const getAvatarColor = (name: string) => {
    const index = name.charCodeAt(0) % avatarColors.length
    return avatarColors[index]
}

const getFirstLetter = (name: string) => {
    return name.charAt(0)
}

// Helper for Thai date format
const formatDateThai = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

const formatDateThaiShort = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
    })
}

const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
        case 'PENDING':
            return <span className="badge bg-yellow">รอดำเนินการ</span>
        case 'IN_PROGRESS':
            return <span className="badge bg-azure">กำลังซ่อม</span>
        case 'WAITING_PARTS':
            return <span className="badge bg-orange">รอชิ้นส่วน</span>
        case 'COMPLETED':
            return <span className="badge bg-green">เสร็จแล้ว</span>
        case 'CANCELLED':
            return <span className="badge bg-secondary">ยกเลิก</span>
        default:
            return <span className="badge bg-secondary">{status}</span>
    }
}

export default function CarDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [car, setCar] = useState<CarDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [filterYear, setFilterYear] = useState('all')

    useEffect(() => {
        fetchCarDetail()
    }, [params.id])

    const fetchCarDetail = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/master/car/${params.id}`)
            const data = await response.json()

            if (response.ok && data.id) {
                setCar(data)
            } else {
                showError('ไม่พบข้อมูลรถ')
                router.push('/ops/search')
            }
        } catch (error) {
            console.error('Error fetching car detail:', error)
            showError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <MainLayout title="กำลังโหลด...">
                <div className="container-xl d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">กำลังโหลด...</span>
                    </div>
                    <div className="mt-3 text-muted">กำลังโหลดข้อมูล...</div>
                </div>
            </MainLayout>
        )
    }

    if (!car) {
        return null
    }

    // Calculate stats
    const totalVisits = car._count.serviceJobs
    const totalSpent = car.serviceJobs.reduce((sum, job) => sum + job.totalAmount, 0)
    const unpaidJobs = car.serviceJobs.filter(job => !job.isPaid).length
    const inProgressJobs = car.serviceJobs.filter(job =>
        ['PENDING', 'IN_PROGRESS', 'WAITING_PARTS'].includes(job.status.toUpperCase())
    ).length

    // Calculate maintenance schedule
    const currentMileage = car.mileage || 0
    const oilChangeInterval = 10000
    const inspectionInterval = 10000

    const lastOilChangeMileage = Math.floor(currentMileage / oilChangeInterval) * oilChangeInterval
    const nextOilChangeMileage = lastOilChangeMileage + oilChangeInterval
    const oilChangeRemaining = nextOilChangeMileage - currentMileage
    const isOilOverdue = oilChangeRemaining <= 0

    const lastInspectionMileage = Math.floor(currentMileage / inspectionInterval) * inspectionInterval
    const nextInspectionMileage = lastInspectionMileage + inspectionInterval
    const inspectionRemaining = nextInspectionMileage - currentMileage

    // Filter service jobs by year
    const years = [...new Set(car.serviceJobs.map(job => new Date(job.jobDate).getFullYear()))]
    const filteredJobs = filterYear === 'all'
        ? car.serviceJobs
        : car.serviceJobs.filter(job => new Date(job.jobDate).getFullYear().toString() === filterYear)

    // Calculate customer since (years)
    const customerSince = new Date(car.customer.createdAt)
    const yearsSince = new Date().getFullYear() - customerSince.getFullYear()

    return (
        <MainLayout
            title={`${car.licensePlate} ${car.province || ''}`}
            pretitle="รายละเอียดรถ"
        >
            <div className="container-xl">
                {/* Header Actions */}
                <div className="row mb-3">
                    <div className="col-12">
                        <div className="btn-list">
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => router.push('/ops/search')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon me-2" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M5 12l14 0"></path>
                                    <path d="M5 12l6 6"></path>
                                    <path d="M5 12l6 -6"></path>
                                </svg>
                                กลับ
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={() => router.push(`/ops/receive?carId=${car.id}`)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon me-2" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5"></path>
                                </svg>
                                เปิดงานซ่อมใหม่
                            </button>
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => router.push(`/ops/register?edit=${car.id}`)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon me-2" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1"></path>
                                    <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z"></path>
                                    <path d="M16 5l3 3"></path>
                                </svg>
                                แก้ไขข้อมูล
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row row-cards">
                    {/* Left Column: Car Info + Customer Info + Stats */}
                    <div className="col-md-4">
                        {/* Car Info Card */}
                        <div className="card mb-3">
                            <div className="card-header bg-blue text-white">
                                <h3 className="card-title text-white">ข้อมูลรถ</h3>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <div className="display-5 fw-bold text-primary">{car.licensePlate}</div>
                                    {car.province && <div className="text-muted">{car.province}</div>}
                                </div>

                                <div className="datagrid">
                                    <div className="datagrid-item">
                                        <div className="datagrid-title">รหัสรถ</div>
                                        <div className="datagrid-content">
                                            <span className="badge bg-blue-lt">{car.code}</span>
                                        </div>
                                    </div>
                                    <div className="datagrid-item">
                                        <div className="datagrid-title">ยี่ห้อ / รุ่น</div>
                                        <div className="datagrid-content fw-bold">
                                            {car.carBrand.nameThai || car.carBrand.nameEnglish} {car.carModel.name}
                                        </div>
                                    </div>
                                    {car.carModel.fuelType && (
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">เชื้อเพลิง</div>
                                            <div className="datagrid-content">{car.carModel.fuelType}</div>
                                        </div>
                                    )}
                                    {car.year && (
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">ปีรถ</div>
                                            <div className="datagrid-content">{car.year}</div>
                                        </div>
                                    )}
                                    {car.color && (
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">สี</div>
                                            <div className="datagrid-content">{car.color}</div>
                                        </div>
                                    )}
                                    {car.mileage !== null && (
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">เลขไมล์ล่าสุด</div>
                                            <div className="datagrid-content">{car.mileage.toLocaleString()} km</div>
                                        </div>
                                    )}
                                    {car.vinNumber && (
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">เลขตัวถัง (VIN)</div>
                                            <div className="datagrid-content"><code className="small">{car.vinNumber}</code></div>
                                        </div>
                                    )}
                                    {car.engineNumber && (
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">เลขเครื่อง</div>
                                            <div className="datagrid-content"><code className="small">{car.engineNumber}</code></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Customer Info Card */}
                        <div className="card mb-3">
                            <div className="card-header bg-green text-white">
                                <h3 className="card-title text-white">ข้อมูลเจ้าของรถ</h3>
                            </div>
                            <div className="card-body">
                                <div className="d-flex align-items-center mb-3">
                                    <span className={`avatar avatar-lg me-3 ${getAvatarColor(car.customer.fullName)}`}>
                                        {getFirstLetter(car.customer.fullName)}
                                    </span>
                                    <div>
                                        <div className="h3 mb-0">{car.customer.fullName}</div>
                                        <span className="badge bg-secondary mt-1">
                                            {car.customer.customerType.name}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-muted mb-3">
                                    ลูกค้าตั้งแต่ {formatDateThai(car.customer.createdAt)}
                                </div>

                                <div className="datagrid">
                                    <div className="datagrid-item">
                                        <div className="datagrid-title">รหัสลูกค้า</div>
                                        <div className="datagrid-content">{car.customer.code}</div>
                                    </div>
                                    <div className="datagrid-item">
                                        <div className="datagrid-title">โทรศัพท์</div>
                                        <div className="datagrid-content">
                                            <a href={`tel:${car.customer.phone}`}>{car.customer.phone}</a>
                                        </div>
                                    </div>
                                    {car.customer.lineId && (
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">LINE ID</div>
                                            <div className="datagrid-content">{car.customer.lineId}</div>
                                        </div>
                                    )}
                                    {car.customer.email && (
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">อีเมล</div>
                                            <div className="datagrid-content">
                                                <a href={`mailto:${car.customer.email}`}>{car.customer.email}</a>
                                            </div>
                                        </div>
                                    )}
                                    {car.customer.address && (
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">ที่อยู่</div>
                                            <div className="datagrid-content">{car.customer.address}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">สถิติสรุป</h3>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <div className="h1 mb-0 text-primary">{totalVisits}</div>
                                        <div className="text-muted">ครั้งที่มาใช้บริการ</div>
                                    </div>
                                    <div className="col-12 mb-3">
                                        <div className="h1 mb-0 text-success">฿{totalSpent.toLocaleString()}</div>
                                        <div className="text-muted">ยอดรวมทั้งหมด</div>
                                    </div>
                                    <div className="col-12 mb-3">
                                        <div className="h1 mb-0 text-info">{yearsSince}</div>
                                        <div className="text-muted">ปี ที่เป็นลูกค้า</div>
                                    </div>
                                    {unpaidJobs > 0 && (
                                        <div className="col-12 mb-3">
                                            <div className="h1 mb-0 text-warning">{unpaidJobs}</div>
                                            <div className="text-muted">งานรอชำระเงิน</div>
                                        </div>
                                    )}
                                    {inProgressJobs > 0 && (
                                        <div className="col-12">
                                            <div className="h1 mb-0 text-azure">{inProgressJobs}</div>
                                            <div className="text-muted">งานกำลังดำเนินการ</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Service History + Maintenance */}
                    <div className="col-md-8">
                        {/* Service History */}
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3 className="card-title">ประวัติการซ่อม</h3>
                                <div className="ms-auto">
                                    <select
                                        className="form-select"
                                        value={filterYear}
                                        onChange={(e) => setFilterYear(e.target.value)}
                                    >
                                        <option value="all">ปีทั้งหมด</option>
                                        {years.map(year => (
                                            <option key={year} value={year.toString()}>
                                                ปี {year + 543}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-vcenter card-table">
                                    <thead>
                                        <tr>
                                            <th>วันที่</th>
                                            <th>เลขงาน</th>
                                            <th>ไมล์</th>
                                            <th className="text-end">ยอด</th>
                                            <th>สถานะ</th>
                                            <th className="w-1"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredJobs.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-5 text-muted">
                                                    ไม่มีประวัติการซ่อม
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredJobs.map((job) => (
                                                <tr key={job.id} className={!job.isPaid ? 'table-warning' : ''}>
                                                    <td>{formatDateThaiShort(job.jobDate)}</td>
                                                    <td>
                                                        <a href={`/ops/job/${job.id}`} className="text-reset fw-bold">
                                                            {job.jobNo}
                                                        </a>
                                                    </td>
                                                    <td>
                                                        {job.mileage ? `${job.mileage.toLocaleString()} km` : '-'}
                                                    </td>
                                                    <td className="text-end">
                                                        ฿{job.totalAmount.toLocaleString()}
                                                    </td>
                                                    <td>
                                                        {getStatusBadge(job.status)}
                                                        {!job.isPaid && (
                                                            <span className="badge bg-warning ms-1">ยังไม่ชำระ</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-ghost-secondary"
                                                            onClick={() => router.push(`/ops/job/${job.id}`)}
                                                            title="ดูรายละเอียด"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                                <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
                                                                <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"></path>
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Maintenance Schedule */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">กำหนดการบำรุงรักษา</h3>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    {/* Oil Change */}
                                    <div className="col-md-6 mb-3">
                                        <div className={`card ${isOilOverdue ? 'bg-warning-lt' : ''}`}>
                                            <div className="card-body">
                                                <div className="h4 mb-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon me-2" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                        <path d="M6 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
                                                        <path d="M18 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
                                                        <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
                                                        <path d="M12 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
                                                        <path d="M6 6l6 6l6 -6"></path>
                                                        <path d="M12 12l0 6"></path>
                                                    </svg>
                                                    เปลี่ยนน้ำมันเครื่อง
                                                </div>
                                                {isOilOverdue ? (
                                                    <div className="h2 text-warning mb-0">ครบกำหนดแล้ว!</div>
                                                ) : (
                                                    <div>
                                                        <div className="h3 mb-1">อีก {oilChangeRemaining.toLocaleString()} km</div>
                                                        <div className="text-muted small">
                                                            กำหนดที่ {nextOilChangeMileage.toLocaleString()} km
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Inspection */}
                                    <div className="col-md-6 mb-3">
                                        <div className="card">
                                            <div className="card-body">
                                                <div className="h4 mb-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon me-2" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                        <path d="M9 12l2 2l4 -4"></path>
                                                        <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"></path>
                                                    </svg>
                                                    เช็คระยะ
                                                </div>
                                                <div className="h3 mb-1">อีก {inspectionRemaining.toLocaleString()} km</div>
                                                <div className="text-muted small">
                                                    กำหนดที่ {nextInspectionMileage.toLocaleString()} km
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
