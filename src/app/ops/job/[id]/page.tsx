'use client'

import { useState, useEffect, use } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { useRouter } from 'next/navigation'
import { Modal, showSuccess, showError } from '@/components/ui'
import Swal from 'sweetalert2' 

// --- Interfaces ---
interface JobItem {
    id: string
    itemType: 'SERVICE' | 'SPARE'
    description: string
    quantity: number
    unitPrice: number
    discount: number
    total: number
}

interface ServiceJob {
    id: string
    jobNo: string
    jobDate: string
    status: string
    technicianId?: string
    car: {
        licensePlate: string
        province: string
        carBrand: { name: string }
        carModel: { name: string }
        year: number
        color: string
        mileage: number
    }
    customer: {
        fullName: string
        phone: string
        lineId?: string
    }
    customerRequest: string
    notes: string
    items: JobItem[]
    laborCost: number
    partsCost: number
    totalCost: number
    discount: number
    vatAmount: number
    grandTotal: number
}

interface MasterItem {
    id: string
    code: string
    name: string
    price: number
    type: 'SERVICE' | 'SPARE'
}

interface SelectedItem {
    id: string
    code: string
    name: string
    type: 'SERVICE' | 'SPARE'
    quantity: number
    unitPrice: number
    discount: number
}

interface Technician {
    id: string
    name: string
    role: string
}

