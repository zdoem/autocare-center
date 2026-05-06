/**
 * ไฟล์: app/master/customer-type/page.tsx
 * จุดประสงค์: หน้าจัดการประเภทลูกค้า ตาม mockup master-customer-type.html
 * 
 * @author AutoCare Team
 * @created 2024-01-24
 */

'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Modal, FormInput, showCreateSuccess, showUpdateSuccess, showDeleteSuccess, showError, confirmDelete } from '@/components/ui'

interface CustomerType {
    id: string
    code: string
    name: string
    description: string | null
    discount: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    _count: { customers: number }
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

export default function CustomerTypePage() {
    const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<CustomerType | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        discount: 0,
        isActive: true,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    // Sorting state (Matched with Customer Page)
    const [sortBy, setSortBy] = useState('code')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    // Fetch data
    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/master/customer-type')
            const json = await res.json()
            if (json.success) {
                setCustomerTypes(json.data)
            }
        } catch (error) {
            showError('ไม่สามารถโหลดข้อมูลได้')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Open modal for add - ✅ Bug Fix: Reset state
    const handleAdd = () => {
        setEditingItem(null)
        setFormData({ name: '', description: '', discount: 0, isActive: true })
        setErrors({})
        setIsModalOpen(true)
    }

    // Open modal for edit - ✅ Bug Fix: Populate correctly
    const handleEdit = (item: CustomerType) => {
        setEditingItem(item)
        setFormData({
            name: item.name,
            description: item.description || '',
            discount: item.discount || 0,
            isActive: item.isActive,
        })
        setErrors({})
        setIsModalOpen(true)
    }

    // Delete
    const handleDelete = async (item: CustomerType) => {
        const confirmed = await confirmDelete(item.name)
        if (!confirmed) return

        try {
            const res = await fetch(`/api/master/customer-type/${item.id}`, {
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
            newErrors.name = 'กรุณากรอกชื่อประเภท'
        }
        if (formData.discount < 0 || formData.discount > 100) {
            newErrors.discount = 'ส่วนลดต้องอยู่ระหว่าง 0-100%'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Save - ✅ Bug Fix: Loading state
    const handleSave = async () => {
        if (!validate()) return

        setSaving(true)
        try {
            const url = editingItem
                ? `/api/master/customer-type/${editingItem.id}`
                : '/api/master/customer-type'

            const res = await fetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    description: formData.description.trim() || null,
                    discount: Number(formData.discount),
                    isActive: formData.isActive,
                })
            })

            const json = await res.json()

            if (json.success) {
                if (editingItem) {
                    showUpdateSuccess(formData.name)
                } else {
                    showCreateSuccess(formData.name)
                }
                setIsModalOpen(false)
                fetchData()

                // Switch sort to Updated At desc on Save
                setSortBy('updatedAt')
                setSortOrder('desc')
            } else {
                showError(json.error)
            }
        } catch (error) {
            showError('ไม่สามารถบันทึกข้อมูลได้')
        } finally {
            setSaving(false)
        }
    }

    // Sorting Logic
    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
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

    const sortedCustomerTypes = [...customerTypes].sort((a, b) => {
        const key = sortBy as keyof CustomerType
        let aValue = a[key]
        let bValue = b[key]

        if (typeof aValue === 'string') aValue = aValue.toLowerCase()
        if (typeof bValue === 'string') bValue = bValue.toLowerCase()

        if (aValue === bValue) return 0

        const result = aValue! < bValue! ? -1 : 1
        return sortOrder === 'asc' ? result : -result
    })

    return (
        <MainLayout
            title={<><i className="ti ti-category me-2"></i>ประเภทลูกค้า</>}
            pretitle="Master Data / ลูกค้า"
            actions={
                <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="ti ti-plus me-1"></i>เพิ่มประเภท
                </button>
            }
        >
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">รายการประเภทลูกค้า</h3>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('code')} style={{ cursor: 'pointer' }}>
                                    รหัส {renderSortIcon('code')}
                                </th>
                                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                    ประเภท {renderSortIcon('name')}
                                </th>
                                <th>คำอธิบาย</th>
                                <th className="text-center" onClick={() => handleSort('discount')} style={{ cursor: 'pointer' }}>
                                    ส่วนลด (%) {renderSortIcon('discount')}
                                </th>
                                <th className="text-center" onClick={() => handleSort('isActive')} style={{ cursor: 'pointer' }}>
                                    สถานะ {renderSortIcon('isActive')}
                                </th>
                                <th onClick={() => handleSort('updatedAt')} style={{ cursor: 'pointer' }}>
                                    แก้ไขล่าสุด {renderSortIcon('updatedAt')}
                                </th>
                                <th className="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : sortedCustomerTypes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-4 text-muted">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            ) : (
                                sortedCustomerTypes.map((item) => (
                                    <tr key={item.id}>
                                        <td><code>{item.code}</code></td>
                                        <td>
                                            <span className="badge bg-info text-white">
                                                {item.name}
                                            </span>
                                        </td>
                                        <td>{item.description || '-'}</td>
                                        <td className="text-center">
                                            {item.discount > 0 ? (
                                                <span className="text-success fw-bold">{item.discount}%</span>
                                            ) : (
                                                '0%'
                                            )}
                                        </td>
                                        {/* Removed Customer Count Cell */}
                                        <td className="text-center">
                                            <span className={`badge ${item.isActive ? 'bg-success' : 'bg-secondary text-white'}`}>
                                                {item.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                            </span>
                                        </td>
                                        <td>
                                            {formatDateThaiShort(item.updatedAt)}
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
                title={editingItem ? 'แก้ไขประเภทลูกค้า' : 'เพิ่มประเภทลูกค้า'}
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
                    label="ชื่อประเภท"
                    required
                    value={formData.name}
                    onChange={(e) => {
                        setFormData(prev => ({ ...prev, name: e.target.value }))
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                    }}
                    error={errors.name}
                    placeholder="เช่น VIP, ทั่วไป, นิติบุคคล"
                />
                <div className="mb-3">
                    <label className="form-label">คำอธิบาย</label>
                    <textarea
                        className="form-control"
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="รายละเอียดเพิ่มเติม"
                    />
                </div>
                <FormInput
                    label="ส่วนลด (%)"
                    type="number"
                    value={formData.discount}
                    onChange={(e) => {
                        setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))
                        if (errors.discount) setErrors(prev => ({ ...prev, discount: '' }))
                    }}
                    error={errors.discount}
                    placeholder="0"
                    min="0"
                    max="100"
                />
                <div className="mb-3">
                    <label className="form-check form-switch cursor-pointer">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        />
                        <span className="form-check-label">สถานะใช้งาน</span>
                    </label>
                </div>
            </Modal>
        </MainLayout>
    )
}
