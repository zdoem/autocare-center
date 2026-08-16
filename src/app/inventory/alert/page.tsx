'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'

const formatMoney = (amount: number | string) => {
    return Number(amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

export default function InventoryAlertPage() {
    const router = useRouter()
    
    const [spares, setSpares] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterLevel, setFilterLevel] = useState('ALL')

    useEffect(() => {
        fetchAlerts()
    }, [])

    const fetchAlerts = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/inventory/alert')
            const json = await res.json()
            if (json.success) {
                setSpares(json.data)
            } else {
                showError('โหลดข้อมูลแจ้งเตือนไม่สำเร็จ')
            }
        } catch (e) {
            console.error(e)
            showError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
        } finally {
            setLoading(false)
        }
    }

    const filteredSpares = spares.filter(s => {
        const matchesSearch = s.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              s.name.toLowerCase().includes(searchQuery.toLowerCase())
        if (!matchesSearch) return false

        if (filterLevel === 'OUT_OF_STOCK') return s.isOutOfStock
        if (filterLevel === 'LOW_STOCK') return s.isLowStock
        return true
    })

    const outOfStockCount = spares.filter(s => s.isOutOfStock).length
    const lowStockCount = spares.filter(s => s.isLowStock).length

    return (
        <MainLayout title={<><i className="ti ti-bell-ringing me-2"></i>แจ้งเตือนสินค้าใกล้หมด</>} pretitle="Inventory">
            {/* Summary Cards */}
            <div className="row row-deck row-cards mb-3">
                <div className="col-sm-6 col-lg-6">
                    <div className="card bg-danger text-white">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <span className="avatar avatar-lg bg-white-lt me-3">
                                    <i className="ti ti-alert-triangle text-white"></i>
                                </span>
                                <div>
                                    <div className="h2 mb-0">{outOfStockCount} รายการ</div>
                                    <div className="text-white-50">สินค้าที่หมดสต๊อก (Out of Stock)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-lg-6">
                    <div className="card bg-warning text-white">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <span className="avatar avatar-lg bg-white-lt me-3">
                                    <i className="ti ti-battery-1 text-white"></i>
                                </span>
                                <div>
                                    <div className="h2 mb-0">{lowStockCount} รายการ</div>
                                    <div className="text-white-50">สินค้าที่ใกล้หมด (Low Stock)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and Table */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title">รายการที่ต้องสั่งซื้อด่วน</h3>
                    <div className="btn-list">
                        <button className="btn btn-primary" onClick={() => router.push('/inventory/purchase')}>
                            <i className="ti ti-shopping-cart-plus me-1"></i>ไปหน้าสั่งซื้อ (PO)
                        </button>
                    </div>
                </div>
                <div className="card-body border-bottom py-3">
                    <div className="d-flex">
                        <div className="text-muted">
                            แสดง 
                            <select 
                                className="form-select form-select-sm d-inline-block w-auto mx-2"
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                            >
                                <option value="ALL">ทั้งหมด</option>
                                <option value="OUT_OF_STOCK">หมดสต๊อก</option>
                                <option value="LOW_STOCK">ใกล้หมด</option>
                            </select>
                        </div>
                        <div className="ms-auto text-muted">
                            ค้นหา: 
                            <div className="ms-2 d-inline-block">
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm" 
                                    placeholder="รหัส หรือ ชื่ออะไหล่" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table card-table table-vcenter text-nowrap datatable table-hover">
                        <thead>
                            <tr>
                                <th>รหัส</th>
                                <th>ชื่ออะไหล่/สินค้า</th>
                                <th>หมวดหมู่</th>
                                <th>Vendor แนะนำ</th>
                                <th className="text-center">จุดสั่งซื้อ (Min)</th>
                                <th className="text-center">คงเหลือ (Current)</th>
                                <th>สถานะ</th>
                                <th>การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-5">
                                        <div className="spinner-border text-primary"></div>
                                        <div className="mt-2">กำลังโหลดข้อมูล...</div>
                                    </td>
                                </tr>
                            ) : filteredSpares.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-5 text-muted">
                                        ไม่มีรายการแจ้งเตือน
                                    </td>
                                </tr>
                            ) : (
                                filteredSpares.map((spare) => (
                                    <tr key={spare.id}>
                                        <td><span className="text-muted">{spare.code}</span></td>
                                        <td>
                                            <div className="d-flex py-1 align-items-center">
                                                <span className="avatar me-2" style={{ backgroundColor: '#f4f6fa' }}>
                                                    {spare.name.charAt(0)}
                                                </span>
                                                <div className="flex-fill">
                                                    <div className="font-weight-medium">{spare.name}</div>
                                                    <div className="text-muted"><small>ราคาต้นทุน: ฿{formatMoney(spare.costPrice)}</small></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{spare.sparesCategory?.name || '-'}</td>
                                        <td>{spare.vendor?.name || '-'}</td>
                                        <td className="text-center">{spare.minStock}</td>
                                        <td className="text-center fw-bold fs-3">
                                            <span className={spare.isOutOfStock ? 'text-danger' : 'text-warning'}>
                                                {spare.currentStock}
                                            </span>
                                        </td>
                                        <td>
                                            {spare.isOutOfStock ? (
                                                <span className="badge bg-danger">หมดสต๊อก</span>
                                            ) : (
                                                <span className="badge bg-warning text-white">ใกล้หมด</span>
                                            )}
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => router.push('/inventory/purchase')}
                                            >
                                                สั่งซื้อ
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </MainLayout>
    )
}
