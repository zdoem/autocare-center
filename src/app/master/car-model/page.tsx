/**
 * ไฟล์: app/master/car-model/page.tsx
 * จุดประสงค์: หน้าจัดการรุ่นรถ ตาม mockup master-car-model.html
 * 
 * @author AutoCare Team
 * @created 2026-01-25
 */

'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Modal, FormInput, FormSelect, showCreateSuccess, showUpdateSuccess, showDeleteSuccess, showError, confirmDelete } from '@/components/ui'

interface CarModel {
    id: string
    code: string
    name: string
    carBrandId: string
    carBrandName: string
    yearStart: number | null
    yearEnd: number | null
    vehicleType: string | null
    fuelType: string | null
    isActive: boolean
    updatedAt: string | null
}

interface CarBrand {
    id: string
    nameEnglish: string
}

// Format วันที่
const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${(d.getFullYear() + 543) % 100}`
}

// Format year range
const formatYearRange = (start: number | null, end: number | null) => {
    if (!start && !end) return '-'
    if (start && end) return `${start}-${end}`
    return start || end || '-'
}

// Vehicle Types
const vehicleTypes = [
    { value: 'รถเก๋ง', label: 'รถเก๋ง' },
    { value: 'กระบะ', label: 'กระบะ' },
    { value: 'SUV', label: 'SUV' },
    { value: 'Van', label: 'Van' },
    { value: 'รถบรรทุก', label: 'รถบรรทุก' },
]

// Fuel Types
const fuelTypes = [
    { value: 'เบนซิน', label: 'เบนซิน (Gasoline)' },
    { value: 'ดีเซล', label: 'ดีเซล (Diesel)' },
    { value: 'LPG/NGV', label: 'LPG/NGV' },
    { value: 'ไฮบริด', label: 'ไฮบริด (Hybrid)' },
    { value: 'ปลั๊กอินไฮบริด', label: 'ปลั๊กอินไฮบริด (PHEV)' },
    { value: 'ไฟฟ้า', label: 'ไฟฟ้า 100% (EV)' },
]

// Brand badge colors
const brandColors: Record<string, string> = {
    'Toyota': 'bg-blue-lt',
    'Honda': 'bg-red-lt',
    'Mazda': 'bg-orange-lt',
    'Nissan': 'bg-green-lt',
    'Isuzu': 'bg-purple-lt',
}

const getBrandColor = (name: string) => brandColors[name] || 'bg-secondary-lt'

export default function CarModelPage() {
    const [carModels, setCarModels] = useState<CarModel[]>([])
    const [carBrands, setCarBrands] = useState<CarBrand[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingModel, setEditingModel] = useState<CarModel | null>(null)

    // Filtering
    const [selectedBrandFilter, setSelectedBrandFilter] = useState('')

    // Sorting
    const [sortBy, setSortBy] = useState('updatedAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        carBrandId: '',
        yearStart: '',
        yearEnd: '',
        vehicleType: '',
        fuelType: '',
        isActive: true,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    // Fetch brands
    const fetchBrands = async () => {
        try {
            const res = await fetch('/api/master/car-brand')
            const json = await res.json()
            if (json.success) {
                setCarBrands(json.data)
            }
        } catch (error) {
            console.error('Failed to fetch brands')
        }
    }

    // Fetch data
    const fetchData = async (
        sort: string = sortBy,
        order: string = sortOrder,
        brandFilter: string = selectedBrandFilter
    ) => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            params.set('sortBy', sort)
            params.set('sortOrder', order)
            if (brandFilter) {
                params.set('carBrandId', brandFilter)
            }

            const res = await fetch(`/api/master/car-model?${params}`)
            const json = await res.json()
            if (json.success) {
                setCarModels(json.data)
            }
        } catch (error) {
            showError('ไม่สามารถโหลดข้อมูลได้')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBrands()
    }, [])

    useEffect(() => {
        fetchData()
    }, [sortBy, sortOrder, selectedBrandFilter])

    // Handle Sort
    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('asc')
        }
    }

    const renderSortIcon = (field: string) => {
        if (sortBy !== field) return <i className="ti ti-arrows-sort text-muted ms-1 fs-5"></i>
        return sortOrder === 'asc'
            ? <i className="ti ti-arrow-up text-primary ms-1 fs-5"></i>
            : <i className="ti ti-arrow-down text-primary ms-1 fs-5"></i>
    }

    // Open modal for add
    const handleAdd = () => {
        setEditingModel(null)
        setFormData({ name: '', carBrandId: '', yearStart: '', yearEnd: '', vehicleType: '', fuelType: '', isActive: true })
        setErrors({})
        setIsModalOpen(true)
    }

    // Open modal for edit
    const handleEdit = (item: CarModel) => {
        setEditingModel(item)
        setFormData({
            name: item.name,
            carBrandId: item.carBrandId,
            yearStart: item.yearStart ? String(item.yearStart) : '',
            yearEnd: item.yearEnd ? String(item.yearEnd) : '',
            vehicleType: item.vehicleType || '',
            fuelType: item.fuelType || '',
            isActive: item.isActive,
        })
        setErrors({})
        setIsModalOpen(true)
    }

    // Delete
    const handleDelete = async (item: CarModel) => {
        const confirmed = await confirmDelete(item.name)
        if (!confirmed) return

        try {
            const res = await fetch(`/api/master/car-model/${item.id}`, {
                method: 'DELETE'
            })
            const json = await res.json()

            if (json.success) {
                showDeleteSuccess(item.name)
                fetchData()
            } else {
                showError(json.error)
            }
        } catch (error) {
            showError('ไม่สามารถลบข้อมูลได้')
        }
    }

    // Validate form
    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.name.trim()) {
            newErrors.name = 'กรุณากรอกชื่อรุ่นรถ'
        }
        if (!formData.carBrandId) {
            newErrors.carBrandId = 'กรุณาเลือกยี่ห้อรถ'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Save
    const handleSave = async () => {
        if (!validate()) return

        setSaving(true)
        try {
            const url = editingModel
                ? `/api/master/car-model/${editingModel.id}`
                : '/api/master/car-model'

            const res = await fetch(url, {
                method: editingModel ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    carBrandId: formData.carBrandId,
                    yearStart: formData.yearStart ? parseInt(formData.yearStart) : null,
                    yearEnd: formData.yearEnd ? parseInt(formData.yearEnd) : null,
                    vehicleType: formData.vehicleType || null,
                    fuelType: formData.fuelType || null,
                    isActive: formData.isActive,
                })
            })

            const json = await res.json()

            if (json.success) {
                if (editingModel) {
                    showUpdateSuccess(formData.name)
                } else {
                    showCreateSuccess(formData.name)
                }
                setIsModalOpen(false)

                // Sort by Updated At Descending after save
                setSortBy('updatedAt')
                setSortOrder('desc')
                fetchData('updatedAt', 'desc', selectedBrandFilter)
            } else {
                showError(json.error)
            }
        } catch (error) {
            showError('ไม่สามารถบันทึกข้อมูลได้')
        } finally {
            setSaving(false)
        }
    }

    return (
        <MainLayout
            title={<><i className="ti ti-car me-2"></i>รุ่นรถ</>}
            pretitle="Master Data / รถยนต์"
            actions={
                <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="ti ti-plus me-1"></i>เพิ่มรุ่นรถ
                </button>
            }
        >
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">รายการรุ่นรถ</h3>
                    <div className="card-actions">
                        <select
                            className="form-select form-select-sm"
                            style={{ width: '150px' }}
                            value={selectedBrandFilter}
                            onChange={(e) => setSelectedBrandFilter(e.target.value)}
                        >
                            <option value="">ทุกยี่ห้อ</option>
                            {carBrands.map(brand => (
                                <option key={brand.id} value={brand.id}>{brand.nameEnglish}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th className="cursor-pointer" onClick={() => handleSort('code')}>
                                    รหัส {renderSortIcon('code')}
                                </th>
                                <th className="cursor-pointer" onClick={() => handleSort('carBrand')}>
                                    ยี่ห้อ {renderSortIcon('carBrand')}
                                </th>
                                <th className="cursor-pointer" onClick={() => handleSort('name')}>
                                    รุ่น {renderSortIcon('name')}
                                </th>
                                <th>ปี</th>
                                <th className="cursor-pointer" onClick={() => handleSort('vehicleType')}>
                                    ประเภท {renderSortIcon('vehicleType')}
                                </th>
                                <th className="cursor-pointer" onClick={() => handleSort('fuelType')}>
                                    เชื้อเพลิง {renderSortIcon('fuelType')}
                                </th>
                                <th className="cursor-pointer text-center" onClick={() => handleSort('isActive')}>
                                    สถานะ {renderSortIcon('isActive')}
                                </th>
                                <th className="cursor-pointer text-center" onClick={() => handleSort('updatedAt')}>
                                    แก้ไขล่าสุด {renderSortIcon('updatedAt')}
                                </th>
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
                            ) : carModels.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-4 text-muted">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            ) : (
                                carModels.map((item) => (
                                    <tr key={item.id}>
                                        <td><code>{item.code}</code></td>
                                        <td>
                                            <span className={`badge ${getBrandColor(item.carBrandName)}`}>
                                                {item.carBrandName}
                                            </span>
                                        </td>
                                        <td>{item.name}</td>
                                        <td>{formatYearRange(item.yearStart, item.yearEnd)}</td>
                                        <td>{item.vehicleType || '-'}</td>
                                        <td>{item.fuelType || '-'}</td>
                                        <td className="text-center">
                                            <span className={`badge ${item.isActive ? 'bg-success' : 'bg-secondary text-white'}`}>
                                                {item.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                            </span>
                                        </td>
                                        <td className="text-center">{formatDate(item.updatedAt)}</td>
                                        <td className="text-end">
                                            <a
                                                href="#"
                                                className="btn btn-ghost-primary btn-icon btn-sm"
                                                onClick={(e) => { e.preventDefault(); handleEdit(item) }}
                                            >
                                                <i className="ti ti-edit"></i>
                                            </a>
                                            <a
                                                href="#"
                                                className="btn btn-ghost-danger btn-icon btn-sm"
                                                onClick={(e) => { e.preventDefault(); handleDelete(item) }}
                                            >
                                                <i className="ti ti-trash"></i>
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Add/Edit */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingModel ? 'แก้ไขรุ่นรถ' : 'เพิ่มรุ่นรถ'}
                footer={
                    <>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    กำลังบันทึก...
                                </>
                            ) : (
                                'บันทึก'
                            )}
                        </button>
                    </>
                }
            >
                <FormSelect
                    label="ยี่ห้อรถ"
                    required
                    value={formData.carBrandId}
                    onChange={(e) => {
                        setFormData(prev => ({ ...prev, carBrandId: e.target.value }))
                        if (errors.carBrandId) setErrors(prev => ({ ...prev, carBrandId: '' }))
                    }}
                    options={carBrands.map(b => ({ value: b.id, label: b.nameEnglish }))}
                    error={errors.carBrandId}
                />
                <FormInput
                    label="ชื่อรุ่น"
                    required
                    value={formData.name}
                    onChange={(e) => {
                        setFormData(prev => ({ ...prev, name: e.target.value }))
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                    }}
                    error={errors.name}
                    placeholder="เช่น Camry, Civic"
                />
                <div className="row">
                    <div className="col-6">
                        <FormInput
                            label="ปีเริ่ม"
                            type="number"
                            value={formData.yearStart}
                            onChange={(e) => setFormData(prev => ({ ...prev, yearStart: e.target.value }))}
                            placeholder="2019"
                        />
                    </div>
                    <div className="col-6">
                        <FormInput
                            label="ปีสิ้นสุด"
                            type="number"
                            value={formData.yearEnd}
                            onChange={(e) => setFormData(prev => ({ ...prev, yearEnd: e.target.value }))}
                            placeholder="2024"
                        />
                    </div>
                </div>
                <FormSelect
                    label="ประเภทรถ"
                    value={formData.vehicleType}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                    options={vehicleTypes}
                />
                <FormSelect
                    label="ประเภทเชื้อเพลิง"
                    value={formData.fuelType}
                    onChange={(e) => setFormData(prev => ({ ...prev, fuelType: e.target.value }))}
                    options={fuelTypes}
                />
                <div className="mt-3">
                    <label className="form-check form-switch cursor-pointer">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        />
                        <span className="form-check-label ms-2">สถานะการใช้งาน (Active)</span>
                    </label>
                </div>
            </Modal>
        </MainLayout>
    )
}
