/**
 * ไฟล์: app/master/employee-type/page.tsx
 * จุดประสงค์: หน้าจัดการประเภทพนักงาน ตาม mockup master-employee-type.html
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Modal, FormInput, showCreateSuccess, showUpdateSuccess, showDeleteSuccess, showError, confirmDelete } from '@/components/ui'

interface EmployeeType {
    id: number
    code: string
    name: string
    description: string | null
    leaveEntitlement: string | null
    employeeCount: number
    isActive: boolean
    updatedAt: string | null
}

// สีสำหรับแต่ละประเภท
const typeStyles: Record<string, string> = {
    'พนักงานประจำ': 'bg-success',
    'พนักงานสัญญาจ้าง': 'bg-warning',
    'พนักงาน Part-time': 'bg-cyan',
    'Freelance': 'bg-secondary',
}

const getStyle = (name: string) => {
    return typeStyles[name] || 'bg-primary'
}

// Format วันที่
const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${(d.getFullYear() + 543) % 100}`
}

export default function EmployeeTypePage() {
    const [employeeTypes, setEmployeeTypes] = useState<EmployeeType[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingType, setEditingType] = useState<EmployeeType | null>(null)

    // Sorting
    const [sortBy, setSortBy] = useState('updatedAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        leaveEntitlement: '',
        employeeCount: 0,
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

            const res = await fetch(`/api/master/employee-type?${params}`)
            const json = await res.json()
            if (json.success) {
                setEmployeeTypes(json.data)
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
        setEditingType(null)
        setFormData({ name: '', description: '', leaveEntitlement: '', employeeCount: 0, isActive: true })
        setErrors({})
        setIsModalOpen(true)
    }

    // Open modal for edit
    const handleEdit = (item: EmployeeType) => {
        setEditingType(item)
        setFormData({
            name: item.name,
            description: item.description || '',
            leaveEntitlement: item.leaveEntitlement || '',
            employeeCount: item.employeeCount || 0,
            isActive: item.isActive,
        })
        setErrors({})
        setIsModalOpen(true)
    }

    // Delete
    const handleDelete = async (item: EmployeeType) => {
        const confirmed = await confirmDelete(item.name)
        if (!confirmed) return

        try {
            const res = await fetch(`/api/master/employee-type/${item.id}`, {
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
        } else if (formData.name.length < 2) {
            newErrors.name = 'ชื่อประเภทต้องมีอย่างน้อย 2 ตัวอักษร'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Save
    const handleSave = async () => {
        if (!validate()) return

        setSaving(true)
        try {
            const url = editingType
                ? `/api/master/employee-type/${editingType.id}`
                : '/api/master/employee-type'

            const res = await fetch(url, {
                method: editingType ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    description: formData.description.trim() || null,
                    leaveEntitlement: formData.leaveEntitlement.trim() || null,
                    employeeCount: Number(formData.employeeCount),
                    isActive: formData.isActive,
                })
            })

            const json = await res.json()

            if (json.success) {
                if (editingType) {
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
            title={<><i className="ti ti-user-cog me-2"></i>ประเภทพนักงาน</>}
            pretitle="Master Data / พนักงาน"
            actions={
                <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="ti ti-plus me-1"></i>เพิ่มประเภท
                </button>
            }
        >
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">รายการประเภทพนักงาน</h3>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th className="cursor-pointer" onClick={() => handleSort('code')}>
                                    รหัส {renderSortIcon('code')}
                                </th>
                                <th className="cursor-pointer" onClick={() => handleSort('name')}>
                                    ประเภท {renderSortIcon('name')}
                                </th>
                                <th>คำอธิบาย</th>
                                <th>สิทธิ์การหยุด</th>
                                <th className="cursor-pointer text-center" onClick={() => handleSort('employeeCount')}>
                                    จำนวนคน {renderSortIcon('employeeCount')}
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
                                    <td colSpan={8} className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : employeeTypes.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-4 text-muted">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            ) : (
                                employeeTypes.map((item) => (
                                    <tr key={item.id}>
                                        <td><code>{item.code}</code></td>
                                        <td>
                                            <span className="badge bg-info text-white fs-5">
                                                {item.name}
                                            </span>
                                        </td>
                                        <td>{item.description || '-'}</td>
                                        <td>{item.leaveEntitlement || '-'}</td>
                                        <td className="text-center">{item.employeeCount}</td>
                                        <td className="text-center">
                                            <span className={`badge ${item.isActive ? 'bg-success' : 'bg-secondary text-white'}`}>
                                                {item.isActive ? 'ใญ้งาน' : 'ไม่ใช้งาน'}
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
                title={editingType ? 'แก้ไขประเภทพนักงาน' : 'เพิ่มประเภทพนักงาน'}
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
                    placeholder="เช่น พนักงานประจำ, สัญญาจ้าง"
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
                    label="สิทธิ์การหยุด"
                    value={formData.leaveEntitlement}
                    onChange={(e) => setFormData(prev => ({ ...prev, leaveEntitlement: e.target.value }))}
                    placeholder="เช่น ลาพักร้อน 6 วัน, ลาป่วย 30 วัน"
                />
                <FormInput
                    label="จำนวนพนักงาน"
                    type="number"
                    value={formData.employeeCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeCount: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
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
