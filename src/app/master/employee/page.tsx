/**
 * ไฟล์: app/master/employee/page.tsx
 * จุดประสงค์: หน้าจัดการพนักงาน ตาม mockup master-employee.html
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Modal, FormInput, FormSelect, showCreateSuccess, showUpdateSuccess, showDeleteSuccess, showError, confirmDelete, DatePickerTH } from '@/components/ui'
import { format } from 'date-fns'

interface Employee {
    id: string
    code: string
    name: string
    nickname: string | null
    departmentId: string
    departmentName: string
    positionId: string
    positionName: string
    employeeTypeId: string | null
    employeeTypeName: string
    phone: string
    email: string | null
    startDate: string | null
    salary: number | null
    username: string | null
    role: string | null
    isActive: boolean
    updatedAt: string | null
}

interface Department { id: string; name: string }
interface Position { id: string; name: string; departmentId: string }

// สีแผนก
const deptColors: Record<string, { bg: string; icon: string }> = {
    'ผู้บริหาร': { bg: 'bg-blue-lt', icon: 'ti-briefcase' },
    'ช่าง': { bg: 'bg-cyan-lt', icon: 'ti-tool' },
    'การเงิน': { bg: 'bg-green-lt', icon: 'ti-cash' },
    'สำนักงาน': { bg: 'bg-purple-lt', icon: 'ti-building' },
    'คลังสินค้า': { bg: 'bg-orange-lt', icon: 'ti-package' },
}

const getDeptStyle = (name: string) => deptColors[name] || { bg: 'bg-secondary-lt', icon: 'ti-user' }

// สีแผนก badge (matching actual department names in database)
const deptBadgeColors: Record<string, string> = {
    'ผู้บริหาร': 'bg-blue',
    'ช่าง': 'bg-cyan',
    'ช่างยนต์': 'bg-cyan',      // Auto Mechanic (actual name in DB)
    'การเงิน': 'bg-green',
    'สำนักงาน': 'bg-purple',
    'คลังสินค้า': 'bg-orange',
}

// Format วันที่
const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${(d.getFullYear() + 543) % 100}`
}

export default function EmployeePage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [positions, setPositions] = useState<Position[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Employee | null>(null)

    // Pagination
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    // Filters
    const [filterDept, setFilterDept] = useState('')
    const [searchText, setSearchText] = useState('')

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        nickname: '',
        departmentId: '',
        positionId: '',
        phone: '',
        email: '',
        startDate: '',
        salary: '',
        username: '',
        role: 'TECHNICIAN',
        password: '',
        isActive: true,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    // Sorting
    const [sortBy, setSortBy] = useState('updatedAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    // Filtered positions based on selected department
    const filteredPositions = formData.departmentId
        ? positions.filter(p => p.departmentId === formData.departmentId)
        : positions

    // Fetch master data
    const fetchMasterData = async () => {
        const [deptRes, posRes] = await Promise.all([
            fetch('/api/master/department'),
            fetch('/api/master/position'),
        ])
        const deptJson = await deptRes.json()
        const posJson = await posRes.json()
        if (deptJson.success) setDepartments(deptJson.data)
        if (posJson.success) setPositions(posJson.data)
    }

    // Fetch employees
    const fetchData = async (
        p: number = page,
        dept: string = filterDept,
        search: string = searchText,
        sort: string = sortBy,
        order: string = sortOrder
    ) => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            params.set('page', String(p))
            params.set('limit', '10')
            if (dept) params.set('departmentId', dept)
            if (search) params.set('search', search)
            params.set('sortBy', sort)
            params.set('sortOrder', order)

            const res = await fetch(`/api/master/employee?${params}`)
            const json = await res.json()

            if (json.success) {
                setEmployees(json.data)
                setTotal(json.total)
                setTotalPages(json.totalPages)
            }
        } catch (error) {
            showError('ไม่สามารถโหลดข้อมูลได้')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMasterData()
    }, [])

    useEffect(() => {
        fetchData()
    }, [page, filterDept, searchText, sortBy, sortOrder])

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
        setFormData({
            name: '',
            nickname: '',
            departmentId: '',
            positionId: '',
            phone: '',
            email: '',
            startDate: '',
            salary: '',
            username: '',
            role: 'TECHNICIAN',
            password: '',
            isActive: true,
        })
        setErrors({})
        setIsModalOpen(true)
    }

    // Open modal for edit
    const handleEdit = (item: Employee) => {
        setEditingItem(item)
        setFormData({
            name: item.name,
            nickname: item.nickname || '',
            departmentId: String(item.departmentId),
            positionId: String(item.positionId),
            phone: item.phone,
            email: item.email || '',
            startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
            salary: item.salary ? String(item.salary) : '',
            username: item.username || '',
            role: item.role || 'TECHNICIAN',
            password: '',
            isActive: item.isActive,
        })
        setErrors({})
        setIsModalOpen(true)
    }

    // Delete
    const handleDelete = async (item: Employee) => {
        const confirmed = await confirmDelete(item.name)
        if (!confirmed) return

        try {
            const res = await fetch(`/api/master/employee/${item.id}`, {
                method: 'DELETE'
            })
            const json = await res.json()

            if (json.success) {
                showDeleteSuccess(item.name)
                // If last item on page and not first page, go back
                if (employees.length === 1 && page > 1) {
                    setPage(prev => prev - 1)
                } else {
                    fetchData()
                }
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
        if (!formData.name.trim()) newErrors.name = 'กรุณากรอกชื่อ-นามสกุล'
        if (!formData.departmentId) newErrors.departmentId = 'กรุณาเลือกแผนก'
        if (!formData.positionId) newErrors.positionId = 'กรุณาเลือกตำแหน่ง'
        if (!formData.phone.trim()) {
            newErrors.phone = 'กรุณากรอกเบอร์โทร'
        } else if (!/^0\d{2}-?\d{3}-?\d{4}$/.test(formData.phone)) {
            newErrors.phone = 'รูปแบบเบอร์โทรไม่ถูกต้อง (0XX-XXX-XXXX)'
        }

        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
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
                ? `/api/master/employee/${editingItem.id}`
                : '/api/master/employee'

            const res = await fetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    nickname: formData.nickname.trim() || null,
                    departmentId: formData.departmentId,
                    positionId: formData.positionId,
                    phone: formData.phone.trim(),
                    email: formData.email.trim() || null,
                    startDate: formData.startDate || null,
                    salary: formData.salary ? parseFloat(formData.salary) : null,
                    username: formData.username.trim() || null,
                    role: formData.role || null,
                    password: formData.password || undefined,
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
                // Reset page to 1 to see the updated/new item
                setPage(1)

                // Force fetch with new sort params immediately
                fetchData(1, filterDept, searchText, 'updatedAt', 'desc')
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
            title={<><i className="ti ti-id-badge me-2"></i>ข้อมูลพนักงาน</>}
            pretitle="Master Data / พนักงาน"
            actions={
                <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="ti ti-plus me-1"></i>เพิ่มพนักงาน
                </button>
            }
        >
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">รายชื่อพนักงาน</h3>
                    <div className="card-actions">
                        <select
                            className="form-select form-select-sm me-2"
                            style={{ width: 120 }}
                            value={filterDept}
                            onChange={(e) => { setFilterDept(e.target.value); setPage(1) }}
                        >
                            <option value="">ทุกแผนก</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="ค้นหา..."
                            style={{ width: 150 }}
                            value={searchText}
                            onChange={(e) => { setSearchText(e.target.value); setPage(1) }}
                        />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th className="cursor-pointer" onClick={() => handleSort('code')}>
                                    รหัส {renderSortIcon('code')}
                                </th>
                                <th className="cursor-pointer" onClick={() => handleSort('name')}>
                                    พนักงาน {renderSortIcon('name')}
                                </th>
                                <th className="cursor-pointer" onClick={() => handleSort('position')}>
                                    ตำแหน่ง {renderSortIcon('position')}
                                </th>
                                <th className="cursor-pointer" onClick={() => handleSort('department')}>
                                    แผนก {renderSortIcon('department')}
                                </th>
                                <th>โทรศัพท์</th>
                                <th>วันเริ่มงาน</th>
                                <th className="cursor-pointer" onClick={() => handleSort('updatedAt')}>
                                    แก้ไขล่าสุด {renderSortIcon('updatedAt')}
                                </th>
                                <th>สถานะ</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : employees.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-4 text-muted">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            ) : (
                                employees.map((item) => {
                                    const style = getDeptStyle(item.departmentName)
                                    return (
                                        <tr key={item.id}>
                                            <td><code>{item.code}</code></td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <span className={`avatar avatar-sm ${style.bg} me-2`}>
                                                        <i className={`ti ${style.icon}`}></i>
                                                    </span>
                                                    <div>
                                                        <div className="fw-bold">{item.name}</div>
                                                        <small className="text-muted">{item.email || '-'}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{item.positionName}</td>
                                            <td>
                                                <span className={`badge ${deptBadgeColors[item.departmentName?.trim()] || 'bg-secondary'} text-white`}>
                                                    {item.departmentName}
                                                </span>
                                            </td>
                                            <td>{item.phone}</td>
                                            <td>{formatDate(item.startDate)}</td>
                                            <td>{formatDate(item.updatedAt)}</td>
                                            <td>
                                                <span className={`badge ${item.isActive ? 'bg-success' : 'bg-secondary'} text-white`}>
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
                                    )
                                })
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
                title={editingItem ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงาน'}
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
                    <div className="col-md-6">
                        <FormInput
                            label="ชื่อ-นามสกุล"
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
                            label="ชื่อเล่น"
                            value={formData.nickname}
                            onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                        />
                    </div>
                    <div className="col-md-6">
                        <FormSelect
                            label="แผนก"
                            required
                            value={formData.departmentId}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, departmentId: e.target.value, positionId: '' }))
                                if (errors.departmentId) setErrors(prev => ({ ...prev, departmentId: '' }))
                            }}
                            options={departments.map(d => ({ value: d.id, label: d.name }))}
                            error={errors.departmentId}
                        />
                    </div>
                    <div className="col-md-6">
                        <FormSelect
                            label="ตำแหน่ง"
                            required
                            value={formData.positionId}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, positionId: e.target.value }))
                                if (errors.positionId) setErrors(prev => ({ ...prev, positionId: '' }))
                            }}
                            options={filteredPositions.map(p => ({ value: p.id, label: p.name }))}
                            error={errors.positionId}
                        />
                    </div>
                    <div className="col-md-6">
                        <FormInput
                            label="โทรศัพท์"
                            required
                            value={formData.phone}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, phone: e.target.value }))
                                if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }))
                            }}
                            error={errors.phone}
                            placeholder="0XX-XXX-XXXX"
                        />
                    </div>
                    <div className="col-md-6">
                        <FormInput
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, email: e.target.value }))
                                if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
                            }}
                            error={errors.email}
                        />
                    </div>
                    <div className="col-md-6">
                        <DatePickerTH
                            label="วันเริ่มงาน"
                            selected={formData.startDate ? new Date(formData.startDate) : null}
                            onChange={(date: Date | null) => setFormData(prev => ({ ...prev, startDate: date ? format(date, 'yyyy-MM-dd') : '' }))}
                        />
                    </div>
                    <div className="col-md-6">
                        <FormInput
                            label="เงินเดือน"
                            type="number"
                            value={formData.salary}
                            onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                        />
                    </div>
                </div>
                <hr />
                <h4>ข้อมูลเข้าใช้งานระบบ</h4>
                <div className="row">
                    <div className="col-md-6">
                        <FormInput
                            label="Username"
                            value={formData.username}
                            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                            helpText={!editingItem ? "รหัสผ่านเริ่มต้น = Username" : undefined}
                        />
                    </div>
                    <div className="col-md-6">
                        <FormInput
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            placeholder={editingItem ? "เว้นว่างหากไม่ต้องการเปลี่ยน" : "กำหนดรหัสผ่าน (ถ้ามี)"}
                        />
                    </div>
                    <div className="col-md-6">
                        <FormSelect
                            label="Role"
                            value={formData.role}
                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                            options={[
                                { value: 'TECHNICIAN', label: 'Technician' },
                                { value: 'CASHIER', label: 'Cashier' },
                                { value: 'MANAGER', label: 'Manager' },
                                { value: 'ADMIN', label: 'Admin' },
                            ]}
                        />
                    </div>
                    <div className="col-md-6 d-flex align-items-center mt-3">
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
                </div>
            </Modal>
        </MainLayout>
    )
}
