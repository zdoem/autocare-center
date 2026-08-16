'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { showError, showCreateSuccess } from '@/components/ui'

const formatMoney = (amount: number | string) => {
    return Number(amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function InventoryReceivePage() {
    const router = useRouter()
    
    const [pendingPOs, setPendingPOs] = useState<any[]>([])
    const [selectedPO, setSelectedPO] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchPendingPOs()
    }, [])

    const fetchPendingPOs = async () => {
        try {
            const res = await fetch('/api/inventory/purchase?status=PENDING')
            const json = await res.json()
            if (json.success) {
                setPendingPOs(json.data)
            }
        } catch (e) { console.error(e) }
    }

    const handleSelectPO = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value
        if (!id) {
            setSelectedPO(null)
            return
        }
        const po = pendingPOs.find(p => p.id === id)
        setSelectedPO(po)
    }

    const handleReceivePO = async () => {
        if (!selectedPO) return showError('กรุณาเลือก PO ก่อน')
        
        try {
            setLoading(true)
            const res = await fetch(`/api/inventory/purchase/${selectedPO.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'RECEIVED' })
            })

            const json = await res.json()
            if (res.ok && json.success) {
                showCreateSuccess('รับสินค้าเข้าสต๊อกเรียบร้อย')
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
        <MainLayout title={<><i className="ti ti-box me-2"></i>รับสินค้าเข้าสต๊อก (Receive)</>} pretitle="Inventory">
            <div className="row">
                <div className="col-lg-8">
                    {/* Select PO */}
                    <div className="card mb-3">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-search me-2"></i>เลือกใบสั่งซื้อ (PO) ที่รอรับสินค้า</h3>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-12">
                                    <label className="form-label required">ค้นหาหรือเลือก PO</label>
                                    <select 
                                        className="form-select form-select-lg"
                                        onChange={handleSelectPO}
                                        defaultValue=""
                                    >
                                        <option value="">-- เลือกใบสั่งซื้อ (PO) --</option>
                                        {pendingPOs.map(po => (
                                            <option key={po.id} value={po.id}>
                                                {po.purchaseNo} - {po.vendor.name} (ยอด {formatMoney(po.grandTotal)} ฿)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {selectedPO && (
                                <div className="alert alert-info mt-3 mb-0">
                                    <div className="d-flex align-items-center">
                                        <i className="ti ti-building me-3 fs-1"></i>
                                        <div>
                                            <div className="fw-bold">{selectedPO.vendor.name}</div>
                                            <div>วันที่สั่ง: {formatDate(selectedPO.createdAt)}</div>
                                            <div>หมายเหตุ: {selectedPO.notes || '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items */}
                    <div className="card mb-3">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-package me-2"></i>รายการสินค้าที่จะได้รับ</h3>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-vcenter card-table">
                                <thead>
                                    <tr>
                                        <th>รหัส</th>
                                        <th>อะไหล่</th>
                                        <th className="text-center">จำนวนสั่งซื้อ</th>
                                        <th className="text-end">ราคา/หน่วย</th>
                                        <th className="text-end">รวม</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!selectedPO ? (
                                        <tr>
                                            <td colSpan={5} className="text-center text-muted py-4">กรุณาเลือกใบสั่งซื้อ (PO)</td>
                                        </tr>
                                    ) : (
                                        selectedPO.items.map((item: any, index: number) => (
                                            <tr key={index}>
                                                <td><code>{item.spare.code}</code></td>
                                                <td>{item.spare.name}</td>
                                                <td className="text-center">
                                                    <span className="badge bg-blue">{item.quantity}</span>
                                                </td>
                                                <td className="text-end">฿{formatMoney(item.unitPrice)}</td>
                                                <td className="text-end fw-bold">฿{formatMoney(item.total)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right: Summary */}
                <div className="col-lg-4">
                    <div className="card sticky-top" style={{ top: '1rem' }}>
                        <div className="card-header bg-success text-white">
                            <h3 className="card-title text-white">ยืนยันรับสินค้าเข้า</h3>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <div className="text-muted">เลขที่ PO</div>
                                <div className="h3">{selectedPO ? selectedPO.purchaseNo : '-'}</div>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-2">
                                <span>จำนวนรายการ</span><span className="fw-bold">{selectedPO ? selectedPO.items.length : 0} รายการ</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>รวมก่อน VAT</span><span>฿{formatMoney(selectedPO?.totalAmount || 0)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>VAT</span><span>฿{formatMoney(selectedPO?.vatAmount || 0)}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-4">
                                <span className="h3">ยอดสุทธิ</span>
                                <span className="display-6 text-success fw-bold">฿{formatMoney(selectedPO?.grandTotal || 0)}</span>
                            </div>

                            <div className="d-grid gap-2">
                                <button 
                                    className="btn btn-success btn-lg" 
                                    disabled={loading || !selectedPO}
                                    onClick={handleReceivePO}
                                >
                                    <i className="ti ti-check me-1"></i>รับสินค้าเข้า Stock
                                </button>
                                <button 
                                    className="btn btn-outline-secondary" 
                                    onClick={() => router.push('/inventory/purchase')}
                                >
                                    ย้อนกลับไปสร้าง PO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
