/**
 * ไฟล์: app/master/spares-category/page.tsx
 * จุดประสงค์: หน้าจัดการหมวดหมู่อะไหล่ ตาม mockup master-spares-category.html
 * 
 * @author AutoCare Team
 * @created 2026-01-26
 */

'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Modal, FormInput, showCreateSuccess, showUpdateSuccess, showDeleteSuccess, showError, confirmDelete } from '@/components/ui'

interface SparesCategory {
    id: string
    code: string
    name: string
    description: string | null
    spareCount: number
    isActive: boolean
    updatedAt: string | null
}

export default function SparesCategoryPage() {
    const [categories, setCategories] = useState<SparesCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<SparesCategory | null>(null)

    // Sorting
    const [sortBy, setSortBy] = useState('code')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    // Search/Filter
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('')

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
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

            const res = await fetch(`/api/master/spares-category?${params}`)

            if (!res.ok) {
                console.error('API Error:', res.status, res.statusText)
                showError(`เกิดข้อผิดพลาด (${res.status})`)
                setCategories([])
                return
            }

            const json = await res.json()
            setCategories(json)
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
        setEditingCategory(null)
        setFormData({ name: '', description: '', isActive: true })
        setErrors({})
        setIsModalOpen(true)
    }

    // Open modal for edit
    const handleEdit = (item: SparesCategory) => {
        setEditingCategory(item)
        setFormData({
            name: item.name,
            description: item.description || '',
            isActive: item.isActive,
        })
        setErrors({})
        setIsModalOpen(true)
    }

    // Delete
    const handleDelete = async (item: SparesCategory) => {
        const confirmed = await confirmDelete(item.name)
        if (!confirmed) return

        try {
            const res = await fetch(`/api/master/spares-category/${item.id}`, {
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
            newErrors.name = 'กรุณากรอกชื่อหมวดหมู่'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Save
    const handleSave = async () => {
        if (!validate()) return

        setSaving(true)
        try {
            const url = editingCategory
                ? `/api/master/spares-category/${editingCategory.id}`
                : '/api/master/spares-category'

            const res = await fetch(url, {
                method: editingCategory ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    description: formData.description.trim() || null,
                    isActive: formData.isActive,
                })
            })

            const json = await res.json()

            if (res.ok) {
                if (editingCategory) {
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
            title={<><i className="ti ti-category-2 me-2"></i>หมวดหมู่อะไหล่</>}
            pretitle="Master Data / อะไหล่"
            actions={
                <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="ti ti-plus me-1"></i>เพิ่มหมวดหมู่
                </button>
            }
        >
            {/* Search/Filter Bar */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="row g-2">
                        <div className="col-md-7">
                            <div className="input-icon">
                                <span className="input-icon-addon">
                                    <i className="ti ti-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="ค้นหา รหัส, ชื่อหมวดหมู่, คำอธิบาย..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                        </div>
                        <div className="col-md-2">
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
                    <h3 className="card-title">รายการหมวดหมู่</h3>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th className="cursor-pointer" onClick={() => handleSort('code')}>
                                    รหัส {renderSortIcon('code')}
                                </th>
                                <th className="cursor-pointer" onClick={() => handleSort('name')}>
                                    หมวดหมู่ {renderSortIcon('name')}
                                </th>
                                <th>คำอธิบาย</th>
                                <th className="text-center">จำนวนอะไหล่</th>
                                <th className="text-center cursor-pointer" onClick={() => handleSort('isActive')}>
                                    สถานะ {renderSortIcon('isActive')}
                                </th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-4 text-muted">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            ) : (
                                categories.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <code>{item.code}</code>
                                        </td>
                                        <td>
                                            <span className="badge bg-blue-lt fs-5">
                                                <i className="ti ti-category-2 me-1"></i>{item.name}
                                            </span>
                                        </td>
                                        <td className="text-muted">{item.description || '-'}</td>
                                        <td className="text-center">
                                            {item.spareCount}
                                        </td>
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
                title={editingCategory ? 'แก้ไขหมวดหมู่อะไหล่' : 'เพิ่มหมวดหมู่อะไหล่'}
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
                    label="ชื่อหมวดหมู่"
                    required
                    value={formData.name}
                    onChange={(e) => {
                        setFormData(prev => ({ ...prev, name: e.target.value }))
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                    }}
                    error={errors.name}
                    placeholder="เช่น น้ำมัน/ของเหลว"
                />
                <div className="mb-3">
                    <label className="form-label">คำอธิบาย</label>
                    <textarea
                        className="form-control"
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="เช่น น้ำมันเครื่อง, น้ำมันเก ียร์, น้ำยาหล่อเย็น"
                    />
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