// --- Page Component ---
export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()

    const [job, setJob] = useState<ServiceJob | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)

    // Master Data
    const [services, setServices] = useState<MasterItem[]>([])
    const [spares, setSpares] = useState<MasterItem[]>([])
    const [technicians, setTechnicians] = useState<Technician[]>([])

    // Right Sidebar State
    const [statusInput, setStatusInput] = useState<string>('')
    const [technicianInput, setTechnicianInput] = useState<string>('')

    // Multi-select modal state
    const [activeTab, setActiveTab] = useState<'SERVICE' | 'SPARE' | 'CUSTOM'>('SERVICE')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
    const [submitting, setSubmitting] = useState(false)

    // Custom Item Form State
    const [customName, setCustomName] = useState('')
    const [customType, setCustomType] = useState<'SERVICE' | 'SPARE'>('SERVICE')
    const [customPrice, setCustomPrice] = useState<string>('')
    const [customQty, setCustomQty] = useState<number>(1)
    const [customDiscount, setCustomDiscount] = useState<number>(0)

    useEffect(() => {
        fetchJob()
        fetchMasterData()
    }, [id])

    const fetchJob = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/ops/job/${id}`)
            const json = await res.json()
            if (json.success) {
                setJob(json.data)
                setStatusInput(json.data.status)
                setTechnicianInput(json.data.technicianId || '')
            } else {
                showError(json.error || 'ไม่พบข้อมูลงานซ่อม')
                router.push('/ops/search')
            }
        } catch (error) {
            showError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
        } finally {
            setLoading(false)
        }
    }

    const fetchMasterData = async () => {
        fetch('/api/master/service').then(res => res.json()).then(json => {
            if (Array.isArray(json)) setServices(json.map((s: any) => ({ ...s, type: 'SERVICE' as const, price: Number(s.price) })))
        })
        fetch('/api/master/spare').then(res => res.json()).then(json => {
            if (Array.isArray(json)) setSpares(json.map((s: any) => ({ ...s, type: 'SPARE' as const, price: Number(s.sellingPrice) })))
        })
        fetch('/api/master/employee?limit=999').then(res => res.json()).then(json => {
            if (json.success && Array.isArray(json.data)) {
                // Filter technicians (or just use all employees if role isn't strictly TECHNICIAN)
                const techs = json.data.filter((e: any) => e.role === 'TECHNICIAN' || e.positionName?.includes('ช่าง'))
                setTechnicians(techs.length > 0 ? techs : json.data)
            }
        })
    }

    // Modal Logic
    const getFilteredList = () => {
        const list = activeTab === 'SERVICE' ? services : spares
        if (!searchQuery.trim()) return list
        const q = searchQuery.toLowerCase()
        return list.filter(i => i.code.toLowerCase().includes(q) || i.name.toLowerCase().includes(q))
    }

    const isItemSelected = (itemId: string) => selectedItems.some(s => s.id === itemId)

    const toggleItem = (item: MasterItem) => {
        if (isItemSelected(item.id)) {
            setSelectedItems(prev => prev.filter(s => s.id !== item.id))
        } else {
            setSelectedItems(prev => [...prev, {
                id: item.id,
                code: item.code,
                name: item.name,
                type: item.type,
                quantity: 1,
                unitPrice: Number(item.price),
                discount: 0,
            }])
        }
    }

    const handleAddCustomItem = () => {
        if (!customName.trim()) {
            showError('กรุณากรอกชื่อบริการหรือรายการ')
            return
        }
        const price = parseFloat(customPrice)
        if (isNaN(price) || price < 0) {
            showError('กรุณาระบุราคาที่ถูกต้อง (เช่น 1 บาท หรือมากกว่า)')
            return
        }
        if (customQty <= 0) {
            showError('กรุณาระบุจำนวนอย่างน้อย 1')
            return
        }

        const newItem: SelectedItem = {
            id: `custom-${Date.now()}`,
            code: customType === 'SERVICE' ? 'SVC-CUSTOM' : 'PART-CUSTOM',
            name: customName.trim(),
            type: customType,
            quantity: customQty,
            unitPrice: price,
            discount: Number(customDiscount) || 0,
        }

        setSelectedItems(prev => [...prev, newItem])
        setCustomName('')
        setCustomPrice('')
        setCustomQty(1)
        setCustomDiscount(0)
    }

    const updateSelectedItemField = (itemId: string, field: 'quantity' | 'discount' | 'unitPrice', value: number) => {
        setSelectedItems(prev => prev.map(s => s.id === itemId ? { ...s, [field]: value } : s))
    }

    const getSelectedTotal = () => selectedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice - item.discount), 0)

    const openModal = (tab: 'SERVICE' | 'SPARE' | 'CUSTOM' = 'SERVICE') => {
        setSelectedItems([])
        setSearchQuery('')
        setActiveTab(tab)
        setCustomName('')
        setCustomPrice('')
        setCustomQty(1)
        setCustomDiscount(0)
        setIsAddItemModalOpen(true)
    }

    const handleBatchAddItems = async () => {
        if (selectedItems.length === 0) {
            showError('กรุณาเลือกหรือเพิ่มอย่างน้อย 1 รายการ')
            return
        }
        setSubmitting(true)
        try {
            const res = await fetch('/api/ops/job-item/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceJobId: id,
                    items: selectedItems.map(item => ({
                        itemType: item.type,
                        serviceId: item.id.startsWith('custom-') ? undefined : (item.type === 'SERVICE' ? item.id : undefined),
                        spareId: item.id.startsWith('custom-') ? undefined : (item.type === 'SPARE' ? item.id : undefined),
                        description: item.name,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        discount: item.discount,
                    })),
                }),
            })
            const json = await res.json()
            if (res.ok && json.success) {
                showSuccess(`เพิ่ม ${selectedItems.length} รายการแล้ว`)
                setIsAddItemModalOpen(false)
                fetchJob()
            } else {
                showError(json.error || 'บันทึกไม่สำเร็จ')
            }
        } catch (error) {
            showError('เกิดข้อผิดพลาด')
        } finally {
            setSubmitting(false)
        }
    }

    // Cancel item modal state
    const [cancelModalItem, setCancelModalItem] = useState<{ id: string; name: string } | null>(null)
    const [cancelReasonPreset, setCancelReasonPreset] = useState<string>('ลูกค้าขอยกเลิก / เลื่อนการซ่อม')
    const [cancelReasonCustom, setCancelReasonCustom] = useState<string>('')
    const [cancelling, setCancelling] = useState(false)

    const handleConfirmCancelItem = async () => {
        if (!cancelModalItem) return
        const reason = cancelReasonPreset === 'OTHER' ? cancelReasonCustom.trim() : cancelReasonPreset
        if (!reason) {
            showError('กรุณาระบุเหตุผลในการยกเลิก')
            return
        }

        setCancelling(true)
        try {
            const res = await fetch(`/api/ops/job-item/${cancelModalItem.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'CANCEL', reason })
            })
            if (res.ok) {
                showSuccess('ยกเลิกรายการเรียบร้อยแล้ว')
                setCancelModalItem(null)
                fetchJob()
            } else {
                showError('ไม่สามารถยกเลิกรายการได้')
            }
        } catch (e) {
            showError('เกิดข้อผิดพลาดในการยกเลิกรายการ')
        } finally {
            setCancelling(false)
        }
    }

    const handleRestoreItem = async (itemId: string) => {
        try {
            const res = await fetch(`/api/ops/job-item/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'RESTORE' })
            })
            if (res.ok) {
                showSuccess('นำรายการกลับมาเรียบร้อยแล้ว')
                fetchJob()
            } else {
                showError('ไม่สามารถนำรายการกลับมาได้')
            }
        } catch (e) {
            showError('เกิดข้อผิดพลาด')
        }
    }

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('ลบรายการนี้ถาวร?')) return
        try {
            const res = await fetch(`/api/ops/job-item/${itemId}`, { method: 'DELETE' })
            if (res.ok) {
                fetchJob()
            }
        } catch (error) {
            showError('ลบรายการไม่สำเร็จ')
        }
    }

    const handleSaveStatus = async () => {
        try {
            const res = await fetch(`/api/ops/job/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: statusInput, technicianId: technicianInput || undefined })
            })
            if (res.ok) {
                showSuccess('บันทึกสถานะเรียบร้อยแล้ว')
                fetchJob()
            } else {
                showError('บันทึกไม่สำเร็จ')
            }
        } catch (error) {
            showError('เกิดข้อผิดพลาดในการบันทึก')
        }
    }

    const handlePrimaryAction = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/ops/job/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (res.ok) {
                showSuccess('อัปเดตสถานะงานเรียบร้อยแล้ว')
                fetchJob()
            } else {
                showError('อัปเดตไม่สำเร็จ')
            }
        } catch (error) {
            showError('เกิดข้อผิดพลาด')
        }
    }

    if (loading) return <div className="text-center py-5"><div className="spinner-border"></div></div>
    if (!job) return null

    // Separate services and spares for the 2 tables
    const serviceItems = job.items.filter(item => item.itemType === 'SERVICE')
    const spareItems = job.items.filter(item => item.itemType === 'SPARE')
    const isReadOnly = job.status === 'COMPLETED' || job.status === 'DELIVERED' || job.status === 'CANCELLED'
    const hasRevisions = job.items.some(item => item.isModified)

    return (
        <MainLayout
            title={<><i className="ti ti-tools me-2"></i>รายละเอียดงานซ่อม ({job.jobNo})</>}
            pretitle="Operations / Job Detail"
        >
            {/* Read-Only Status Banner */}
            {job.status === 'COMPLETED' && (
                <div className="p-3 mb-3 bg-success-lt text-success rounded-3 border border-success-subtle d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <i className="ti ti-circle-check fs-2 me-2"></i>
                        <div>
                            <strong>งานซ่อมนี้ปิดงานและชำระเงินเรียบร้อยแล้ว (View Only)</strong>
                            <div className="small">สามารถดูรายละเอียดและพิมพ์เอกสารได้ ปิดการแก้ไขและเพิ่มรายการทั้งหมด</div>
                        </div>
                    </div>
                    <span className="badge bg-green text-white">ปิดงานแล้ว</span>
                </div>
            )}
            {job.status === 'DELIVERED' && (
                <div className="p-3 mb-3 bg-lime-lt text-lime rounded-3 border border-lime-subtle d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <i className="ti ti-car fs-2 me-2"></i>
                        <div>
                            <strong>ส่งมอบรถให้ลูกค้าเรียบร้อยแล้ว (View Only)</strong>
                            <div className="small">งานซ่อมเสร็จสมบูรณ์ ปิดการแก้ไขทั้งหมด</div>
                        </div>
                    </div>
                    <span className="badge bg-lime text-white">ส่งมอบแล้ว</span>
                </div>
            )}
            {job.status === 'CANCELLED' && (
                <div className="p-3 mb-3 bg-secondary-lt text-secondary rounded-3 border border-secondary-subtle d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <i className="ti ti-circle-x fs-2 me-2"></i>
                        <div>
                            <strong>งานซ่อมนี้ถูกยกเลิกแล้ว (View Only)</strong>
                            <div className="small">ไม่สามารถแก้ไขรายการหรือเริ่มงานใหม่ได้</div>
                        </div>
                    </div>
                    <span className="badge bg-secondary text-white">ยกเลิกแล้ว</span>
                </div>
            )}

            {/* Dynamic Revision Alert */}
            {hasRevisions && !isReadOnly && (
                <div className="p-3 mb-3 bg-warning-lt text-warning rounded-3 border border-warning-subtle d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <i className="ti ti-alert-triangle fs-2 me-2"></i>
                        <div>
                            <strong className="text-dark">ใบงานนี้มีการยกเลิก/ปรับปรุงรายการ (Revised Quotation)</strong>
                            <div className="small text-muted">ขอบเขตงานหรือยอดเงินมีการเปลี่ยนแปลง กรุณาพิมพ์ใบเสนอราคาฉบับแก้ไขให้ลูกค้ายืนยัน</div>
                        </div>
                    </div>
                    <button className="btn btn-warning btn-sm text-dark fw-bold shadow-sm" onClick={() => window.open(`/ops/job/print/${job.id}?type=quotation`, '_blank')}>
                        <i className="ti ti-printer me-1"></i>พิมพ์ใบเสนอราคาฉบับแก้ไข
                    </button>
                </div>
            )}

            <div className="row">
                {/* Left Column */}
                <div className="col-lg-8">
                    {/* Car & Customer Info (Datagrid) */}
                    <div className="card mb-3">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6 mb-3 mb-md-0">
                                    <h4 className="mb-3"><i className="ti ti-car me-2 text-blue"></i>ข้อมูลรถ</h4>
                                    <div className="datagrid">
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">ทะเบียน</div>
                                            <div className="datagrid-content">
                                                <span className="badge bg-blue fs-5">{job.car.licensePlate}</span>
                                            </div>
                                        </div>
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">ยี่ห้อ/รุ่น</div>
                                            <div className="datagrid-content">{job.car.carBrand.name} {job.car.carModel.name} {job.car.year}</div>
                                        </div>
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">สี</div>
                                            <div className="datagrid-content">{job.car.color || '-'}</div>
                                        </div>
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">เลขไมล์</div>
                                            <div className="datagrid-content">{job.car.mileage ? `${Number(job.car.mileage).toLocaleString()} km` : '-'}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <h4 className="mb-3"><i className="ti ti-user me-2 text-green"></i>ข้อมูลลูกค้า</h4>
                                    <div className="datagrid">
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">ลูกค้า</div>
                                            <div className="datagrid-content">{job.customer.fullName}</div>
                                        </div>
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">โทรศัพท์</div>
                                            <div className="datagrid-content">
                                                <a href={`tel:${job.customer.phone}`}>{job.customer.phone}</a>
                                            </div>
                                        </div>
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">LINE</div>
                                            <div className="datagrid-content">{job.customer.lineId || '-'}</div>
                                        </div>
                                    </div>
                                    {job.customerRequest && (
                                        <div className="mt-3">
                                            <div className="text-muted small mb-1">อาการที่แจ้ง:</div>
                                            <div>{job.customerRequest}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service Items Table */}
                    <div className="card mb-3">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-list-check me-2"></i>รายการซ่อม/บริการ</h3>
                            {!isReadOnly && (
                                <div className="card-actions">
                                    <button className="btn btn-sm btn-primary" onClick={() => openModal('SERVICE')}>
                                        <i className="ti ti-plus me-1"></i>เพิ่มรายการ
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="table-responsive">
                            <table className="table table-vcenter card-table">
                                <thead>
                                    <tr>
                                        <th>รายการ</th>
                                        <th className="text-end">ราคา/หน่วย</th>
                                        <th className="text-center">จำนวน</th>
                                        <th className="text-end">รวม</th>
                                        {!isReadOnly && <th className="text-end" style={{ width: '120px' }}>การจัดการ</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {serviceItems.length === 0 ? (
                                        <tr><td colSpan={isReadOnly ? 4 : 5} className="text-center text-muted py-3">ยังไม่มีรายการ</td></tr>
                                    ) : (
                                        serviceItems.map(item => {
                                            const isCancelled = item.isModified && Number(item.total) === 0
                                            return (
                                                <tr key={item.id} className={isCancelled ? 'bg-light text-muted' : ''}>
                                                    <td>
                                                        <div className="fw-medium">
                                                            {isCancelled ? (
                                                                <span className="text-decoration-line-through">{item.description}</span>
                                                            ) : (
                                                                item.description
                                                            )}
                                                            {isCancelled && (
                                                                <span className="badge bg-secondary text-white ms-2">ยกเลิกแล้ว</span>
                                                            )}
                                                        </div>
                                                        {isCancelled && item.modifiedReason && (
                                                            <div className="small text-danger mt-1">
                                                                <i className="ti ti-info-circle me-1"></i>เหตุผล: {item.modifiedReason}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="text-end">฿{Number(item.unitPrice).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                                                    <td className="text-center">{item.quantity}</td>
                                                    <td className="text-end fw-bold">฿{Number(item.total).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                                                    {!isReadOnly && (
                                                        <td className="text-end text-nowrap">
                                                            {isCancelled ? (
                                                                <button
                                                                    className="btn btn-ghost-primary btn-sm me-1"
                                                                    title="นำรายการกลับมาทำต่อ"
                                                                    onClick={() => handleRestoreItem(item.id)}
                                                                >
                                                                    <i className="ti ti-rotate me-1"></i>นำกลับมา
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="btn btn-outline-danger btn-sm me-1"
                                                                    title="ยกเลิกรายการนี้ (ระบุเหตุผล)"
                                                                    onClick={() => {
                                                                        setCancelModalItem({ id: item.id, name: item.description })
                                                                        setCancelReasonPreset('ลูกค้าขอยกเลิก / เลื่อนการซ่อม')
                                                                        setCancelReasonCustom('')
                                                                    }}
                                                                >
                                                                    <i className="ti ti-x me-1"></i>ยกเลิก
                                                                </button>
                                                            )}
                                                            <a
                                                                href="#"
                                                                className="btn btn-ghost-danger btn-icon btn-sm"
                                                                title="ลบทิ้งถาวร"
                                                                onClick={(e) => { e.preventDefault(); handleDeleteItem(item.id) }}
                                                            >
                                                                <i className="ti ti-trash"></i>
                                                            </a>
                                                        </td>
                                                    )}
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Spare Parts Table */}
                    <div className="card mb-3">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-package me-2"></i>อะไหล่ที่ใช้</h3>
                            {!isReadOnly && (
                                <div className="card-actions">
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => openModal('SPARE')}>
                                        <i className="ti ti-plus me-1"></i>เพิ่มอะไหล่
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="table-responsive">
                            <table className="table table-vcenter card-table">
                                <thead>
                                    <tr>
                                        <th>รายการอะไหล่</th>
                                        <th className="text-end">ราคา/หน่วย</th>
                                        <th className="text-center">จำนวน</th>
                                        <th className="text-end">รวม</th>
                                        {!isReadOnly && <th className="text-end" style={{ width: '120px' }}>การจัดการ</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {spareItems.length === 0 ? (
                                        <tr><td colSpan={isReadOnly ? 4 : 5} className="text-center text-muted py-3">ยังไม่มีรายการอะไหล่</td></tr>
                                    ) : (
                                        spareItems.map(item => {
                                            const isCancelled = item.isModified && Number(item.total) === 0
                                            return (
                                                <tr key={item.id} className={isCancelled ? 'bg-light text-muted' : ''}>
                                                    <td>
                                                        <div className="fw-medium">
                                                            {isCancelled ? (
                                                                <span className="text-decoration-line-through">{item.description}</span>
                                                            ) : (
                                                                item.description
                                                            )}
                                                            {isCancelled && (
                                                                <span className="badge bg-secondary text-white ms-2">ยกเลิกแล้ว</span>
                                                            )}
                                                        </div>
                                                        {isCancelled && item.modifiedReason && (
                                                            <div className="small text-danger mt-1">
                                                                <i className="ti ti-info-circle me-1"></i>เหตุผล: {item.modifiedReason}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="text-end">฿{Number(item.unitPrice).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                                                    <td className="text-center">{item.quantity}</td>
                                                    <td className="text-end fw-bold">฿{Number(item.total).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                                                    {!isReadOnly && (
                                                        <td className="text-end text-nowrap">
                                                            {isCancelled ? (
                                                                <button
                                                                    className="btn btn-ghost-primary btn-sm me-1"
                                                                    title="นำรายการกลับมาทำต่อ"
                                                                    onClick={() => handleRestoreItem(item.id)}
                                                                >
                                                                    <i className="ti ti-rotate me-1"></i>นำกลับมา
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="btn btn-outline-danger btn-sm me-1"
                                                                    title="ยกเลิกรายการนี้ (ระบุเหตุผล)"
                                                                    onClick={() => {
                                                                        setCancelModalItem({ id: item.id, name: item.description })
                                                                        setCancelReasonPreset('ลูกค้าขอยกเลิก / เลื่อนการซ่อม')
                                                                        setCancelReasonCustom('')
                                                                    }}
                                                                >
                                                                    <i className="ti ti-x me-1"></i>ยกเลิก
                                                                </button>
                                                            )}
                                                            <a
                                                                href="#"
                                                                className="btn btn-ghost-danger btn-icon btn-sm"
                                                                title="ลบทิ้งถาวร"
                                                                onClick={(e) => { e.preventDefault(); handleDeleteItem(item.id) }}
                                                            >
                                                                <i className="ti ti-trash"></i>
                                                            </a>
                                                        </td>
                                                    )}
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {job.notes && (
                        <div className="card mb-3">
                            <div className="card-body">
                                <h4 className="card-title"><i className="ti ti-note me-1"></i>หมายเหตุช่าง/ภายใน</h4>
                                <p className="text-muted">{job.notes}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="col-lg-4">
                    {/* Status Update Card */}
                    <div className="card mb-3">
                        <div className="card-header">
                            <h3 className="card-title">{isReadOnly ? 'สถานะงาน (ปิดการแก้ไข)' : 'สถานะงาน'}</h3>
                        </div>
                        <div className="card-body">
                            {isReadOnly ? (
                                <div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted">สถานะปัจจุบัน</label>
                                        <div>
                                            {job.status === 'COMPLETED' && <span className="badge bg-green fs-4 py-2 px-3"><i className="ti ti-circle-check me-1"></i>เสร็จสิ้น (COMPLETED)</span>}
                                            {job.status === 'DELIVERED' && <span className="badge bg-lime fs-4 py-2 px-3"><i className="ti ti-car me-1"></i>ส่งมอบรถแล้ว (DELIVERED)</span>}
                                            {job.status === 'CANCELLED' && <span className="badge bg-secondary fs-4 py-2 px-3"><i className="ti ti-x me-1"></i>ยกเลิก (CANCELLED)</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label text-muted">ช่างผู้รับผิดชอบ</label>
                                        <div className="fw-bold">{job.technician?.fullName || technicians.find(t => t.id === job.technicianId)?.name || '-'}</div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label">สถานะ</label>
                                        <select className="form-select" value={statusInput} onChange={(e) => setStatusInput(e.target.value)}>
                                            <option value="RECEIVED">รอรับรถ / รับรถแล้ว</option>
                                            <option value="WAITING_APPROVAL">รออนุมัติ</option>
                                            <option value="APPROVED">อนุมัติแล้ว</option>
                                            <option value="IN_PROGRESS">กำลังซ่อม</option>
                                            <option value="INSPECTION">ตรวจสอบ</option>
                                            <option value="WAITING_PARTS">รออะไหล่</option>
                                            <option value="QC_CHECK">QC ตรวจสอบ</option>
                                            <option value="WAITING_PAYMENT">รอชำระเงิน</option>
                                            <option value="COMPLETED">เสร็จสิ้น</option>
                                            <option value="DELIVERED">ส่งมอบแล้ว</option>
                                            <option value="CANCELLED">ยกเลิก</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">ช่างผู้รับผิดชอบ</label>
                                        <select className="form-select" value={technicianInput} onChange={(e) => setTechnicianInput(e.target.value)}>
                                            <option value="">-- ไม่ระบุ --</option>
                                            {technicians.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button className="btn btn-primary w-100" onClick={handleSaveStatus}>
                                        <i className="ti ti-device-floppy me-1"></i>บันทึกสถานะ
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="card mb-3 bg-primary-lt">
                        <div className="card-body">
                            <h4 className="mb-3">สรุปยอด</h4>
                            <div className="d-flex justify-content-between mb-2">
                                <span>ค่าแรง (บริการ)</span>
                                <span>฿{Number(job.laborCost).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>ค่าอะไหล่</span>
                                <span>฿{Number(job.partsCost).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {Number(job.discount) > 0 && (
                                <div className="d-flex justify-content-between mb-2 text-danger">
                                    <span>ส่วนลด</span>
                                    <span>-฿{Number(job.discount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <hr />
                            <div className="d-flex justify-content-between mb-2">
                                <span>รวมก่อน VAT</span>
                                <span>฿{(Number(job.laborCost) + Number(job.partsCost) - Number(job.discount)).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>VAT 7%</span>
                                <span>฿{Number(job.vatAmount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-2 align-items-center">
                                <span className="h3 mb-0">ยอดสุทธิ</span>
                                <span className="h2 text-primary mb-0">฿{Number(job.grandTotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="d-grid gap-2">
                        {!isReadOnly && (job.status === 'RECEIVED' || job.status === 'APPROVED' || job.status === 'WAITING_APPROVAL') && (
                            <button className="btn btn-primary btn-lg" onClick={() => handlePrimaryAction('IN_PROGRESS')}>
                                <i className="ti ti-player-play me-1"></i>เริ่มงานซ่อม
                            </button>
                        )}
                        {!isReadOnly && (job.status === 'IN_PROGRESS' || job.status === 'INSPECTION' || job.status === 'WAITING_PARTS' || job.status === 'QC_CHECK') && (
                            <button className="btn btn-success btn-lg" onClick={() => handlePrimaryAction('WAITING_PAYMENT')}>
                                <i className="ti ti-check me-1"></i>เสร็จงาน / ส่งชำระ
                            </button>
                        )}
                        {!isReadOnly && job.status === 'WAITING_PAYMENT' && (
                            <button className="btn btn-orange btn-lg" onClick={() => router.push(`/cash/payment?jobId=${job.id}`)}>
                                <i className="ti ti-cash me-1"></i>ไปหน้ารับชำระเงิน
                            </button>
                        )}
                        {job.status === 'COMPLETED' && (
                            <button className="btn btn-lime btn-lg" onClick={() => handlePrimaryAction('DELIVERED')}>
                                <i className="ti ti-car me-1"></i>ส่งมอบรถ
                            </button>
                        )}

                        {(job.status === 'COMPLETED' || job.status === 'DELIVERED') && (
                            <button className="btn btn-success" onClick={() => window.open(`/ops/job/print/${job.id}?type=receipt`, '_blank')}>
                                <i className="ti ti-receipt me-1"></i>พิมพ์ใบเสร็จรับเงิน
                            </button>
                        )}
                        <button className="btn btn-outline-secondary" onClick={() => window.open(`/ops/job/print/${job.id}?type=quotation`, '_blank')}>
                            <i className="ti ti-printer me-1"></i>พิมพ์ใบเสนอราคา / ใบสั่งงาน
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isAddItemModalOpen}
                onClose={() => setIsAddItemModalOpen(false)}
                title="เพิ่มรายการ (Add Items)"
                size="lg"
                footer={
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <div>
                            {selectedItems.length > 0 && (
                                <span className="text-muted">
                                    เลือกแล้ว <strong className="text-primary">{selectedItems.length}</strong> รายการ
                                    {' • '}
                                    รวม <strong className="text-primary">฿{getSelectedTotal().toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong>
                                </span>
                            )}
                        </div>
                        <div className="btn-list">
                            <button className="btn btn-link link-secondary" onClick={() => setIsAddItemModalOpen(false)}>
                                ยกเลิก
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleBatchAddItems}
                                disabled={selectedItems.length === 0 || submitting}
                            >
                                {submitting ? (
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                ) : (
                                    <i className="ti ti-plus me-1"></i>
                                )}
                                เพิ่ม {selectedItems.length > 0 ? `${selectedItems.length} รายการ` : 'รายการ'}
                            </button>
                        </div>
                    </div>
                }
            >
                {/* Tabs: Service / Spare / Custom */}
                <div className="mb-3">
                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <a
                                className={`nav-link ${activeTab === 'SERVICE' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => { e.preventDefault(); setActiveTab('SERVICE'); setSearchQuery('') }}
                            >
                                <i className="ti ti-tool me-1"></i> ค่าบริการ (มาตรฐาน)
                                {selectedItems.filter(s => s.type === 'SERVICE' && !s.id.startsWith('custom-')).length > 0 && (
                                    <span className="badge bg-blue ms-2">{selectedItems.filter(s => s.type === 'SERVICE' && !s.id.startsWith('custom-')).length}</span>
                                )}
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                className={`nav-link ${activeTab === 'SPARE' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => { e.preventDefault(); setActiveTab('SPARE'); setSearchQuery('') }}
                            >
                                <i className="ti ti-box me-1"></i> อะไหล่ (ในคลัง)
                                {selectedItems.filter(s => s.type === 'SPARE' && !s.id.startsWith('custom-')).length > 0 && (
                                    <span className="badge bg-orange ms-2">{selectedItems.filter(s => s.type === 'SPARE' && !s.id.startsWith('custom-')).length}</span>
                                )}
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                className={`nav-link ${activeTab === 'CUSTOM' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => { e.preventDefault(); setActiveTab('CUSTOM') }}
                            >
                                <i className="ti ti-pencil me-1"></i> บริการอื่นๆ / กำหนดเอง
                                {selectedItems.filter(s => s.id.startsWith('custom-')).length > 0 && (
                                    <span className="badge bg-purple ms-2">{selectedItems.filter(s => s.id.startsWith('custom-')).length}</span>
                                )}
                            </a>
                        </li>
                    </ul>
                </div>

                {activeTab === 'CUSTOM' ? (
                    <div className="card p-3 mb-3 bg-light border-0 shadow-none">
                        <h4 className="card-title mb-3"><i className="ti ti-pencil me-1 text-primary"></i>ระบุบริการอื่นๆ หรือราคาแบบกำหนดเอง</h4>
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label required">ประเภทรายการ</label>
                                <div className="form-selectgroup">
                                    <label className="form-selectgroup-item">
                                        <input
                                            type="radio"
                                            name="customType"
                                            value="SERVICE"
                                            className="form-selectgroup-input"
                                            checked={customType === 'SERVICE'}
                                            onChange={() => setCustomType('SERVICE')}
                                        />
                                        <span className="form-selectgroup-label">
                                            <i className="ti ti-tool me-1 text-primary"></i>ค่าบริการ / ค่าแรง
                                        </span>
                                    </label>
                                    <label className="form-selectgroup-item">
                                        <input
                                            type="radio"
                                            name="customType"
                                            value="SPARE"
                                            className="form-selectgroup-input"
                                            checked={customType === 'SPARE'}
                                            onChange={() => setCustomType('SPARE')}
                                        />
                                        <span className="form-selectgroup-label">
                                            <i className="ti ti-box me-1 text-warning"></i>อะไหล่ / วัสดุอื่นๆ
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <label className="form-label required">ชื่อบริการ / รายการ</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="เช่น ค่าแรงพิเศษ, ค่าบริการลากรถฉุกเฉิน, งานกลึงจานเบรก, ค่าบริการนอกสถานที่ ฯลฯ"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label required">ราคาต่อหน่วย (฿)</label>
                                <div className="input-group">
                                    <span className="input-group-text">฿</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        className="form-control fw-bold fs-3"
                                        placeholder="เช่น 1 หรือ 500 หรือ 99999999"
                                        value={customPrice}
                                        onChange={(e) => setCustomPrice(e.target.value)}
                                    />
                                </div>
                                <small className="text-muted">สามารถใส่ยอดเงินได้ตั้งแต่ 1 บาท ถึง 99,999,999 บาท</small>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label required">จำนวน</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-control text-center"
                                    value={customQty}
                                    onChange={(e) => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">ส่วนลด (฿)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="form-control text-center"
                                    value={customDiscount}
                                    onChange={(e) => setCustomDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                                />
                            </div>
                            <div className="col-12 text-end">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleAddCustomItem}
                                    disabled={!customName.trim() || customPrice === ''}
                                >
                                    <i className="ti ti-plus me-1"></i>เพิ่มเข้ารายการที่เลือก
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Search Box */}
                        <div className="mb-3">
                            <div className="input-icon">
                                <span className="input-icon-addon"><i className="ti ti-search"></i></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder={`ค้นหาด้วยรหัส หรือ ชื่อ${activeTab === 'SERVICE' ? 'บริการ' : 'อะไหล่'}...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Item List Table */}
                        <div className="table-responsive" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                            <table className="table table-vcenter table-hover">
                                <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                                    <tr>
                                        <th style={{ width: '40px' }}></th>
                                        <th style={{ width: '80px' }}>รหัส</th>
                                        <th>ชื่อรายการ</th>
                                        <th className="text-end" style={{ width: '100px' }}>ราคา</th>
                                        <th className="text-center" style={{ width: '90px' }}>จำนวน</th>
                                        <th className="text-end" style={{ width: '110px' }}>รวม</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredList().length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-4 text-muted">
                                                {searchQuery ? `ไม่พบรายการที่ตรงกับ "${searchQuery}"` : 'ไม่มีข้อมูล'}
                                            </td>
                                        </tr>
                                    ) : (
                                        getFilteredList().map((item) => {
                                            const selected = isItemSelected(item.id)
                                            const selectedData = selectedItems.find(s => s.id === item.id)
                                            return (
                                                <tr
                                                    key={item.id}
                                                    className={selected ? 'bg-primary-lt' : ''}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => toggleItem(item)}
                                                >
                                                    <td className="text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            checked={selected}
                                                            onChange={() => toggleItem(item)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-blue-lt text-blue font-monospace">{item.code || '-'}</span>
                                                    </td>
                                                    <td className="fw-medium">{item.name}</td>
                                                    <td className="text-end">{Number(item.price).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                                                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                                                        {selected ? (
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm text-center"
                                                                style={{ width: '70px', margin: '0 auto' }}
                                                                value={selectedData?.quantity || 1}
                                                                min={1}
                                                                onChange={(e) => updateSelectedItemField(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
                                                            />
                                                        ) : (
                                                            <span className="text-muted">-</span>
                                                        )}
                                                    </td>
                                                    <td className="text-end fw-bold">
                                                        {selected ? (
                                                            <span className="text-primary">
                                                                ฿{((selectedData?.quantity || 1) * Number(item.price)).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Selected Items Summary */}
                {selectedItems.length > 0 && (
                    <div className="mt-3 p-3 bg-light rounded">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <strong><i className="ti ti-shopping-cart me-1"></i>รายการที่เลือก ({selectedItems.length})</strong>
                        </div>
                        <div className="list-group list-group-flush">
                            {selectedItems.map((item) => (
                                <div key={item.id} className="list-group-item px-0 py-1 d-flex justify-content-between align-items-center bg-transparent">
                                    <div>
                                        <span className={`badge ${item.type === 'SERVICE' ? 'bg-blue-lt' : 'bg-orange-lt'} me-1`}>
                                            {item.type === 'SERVICE' ? 'บริการ' : 'อะไหล่'}
                                        </span>
                                        <span className="small">{item.name}</span>
                                        <span className="text-muted small ms-1">×{item.quantity}</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="fw-bold small">฿{(item.quantity * item.unitPrice).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                                        <button
                                            className="btn btn-sm btn-ghost-danger ms-2 p-0"
                                            onClick={() => setSelectedItems(prev => prev.filter(s => s.id !== item.id))}
                                        >
                                            <i className="ti ti-x"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between">
                            <strong>ยอดรวม</strong>
                            <strong className="text-primary fs-4">฿{getSelectedTotal().toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal for Item Cancellation Reason */}
            {cancelModalItem && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal modal-blur fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header bg-danger text-white">
                                    <h5 className="modal-title"><i className="ti ti-alert-circle me-2"></i>ระบุสาเหตุการยกเลิกรายการ</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setCancelModalItem(null)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label text-muted">รายการที่ต้องการยกเลิก:</label>
                                        <div className="fw-bold fs-3 text-dark">{cancelModalItem.name}</div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label required">สาเหตุการยกเลิก</label>
                                        <div className="form-selectgroup form-selectgroup-boxes d-flex flex-column gap-2">
                                            {[
                                                'ลูกค้าขอยกเลิก / เลื่อนการซ่อม',
                                                'ตรวจเช็คแล้วยังไม่จำเป็นต้องเปลี่ยน',
                                                'อะไหล่ขาดตลาด / สั่งไม่ได้',
                                                'พบความเสียหายอื่นที่ต้องซ่อมจุดอื่นแทน',
                                                'OTHER',
                                            ].map((r) => (
                                                <label key={r} className="form-selectgroup-item flex-fill">
                                                    <input
                                                        type="radio"
                                                        name="cancelReason"
                                                        value={r}
                                                        className="form-selectgroup-input"
                                                        checked={cancelReasonPreset === r}
                                                        onChange={() => setCancelReasonPreset(r)}
                                                    />
                                                    <div className="form-selectgroup-label d-flex align-items-center p-3">
                                                        <span className="me-3">
                                                            <span className="form-selectgroup-check"></span>
                                                        </span>
                                                        <div>
                                                            {r === 'OTHER' ? '📝 ระบุสาเหตุอื่นๆ...' : r}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {cancelReasonPreset === 'OTHER' && (
                                        <div className="mb-3">
                                            <label className="form-label required">ระบุรายละเอียดสาเหตุ</label>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                placeholder="กรอกเหตุผลที่ลูกค้ายกเลิก หรือช่างยกเลิกรายการนี้..."
                                                value={cancelReasonCustom}
                                                onChange={(e) => setCancelReasonCustom(e.target.value)}
                                                autoFocus
                                            ></textarea>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-link link-secondary" onClick={() => setCancelModalItem(null)}>
                                        ปิด
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        disabled={cancelling || (cancelReasonPreset === 'OTHER' && !cancelReasonCustom.trim())}
                                        onClick={handleConfirmCancelItem}
                                    >
                                        {cancelling ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="ti ti-check me-1"></i>}
                                        ยืนยันยกเลิกรายการ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </MainLayout>
    )
}
