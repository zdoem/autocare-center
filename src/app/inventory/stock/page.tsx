'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'
import Link from 'next/link'

interface Spare {
    id: string
    code: string
    name: string
    unit: string
    costPrice: number
    sellingPrice: number
    minStock: number
    maxStock: number
    currentStock: number
    isLowStock: boolean
    isOutOfStock: boolean
    sparesCategory?: {
        name: string
    }
}

interface Category {
    id: string
    name: string
}

interface StockMovement {
    id: string
    movementNo: string
    movementDate: string
    movementType: 'IN' | 'OUT' | 'ADJUST' | 'RETURN'
    quantity: number
    beforeQty: number
    afterQty: number
    reference: string | null
    notes: string | null
    spare: {
        code: string
        name: string
        unit: string
    }
}

const formatMoney = (amount: number | string) => {
    return Number(amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

const MovementTypeBadge = ({ type }: { type: string }) => {
    const config: Record<string, { label: string; className: string; icon: string }> = {
        IN:     { label: 'รับเข้า',    className: 'bg-green text-white',  icon: 'ti-arrow-bar-down' },
        OUT:    { label: 'เบิกออก',    className: 'bg-orange text-white', icon: 'ti-arrow-bar-up' },
        ADJUST: { label: 'ปรับปรุง',   className: 'bg-secondary text-white', icon: 'ti-adjustments' },
        RETURN: { label: 'คืนสินค้า',  className: 'bg-blue text-white',   icon: 'ti-refresh' },
    }
    const c = config[type] || config.ADJUST
    return (
        <span className={`badge ${c.className}`}>
            <i className={`ti ${c.icon} me-1`}></i>{c.label}
        </span>
    )
}

function StockContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const initialTab = searchParams.get('tab') === 'movement' ? 'movement' : 'stock'
    const initialCode = searchParams.get('spareCode') || ''

    const [activeTab, setActiveTab] = useState<'stock' | 'movement'>(initialTab)

    // Stock Balance States
    const [spares, setSpares] = useState<Spare[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [stockLoading, setStockLoading] = useState(true)
    const [stockSearch, setStockSearch] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [stockStatus, setStockStatus] = useState('')
    const [totalValue, setTotalValue] = useState(0)

    // Stock Movement States
    const [movements, setMovements] = useState<StockMovement[]>([])
    const [movementLoading, setMovementLoading] = useState(false)
    const [movementType, setMovementType] = useState('')
    const [movementSearch, setMovementSearch] = useState(initialCode)

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        if (activeTab === 'stock') {
            fetchSpares()
        } else {
            fetchMovements()
        }
    }, [activeTab, stockSearch, categoryId, stockStatus, movementType])

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/master/spares-category')
            const json = await res.json()
            if (Array.isArray(json)) setCategories(json)
            else if (json?.success && Array.isArray(json.data)) setCategories(json.data)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchSpares = async () => {
        try {
            setStockLoading(true)
            const query = new URLSearchParams()
            if (stockSearch) query.append('search', stockSearch)
            if (categoryId) query.append('categoryId', categoryId)
            if (stockStatus) query.append('stockStatus', stockStatus)

            const res = await fetch(`/api/master/spare?${query.toString()}`)
            const json = await res.json()
            if (Array.isArray(json)) {
                setSpares(json)
                const total = json.reduce((sum, spare) => sum + (spare.currentStock * spare.costPrice), 0)
                setTotalValue(total)
            } else if (json?.success && Array.isArray(json.data)) {
                setSpares(json.data)
                const total = json.data.reduce((sum: number, spare: any) => sum + (spare.currentStock * spare.costPrice), 0)
                setTotalValue(total)
            } else {
                setSpares([])
                setTotalValue(0)
            }
        } catch (error) {
            showError('โหลดข้อมูลสต็อกไม่สำเร็จ')
            setSpares([])
        } finally {
            setStockLoading(false)
        }
    }

    const fetchMovements = async () => {
        try {
            setMovementLoading(true)
            const query = new URLSearchParams()
            if (movementType) query.append('movementType', movementType)
            query.append('limit', '200')

            const res = await fetch(`/api/inventory/movement?${query.toString()}`)
            const json = await res.json()
            if (json.success) {
                setMovements(json.data || [])
            } else if (Array.isArray(json)) {
                setMovements(json)
            } else {
                setMovements([])
            }
        } catch (error) {
            showError('โหลดข้อมูลประวัติความเคลื่อนไหวไม่สำเร็จ')
            setMovements([])
        } finally {
            setMovementLoading(false)
        }
    }

    // Filter movements by search
    const filteredMovements = movements.filter(m =>
        !movementSearch ||
        m.spare.code.toLowerCase().includes(movementSearch.toLowerCase()) ||
        m.spare.name.toLowerCase().includes(movementSearch.toLowerCase()) ||
        (m.reference || '').toLowerCase().includes(movementSearch.toLowerCase())
    )

    // Drill down to movement from stock table
    const handleViewStockCard = (spareCode: string) => {
        setMovementSearch(spareCode)
        setActiveTab('movement')
    }

    const getStatusBadge = (spare: Spare) => {
        if (spare.isOutOfStock) {
            return <span className="badge bg-danger text-white"><i className="ti ti-x me-1"></i>หมดสต็อก (0)</span>
        }
        if (spare.isLowStock) {
            return <span className="badge bg-warning text-white"><i className="ti ti-alert-triangle me-1"></i>ใกล้หมด (&lt;Min)</span>
        }
        return <span className="badge bg-success text-white"><i className="ti ti-check me-1"></i>ปกติ</span>
    }

    const getRowClass = (spare: Spare) => {
        if (spare.isOutOfStock) return 'bg-danger-lt'
        if (spare.isLowStock) return 'bg-yellow-lt'
        return ''
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString('th-TH', { year: '2-digit', month: '2-digit', day: '2-digit' }) + 
               ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    }

    // Metrics for Stock
    const lowStockCount = spares.filter(s => s.isLowStock).length
    const outOfStockCount = spares.filter(s => s.isOutOfStock).length

    // Metrics for Movement
    const inCount = movements.filter(m => m.movementType === 'IN').length
    const outCount = movements.filter(m => m.movementType === 'OUT').length
    const adjustCount = movements.filter(m => m.movementType === 'ADJUST').length

    return (
        <MainLayout 
            title={<><i className="ti ti-packages me-2"></i>สต็อกและความเคลื่อนไหว</>} 
            pretitle="คลังสินค้าและอะไหล่ (Inventory Hub)"
        >
            {/* Header & Tabs */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                {/* Unified Tab Navigator */}
                <ul className="nav nav-pills card-header-pills m-0 bg-white p-1 rounded-3 shadow-sm border">
                    <li className="nav-item">
                        <button
                            type="button"
                            className={`nav-link px-3 py-2 fw-medium ${activeTab === 'stock' ? 'active shadow-sm' : 'text-muted'}`}
                            onClick={() => { setActiveTab('stock'); setMovementSearch('') }}
                        >
                            <i className="ti ti-box me-2"></i>1. สต็อกคงเหลือ (Balance)
                            <span className={`badge ms-2 ${activeTab === 'stock' ? 'bg-white text-primary' : 'bg-primary-lt'}`}>
                                {spares.length}
                            </span>
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            type="button"
                            className={`nav-link px-3 py-2 fw-medium ${activeTab === 'movement' ? 'active shadow-sm' : 'text-muted'}`}
                            onClick={() => setActiveTab('movement')}
                        >
                            <i className="ti ti-arrows-exchange me-2"></i>2. ประวัติความเคลื่อนไหว (Stock Movements)
                            {movementSearch && (
                                <span className="badge bg-warning-lt ms-2">กรอง: {movementSearch}</span>
                            )}
                        </button>
                    </li>
                </ul>

                {/* Right Action: Procurement Flow */}
                <div className="btn-list">
                    <Link href="/inventory/purchase" className="btn btn-primary shadow-sm">
                        <i className="ti ti-shopping-cart me-1"></i>สั่งซื้ออะไหล่ (สร้าง PO)
                    </Link>
                </div>
            </div>

            {/* =========================================================
                TAB 1: สต็อกคงเหลือ (Stock Balance)
               ========================================================= */}
            {activeTab === 'stock' && (
                <>
                    {/* Summary KPI Cards */}
                    <div className="row g-3 mb-3">
                        <div className="col-sm-6 col-lg-3">
                            <div className="card card-sm">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col-auto">
                                            <span className="bg-primary text-white avatar">
                                                <i className="ti ti-box fs-2"></i>
                                            </span>
                                        </div>
                                        <div className="col">
                                            <div className="font-weight-medium">อะไหล่ทั้งหมด</div>
                                            <div className="text-muted fs-3 fw-bold">{spares.length} รายการ</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                            <div className="card card-sm">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col-auto">
                                            <span className="bg-warning text-white avatar">
                                                <i className="ti ti-alert-triangle fs-2"></i>
                                            </span>
                                        </div>
                                        <div className="col">
                                            <div className="font-weight-medium">ใกล้หมดสต็อก (&lt; Min)</div>
                                            <div className="text-warning fs-3 fw-bold">{lowStockCount} รายการ</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                            <div className="card card-sm">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col-auto">
                                            <span className="bg-danger text-white avatar">
                                                <i className="ti ti-x fs-2"></i>
                                            </span>
                                        </div>
                                        <div className="col">
                                            <div className="font-weight-medium">หมดสต็อก (0)</div>
                                            <div className="text-danger fs-3 fw-bold">{outOfStockCount} รายการ</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                            <div className="card card-sm">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col-auto">
                                            <span className="bg-success text-white avatar">
                                                <i className="ti ti-currency-baht fs-2"></i>
                                            </span>
                                        </div>
                                        <div className="col">
                                            <div className="font-weight-medium">มูลค่าสต็อกรวม</div>
                                            <div className="text-success fs-3 fw-bold">฿{formatMoney(totalValue)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stock Filters */}
                    <div className="card mb-3">
                        <div className="card-body">
                            <div className="row g-2">
                                <div className="col-lg-5">
                                    <div className="input-icon">
                                        <span className="input-icon-addon"><i className="ti ti-search"></i></span>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="ค้นหารหัส หรือ ชื่ออะไหล่..."
                                            value={stockSearch}
                                            onChange={(e) => setStockSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-lg-4">
                                    <select 
                                        className="form-select"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                    >
                                        <option value="">ทุกหมวดหมู่อะไหล่</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-lg-3">
                                    <select 
                                        className="form-select"
                                        value={stockStatus}
                                        onChange={(e) => setStockStatus(e.target.value)}
                                    >
                                        <option value="">ทุกสถานะสต็อก</option>
                                        <option value="low">⚠️ ใกล้หมดสต็อก (ต่ำกว่า Min)</option>
                                        <option value="out">❌ หมดสต็อก (0)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stock Table */}
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h3 className="card-title"><i className="ti ti-list-check me-2"></i>รายการสต็อกอะไหล่คงเหลือ</h3>
                            <div className="card-actions text-muted small">
                                แสดง {spares.length} รายการ | รวมมูลค่าทุน ฿{formatMoney(totalValue)}
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-vcenter table-hover card-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '90px' }}>รหัส</th>
                                        <th>ชื่ออะไหล่</th>
                                        <th>หมวดหมู่</th>
                                        <th className="text-center">คงเหลือ</th>
                                        <th className="text-center" style={{ width: '70px' }}>Min</th>
                                        <th className="text-center" style={{ width: '70px' }}>Max</th>
                                        <th className="text-end">ต้นทุน</th>
                                        <th className="text-end">ราคาขาย</th>
                                        <th className="text-end">มูลค่ารวม</th>
                                        <th className="text-center">สถานะ</th>
                                        <th className="text-end" style={{ width: '130px' }}>Stock Card</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stockLoading ? (
                                        <tr>
                                            <td colSpan={11} className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status"></div>
                                            </td>
                                        </tr>
                                    ) : spares.length === 0 ? (
                                        <tr>
                                            <td colSpan={11} className="text-center text-muted py-4">
                                                ไม่พบข้อมูลอะไหล่ที่ตรงตามเงื่อนไข
                                            </td>
                                        </tr>
                                    ) : (
                                        spares.map(spare => (
                                            <tr key={spare.id} className={getRowClass(spare)}>
                                                <td><span className="badge bg-blue text-white font-monospace">{spare.code}</span></td>
                                                <td className="fw-medium">{spare.name}</td>
                                                <td>
                                                    <span className="text-muted small">
                                                        {spare.sparesCategory?.name || '-'}
                                                    </span>
                                                </td>
                                                <td className={`text-center fs-3 fw-bold ${spare.isOutOfStock ? 'text-danger' : (spare.isLowStock ? 'text-warning' : 'text-primary')}`}>
                                                    {spare.currentStock} <span className="small fs-6 text-muted fw-normal">{spare.unit}</span>
                                                </td>
                                                <td className="text-center text-muted">{spare.minStock}</td>
                                                <td className="text-center text-muted">{spare.maxStock}</td>
                                                <td className="text-end">฿{formatMoney(spare.costPrice)}</td>
                                                <td className="text-end fw-bold text-dark">฿{formatMoney(spare.sellingPrice)}</td>
                                                <td className="text-end text-muted">฿{formatMoney(spare.currentStock * spare.costPrice)}</td>
                                                <td className="text-center">{getStatusBadge(spare)}</td>
                                                <td className="text-end">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        title="คลิกเพื่อดูประวัติการเข้า-ออกของอะไหล่ชิ้นนี้"
                                                        onClick={() => handleViewStockCard(spare.code)}
                                                    >
                                                        <i className="ti ti-history me-1"></i>ดูประวัติ
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* =========================================================
                TAB 2: ประวัติความเคลื่อนไหว (Stock Movements)
               ========================================================= */}
            {activeTab === 'movement' && (
                <>
                    {/* Summary Cards */}
                    <div className="row g-3 mb-3">
                        <div className="col-md-4">
                            <div className="card card-sm bg-green-lt border-green-subtle">
                                <div className="card-body d-flex align-items-center">
                                    <span className="bg-green text-white avatar me-3">
                                        <i className="ti ti-arrow-bar-down fs-2"></i>
                                    </span>
                                    <div>
                                        <div className="text-muted">รายการรับเข้า (IN)</div>
                                        <div className="fs-3 fw-bold text-green">{inCount} รายการ</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card card-sm bg-orange-lt border-orange-subtle">
                                <div className="card-body d-flex align-items-center">
                                    <span className="bg-orange text-white avatar me-3">
                                        <i className="ti ti-arrow-bar-up fs-2"></i>
                                    </span>
                                    <div>
                                        <div className="text-muted">รายการเบิกออก (OUT)</div>
                                        <div className="fs-3 fw-bold text-orange">{outCount} รายการ</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card card-sm bg-secondary-lt border-secondary-subtle">
                                <div className="card-body d-flex align-items-center">
                                    <span className="bg-secondary text-white avatar me-3">
                                        <i className="ti ti-adjustments fs-2"></i>
                                    </span>
                                    <div>
                                        <div className="text-muted">รายการปรับปรุงยอด (ADJUST)</div>
                                        <div className="fs-3 fw-bold text-dark">{adjustCount} รายการ</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter & Search */}
                    <div className="card mb-3">
                        <div className="card-body">
                            <div className="row g-2 align-items-center">
                                <div className="col-md-6">
                                    <div className="input-icon">
                                        <span className="input-icon-addon"><i className="ti ti-search"></i></span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="ค้นหา รหัสอะไหล่, ชื่ออะไหล่ หรือ เอกสารอ้างอิง..."
                                            value={movementSearch}
                                            onChange={(e) => setMovementSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <select
                                        className="form-select"
                                        value={movementType}
                                        onChange={(e) => setMovementType(e.target.value)}
                                    >
                                        <option value="">ทุกประเภทความเคลื่อนไหว</option>
                                        <option value="IN">📥 รับเข้า (IN)</option>
                                        <option value="OUT">📤 เบิกออกตามงานซ่อม (OUT)</option>
                                        <option value="ADJUST">⚙️ ปรับปรุงยอดตรวจนับ (ADJUST)</option>
                                        <option value="RETURN">🔄 รับคืนเข้าคลัง (RETURN)</option>
                                    </select>
                                </div>
                                {movementSearch && (
                                    <div className="col-md-2 text-end">
                                        <button
                                            type="button"
                                            className="btn btn-ghost-secondary btn-sm w-100"
                                            onClick={() => setMovementSearch('')}
                                        >
                                            <i className="ti ti-x me-1"></i>ล้างตัวกรอง
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Movements Table */}
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h3 className="card-title"><i className="ti ti-history me-2"></i>บันทึกประวัติการเข้า-ออกอะไหล่ (Stock Card Audit Log)</h3>
                            <div className="card-actions text-muted small">
                                ทั้งหมด {filteredMovements.length} รายการ
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-vcenter table-hover card-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '130px' }}>วัน-เวลา</th>
                                        <th style={{ width: '90px' }}>รหัสอะไหล่</th>
                                        <th>ชื่ออะไหล่</th>
                                        <th className="text-center" style={{ width: '110px' }}>ประเภท</th>
                                        <th className="text-center" style={{ width: '90px' }}>จำนวน</th>
                                        <th className="text-center" style={{ width: '80px' }}>ก่อนหน้า</th>
                                        <th className="text-center" style={{ width: '80px' }}>คงเหลือ</th>
                                        <th>เอกสารอ้างอิง</th>
                                        <th>หมายเหตุ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movementLoading ? (
                                        <tr>
                                            <td colSpan={9} className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status"></div>
                                            </td>
                                        </tr>
                                    ) : filteredMovements.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="text-center text-muted py-4">
                                                ยังไม่มีประวัติความเคลื่อนไหวที่ตรงตามเงื่อนไข
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMovements.map(m => (
                                            <tr key={m.id}>
                                                <td className="text-muted small">{formatDate(m.movementDate)}</td>
                                                <td><span className="badge bg-blue text-white font-monospace">{m.spare.code}</span></td>
                                                <td className="fw-medium">{m.spare.name}</td>
                                                <td className="text-center"><MovementTypeBadge type={m.movementType} /></td>
                                                <td className={`text-center fw-bold ${m.movementType === 'IN' || m.movementType === 'RETURN' ? 'text-success' : 'text-danger'}`}>
                                                    {m.movementType === 'IN' || m.movementType === 'RETURN' ? `+${m.quantity}` : `-${m.quantity}`} {m.spare.unit}
                                                </td>
                                                <td className="text-center text-muted">{m.beforeQty}</td>
                                                <td className="text-center fw-bold text-primary">{m.afterQty}</td>
                                                <td>
                                                    {m.reference ? (
                                                        <span className="badge bg-secondary-lt font-monospace">{m.reference}</span>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td className="text-muted small">{m.notes || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </MainLayout>
    )
}

export default function UnifiedStockPage() {
    return (
        <Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary"></div></div>}>
            <StockContent />
        </Suspense>
    )
}
