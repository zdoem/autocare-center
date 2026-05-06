'use client'

import { useState, useEffect } from 'react'
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

const formatMoney = (amount: number | string) => {
    return Number(amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

export default function InventoryStockPage() {
    const [spares, setSpares] = useState<Spare[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [search, setSearch] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [stockStatus, setStockStatus] = useState('')

    const [totalValue, setTotalValue] = useState(0)

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        fetchSpares()
    }, [search, categoryId, stockStatus])

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/master/spares-category')
            const json = await res.json()
            if (Array.isArray(json)) setCategories(json)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchSpares = async () => {
        try {
            setLoading(true)
            const query = new URLSearchParams()
            if (search) query.append('search', search)
            if (categoryId) query.append('categoryId', categoryId)
            if (stockStatus) query.append('stockStatus', stockStatus)
            
            const res = await fetch(`/api/master/spare?${query.toString()}`)
            const json = await res.json()
            if (Array.isArray(json)) {
                setSpares(json)
                // Calculate total inventory value
                const total = json.reduce((sum, spare) => sum + (spare.currentStock * spare.costPrice), 0)
                setTotalValue(total)
            } else {
                setSpares([])
                setTotalValue(0)
            }
        } catch (error) {
            showError('โหลดข้อมูลสต๊อกไม่สำเร็จ')
            setSpares([])
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (spare: Spare) => {
        if (spare.isOutOfStock) {
            return <span className="badge bg-dark"><i className="ti ti-x me-1"></i>หมด</span>
        }
        if (spare.isLowStock) {
            return <span className="badge bg-yellow"><i className="ti ti-alert-triangle me-1"></i>ใกล้หมด</span>
        }
        return <span className="badge bg-green">ปกติ</span>
    }

    const getRowClass = (spare: Spare) => {
        if (spare.isOutOfStock) return 'bg-danger-lt'
        if (spare.isLowStock) return 'bg-yellow-lt'
        return ''
    }

    return (
        <MainLayout title={<><i className="ti ti-box me-2"></i>รายการ Stock</>} pretitle="Inventory">
            <div className="row align-items-center mb-3">
                <div className="col-auto ms-auto btn-list">
                    <Link href="/inventory/purchase" className="btn btn-primary">
                        <i className="ti ti-plus me-1"></i>รับสินค้าเข้า (PO)
                    </Link>
                    <Link href="/inventory/movement" className="btn btn-outline-secondary">
                        <i className="ti ti-history me-1"></i>ประวัติความเคลื่อนไหว
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="row">
                        <div className="col-lg-4 mb-3 mb-lg-0">
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="ค้นหา รหัส/ชื่ออะไหล่..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="col-lg-3 mb-3 mb-lg-0">
                            <select 
                                className="form-select"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                            >
                                <option value="">ทุกหมวดหมู่</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-lg-3 mb-3 mb-lg-0">
                            <select 
                                className="form-select"
                                value={stockStatus}
                                onChange={(e) => setStockStatus(e.target.value)}
                            >
                                <option value="">ทุกสถานะ</option>
                                <option value="low">ใกล้หมด (ต่ำกว่า Min)</option>
                                <option value="out">หมด (0)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stock Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">รายการอะไหล่</h3>
                    <div className="card-actions text-muted">
                        รวม {spares.length} รายการ | มูลค่า ฿{formatMoney(totalValue)}
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th>รหัส</th>
                                <th>อะไหล่</th>
                                <th>หมวด</th>
                                <th className="text-center">คงเหลือ</th>
                                <th className="text-center">Min</th>
                                <th className="text-center">Max</th>
                                <th className="text-end">ต้นทุน</th>
                                <th className="text-end">ราคาขาย</th>
                                <th className="text-end">มูลค่ารวม</th>
                                <th>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : spares.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="text-center text-muted py-4">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            ) : (
                                spares.map(spare => (
                                    <tr key={spare.id} className={getRowClass(spare)}>
                                        <td><code>{spare.code}</code></td>
                                        <td>{spare.name}</td>
                                        <td>
                                            <span className="badge bg-blue-lt">
                                                {spare.sparesCategory?.name || '-'}
                                            </span>
                                        </td>
                                        <td className={`text-center ${spare.isOutOfStock || spare.isLowStock ? 'fw-bold text-danger' : ''}`}>
                                            {spare.currentStock}
                                        </td>
                                        <td className="text-center">{spare.minStock}</td>
                                        <td className="text-center">{spare.maxStock}</td>
                                        <td className="text-end">฿{formatMoney(spare.costPrice)}</td>
                                        <td className="text-end">฿{formatMoney(spare.sellingPrice)}</td>
                                        <td className="text-end">฿{formatMoney(spare.currentStock * spare.costPrice)}</td>
                                        <td>{getStatusBadge(spare)}</td>
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
