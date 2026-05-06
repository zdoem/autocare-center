/**
 * ไฟล์: app/master/service/page.tsx
 * จุดประสงค์: หน้าจัดการบริการ ตาม mockup master-service.html
 * 
 * @author AutoCare Team
 * @created 2026-01-26
 */

'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Modal, FormInput, showCreateSuccess, showUpdateSuccess, showDeleteSuccess, showError, confirmDelete } from '@/components/ui'

interface Service {
    id: string
    code: string
    name: string
    description: string | null
    price: number
    laborCost: number | null
    laborHours: number | null
    isActive: boolean
    updatedAt: string | null
}

// Format currency
const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-'
    return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export default function ServicePage() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingService, setEditingService] = useState<Service | null>(null)

    // Sorting
    const [sortBy, setSortBy] = useState('updatedAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    // Search/Filter
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('')

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        laborCost: 0,
        laborHours: 0,
        isActive: true,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    // Fetch data
    const fetchData = async (
        sort: string = sortBy,
        order: string = sortOrder,
        searchTerm: string = search,
        status: string = statusFilter
    ) => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            params.set('sortBy', sort)
            params.set('sortOrder', order)
            if (searchTerm) params.set('search', searchTerm)
            if (status) params.set('isActive', status)

            const res = await fetch(`/api/master/service?${params}`)

            if (!res.ok) {
                console.error('API Error:', res.status, res.statusText)
                try {
                    const errorJson = await res.json()
                    showError(errorJson.error || 'ไม่สามารถโหลดข้อมูลได้')
                } catch {
                    showError(`เกิดข้อผิดพลาด (${res.status})`)
                }
                setServices([])
                return
            }

            const json = await res.json()
            setServices(json)
        } catch (error) {
            showError('ไม่สามารถโหลดข้อมูลได้')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [sortBy, sortOrder])

    // Handle Search
    const handleSearch = () => {
        fetchData(sortBy, sortOrder, search, statusFilter)
    }

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
        setEditingService(null)
        setFormData({ name: '', description: '', price: 0, laborCost: 0, laborHours: 0, isActive: true })
        setErrors({})
        setIsModalOpen(true)
    }

    // Open modal for edit
    const handleEdit = (item: Service) => {
        setEditingService(item)
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price,
            laborCost: item.laborCost || 0,
            laborHours: item.laborHours || 0,
            isActive: item.isActive,
        })
        setErrors({})
        setIsModalOpen(true)
    }

    // Delete
    const handleDelete = async (item: Service) => {
        const confirmed = await confirmDelete(item.name)
        if (!confirmed) return

        try {
            const res = await fetch(`/api/master/service/${item.id}`, {
                method: 'DELETE'
            })
            const json = await res.json()

            if (res.ok) {
                showDeleteSuccess(item.name)
                fetchData()
            } else {
                showError(json.error || json.details || 'ไม่สามารถลบข้อมูลได้')
            }
        } catch (error) {
            showError('ไม่สามารถลบข้อมูลได้')
        }
    }

    // Validate form
    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.name.trim()) {
            newErrors.name = 'กรุณากรอกชื่อบริการ'
        }
        if (formData.price < 0) {
            newErrors.price = 'ราคาต้องไม่ต่ำกว่า 0'
        }
        if (formData.laborCost !== null && formData.laborCost < 0) {
            newErrors.laborCost = 'ค่าแรงต้องไม่ต่ำกว่า 0'
        }
        if (formData.laborHours !== null && formData.laborHours < 0) {
            newErrors.laborHours = 'เวลาซ่อมต้องไม่ต่ำกว่า 0'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Save
    const handleSave = async () => {
        if (!validate()) return

        setSaving(true)
        try {
            const url = editingService
                ? `/api/master/service/${editingService.id}`
                : '/api/master/service'

            const res = await fetch(url, {
                method: editingService ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    description: formData.description.trim() || null,
                    price: formData.price,
                    laborCost: formData.laborCost || null,
                    laborHours: formData.laborHours || null,
                    isActive: formData.isActive,
                })
            })

            const json = await res.json()

            if (res.ok) {
                if (editingService) {
                    showUpdateSuccess(formData.name)
                } else {
                    showCreateSuccess(formData.name)
                }
                setIsModalOpen(false)

                // Sort by Updated At Descending after save
                setSortBy('updatedAt')
                setSortOrder('desc')
                fetchData('updatedAt', 'desc')
            } else {
                showError(json.error || 'ไม่สามารถบันทึกข้อมูลได้')
            }
        } catch (error) {
            showError('ไม่สามารถบันทึกข้อมูลได้')
        } finally {
            setSaving(false)
        }
    }

    return (
        <MainLayout
            title={<><i className="ti ti-tool me-2"></i>ประเภทบริการ</>}
            pretitle="Master Data / บริการ"
            actions={
                <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="ti ti-plus me-1"></i>เพิ่มบริการ
                </button>
            }
        >
            {/* Search/Filter Bar */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="row g-2">
                        <div className="col-md-6">
                            <div className="input-icon">
                                <span className="input-icon-addon">
                                    <i className="ti ti-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="ค้นหา รหัส, ชื่อบริการ, คำอธิบาย..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">ทุกสถานะ</option>
                                <option value="true">ใช้งาน</option>
                                <option value="false">ไม่ใช้งาน</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <button className="btn btn-primary w-100" onClick={handleSearch}>
                                <i className="ti ti-search me-1"></i>ค้นหา
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">รายการประเภทบริการ</h3>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th className="cursor-pointer" onClick={() => handleSort('code')}>
                                    รหัส {renderSortIcon('code')}
                                </th>
                                <th className="cursor-pointer" onClick={() => handleSort('name')}>
                                    บริการ {renderSortIcon('name')}
                                </th>
                                <th>คำอธิบาย</th>
                                <th className="text-end cursor-pointer" onClick={() => handleSort('price')}>
                                    ราคาเริ่มต้น {renderSortIcon('price')}
                                </th>
                                <th className="text-end">ค่าแรง</th>
                                <th className="text-center">เวลา (ชม.)</th>
                                <th className="text-center cursor-pointer" onClick={() => handleSort('isActive')}>
                                    สถานะ {renderSortIcon('isActive')}
                                </th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : services.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-4 text-muted">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            ) : (
                                services.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <code>{item.code}</code>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <span className="bg-primary text-white avatar avatar-xs me-2 rounded">
                                                    <i className="ti ti-tool fs-6"></i>
                                                </span>
                                                <span className="fw-bold">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-muted">{item.description || '-'}</td>
                                        <td className="text-end">{formatCurrency(item.price)}</td>
                                        <td className="text-end">{formatCurrency(item.laborCost)}</td>
                                        <td className="text-center">{item.laborHours || '-'}</td>
                                        <td className="text-center">
                                            <span className={`badge ${item.isActive ? 'bg-success' : 'bg-secondary text-white'}`}>
                                                {item.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                            </span>
                                        </td>
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
                title={editingService ? 'แก้ไขบริการ' : 'เพิ่มบริการ'}
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
                <FormInput
                    label="ชื่อบริการ"
                    required
                    value={formData.name}
                    onChange={(e) => {
                        setFormData(prev => ({ ...prev, name: e.target.value }))
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                    }}
                    error={errors.name}
                    placeholder="เช่น เปลี่ยนถ่ายน้ำมันเครื่อง"
                />
                <div className="mb-3">
                    <label className="form-label">คำอธิบาย</label>
                    <textarea
                        className="form-control"
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="เช่น เปลี่ยนน้ำมันเครื่อง + กรองน้ำมัน"
                    />
                </div>
                <div className="row">
                    <div className="col-md-4">
                        <FormInput
                            label="ราคาเริ่มต้น"
                            type="number"
                            value={formData.price}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
                                if (errors.price) setErrors(prev => ({ ...prev, price: '' }))
                            }}
                            error={errors.price}
                            placeholder="0"
                        />
                    </div>
                    <div className="col-md-4">
                        <FormInput
                            label="ค่าแรง"
                            type="number"
                            value={formData.laborCost}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, laborCost: parseFloat(e.target.value) || 0 }))
                                if (errors.laborCost) setErrors(prev => ({ ...prev, laborCost: '' }))
                            }}
                            error={errors.laborCost}
                            placeholder="0"
                        />
                    </div>
                    <div className="col-md-4">
                        <FormInput
                            label="เวลาซ่อม (ชม.)"
                            type="number"
                            step="0.5"
                            value={formData.laborHours}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, laborHours: parseFloat(e.target.value) || 0 }))
                                if (errors.laborHours) setErrors(prev => ({ ...prev, laborHours: '' }))
                            }}
                            error={errors.laborHours}
                            placeholder="0"
                        />
                    </div>
                </div>
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
