/**
 * ไฟล์: app/master/vendor/page.tsx
 * จุดประสงค์: หน้าจัดการผู้จำหน่าย (Vendor)
 * 
 * @author AutoCare Team
 * @created 2024-02-08
 */

'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Modal, FormInput, showCreateSuccess, showUpdateSuccess, showDeleteSuccess, showError, confirmDelete } from '@/components/ui'

interface Vendor {
    id: string
    code: string
    name: string
    contactName: string | null
    phone: string | null
    email: string | null
    address: string | null
    taxId: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
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
    return name.charAt(0).toUpperCase()
}

// Helper for Thai date short format (DD/MM/YY)
const formatDateThaiShort = (dateString: string | Date | undefined) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
    })
}

export default function VendorPage() {
    const [vendors, setVendors] = useState<Vendor[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Vendor | null>(null)

    // Filters
    const [searchText, setSearchText] = useState('')
    const [sortBy, setSortBy] = useState('updatedAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        taxId: '',
        isActive: true,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    // Fetch vendors
    const fetchData = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (searchText) params.set('search', searchText)
            params.set('sortBy', sortBy)
            params.set('sortOrder', sortOrder)

            const res = await fetch(`/api/master/vendor?${params}`)
            const data = await res.json()

            if (Array.isArray(data)) {
                setVendors(data)
            } else if (data.error) {
                showError(data.error)
            }
        } catch (error) {
            showError('ไม่สามารถโหลดข้อมูลได้')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [searchText, sortBy, sortOrder])

    // Sort handler
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

    const handleAdd = () => {
        setEditingItem(null)
        setFormData({
            name: '',
            contactName: '',
            phone: '',
            email: '',
            address: '',
            taxId: '',
            isActive: true, // Default active
        })
        setErrors({})
        setIsModalOpen(true)
    }

    const handleEdit = (item: Vendor) => {
        setEditingItem(item)
        setFormData({
            name: item.name,
            contactName: item.contactName || '',
            phone: item.phone || '',
            email: item.email || '',
            address: item.address || '',
            taxId: item.taxId || '',
            isActive: item.isActive,
        })
        setErrors({})
        setIsModalOpen(true)
    }

    const handleDelete = async (item: Vendor) => {
        const confirmed = await confirmDelete(item.name)
        if (!confirmed) return

        try {
            const res = await fetch(`/api/master/vendor/${item.id}`, {
                method: 'DELETE'
            })
            const json = await res.json()

            if (res.ok) {
                showDeleteSuccess(item.name)
                fetchData()
            } else {
                showError(json.error || json.details)
            }
        } catch (error) {
            showError('ไม่สามารถลบข้อมูลได้')
        }
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.name.trim()) newErrors.name = 'กรุณากรอกชื่อ Vendor'
        // Add more validation if needed
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validate()) return

        setSaving(true)
        try {
            const url = editingItem
                ? `/api/master/vendor/${editingItem.id}`
                : '/api/master/vendor'

            const res = await fetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    contactName: formData.contactName.trim() || null,
                    phone: formData.phone.trim() || null,
                    email: formData.email.trim() || null,
                    address: formData.address.trim() || null,
                    taxId: formData.taxId.trim() || null,
                    isActive: formData.isActive,
                })
            })

            const json = await res.json()

            if (res.ok) {
                const name = formData.name
                if (editingItem) {
                    showUpdateSuccess(name)
                } else {
                    showCreateSuccess(name)
                }
                setIsModalOpen(false)
                fetchData()
            } else {
                if (json.details && Array.isArray(json.details)) {
                    // Handle Zod errors if returned in that format
                    const msg = json.details.map((e: any) => e.message).join(', ')
                    showError(msg || 'ข้อมูลไม่ถูกต้อง')
                } else {
                    showError(json.error || 'เกิดข้อผิดพลาด')
                }
            }
        } catch (error) {
            showError('ไม่สามารถบันทึกข้อมูลได้')
        } finally {
            setSaving(false)
        }
    }

    return (
        <MainLayout
            title={<><i className="ti ti-truck-delivery me-2"></i>ข้อมูลผู้จำหน่าย (Vendor)</>}
            pretitle="Master Data / ผู้จำหน่าย"
            actions={
                <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="ti ti-plus me-1"></i>เพิ่ม Vendor
                </button>
            }
        >
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">รายชื่อผู้จำหน่าย</h3>
                    <div className="card-actions">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="ค้นหาชื่อ/เบอร์/ผู้ติดต่อ..."
                            style={{ width: 250 }}
                            value={searchText}
                            onChange={(e) => { setSearchText(e.target.value) }}
                        />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('code')}>
                                    รหัส {renderSortIcon('code')}
                                </th>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                                    ชื่อร้าน/บริษัท {renderSortIcon('name')}
                                </th>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('contactName')}>
                                    ผู้ติดต่อ {renderSortIcon('contactName')}
                                </th>
                                <th>เบอร์โทร</th>
                                <th>เลขภาษี</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('updatedAt')}>
                                    วันที่ล่าสุด {renderSortIcon('updatedAt')}
                                </th>
                                <th className="text-center">สถานะ</th>
                                <th className="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : vendors.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-4 text-muted">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            ) : (
                                vendors.map((item) => (
                                    <tr key={item.id}>
                                        <td><code>{item.code}</code></td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <span className={`avatar avatar-sm ${getAvatarColor(item.name)} me-2`}>
                                                    {getFirstLetter(item.name)}
                                                </span>
                                                <div className="fw-bold">{item.name}</div>
                                            </div>
                                        </td>
                                        <td>{item.contactName || '-'}</td>
                                        <td>{item.phone || '-'}</td>
                                        <td>{item.taxId || '-'}</td>
                                        <td>
                                            {formatDateThaiShort(item.updatedAt || item.createdAt)}
                                        </td>
                                        <td className="text-center">
                                            {item.isActive ? (
                                                <span className="badge bg-success-lt">Active</span>
                                            ) : (
                                                <span className="badge bg-secondary-lt">Inactive</span>
                                            )}
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
                <div className="card-footer d-flex align-items-center">
                    <p className="m-0 text-muted">
                        จำนวนทั้งหมด {vendors.length} รายการ
                    </p>
                </div>
            </div>

            {/* Modal Add/Edit */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'แก้ไข Vendor' : 'เพิ่ม Vendor'}
                size="lg"
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
                <div className="row">
                    <div className="col-md-12 mb-3">
                        <label className="form-check form-switch cursor-pointer">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            />
                            <span className="form-check-label">ใช้งาน (Active)</span>
                        </label>
                    </div>

                    <div className="col-md-6">
                        <FormInput
                            label="ชื่อร้านค้า / บริษัท"
                            required
                            value={formData.name}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, name: e.target.value }))
                                if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                            }}
                            error={errors.name}
                        />
                    </div>
                    <div className="col-md-6">
                        <FormInput
                            label="ชื่อผู้ติดต่อ"
                            value={formData.contactName}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                        />
                    </div>
                    <div className="col-md-6">
                        <FormInput
                            label="เบอร์โทรศัพท์"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                    </div>
                    <div className="col-md-6">
                        <FormInput
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </div>
                    <div className="col-md-6">
                        <FormInput
                            label="เลขประจำตัวผู้เสียภาษี"
                            value={formData.taxId}
                            onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                        />
                    </div>
                    <div className="col-12">
                        <div className="mb-3">
                            <label className="form-label">ที่อยู่</label>
                            <textarea
                                className="form-control"
                                rows={2}
                                value={formData.address}
                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </MainLayout>
    )
}
