/**
 * ไฟล์: app/master/customer/page.tsx
 * จุดประสงค์: หน้าจัดการลูกค้า ตาม mockup master-customer.html
 * 
 * @author AutoCare Team
 * @created 2024-01-24
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { Modal, FormInput, FormSelect, showCreateSuccess, showUpdateSuccess, showDeleteSuccess, showError, confirmDelete } from '@/components/ui'

interface Customer {
    id: string
    code: string
    firstName: string
    lastName: string
    fullName: string
    phone: string
    email: string | null
    lineId: string | null
    address: string | null
    taxId: string | null
    customerTypeId: string
    customerType: { id: string; name: string }
    isActive: boolean
    createdAt: string | null
    updatedAt: string | null
    _count: { cars: number }
}

interface CustomerType {
    id: string
    name: string
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
    return name.charAt(0)
}

// Helper for Thai date short format (DD/MM/YY)
const formatDateThaiShort = (dateString: string | Date | undefined | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
    })
}

export default function CustomerPage() {
    const router = useRouter()
    const [customers, setCustomers] = useState<Customer[]>([])
    const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Customer | null>(null)

    // Pagination
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    // Filters
    const [filterType, setFilterType] = useState('')
    const [searchText, setSearchText] = useState('')

    // Sorting state
    const [sortBy, setSortBy] = useState('updatedAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        lineId: '',
        address: '',
        taxId: '',
        customerTypeId: '',
        isActive: true,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    // Fetch customer types
    const fetchCustomerTypes = async () => {
        const res = await fetch('/api/master/customer-type')
        const json = await res.json()
        if (json.success) setCustomerTypes(json.data)
    }

    // Fetch customers
    const fetchData = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            params.set('page', String(page))
            params.set('limit', '10')
            if (filterType) params.set('customerTypeId', filterType)
            if (searchText) params.set('search', searchText)

            // Add sort params
            params.set('sortBy', sortBy)
            params.set('sortOrder', sortOrder)

            const res = await fetch(`/api/master/customer?${params}`)
            const json = await res.json()

            if (json.success) {
                setCustomers(json.data)
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
        fetchCustomerTypes()
    }, [])

    useEffect(() => {
        fetchData()
    }, [page, filterType, searchText, sortBy, sortOrder]) // Add sort dependencies

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

    // Open modal for add - ✅ Bug Fix: Reset state
    const handleAdd = () => {
        setEditingItem(null)
        setFormData({
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            lineId: '',
            address: '',
            taxId: '',
            customerTypeId: '',
            isActive: true,
        })
        setErrors({})
        setIsModalOpen(true)
    }

    // Open modal for edit - ✅ Bug Fix: Populate correctly
    const handleEdit = (item: Customer) => {
        setEditingItem(item)
        setFormData({
            firstName: item.firstName,
            lastName: item.lastName,
            phone: item.phone,
            email: item.email || '',
            lineId: item.lineId || '',
            address: item.address || '',
            taxId: item.taxId || '',
            customerTypeId: item.customerTypeId,
            isActive: item.isActive,
        })
        setErrors({})
        setIsModalOpen(true)
    }

    // Delete
    const handleDelete = async (item: Customer) => {
        const confirmed = await confirmDelete(item.fullName)
        if (!confirmed) return

        try {
            const res = await fetch(`/api/master/customer/${item.id}`, {
                method: 'DELETE'
            })
            const json = await res.json()

            if (json.success) {
                showDeleteSuccess(item.fullName)
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
        if (!formData.firstName.trim()) newErrors.firstName = 'กรุณากรอกชื่อ'
        if (!formData.lastName.trim()) newErrors.lastName = 'กรุณากรอกนามสกุล'
        if (!formData.phone.trim()) {
            newErrors.phone = 'กรุณากรอกเบอร์โทร'
        } else if (!/^0\d{2}-?\d{3}-?\d{4}$/.test(formData.phone)) {
            newErrors.phone = 'รูปแบบเบอร์โทรไม่ถูกต้อง (0XX-XXX-XXXX)'
        }
        if (!formData.customerTypeId) newErrors.customerTypeId = 'กรุณาเลือกประเภทลูกค้า'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Save - ✅ Bug Fix: Loading state
    const handleSave = async () => {
        if (!validate()) return

        setSaving(true)
        try {
            const url = editingItem
                ? `/api/master/customer/${editingItem.id}`
                : '/api/master/customer'

            const res = await fetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    phone: formData.phone.trim(),
                    email: formData.email.trim() || null,
                    lineId: formData.lineId.trim() || null,
                    address: formData.address.trim() || null,
                    taxId: formData.taxId.trim() || null,
                    customerTypeId: formData.customerTypeId,
                    isActive: formData.isActive,
                })
            })

            const json = await res.json()

            if (json.success) {
                const fullName = `${formData.firstName} ${formData.lastName}`
                if (editingItem) {
                    showUpdateSuccess(fullName)
                } else {
                    showCreateSuccess(fullName)
                }
                setIsModalOpen(false)
                fetchData()
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
            title={<><i className="ti ti-users me-2"></i>ข้อมูลลูกค้า</>}
            pretitle="Master Data / ลูกค้า"
            actions={
                <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="ti ti-plus me-1"></i>เพิ่มลูกค้า
                </button>
            }
        >
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">รายชื่อลูกค้า</h3>
                    <div className="card-actions">
                        <select
                            className="form-select form-select-sm me-2"
                            style={{ width: 120 }}
                            value={filterType}
                            onChange={(e) => { setFilterType(e.target.value); setPage(1) }}
                        >
                            <option value="">ทั้งหมด</option>
                            {customerTypes.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="ค้นหาชื่อ/เบอร์..."
                            style={{ width: 180 }}
                            value={searchText}
                            onChange={(e) => { setSearchText(e.target.value); setPage(1) }}
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
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('fullName')}>
                                    ลูกค้า {renderSortIcon('fullName')}
                                </th>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('phone')}>
                                    โทรศัพท์ {renderSortIcon('phone')}
                                </th>
                                <th>Email</th>
                                <th>LINE ID</th>
                                <th>ที่อยู่</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('updatedAt')}>
                                    วันที่ล่าสุด {renderSortIcon('updatedAt')}
                                </th>
                                <th>ประเภท</th>
                                <th className="text-center">รถ</th>
                                <th className="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="text-center py-4 text-muted">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            ) : (
                                customers.map((item) => (
                                    <tr key={item.id}>
                                        <td><code>{item.code}</code></td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <span className={`avatar avatar-sm ${getAvatarColor(item.fullName)} me-2`}>
                                                    {getFirstLetter(item.fullName)}
                                                </span>
                                                <div className="fw-bold">{item.fullName}</div>
                                            </div>
                                        </td>
                                        <td>{item.phone}</td>
                                        <td>{item.email || '-'}</td>
                                        <td>{item.lineId || '-'}</td>
                                        <td>
                                            {item.address ? (
                                                <span
                                                    className="d-inline-block text-truncate"
                                                    style={{ maxWidth: '150px' }}
                                                    title={item.address}
                                                >
                                                    {item.address}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            {formatDateThaiShort(item.updatedAt || item.createdAt)}
                                        </td>
                                        <td>
                                            <span className="badge bg-info text-white">
                                                {item.customerType.name}
                                            </span>
                                        </td>
                                        <td className="text-center">{item._count.cars}</td>
                                        <td className="text-end">
                                            <a
                                                href="#"
                                                className="btn btn-ghost-secondary btn-icon btn-sm"
                                                title="ดูรายละเอียด"
                                                onClick={(e) => { e.preventDefault(); router.push(`/master/customer/${item.id}`) }}
                                            >
                                                <i className="ti ti-eye" />
                                            </a>
                                            <a
                                                href="#"
                                                className="btn btn-ghost-primary btn-icon btn-sm"
                                                onClick={(e) => { e.preventDefault(); handleEdit(item) }}
                                            >
                                                <i className="ti ti-edit" />
                                            </a>
                                            <a
                                                href="#"
                                                className="btn btn-ghost-danger btn-icon btn-sm"
                                                onClick={(e) => { e.preventDefault(); handleDelete(item) }}
                                            >
                                                <i className="ti ti-trash" />
                                            </a>
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
                title={editingItem ? 'แก้ไขลูกค้า' : 'เพิ่มลูกค้า'}
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
                            label="ชื่อ"
                            required
                            value={formData.firstName}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, firstName: e.target.value }))
                                if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }))
                            }}
                            error={errors.firstName}
                        />
                    </div>
                    <div className="col-md-6">
                        <FormInput
                            label="นามสกุล"
                            required
                            value={formData.lastName}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, lastName: e.target.value }))
                                if (errors.lastName) setErrors(prev => ({ ...prev, lastName: '' }))
                            }}
                            error={errors.lastName}
                        />
                    </div>
                    <div className="col-md-6">
                        <FormSelect
                            label="ประเภทลูกค้า"
                            required
                            value={formData.customerTypeId}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, customerTypeId: e.target.value }))
                                if (errors.customerTypeId) setErrors(prev => ({ ...prev, customerTypeId: '' }))
                            }}
                            options={customerTypes.map(t => ({ value: t.id, label: t.name }))}
                            error={errors.customerTypeId}
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
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </div>
                    <div className="col-md-6">
                        <FormInput
                            label="LINE ID"
                            value={formData.lineId}
                            onChange={(e) => setFormData(prev => ({ ...prev, lineId: e.target.value }))}
                        />
                    </div>
                    <div className="col-md-6">
                        <FormInput
                            label="เลขประจำตัวผู้เสียภาษี"
                            value={formData.taxId}
                            onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                            placeholder="13 หลัก"
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
