/**
 * ไฟล์: app/master/car/page.tsx
 * จุดประสงค์: หน้าจัดการข้อมูลรถ (Master Car)
 * 
 * @author AutoCare Team
 * @created 2026-08-15
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { Modal, FormInput, FormSelect, showCreateSuccess, showUpdateSuccess, showDeleteSuccess, showError, confirmDelete } from '@/components/ui'

// ─── Interfaces ────────────────────────────────────────────────────────
interface Car {
    id: string
    code: string
    licensePlate: string
    province: string | null
    year: number | null
    color: string | null
    mileage: number | null
    vin: string | null
    engineNo: string | null
    isActive: boolean
    updatedAt: string
    createdAt: string
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
    customer: {
        id: string
        fullName: string
        phone: string
    }
    _count?: {
        serviceJobs: number
    }
}

interface CarBrand {
    id: string
    nameEnglish: string
}

interface CarModel {
    id: string
    name: string
    carBrandId: string
}

interface Customer {
    id: string
    fullName: string
    phone: string
}

// ─── Helpers ───────────────────────────────────────────────────────────
const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${(d.getFullYear() + 543) % 100}`
}

const formatNumber = (n: number | null | undefined) => {
    if (n === null || n === undefined) return '-'
    return n.toLocaleString('th-TH')
}

// Brand badge colors
const brandColors: Record<string, string> = {
    'Toyota': 'bg-blue-lt',
    'Honda': 'bg-red-lt',
    'Mazda': 'bg-orange-lt',
    'Nissan': 'bg-green-lt',
    'Isuzu': 'bg-purple-lt',
}
const getBrandColor = (name: string) => brandColors[name] || 'bg-secondary-lt'

export default function CarPage() {
    const router = useRouter()

    const [cars, setCars] = useState<Car[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)

    // Master Data for Selects
    const [carBrands, setCarBrands] = useState<CarBrand[]>([])
    const [carModels, setCarModels] = useState<CarModel[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])

    // Filtering
    const [search, setSearch] = useState('')
    const [selectedBrand, setSelectedBrand] = useState('')

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCar, setEditingCar] = useState<Car | null>(null)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const [formData, setFormData] = useState({
        licensePlate: '',
        province: '',
        carBrandId: '',
        carModelId: '',
        customerId: '',
        year: '',
        color: '',
        mileage: '',
        vin: '',
        engineNo: '',
        isActive: true,
    })

    // ─── Fetching Data ──────────────────────────────────────────────────
    const fetchMasterData = async () => {
        try {
            const [brandsRes, modelsRes, customersRes] = await Promise.all([
                fetch('/api/master/car-brand'),
                fetch('/api/master/car-model'),
                fetch('/api/master/customer') // Fetch all or top customers for select
            ])
            const brandsJson = await brandsRes.json()
            const modelsJson = await modelsRes.json()
            const customersJson = await customersRes.json()

            if (brandsJson.success) setCarBrands(brandsJson.data)
            if (modelsJson.success) setCarModels(modelsJson.data)
            if (customersJson.success) setCustomers(customersJson.data || customersJson) // handle array or paginated struct
        } catch (error) {
            console.error('Failed to load master data')
        }
    }

    const fetchData = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: String(page),
                limit: '10',
            })
            if (search) params.set('search', search)
            if (selectedBrand) params.set('brandId', selectedBrand)

            const res = await fetch(`/api/master/car?${params}`)
            const json = await res.json()
            if (res.ok) {
                setCars(json.data)
                setTotal(json.pagination.total)
                setTotalPages(json.pagination.totalPages)
            }
        } catch (error) {
            showError('ไม่สามารถโหลดข้อมูลได้')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMasterData()
    }, [])

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchData()
        }, 300)
        return () => clearTimeout(timeout)
    }, [page, search, selectedBrand])

    // ─── Actions ────────────────────────────────────────────────────────
    const handleAdd = () => {
        setEditingCar(null)
        setFormData({
            licensePlate: '',
            province: '',
            carBrandId: '',
            carModelId: '',
            customerId: '',
            year: '',
            color: '',
            mileage: '',
            vin: '',
            engineNo: '',
            isActive: true,
        })
        setErrors({})
        setIsModalOpen(true)
    }

    const handleEdit = (item: Car) => {
        setEditingCar(item)
        setFormData({
            licensePlate: item.licensePlate,
            province: item.province || '',
            carBrandId: item.carBrand?.id || '',
            carModelId: item.carModel?.id || '',
            customerId: item.customer?.id || '',
            year: item.year ? String(item.year) : '',
            color: item.color || '',
            mileage: item.mileage ? String(item.mileage) : '',
            vin: item.vin || '',
            engineNo: item.engineNo || '',
            isActive: item.isActive,
        })
        setErrors({})
        setIsModalOpen(true)
    }

    const handleDelete = async (item: Car) => {
        const confirmed = await confirmDelete(`รถยนต์ทะเบียน ${item.licensePlate}`)
        if (!confirmed) return

        try {
            const res = await fetch(`/api/master/car/${item.id}`, { method: 'DELETE' })
            const json = await res.json()

            if (res.ok || json.success || json.message) {
                showDeleteSuccess(item.licensePlate)
                fetchData()
            } else {
                showError(json.error || 'ไม่สามารถลบข้อมูลได้')
            }
        } catch (error) {
            showError('ไม่สามารถลบข้อมูลได้')
        }
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.licensePlate.trim()) newErrors.licensePlate = 'กรุณากรอกทะเบียนรถ'
        if (!formData.carBrandId) newErrors.carBrandId = 'กรุณาเลือกยี่ห้อรถ'
        if (!formData.carModelId) newErrors.carModelId = 'กรุณาเลือกรุ่นรถ'
        if (!formData.customerId) newErrors.customerId = 'กรุณาเลือกลูกค้าเจ้าของรถ'
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validate()) return

        setSaving(true)
        try {
            const url = editingCar ? `/api/master/car/${editingCar.id}` : '/api/master/car'
            const method = editingCar ? 'PUT' : 'POST'

            const payload = {
                ...formData,
                year: formData.year ? parseInt(formData.year) : null,
                mileage: formData.mileage ? parseInt(formData.mileage) : null,
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const json = await res.json()

            if (res.ok || json.success) {
                if (editingCar) showUpdateSuccess(formData.licensePlate)
                else showCreateSuccess(formData.licensePlate)
                
                setIsModalOpen(false)
                fetchData()
            } else {
                showError(json.error || 'บันทึกข้อมูลไม่สำเร็จ')
            }
        } catch (error) {
            showError('บันทึกข้อมูลไม่สำเร็จ')
        } finally {
            setSaving(false)
        }
    }

    // ฟิลเตอร์โมเดลตามยี่ห้อที่เลือก
    const filteredModels = carModels.filter(m => m.carBrandId === formData.carBrandId)
    // สำหรับหน้าจอเลือกลูกค้า (อาจจะเยอะ, ควรทำเป็น autocomplete แต่นี่ใช้ Select ตามที่มี)
    const customerList = Array.isArray(customers) ? customers : (customers as any).data || []

    return (
        <MainLayout
            title={<><i className="ti ti-car me-2"></i>รถยนต์ทั้งหมด</>}
            pretitle="Master Data / รถยนต์"
            actions={
                <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="ti ti-plus me-1"></i>เพิ่มรถใหม่
                </button>
            }
        >
            <div className="card">
                <div className="card-header border-bottom-0">
                    <div className="row w-100 align-items-center">
                        <div className="col">
                            <h3 className="card-title">รายการรถยนต์</h3>
                        </div>
                        <div className="col-auto ms-auto d-flex gap-2">
                            <select
                                className="form-select form-select-sm"
                                style={{ width: '150px' }}
                                value={selectedBrand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                            >
                                <option value="">ทุกยี่ห้อ</option>
                                {carBrands.map(brand => (
                                    <option key={brand.id} value={brand.id}>{brand.nameEnglish}</option>
                                ))}
                            </select>
                            <div className="input-icon">
                                <span className="input-icon-addon">
                                    <i className="ti ti-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="ค้นหา ทะเบียน, ลูกค้า..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value)
                                        setPage(1)
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th>รหัส</th>
                                <th>ทะเบียน</th>
                                <th>ยี่ห้อ/รุ่น</th>
                                <th>ลูกค้า</th>
                                <th>สี/ปี</th>
                                <th>ไมล์ล่าสุด</th>
                                <th>สถานะ</th>
                                <th>อัพเดท</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : cars.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-4 text-muted">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            ) : (
                                cars.map((item) => (
                                    <tr key={item.id}>
                                        <td><code className="text-muted">{item.code}</code></td>
                                        <td>
                                            <div className="fw-bold text-primary">{item.licensePlate}</div>
                                            {item.province && <div className="text-muted small">{item.province}</div>}
                                        </td>
                                        <td>
                                            <span className={`badge ${getBrandColor(item.carBrand?.nameEnglish)} mb-1`}>
                                                {item.carBrand?.nameEnglish}
                                            </span>
                                            <div className="text-muted small">{item.carModel?.name}</div>
                                        </td>
                                        <td>
                                            {item.customer ? (
                                                <>
                                                    <a href={`/master/customer/${item.customer.id}`} className="text-body fw-medium">
                                                        {item.customer.fullName}
                                                    </a>
                                                    <div className="text-muted small">
                                                        <i className="ti ti-phone me-1"></i>{item.customer.phone}
                                                    </div>
                                                </>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            {item.color ? <span className="badge bg-secondary-lt me-1">{item.color}</span> : '-'}
                                            {item.year && <span className="text-muted small">ปี {item.year}</span>}
                                        </td>
                                        <td>
                                            {item.mileage ? `${formatNumber(item.mileage)} กม.` : '-'}
                                        </td>
                                        <td>
                                            <span className={`badge ${item.isActive ? 'bg-success' : 'bg-secondary text-white'}`}>
                                                {item.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                            </span>
                                        </td>
                                        <td className="text-muted small">
                                            {formatDate(item.updatedAt || item.createdAt)}
                                        </td>
                                        <td className="text-end">
                                            <a
                                                href={`/ops/car-detail/${item.id}`}
                                                className="btn btn-ghost-secondary btn-icon btn-sm"
                                                title="ดูประวัติรถ"
                                            >
                                                <i className="ti ti-eye"></i>
                                            </a>
                                            <button
                                                className="btn btn-ghost-primary btn-icon btn-sm"
                                                onClick={() => handleEdit(item)}
                                            >
                                                <i className="ti ti-edit"></i>
                                            </button>
                                            <button
                                                className="btn btn-ghost-danger btn-icon btn-sm"
                                                onClick={() => handleDelete(item)}
                                            >
                                                <i className="ti ti-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="card-footer d-flex align-items-center">
                    <p className="m-0 text-muted">
                        แสดง {(page - 1) * 10 + 1}-{Math.min(page * 10, total)} จาก {total}
                    </p>
                    <ul className="pagination m-0 ms-auto">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                                <a
                                    className="page-link"
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setPage(p) }}
                                >
                                    {p}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Modal Add/Edit */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCar ? 'แก้ไขข้อมูลรถ' : 'เพิ่มรถใหม่'}
                size="lg"
                footer={
                    <>
                        <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                            ยกเลิก
                        </button>
                        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span>กำลังบันทึก...</>
                            ) : 'บันทึก'}
                        </button>
                    </>
                }
            >
                <div className="row g-3">
                    <div className="col-md-6">
                        <FormInput
                            label="ทะเบียนรถ"
                            required
                            value={formData.licensePlate}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, licensePlate: e.target.value }))
                                if (errors.licensePlate) setErrors(prev => ({ ...prev, licensePlate: '' }))
                            }}
                            error={errors.licensePlate}
                            placeholder="เช่น กท 1234"
                        />
                    </div>
                    <div className="col-md-6">
                        <FormInput
                            label="จังหวัด"
                            value={formData.province}
                            onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                            placeholder="เช่น กรุงเทพมหานคร"
                        />
                    </div>

                    <div className="col-md-6">
                        <FormSelect
                            label="ยี่ห้อรถ"
                            required
                            value={formData.carBrandId}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, carBrandId: e.target.value, carModelId: '' }))
                                if (errors.carBrandId) setErrors(prev => ({ ...prev, carBrandId: '' }))
                            }}
                            options={carBrands.map(b => ({ value: b.id, label: b.nameEnglish }))}
                            error={errors.carBrandId}
                        />
                    </div>
                    <div className="col-md-6">
                        <FormSelect
                            label="รุ่นรถ"
                            required
                            value={formData.carModelId}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, carModelId: e.target.value }))
                                if (errors.carModelId) setErrors(prev => ({ ...prev, carModelId: '' }))
                            }}
                            options={filteredModels.map(m => ({ value: m.id, label: m.name }))}
                            error={errors.carModelId}
                            disabled={!formData.carBrandId}
                        />
                    </div>

                    <div className="col-md-12">
                        <FormSelect
                            label="ลูกค้าเจ้าของรถ"
                            required
                            value={formData.customerId}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, customerId: e.target.value }))
                                if (errors.customerId) setErrors(prev => ({ ...prev, customerId: '' }))
                            }}
                            options={customerList.map((c: any) => ({ value: c.id, label: `${c.fullName} (${c.phone})` }))}
                            error={errors.customerId}
                        />
                    </div>

                    <div className="col-md-4">
                        <FormInput
                            label="ปีจดทะเบียน (Year)"
                            type="number"
                            value={formData.year}
                            onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                            placeholder="เช่น 2020"
                        />
                    </div>
                    <div className="col-md-4">
                        <FormInput
                            label="สีรถ"
                            value={formData.color}
                            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                            placeholder="เช่น ขาว"
                        />
                    </div>
                    <div className="col-md-4">
                        <FormInput
                            label="เลขไมล์เริ่มต้น"
                            type="number"
                            value={formData.mileage}
                            onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
                            placeholder="กม."
                        />
                    </div>

                    <div className="col-md-6">
                        <FormInput
                            label="เลขตัวถัง (VIN)"
                            value={formData.vin}
                            onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value }))}
                        />
                    </div>
                    <div className="col-md-6">
                        <FormInput
                            label="เลขเครื่องยนต์"
                            value={formData.engineNo}
                            onChange={(e) => setFormData(prev => ({ ...prev, engineNo: e.target.value }))}
                        />
                    </div>

                    <div className="col-12 mt-3">
                        <label className="form-check form-switch">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            />
                            <span className="form-check-label">สถานะการใช้งาน (Active)</span>
                        </label>
                    </div>
                </div>
            </Modal>
        </MainLayout>
    )
}
