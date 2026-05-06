/**
 * ไฟล์: app/ops/search/page.tsx
 * จุดประสงค์: หน้าค้นหารถและลูกค้า สำหรับ Operations
 * 
 * @author AutoCare Team
 * @created 2026-02-14
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'

interface CarSearchResult {
    id: string
    code: string
    licensePlate: string
    province: string | null
    year: number | null
    color: string | null
    customer: {
        id: string
        code: string
        fullName: string
        firstName: string
        lastName: string
        phone: string
        email: string | null
        customerType: {
            name: string
        }
    }
    carBrand: {
        id: string
        nameEnglish: string
        nameThai: string
    }
    carModel: {
        id: string
        name: string
        fuelType: string | null
    }
    images: {
        imageUrl: string
    }[]
    lastServiceDate: string | null
    status: 'in-service' | 'pending' | 'normal'
    hasActiveJob: boolean
    hasUnpaidJob: boolean
}

interface CarBrand {
    id: string
    nameEnglish: string
    nameThai: string
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
        month: 'short',
        day: 'numeric',
    })
}

export default function OpsSearchPage() {
    const router = useRouter()
    const [cars, setCars] = useState<CarSearchResult[]>([])
    const [brands, setBrands] = useState<CarBrand[]>([])
    const [loading, setLoading] = useState(false)

    // Search & Filter state
    const [searchText, setSearchText] = useState('')
    const [filterBrand, setFilterBrand] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    // Pagination
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    // Fetch car brands for filter
    useEffect(() => {
        fetchBrands()
    }, [])

    // Fetch cars when filters change
    useEffect(() => {
        fetchCars()
    }, [searchText, filterBrand, filterStatus, page])

    const fetchBrands = async () => {
        try {
            const response = await fetch('/api/master/car-brand')
            const data = await response.json()
            if (data.data) {
                setBrands(data.data)
            }
        } catch (error) {
            console.error('Error fetching brands:', error)
        }
    }

    const fetchCars = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                q: searchText,
                page: page.toString(),
                limit: '20',
            })

            if (filterBrand) params.append('brandId', filterBrand)
            if (filterStatus !== 'all') params.append('status', filterStatus)

            const response = await fetch(`/api/ops/search?${params}`)
            const data = await response.json()

            if (data.data) {
                setCars(data.data)
                setTotal(data.pagination?.total || 0)
                setTotalPages(data.pagination?.totalPages || 1)
            }
        } catch (error) {
            console.error('Error fetching cars:', error)
            showError('เกิดข้อผิดพลาดในการค้นหา')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = () => {
        setPage(1)
        fetchCars()
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'in-service':
                return <span className="badge bg-azure">กำลังซ่อม</span>
            case 'pending':
                return <span className="badge bg-yellow">รอชำระ</span>
            case 'normal':
                return <span className="badge bg-green">ปกติ</span>
            default:
                return <span className="badge bg-secondary">-</span>
        }
    }

    return (
        <MainLayout
            title="ค้นหารถ / ลูกค้า"
        >
            <div className="container-xl">
                <div className="row row-deck row-cards">
                    {/* Search & Filters Card */}
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="row g-2">
                                    {/* Search Input */}
                                    <div className="col-md-5">
                                        <div className="input-icon">
                                            <span className="input-icon-addon">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                    <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
                                                    <path d="M21 21l-6 -6"></path>
                                                </svg>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                placeholder="ค้นหาทะเบียน, ชื่อลูกค้า, เบอร์โทร..."
                                                value={searchText}
                                                onChange={(e) => setSearchText(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                            />
                                        </div>
                                    </div>

                                    {/* Brand Filter */}
                                    <div className="col-md-3">
                                        <select
                                            className="form-select"
                                            value={filterBrand}
                                            onChange={(e) => setFilterBrand(e.target.value)}
                                        >
                                            <option value="">ยี่ห้อทั้งหมด</option>
                                            {brands.map((brand) => (
                                                <option key={brand.id} value={brand.id}>
                                                    {brand.nameThai || brand.nameEnglish}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status Filter */}
                                    <div className="col-md-2">
                                        <select
                                            className="form-select"
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                        >
                                            <option value="all">สถานะทั้งหมด</option>
                                            <option value="normal">ปกติ</option>
                                            <option value="in-service">กำลังซ่อม</option>
                                            <option value="pending">รอชำระ</option>
                                        </select>
                                    </div>

                                    {/* Search Button */}
                                    <div className="col-md-2">
                                        <button
                                            className="btn btn-primary w-100"
                                            onClick={handleSearch}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="spinner-border spinner-border-sm me-2" />
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="icon me-2" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                    <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
                                                    <path d="M21 21l-6 -6"></path>
                                                </svg>
                                            )}
                                            ค้นหา
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Card */}
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">ผลการค้นหา ({total.toLocaleString()} รายการ)</h3>
                                <div className="ms-auto">
                                    <button
                                        className="btn btn-success"
                                        onClick={() => router.push('/ops/register')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="icon me-2" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                            <path d="M12 5l0 14"></path>
                                            <path d="M5 12l14 0"></path>
                                        </svg>
                                        ลงทะเบียนรถใหม่
                                    </button>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-vcenter card-table table-hover">
                                    <thead>
                                        <tr>
                                            <th>ทะเบียน</th>
                                            <th>รถ</th>
                                            <th>เจ้าของ</th>
                                            <th>โทรศัพท์</th>
                                            <th>ใช้ล่าสุด</th>
                                            <th>สถานะ</th>
                                            <th className="w-1">การกระทำ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan={7} className="text-center py-5">
                                                    <div className="spinner-border text-primary" role="status">
                                                        <span className="visually-hidden">กำลังโหลด...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : cars.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="text-center py-5 text-muted">
                                                    ไม่พบข้อมูล
                                                </td>
                                            </tr>
                                        ) : (
                                            cars.map((car) => (
                                                <tr key={car.id}>
                                                    {/* License Plate */}
                                                    <td>
                                                        <span className="badge bg-blue-lt fs-3 px-3 py-2">
                                                            {car.licensePlate}
                                                        </span>
                                                        {car.province && (
                                                            <div className="small text-muted mt-1">
                                                                {car.province}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Car Info */}
                                                    <td>
                                                        <div className="fw-bold">
                                                            {car.carBrand.nameThai || car.carBrand.nameEnglish} {car.carModel.name}
                                                        </div>
                                                        <div className="small text-muted">
                                                            {car.year ? `ปี ${car.year}` : ''} {car.color ? ` • ${car.color}` : ''}
                                                            {car.carModel.fuelType && ` • ${car.carModel.fuelType}`}
                                                        </div>
                                                    </td>

                                                    {/* Owner */}
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <span className={`avatar avatar-sm me-2 ${getAvatarColor(car.customer.fullName)}`}>
                                                                {getFirstLetter(car.customer.fullName)}
                                                            </span>
                                                            <div>
                                                                <div className="fw-bold">{car.customer.fullName}</div>
                                                                <div className="small text-muted">
                                                                    <span className="badge badge-sm bg-secondary">
                                                                        {car.customer.customerType.name}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Phone */}
                                                    <td>
                                                        <a href={`tel:${car.customer.phone}`} className="text-reset">
                                                            {car.customer.phone}
                                                        </a>
                                                    </td>

                                                    {/* Last Service */}
                                                    <td>
                                                        {formatDateThai(car.lastServiceDate)}
                                                    </td>

                                                    {/* Status */}
                                                    <td>
                                                        {getStatusBadge(car.status)}
                                                    </td>

                                                    {/* Actions */}
                                                    <td>
                                                        <div className="btn-list flex-nowrap">
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => router.push(`/ops/car-detail/${car.id}`)}
                                                                title="ดูรายละเอียด"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                                    <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
                                                                    <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"></path>
                                                                </svg>
                                                                ดู
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-success"
                                                                onClick={() => router.push(`/ops/receive?carId=${car.id}`)}
                                                                title="เปิดงานซ่อม"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                                    <path d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5"></path>
                                                                </svg>
                                                                เปิดงาน
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="card-footer d-flex align-items-center">
                                    <p className="m-0 text-muted">
                                        แสดง <span>{((page - 1) * 20) + 1}</span> ถึง <span>{Math.min(page * 20, total)}</span> จาก <span>{total}</span> รายการ
                                    </p>
                                    <ul className="pagination m-0 ms-auto">
                                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => setPage(page - 1)}
                                                disabled={page === 1}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                    <path d="M15 6l-6 6l6 6"></path>
                                                </svg>
                                                ก่อนหน้า
                                            </button>
                                        </li>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <li key={i + 1} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => setPage(i + 1)}
                                                >
                                                    {i + 1}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => setPage(page + 1)}
                                                disabled={page === totalPages}
                                            >
                                                ถัดไป
                                                <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                    <path d="M9 6l6 6l-6 6"></path>
                                                </svg>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
