/**
 * ไฟล์: app/master/car-brand/page.tsx
 * จุดประสงค์: หน้าจัดการยี่ห้อรถ ตาม mockup master-car-brand.html
 * 
 * @author AutoCare Team
 * @created 2026-01-25
 */

'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Modal, FormInput, showCreateSuccess, showUpdateSuccess, showDeleteSuccess, showError, confirmDelete } from '@/components/ui'

interface CarBrand {
    id: string
    code: string
    nameThai: string
    nameEnglish: string
    name: string
    logoUrl: string | null
    isActive: boolean
    updatedAt: string | null
}

// Format วันที่
const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${(d.getFullYear() + 543) % 100}`
}

export default function CarBrandPage() {
    const [carBrands, setCarBrands] = useState<CarBrand[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBrand, setEditingBrand] = useState<CarBrand | null>(null)

    // Sorting
    const [sortBy, setSortBy] = useState('updatedAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    // Form state
    const [formData, setFormData] = useState({
        nameThai: '',
        nameEnglish: '',
        logoUrl: '',
        isActive: true,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    // Fetch data
    const fetchData = async (
        sort: string = sortBy,
        order: string = sortOrder
    ) => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            params.set('sortBy', sort)
            params.set('sortOrder', order)

            const res = await fetch(`/api/master/car-brand?${params}`)

            if (!res.ok) {
                console.error('API Error:', res.status, res.statusText)
                try {
                    const errorJson = await res.json()
                    showError(errorJson.error || 'ไม่สามารถโหลดข้อมูลได้')
                } catch {
                    showError(`เกิดข้อผิดพลาด (${res.status}): กรุณาตรวจสอบการเชื่อมต่อหรือเข้าสู่ระบบใหม่`)
                }
                setCarBrands([])
                return
            }

            const json = await res.json()
            if (json.success) {
                setCarBrands(json.data)
            } else {
                showError(json.error || 'ไม่สามารถโหลดข้อมูลได้')
            }
        } catch (error) {
            showError('ไม่สามารถโหลดข้อมูลได้')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [sortBy, sortOrder])

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
        setEditingBrand(null)
        setFormData({ nameThai: '', nameEnglish: '', logoUrl: '', isActive: true })
        setErrors({})
        setIsModalOpen(true)
    }

    // Open modal for edit
    const handleEdit = (item: CarBrand) => {
        setEditingBrand(item)
        setFormData({
            nameThai: item.nameThai,
            nameEnglish: item.nameEnglish,
            logoUrl: item.logoUrl || '',
            isActive: item.isActive,
        })
        setErrors({})
        setIsModalOpen(true)
    }

    // Delete
    const handleDelete = async (item: CarBrand) => {
        const confirmed = await confirmDelete(item.nameEnglish)
        if (!confirmed) return

        try {
            const res = await fetch(`/api/master/car-brand/${item.id}`, {
                method: 'DELETE'
            })
            const json = await res.json()

            if (json.success) {
                showDeleteSuccess(item.nameEnglish)
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
        if (!formData.nameThai.trim()) {
            newErrors.nameThai = 'กรุณากรอกชื่อยี่ห้อ (ไทย)'
        }
        if (!formData.nameEnglish.trim()) {
            newErrors.nameEnglish = 'กรุณากรอกชื่อยี่ห้อ (EN)'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Save
    const handleSave = async () => {
        if (!validate()) return

        setSaving(true)
        try {
            const url = editingBrand
                ? `/api/master/car-brand/${editingBrand.id}`
                : '/api/master/car-brand'

            const res = await fetch(url, {
                method: editingBrand ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nameThai: formData.nameThai.trim(),
                    nameEnglish: formData.nameEnglish.trim(),
                    logoUrl: formData.logoUrl.trim() || null,
                    isActive: formData.isActive,
                })
            })

            const json = await res.json()

            if (json.success) {
                if (editingBrand) {
                    showUpdateSuccess(formData.nameEnglish)
                } else {
                    showCreateSuccess(formData.nameEnglish)
                }
                setIsModalOpen(false)

                // Sort by Updated At Descending after save
                setSortBy('updatedAt')
                setSortOrder('desc')
                fetchData('updatedAt', 'desc')
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
            title={<><i className="ti ti-brand-toyota me-2"></i>ยี่ห้อรถ</>}
            pretitle="Master Data / รถยนต์"
            actions={
                <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="ti ti-plus me-1"></i>เพิ่มยี่ห้อ
                </button>
            }
        >
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">รายการยี่ห้อรถ</h3>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th className="cursor-pointer" onClick={() => handleSort('code')}>
                                    รหัส {renderSortIcon('code')}
                                </th>
                                <th className="cursor-pointer" onClick={() => handleSort('nameThai')}>
                                    ยี่ห้อ (ไทย) {renderSortIcon('nameThai')}
                                </th>
                                <th className="cursor-pointer" onClick={() => handleSort('nameEnglish')}>
                                    ยี่ห้อ (EN) {renderSortIcon('nameEnglish')}
                                </th>
                                <th>โลโก้</th>
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
                                    <td colSpan={7} className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : carBrands.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-4 text-muted">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            ) : (
                                carBrands.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <code>{item.code}</code>
                                            {/* Debug: {JSON.stringify(item)} */}
                                        </td>
                                        <td>{item.nameThai || item.name}</td>
                                        <td>{item.nameEnglish || item.name}</td>
                                        <td>
                                            {item.logoUrl ? (
                                                <img
                                                    src={item.logoUrl}
                                                    alt={item.nameEnglish}
                                                    style={{ height: '30px', width: 'auto', objectFit: 'contain' }}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.parentElement!.innerHTML = `<span class="avatar avatar-xs rounded bg-secondary-lt">${(item.nameEnglish || item.name || '?').charAt(0)}</span>`;
                                                    }}
                                                />
                                            ) : (
                                                <span className="avatar avatar-xs rounded bg-secondary-lt">
                                                    {(item.nameEnglish || item.name || '?').charAt(0)}
                                                </span>
                                            )}
                                        </td>
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
                title={editingBrand ? 'แก้ไขยี่ห้อรถ' : 'เพิ่มยี่ห้อรถ'}
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
                    label="ยี่ห้อ (ไทย)"
                    required
                    value={formData.nameThai}
                    onChange={(e) => {
                        setFormData(prev => ({ ...prev, nameThai: e.target.value }))
                        if (errors.nameThai) setErrors(prev => ({ ...prev, nameThai: '' }))
                    }}
                    error={errors.nameThai}
                    placeholder="เช่น โตโยต้า"
                />
                <FormInput
                    label="ยี่ห้อ (EN)"
                    required
                    value={formData.nameEnglish}
                    onChange={(e) => {
                        setFormData(prev => ({ ...prev, nameEnglish: e.target.value }))
                        if (errors.nameEnglish) setErrors(prev => ({ ...prev, nameEnglish: '' }))
                    }}
                    error={errors.nameEnglish}
                    placeholder="เช่น Toyota"
                />
                <FormInput
                    label="โลโก้ URL"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://example.com/logo.png"
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
