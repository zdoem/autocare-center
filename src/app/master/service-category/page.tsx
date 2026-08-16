/**
 * ไฟล์: app/master/service-category/page.tsx
 * จุดประสงค์: หน้าจัดการข้อมูลหมวดหมู่บริการ (Service Category)
 * 
 * @author AutoCare Team
 * @created 2026-08-15
 */

'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Modal, FormInput, showCreateSuccess, showUpdateSuccess, showDeleteSuccess, showError, confirmDelete } from '@/components/ui'

interface ServiceCategory {
    id: string
    code: string
    name: string
    description: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
    _count?: {
        services: number
    }
}

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${(d.getFullYear() + 543) % 100}`
}

export default function ServiceCategoryPage() {
    const [categories, setCategories] = useState<ServiceCategory[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)

    // Filtering
    const [search, setSearch] = useState('')

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true,
    })

    const fetchData = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: String(page),
                limit: '10',
            })
            if (search) params.set('search', search)

            const res = await fetch(`/api/master/service-category?${params}`)
            const json = await res.json()
            if (res.ok && json.success) {
                setCategories(json.data)
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
        const timeout = setTimeout(() => {
            fetchData()
        }, 300)
        return () => clearTimeout(timeout)
    }, [page, search])

    const handleAdd = () => {
        setEditingCategory(null)
        setFormData({
            name: '',
            description: '',
            isActive: true,
        })
        setErrors({})
        setIsModalOpen(true)
    }

    const handleEdit = (item: ServiceCategory) => {
        setEditingCategory(item)
        setFormData({
            name: item.name,
            description: item.description || '',
            isActive: item.isActive,
        })
        setErrors({})
        setIsModalOpen(true)
    }

    const handleDelete = async (item: ServiceCategory) => {
        const confirmed = await confirmDelete(`หมวดหมู่ ${item.name}`)
        if (!confirmed) return

        try {
            const res = await fetch(`/api/master/service-category/${item.id}`, { method: 'DELETE' })
            const json = await res.json()

            if (res.ok && json.success) {
                showDeleteSuccess(item.name)
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
        if (!formData.name.trim()) newErrors.name = 'กรุณากรอกชื่อหมวดหมู่'
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validate()) return

        setSaving(true)
        try {
            const url = editingCategory ? `/api/master/service-category/${editingCategory.id}` : '/api/master/service-category'
            const method = editingCategory ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const json = await res.json()

            if (res.ok && json.success) {
                if (editingCategory) showUpdateSuccess(formData.name)
                else showCreateSuccess(formData.name)
                
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

    return (
        <MainLayout
            title={<><i className="ti ti-tags me-2"></i>หมวดหมู่บริการ</>}
            pretitle="Master Data / บริการ"
            actions={
                <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="ti ti-plus me-1"></i>เพิ่มหมวดหมู่
                </button>
            }
        >
            <div className="card">
                <div className="card-header border-bottom-0">
                    <div className="row w-100 align-items-center">
                        <div className="col">
                            <h3 className="card-title">รายการหมวดหมู่บริการ</h3>
                        </div>
                        <div className="col-auto ms-auto d-flex gap-2">
                            <div className="input-icon">
                                <span className="input-icon-addon">
                                    <i className="ti ti-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="ค้นหา รหัส, ชื่อ..."
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
                                <th>ชื่อหมวดหมู่</th>
                                <th>คำอธิบาย</th>
                                <th>จำนวนบริการ</th>
                                <th>สถานะ</th>
                                <th>อัพเดท</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-4 text-muted">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            ) : (
                                categories.map((item) => (
                                    <tr key={item.id}>
                                        <td><code className="text-muted">{item.code}</code></td>
                                        <td><div className="fw-medium">{item.name}</div></td>
                                        <td><span className="text-muted">{item.description || '-'}</span></td>
                                        <td>
                                            <span className="badge bg-blue-lt">
                                                {item._count?.services || 0} บริการ
                                            </span>
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
                title={editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
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
                    <div className="col-md-12">
                        <FormInput
                            label="ชื่อหมวดหมู่"
                            required
                            value={formData.name}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, name: e.target.value }))
                                if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                            }}
                            error={errors.name}
                            placeholder="เช่น ถ่ายน้ำมันเครื่อง, เช็คระยะ"
                        />
                    </div>
                    
                    <div className="col-md-12">
                        <label className="form-label">คำอธิบาย (ทางเลือก)</label>
                        <textarea
                            className="form-control"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        ></textarea>
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
