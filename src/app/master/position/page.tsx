/**
 * ไฟล์: app/master/position/page.tsx
 * จุดประสงค์: หน้าจัดการตำแหน่งงาน ตาม mockup master-position.html
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Modal, FormInput, FormSelect, showCreateSuccess, showUpdateSuccess, showDeleteSuccess, showError, confirmDelete } from '@/components/ui'

interface Position {
    id: number
    code: string
    name: string
    departmentId: string
    departmentName: string
    baseSalary: number | null
    employeeCount: number
    isActive: boolean
    updatedAt: string | null
}

interface Department {
    id: string
    name: string
}

// สีแผนก
const departmentColors: Record<string, string> = {
    'ผู้บริหาร': 'bg-primary',
    'ช่าง': 'bg-azure',
    'การเงิน': 'bg-orange',
    'สำนักงาน': 'bg-purple',
    'คลังสินค้า': 'bg-cyan',
}

const getDeptColor = (name: string) => departmentColors[name] || 'bg-secondary'

// Format เงิน
const formatMoney = (amount: number | null) => {
    if (!amount) return '-'
    return `฿${amount.toLocaleString('th-TH')}`
}

// Format วันที่
const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${(d.getFullYear() + 543) % 100}`
}

export default function PositionPage() {
    const [positions, setPositions] = useState<Position[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Position | null>(null)

    // Sorting
    const [sortBy, setSortBy] = useState('updatedAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        departmentId: '',
        baseSalary: '',
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

            const [posRes, deptRes] = await Promise.all([
                fetch(`/api/master/position?${params}`),
                fetch('/api/master/department'),
            ])
            const posJson = await posRes.json()
            const deptJson = await deptRes.json()

            if (posJson.success) setPositions(posJson.data)
            if (deptJson.success) setDepartments(deptJson.data)
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
        setEditingItem(null)
        setFormData({ name: '', departmentId: '', baseSalary: '', isActive: true })
        setErrors({})
        setIsModalOpen(true)
    }

    // Open modal for edit
    const handleEdit = (item: Position) => {
        setEditingItem(item)
        setFormData({
            name: item.name,
            departmentId: item.departmentId,
            baseSalary: item.baseSalary ? String(item.baseSalary) : '',
            isActive: item.isActive,
        })
        setErrors({})
        setIsModalOpen(true)
    }

    // Delete
    const handleDelete = async (item: Position) => {
        const confirmed = await confirmDelete(item.name)
        if (!confirmed) return

        try {
            const res = await fetch(`/api/master/position/${item.id}`, {
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
            newErrors.name = 'กรุณากรอกชื่อตำแหน่ง'
        }
        if (!formData.departmentId) {
            newErrors.departmentId = 'กรุณาเลือกแผนก'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Save
    const handleSave = async () => {
        if (!validate()) return

        setSaving(true)
        try {
            const url = editingItem
                ? `/api/master/position/${editingItem.id}`
                : '/api/master/position'

            const res = await fetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    departmentId: formData.departmentId,
                    baseSalary: formData.baseSalary ? parseFloat(formData.baseSalary) : null,
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

                // Sort by Updated At Descending after save
                setSortBy('updatedAt')
                setSortOrder('desc')
                // Force fetch with new sort params immediately
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
            title={<><i className="ti ti-briefcase me-2"></i>ตำแหน่งงาน</>}
            pretitle="Master Data / พนักงาน"
            actions={
                <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="ti ti-plus me-1"></i>เพิ่มตำแหน่ง
                </button>
            }
        >
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">รายการตำแหน่งงาน</h3>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th className="cursor-pointer" onClick={() => handleSort('code')}>
                                    รหัส {renderSortIcon('code')}
                                </th>
                                <th className="cursor-pointer" onClick={() => handleSort('name')}>
                                    ตำแหน่ง {renderSortIcon('name')}
                                </th>
                                <th className="cursor-pointer" onClick={() => handleSort('department')}>
                                    แผนก {renderSortIcon('department')}
                                </th>
                                <th className="cursor-pointer text-end" onClick={() => handleSort('baseSalary')}>
                                    เงินเดือนเริ่มต้น {renderSortIcon('baseSalary')}
                                </th>
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
                            ) : positions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-4 text-muted">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            ) : (
                                positions.map((item) => (
                                    <tr key={item.id}>
                                        <td><code>{item.code}</code></td>
                                        <td>{item.name}</td>
                                        <td>
                                            <span className={`badge ${getDeptColor(item.departmentName)} text-white`}>
                                                {item.departmentName}
                                            </span>
                                        </td>
                                        <td className="text-end">{formatMoney(item.baseSalary)}</td>
                                        <td className="text-center">{item.employeeCount}</td>
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
                title={editingItem ? 'แก้ไขตำแหน่งงาน' : 'เพิ่มตำแหน่งงาน'}
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
                    label="ชื่อตำแหน่ง"
                    required
                    value={formData.name}
                    onChange={(e) => {
                        setFormData(prev => ({ ...prev, name: e.target.value }))
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                    }}
                    error={errors.name}
                    placeholder="เช่น ผู้จัดการ, ช่างซ่อม"
                />
                <FormSelect
                    label="แผนก"
                    required
                    value={formData.departmentId}
                    onChange={(e) => {
                        setFormData(prev => ({ ...prev, departmentId: e.target.value }))
                        if (errors.departmentId) setErrors(prev => ({ ...prev, departmentId: '' }))
                    }}
                    options={departments.map(d => ({ value: d.id, label: d.name }))}
                    error={errors.departmentId}
                />
                <FormInput
                    label="เงินเดือนเริ่มต้น"
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseSalary: e.target.value }))}
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
