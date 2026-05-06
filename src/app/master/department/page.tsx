/**
 * ไฟล์: app/master/department/page.tsx
 * จุดประสงค์: หน้าจัดการแผนก ตาม mockup master-department.html
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Modal, FormInput, showCreateSuccess, showUpdateSuccess, showDeleteSuccess, showError, confirmDelete } from '@/components/ui'

interface Department {
    id: number
    code: string
    name: string
    description: string | null
    employeeCount: number
    isActive: boolean
    updatedAt: string | null
}

// สีและไอคอนสำหรับแต่ละแผนก
const departmentStyles: Record<string, { bg: string; icon: string }> = {
    'ผู้บริหาร': { bg: 'bg-primary', icon: 'ti-crown' },
    'ช่าง': { bg: 'bg-azure', icon: 'ti-tool' },
    'การเงิน': { bg: 'bg-orange', icon: 'ti-cash' },
    'สำนักงาน': { bg: 'bg-purple', icon: 'ti-clipboard' },
    'คลังสินค้า': { bg: 'bg-cyan', icon: 'ti-box' },
}

const getStyle = (name: string) => {
    return departmentStyles[name] || { bg: 'bg-info', icon: 'ti-building' }
}

// Format วันที่
const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${(d.getFullYear() + 543) % 100}`
}

export default function DepartmentPage() {
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingDept, setEditingDept] = useState<Department | null>(null)

    // Sorting
    const [sortBy, setSortBy] = useState('updatedAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        employeeCount: 0,
        isActive: true,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    // Fetch departments
    const fetchDepartments = async (
        sort: string = sortBy,
        order: string = sortOrder
    ) => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            params.set('sortBy', sort)
            params.set('sortOrder', order)

            const res = await fetch(`/api/master/department?${params}`)
            const json = await res.json()
            if (json.success) {
                setDepartments(json.data)
            }
        } catch (error) {
            showError('ไม่สามารถโหลดข้อมูลได้')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDepartments()
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
        setEditingDept(null)
        setFormData({ name: '', description: '', employeeCount: 0, isActive: true })
        setErrors({})
        setIsModalOpen(true)
    }

    // Open modal for edit
    const handleEdit = (dept: Department) => {
        setEditingDept(dept)
        setFormData({
            name: dept.name,
            description: dept.description || '',
            employeeCount: dept.employeeCount || 0,
            isActive: dept.isActive,
        })
        setErrors({})
        setIsModalOpen(true)
    }

    // Delete department
    const handleDelete = async (dept: Department) => {
        const confirmed = await confirmDelete(dept.name)
        if (!confirmed) return

        try {
            const res = await fetch(`/api/master/department/${dept.id}`, {
                method: 'DELETE'
            })
            const json = await res.json()

            if (json.success) {
                showDeleteSuccess(dept.name)
                fetchDepartments()
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
            newErrors.name = 'กรุณากรอกชื่อแผนก'
        } else if (formData.name.length < 2) {
            newErrors.name = 'ชื่อแผนกต้องมีอย่างน้อย 2 ตัวอักษร'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Save department
    const handleSave = async () => {
        if (!validate()) return

        setSaving(true)
        try {
            const url = editingDept
                ? `/api/master/department/${editingDept.id}`
                : '/api/master/department'

            const res = await fetch(url, {
                method: editingDept ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    description: formData.description.trim() || null,
                    employeeCount: formData.employeeCount,
                    isActive: formData.isActive,
                })
            })

            const json = await res.json()

            if (json.success) {
                if (editingDept) {
                    showUpdateSuccess(formData.name)
                } else {
                    showCreateSuccess(formData.name)
                }
                setIsModalOpen(false)

                // Sort by Updated At Descending after save
                setSortBy('updatedAt')
                setSortOrder('desc')
                // Force fetch with new sort params immediately
                fetchDepartments('updatedAt', 'desc')
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
            title={<><i className="ti ti-building me-2"></i>แผนก</>}
            pretitle="Master Data / พนักงาน"
            actions={
                <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="ti ti-plus me-1"></i>เพิ่มแผนก
                </button>
            }
        >
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">รายการแผนก</h3>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th className="cursor-pointer" onClick={() => handleSort('code')}>
                                    รหัส {renderSortIcon('code')}
                                </th>
                                <th className="cursor-pointer" onClick={() => handleSort('name')}>
                                    ชื่อแผนก {renderSortIcon('name')}
                                </th>
                                <th>คำอธิบาย</th>
                                <th className="text-center">จำนวนพนักงาน</th>
                                <th className="cursor-pointer text-center" onClick={() => handleSort('isActive')}>
                                    สถานะ {renderSortIcon('isActive')}
                                </th>
                                <th className="cursor-pointer text-center" onClick={() => handleSort('updatedAt')}>
                                    แก้ไขล่าสุด {renderSortIcon('updatedAt')}
                                </th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : departments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-4 text-muted">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            ) : (
                                departments.map((dept) => {
                                    return (
                                        <tr key={dept.id}>
                                            <td><code>{dept.code}</code></td>
                                            <td>{dept.name}</td>
                                            <td>{dept.description || '-'}</td>
                                            <td className="text-center">{dept.employeeCount}</td>
                                            <td className="text-center">
                                                <span className={`badge ${dept.isActive ? 'bg-success' : 'bg-secondary text-white'}`}>
                                                    {dept.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                                </span>
                                            </td>
                                            <td className="text-center">{formatDate(dept.updatedAt)}</td>
                                            <td className="text-end">
                                                <a
                                                    href="#"
                                                    className="btn btn-ghost-primary btn-icon btn-sm"
                                                    onClick={(e) => { e.preventDefault(); handleEdit(dept) }}
                                                >
                                                    <i className="ti ti-edit"></i>
                                                </a>
                                                <a
                                                    href="#"
                                                    className="btn btn-ghost-danger btn-icon btn-sm"
                                                    onClick={(e) => { e.preventDefault(); handleDelete(dept) }}
                                                >
                                                    <i className="ti ti-trash"></i>
                                                </a>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Add/Edit */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingDept ? 'แก้ไขแผนก' : 'เพิ่มแผนก'}
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
                    label="ชื่อแผนก"
                    required
                    value={formData.name}
                    onChange={(e) => {
                        setFormData(prev => ({ ...prev, name: e.target.value }))
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                    }}
                    error={errors.name}
                    placeholder="เช่น ช่าง, การเงิน"
                />
                <div className="mb-3">
                    <label className="form-label">คำอธิบาย</label>
                    <textarea
                        className="form-control"
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
                    />
                </div>
                <FormInput
                    label="จำนวนพนักงาน"
                    type="number"
                    value={formData.employeeCount.toString()}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeCount: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                />
                <div className="mb-3">
                    <label className="form-label d-block">สถานะการใช้งาน</label>
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="isActiveSwitch"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        />
                        <label className="form-check-label" htmlFor="isActiveSwitch">
                            {formData.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </label>
                    </div>
                </div>
            </Modal>
        </MainLayout>
    )
}
