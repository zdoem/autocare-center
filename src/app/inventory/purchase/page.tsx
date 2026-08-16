'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { showError, showCreateSuccess } from '@/components/ui'

interface Vendor {
    id: string
    code: string
    name: string
    contactName: string | null
    phone: string | null
}

interface Spare {
    id: string
    code: string
    name: string
    costPrice: number
    currentStock: number
}

interface PurchaseItem {
    spareId: string
    code: string
    name: string
    quantity: number
    unitPrice: number
    total: number
}

const formatMoney = (amount: number | string) => {
    return Number(amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

export default function InventoryPurchasePage() {
    const router = useRouter()
    const [vendors, setVendors] = useState<Vendor[]>([])
    const [spares, setSpares] = useState<Spare[]>([])
    const [loading, setLoading] = useState(false)

    // Form State
    const [vendorId, setVendorId] = useState('')
    const [expectedDate, setExpectedDate] = useState('')
    const [notes, setNotes] = useState('')
    const [items, setItems] = useState<PurchaseItem[]>([])
    const [vatRate] = useState(7)

    // Modal State
    const [showModal, setShowModal] = useState(false)
    const [searchSpare, setSearchSpare] = useState('')

    useEffect(() => {
        fetchVendors()
        fetchSpares()
    }, [])

    const fetchVendors = async () => {
        try {
            const res = await fetch('/api/master/vendor')
            const json = await res.json()
            if (Array.isArray(json)) setVendors(json)
        } catch (e) { console.error(e) }
    }

    const fetchSpares = async () => {
        try {
            const res = await fetch('/api/master/spare')
            const json = await res.json()
            if (Array.isArray(json)) setSpares(json)
        } catch (e) { console.error(e) }
    }

    const handleAddItem = (spare: Spare) => {
        if (items.find(i => i.spareId === spare.id)) {
            return showError('มีอะไหล่นี้ในรายการสั่งซื้อแล้ว')
        }
        setItems([...items, {
            spareId: spare.id,
            code: spare.code,
            name: spare.name,
            quantity: 1,
            unitPrice: spare.costPrice,
            total: spare.costPrice
        }])
        setShowModal(false)
    }

    const handleUpdateItem = (index: number, field: 'quantity' | 'unitPrice', value: number) => {
        const newItems = [...items]
        newItems[index][field] = value
        newItems[index].total = newItems[index].quantity * newItems[index].unitPrice
        setItems(newItems)
    }

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    // Totals calculation
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0)
    const vatAmount = totalAmount * (vatRate / 100)
    const grandTotal = totalAmount + vatAmount
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)

    const selectedVendor = vendors.find(v => v.id === vendorId)

    const filteredSpares = spares.filter(s => 
        s.code.toLowerCase().includes(searchSpare.toLowerCase()) || 
        s.name.toLowerCase().includes(searchSpare.toLowerCase())
    )

    const handleSavePO = async (status: 'PENDING' | 'RECEIVED') => {
        if (!vendorId) return showError('กรุณาเลือก Vendor')
        if (items.length === 0) return showError('กรุณาเพิ่มรายการสั่งซื้ออย่างน้อย 1 รายการ')

        try {
            setLoading(true)
            const payload = {
                vendorId,
                status,
                notes: `คาดว่าจะรับ: ${expectedDate}\n${notes}`,
                vatRate,
                items: items.map(i => ({
                    spareId: i.spareId,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice
                }))
            }

            const res = await fetch('/api/inventory/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const json = await res.json()
            if (res.ok && json.success) {
                showCreateSuccess(status === 'RECEIVED' ? 'บันทึกและรับสินค้าเข้าสต๊อกเรียบร้อย' : 'สร้างใบสั่งซื้อ (PO) เรียบร้อย')
                router.push('/inventory/stock')
            } else {
                showError(json.error || 'เกิดข้อผิดพลาดในการบันทึก')
            }
        } catch (error) {
            showError('บันทึกข้อมูลไม่สำเร็จ')
        } finally {
            setLoading(false)
        }
    }

    return (
        <MainLayout title={<><i className="ti ti-shopping-cart me-2"></i>สร้างใบสั่งซื้อ (PO)</>} pretitle="Inventory">
            <div className="row">
                {/* Left: PO Form */}
                <div className="col-lg-8">
                    {/* Vendor Selection */}
                    <div className="card mb-3">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-truck me-2"></i>เลือก Vendor</h3>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-8 mb-3">
                                    <label className="form-label required">Vendor</label>
                                    <select 
                                        className="form-select form-select-lg"
                                        value={vendorId}
                                        onChange={(e) => setVendorId(e.target.value)}
                                    >
                                        <option value="">-- เลือก Vendor --</option>
                                        {vendors.map(v => (
                                            <option key={v.id} value={v.id}>{v.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">วันที่คาดรับ</label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        value={expectedDate}
                                        onChange={(e) => setExpectedDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            {selectedVendor && (
                                <div className="alert alert-info mb-0">
                                    <div className="d-flex align-items-center">
                                        <i className="ti ti-building me-3 fs-1"></i>
                                        <div>
                                            <div className="fw-bold">{selectedVendor.name}</div>
                                            <div>ติดต่อ: {selectedVendor.contactName || '-'} | {selectedVendor.phone || '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items */}
                    <div className="card mb-3">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-package me-2"></i>รายการสั่งซื้อ</h3>
                            <div className="card-actions">
                                <button className="btn btn-sm btn-primary" onClick={() => setShowModal(true)}>
                                    <i className="ti ti-plus me-1"></i>เพิ่มรายการ
                                </button>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-vcenter card-table">
                                <thead>
                                    <tr>
                                        <th>รหัส</th>
                                        <th>อะไหล่</th>
                                        <th className="text-center" style={{ width: '120px' }}>จำนวน</th>
                                        <th className="text-end" style={{ width: '150px' }}>ราคา/หน่วย</th>
                                        <th className="text-end">รวม</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center text-muted py-4">ไม่มีรายการสั่งซื้อ</td>
                                        </tr>
                                    ) : (
                                        items.map((item, index) => (
                                            <tr key={index}>
                                                <td><code>{item.code}</code></td>
                                                <td>{item.name}</td>
                                                <td className="text-center">
                                                    <input 
                                                        type="number" 
                                                        className="form-control form-control-sm text-center" 
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateItem(index, 'quantity', Number(e.target.value))}
                                                        min="1"
                                                    />
                                                </td>
                                                <td className="text-end">
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text">฿</span>
                                                        <input 
                                                            type="number" 
                                                            className="form-control text-end" 
                                                            value={item.unitPrice}
                                                            onChange={(e) => handleUpdateItem(index, 'unitPrice', Number(e.target.value))}
                                                            min="0"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="text-end fw-bold">฿{formatMoney(item.total)}</td>
                                                <td>
                                                    <button className="btn btn-ghost-danger btn-icon btn-sm" onClick={() => handleRemoveItem(index)}>
                                                        <i className="ti ti-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-notes me-2"></i>หมายเหตุ</h3>
                        </div>
                        <div className="card-body">
                            <textarea 
                                className="form-control" 
                                rows={3} 
                                placeholder="หมายเหตุเพิ่มเติม..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Right: Summary */}
                <div className="col-lg-4">
                    <div className="card sticky-top" style={{ top: '1rem' }}>
                        <div className="card-header bg-primary text-white">
                            <h3 className="card-title text-white">สรุปใบสั่งซื้อ</h3>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <div className="text-muted">เลขที่ PO</div>
                                <div className="h3">PO-รอสร้างอัตโนมัติ</div>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-2">
                                <span>จำนวนรายการ</span><span className="fw-bold">{items.length} รายการ</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>จำนวนสินค้ารวม</span><span className="fw-bold">{totalQty} ชิ้น</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-2">
                                <span>รวมก่อน VAT</span><span>฿{formatMoney(totalAmount)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>VAT {vatRate}%</span><span>฿{formatMoney(vatAmount)}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-4">
                                <span className="h3">ยอดรวม</span>
                                <span className="display-6 text-primary fw-bold">฿{formatMoney(grandTotal)}</span>
                            </div>

                            <div className="d-grid gap-2">
                                <button 
                                    className="btn btn-primary btn-lg" 
                                    disabled={loading || items.length === 0}
                                    onClick={() => handleSavePO('PENDING')}
                                >
                                    <i className="ti ti-file-plus me-1"></i>บันทึก PO (รอตรวจรับสินค้า)
                                </button>
                                <button 
                                    className="btn btn-success btn-lg" 
                                    disabled={loading || items.length === 0}
                                    onClick={() => handleSavePO('RECEIVED')}
                                >
                                    <i className="ti ti-box me-1"></i>รับสินค้าเข้า Stock ทันที
                                </button>
                                <button className="btn btn-outline-secondary" disabled>
                                    <i className="ti ti-printer me-1"></i>พิมพ์ใบ PO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Add Item */}
            {showModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal modal-blur fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">เพิ่มรายการสั่งซื้อ</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">ค้นหาอะไหล่</label>
                                        <input 
                                            type="text" 
                                            className="form-control form-control-lg" 
                                            placeholder="พิมพ์รหัส หรือชื่ออะไหล่..."
                                            value={searchSpare}
                                            onChange={(e) => setSearchSpare(e.target.value)}
                                        />
                                    </div>
                                    <div className="table-responsive" style={{ maxHeight: '400px' }}>
                                        <table className="table table-hover table-vcenter">
                                            <thead>
                                                <tr>
                                                    <th>รหัส</th>
                                                    <th>อะไหล่</th>
                                                    <th className="text-center">Stock เดิม</th>
                                                    <th className="text-end">ต้นทุนล่าสุด</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredSpares.map(spare => (
                                                    <tr key={spare.id}>
                                                        <td><code>{spare.code}</code></td>
                                                        <td>{spare.name}</td>
                                                        <td className="text-center">
                                                            <span className={`badge ${spare.currentStock > 0 ? 'bg-green' : 'bg-red'}`}>
                                                                {spare.currentStock}
                                                            </span>
                                                        </td>
                                                        <td className="text-end">฿{formatMoney(spare.costPrice)}</td>
                                                        <td className="text-end">
                                                            <button 
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => handleAddItem(spare)}
                                                            >
                                                                <i className="ti ti-plus"></i> เลือก
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>ปิด</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </MainLayout>
    )
}
