/**
 * ไฟล์: app/master/spare/page.tsx
 * จุดประสงค์: หน้าจัดการอะไหล่ (Inventory) ตาม mockup master-spares.html
 * 
 * Features:
 * - Stock alert (low stock warning)
 * - Vendor relation
 * - Category filter
 * - Stock status filter
 * 
 * @author AutoCare Team
 * @created 2026-01-26
 */

'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Modal, FormInput, showCreateSuccess, showUpdateSuccess, showDeleteSuccess, showError, confirmDelete } from '@/components/ui'

interface Spare {
    id: string
    code: string
    name: string
    description: string | null
    sparesCategoryId: string | null
    sparesCategory: { id: string; code: string; name: string } | null
    vendorId: string | null
    vendor: { id: string; code: string; name: string } | null
    unit: string
    sellingPrice: number
    costPrice: number | null
    minStock: number
    currentStock: number
    isLowStock: boolean
    isOutOfStock: boolean
    isActive: boolean
}

interface Category {
    id: string
    code: string
    name: string
}

interface Vendor {
    id: string
    code: string
    name: string
}

const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-'
    return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export default function SparePage() {
    const [spares, setSpares] = useState<Spare[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [vendors, setVendors] = useState<Vendor[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingSpare, setEditingSpare] = useState<Spare | null>(null)

    // Filters
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [stockStatusFilter, setStockStatusFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    // Sorting state
    const [sortBy, setSortBy] = useState('code')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        sparesCategoryId: '',
        vendorId: '',
        unit: 'ชิ้น',
        sellingPrice: 0,
        costPrice: 0,
        minStock: 10,
        currentStock: 0,
        isActive: true,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    // Fetch categories and vendors
    useEffect(() => {
        fetchCategories()
        fetchVendors()
    }, [])

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/master/spares-category?isActive=true')
            if (res.ok) {
                const json = await res.json()
                setCategories(json)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const fetchVendors = async () => {
        try {
            const res = await fetch('/api/master/vendor?isActive=true')
            if (res.ok) {
                const json = await res.json()
                setVendors(json)
            }
        } catch (error) {
            console.error('Error fetching vendors:', error)
        }
    }

    // Fetch spares
    const fetchData = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (categoryFilter) params.set('categoryId', categoryFilter)
            if (stockStatusFilter) params.set('stockStatus', stockStatusFilter)
            if (statusFilter) params.set('isActive', statusFilter)

            // Add sort params
            params.set('sortBy', sortBy)
            params.set('sortOrder', sortOrder)

            const res = await fetch(`/api/master/spare?${params}`)
            if (!res.ok) {
                showError(`เกิดข้อผิดพลาด (${res.status})`)
                setSpares([])
                return
            }

            const json = await res.json()
            setSpares(json)
        } catch (error) {
            showError('ไม่สามารถโหลดข้อมูลได้')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [sortBy, sortOrder])

    const handleSearch = () => {
        fetchData()
    }

    // Sort handler
    const handleSort = (field: string) => {
        if (sortBy === field) {
            // Toggle order if same field
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            // New field, default to asc
            setSortBy(field)
            setSortOrder('asc')
        }
    }

    // Helper to render sort icon
    const renderSortIcon = (field: string) => {
        if (sortBy !== field) return <i className="ti ti-arrows-sort text-muted ms-1 fs-5"></i>
        return sortOrder === 'asc'
            ? <i className="ti ti-arrow-up text-primary ms-1 fs-5"></i>
            : <i className="ti ti-arrow-down text-primary ms-1 fs-5"></i>
    }

    const handleAdd = () => {
        setEditingSpare(null)
        setFormData({
            name: '', description: '', sparesCategoryId: '', vendorId: '',
            unit: 'ชิ้น', sellingPrice: 0, costPrice: 0, minStock: 10, currentStock: 0, isActive: true
        })
        setErrors({})
        setIsModalOpen(true)
    }

    const handleEdit = (item: Spare) => {
        setEditingSpare(item)
        setFormData({
            name: item.name,
            description: item.description || '',
            sparesCategoryId: item.sparesCategoryId || '',
            vendorId: item.vendorId || '',
            unit: item.unit,
            sellingPrice: item.sellingPrice,
            costPrice: item.costPrice || 0,
            minStock: item.minStock,
            currentStock: item.currentStock,
            isActive: item.isActive,
        })
        setErrors({})
        setIsModalOpen(true)
    }

    const handleDelete = async (item: Spare) => {
        const confirmed = await confirmDelete(item.name)
        if (!confirmed) return

        try {
            const res = await fetch(`/api/master/spare/${item.id}`, { method: 'DELETE' })
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

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.name.trim()) newErrors.name = 'กรุณากรอกชื่ออะไหล่'
        if (formData.sellingPrice < 0) newErrors.sellingPrice = 'ราคาขายต้องไม่ต่ำกว่า 0'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validate()) return

        setSaving(true)
        try {
            const url = editingSpare ? `/api/master/spare/${editingSpare.id}` : '/api/master/spare'
            const res = await fetch(url, {
                method: editingSpare ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    sparesCategoryId: formData.sparesCategoryId || null,
                    vendorId: formData.vendorId || null,
                    costPrice: formData.costPrice || null,
                })
            })

            const json = await res.json()

            if (res.ok) {
                if (editingSpare) {
                    showUpdateSuccess(formData.name)
                } else {
                    showCreateSuccess(formData.name)
                }
                setIsModalOpen(false)
                fetchData()
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
            title={<><i className="ti ti-package me-2"></i>จัดการอะไหล่</>}
            pretitle="ข้อมูลหลัก / อะไหล่"
            actions={
                <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="ti ti-plus me-1"></i>เพิ่มอะไหล่
                </button>
            }
        >
            {/* Filter Bar */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="row g-2">
                        <div className="col-md-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="ค้นหา รหัส, ชื่อ..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                <option value="">ทุกหมวดหมู่</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" value={stockStatusFilter} onChange={(e) => setStockStatusFilter(e.target.value)}>
                                <option value="">สต็อกทั้งหมด</option>
                                <option value="low">ต่ำกว่า Min</option>
                                <option value="out">หมด</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
                    <h3 className="card-title">รายการอะไหล่</h3>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table table-hover">
                        <thead>
                            <tr>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('code')}>
                                    รหัส {renderSortIcon('code')}
                                </th>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                                    ชื่ออะไหล่ {renderSortIcon('name')}
                                </th>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('sparesCategoryId')}>
                                    หมวดหมู่ {renderSortIcon('sparesCategoryId')}
                                </th>
                                <th className="text-end" style={{ cursor: 'pointer' }} onClick={() => handleSort('sellingPrice')}>
                                    ราคา {renderSortIcon('sellingPrice')}
                                </th>
                                <th className="text-center" style={{ cursor: 'pointer' }} onClick={() => handleSort('currentStock')}>
                                    คงเหลือ {renderSortIcon('currentStock')}
                                </th>
                                <th className="text-center">Min</th>
                                <th className="text-center" style={{ cursor: 'pointer' }} onClick={() => handleSort('isActive')}>
                                    สถานะ {renderSortIcon('isActive')}
                                </th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="text-center py-4"><div className="spinner-border text-primary"></div></td></tr>
                            ) : spares.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-4 text-muted">ไม่พบข้อมูล</td></tr>
                            ) : (
                                spares.map((item) => (
                                    <tr key={item.id} className={item.isLowStock || item.isOutOfStock ? 'bg-danger-lt' : ''}>
                                        <td><code>{item.code}</code></td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-sm bg-secondary-lt me-2">
                                                    <i className="ti ti-package"></i>
                                                </span>
                                                <div>
                                                    <div className="font-weight-medium">{item.name}</div>
                                                    {item.vendor && <div className="text-muted small">Vendor: {item.vendor.name}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {item.sparesCategory ? (
                                                <span className="badge bg-blue-lt">{item.sparesCategory.name}</span>
                                            ) : '-'}
                                        </td>
                                        <td className="text-end">{formatCurrency(item.sellingPrice)}</td>
                                        <td className="text-center">
                                            <span className={`badge ${item.isOutOfStock ? 'bg-danger' : item.isLowStock ? 'bg-warning' : 'bg-success'}`}>
                                                {item.currentStock}
                                            </span>
                                            {item.isLowStock && <i className="ti ti-alert-triangle text-danger ms-1"></i>}
                                        </td>
                                        <td className="text-center">{item.minStock}</td>
                                        <td className="text-center">
                                            <span className={`badge ${item.isActive ? 'bg-success' : 'bg-secondary text-white'}`}>
                                                {item.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <a href="#" className="btn btn-ghost-primary btn-icon btn-sm" onClick={(e) => { e.preventDefault(); handleEdit(item) }}>
                                                <i className="ti ti-edit"></i>
                                            </a>
                                            <a href="#" className="btn btn-ghost-danger btn-icon btn-sm" onClick={(e) => { e.preventDefault(); handleDelete(item) }}>
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

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSpare ? 'แก้ไขอะไหล่' : 'เพิ่มอะไหล่ใหม่'}
                size="lg"
                footer={
                    <>
                        <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>ยกเลิก</button>
                        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>กำลังบันทึก...</> : 'บันทึก'}
                        </button>
                    </>
                }
            >
                <div className="row g-3">
                    <div className="col-md-12">
                        <FormInput label="ชื่ออะไหล่" required value={formData.name}
                            onChange={(e) => { setFormData(p => ({ ...p, name: e.target.value })); if (errors.name) setErrors(p => ({ ...p, name: '' })) }}
                            error={errors.name} placeholder="เช่น น้ำมันเครื่อง Castrol 5W-40 4L" />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">หมวดหมู่</label>
                        <select className="form-select" value={formData.sparesCategoryId} onChange={(e) => setFormData(p => ({ ...p, sparesCategoryId: e.target.value }))}>
                            <option value="">-- เลือกหมวดหมู่ --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Vendor</label>
                        <select className="form-select" value={formData.vendorId} onChange={(e) => setFormData(p => ({ ...p, vendorId: e.target.value }))}>
                            <option value="">-- เลือก Vendor --</option>
                            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                    </div>
                    <div className="col-12">
                        <label className="form-label">รายละเอียด</label>
                        <textarea className="form-control" rows={2} value={formData.description}
                            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} />
                    </div>
                    <div className="col-md-4">
                        <FormInput label="ราคาขาย" type="number" required value={formData.sellingPrice}
                            onChange={(e) => { setFormData(p => ({ ...p, sellingPrice: parseFloat(e.target.value) || 0 })); if (errors.sellingPrice) setErrors(p => ({ ...p, sellingPrice: '' })) }}
                            error={errors.sellingPrice} />
                    </div>
                    <div className="col-md-4">
                        <FormInput label="ต้นทุน" type="number" value={formData.costPrice}
                            onChange={(e) => setFormData(p => ({ ...p, costPrice: parseFloat(e.target.value) || 0 }))} />
                    </div>
                    <div className="col-md-4">
                        <FormInput label="จำนวน Min" type="number" required value={formData.minStock}
                            onChange={(e) => setFormData(p => ({ ...p, minStock: parseInt(e.target.value) || 10 }))} />
                    </div>
                    <div className="col-md-6">
                        <FormInput label="หน่วย" value={formData.unit}
                            onChange={(e) => setFormData(p => ({ ...p, unit: e.target.value }))} />
                    </div>
                    {editingSpare && (
                        <div className="col-md-6">
                            <FormInput label="คงเหลือ" type="number" value={formData.currentStock}
                                onChange={(e) => setFormData(p => ({ ...p, currentStock: parseInt(e.target.value) || 0 }))} />
                        </div>
                    )}
                    <div className="col-12">
                        <label className="form-check form-switch cursor-pointer">
                            <input className="form-check-input" type="checkbox" checked={formData.isActive}
                                onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))} />
                            <span className="form-check-label ms-2">สถานะการใช้งาน (Active)</span>
                        </label>
                    </div>
                </div>
            </Modal>
        </MainLayout>
    )
}
