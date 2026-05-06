'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'

const fmt = (v: number) => v.toLocaleString('th-TH', { minimumFractionDigits: 2 })

interface Spare {
    id: string; code: string; name: string; currentStock: number; minStock: number; maxStock: number
    costPrice: number; unitName: string
    category: { name: string } | null
}

const StockBadge = ({ spare }: { spare: Spare }) => {
    if (spare.currentStock <= 0) return <span className="badge bg-dark"><i className="ti ti-x me-1"></i>หมด</span>
    if (spare.currentStock <= spare.minStock) return <span className="badge bg-red"><i className="ti ti-alert-triangle me-1"></i>ต่ำ</span>
    if (spare.currentStock <= spare.minStock * 1.5) return <span className="badge bg-yellow">ใกล้หมด</span>
    return <span className="badge bg-green">ปกติ</span>
}

const rowCls = (spare: Spare) => {
    if (spare.currentStock <= 0) return 'bg-danger-lt'
    if (spare.currentStock <= spare.minStock) return 'bg-danger-lt'
    if (spare.currentStock <= spare.minStock * 1.5) return 'bg-yellow-lt'
    return ''
}

export default function ReportStockPage() {
    const [spares, setSpares] = useState<Spare[]>([])
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [categoryId, setCategoryId] = useState('')
    const [search, setSearch] = useState('')

    useEffect(() => { fetchData() }, [categoryId])

    const fetchData = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (categoryId) params.set('categoryId', categoryId)
            const [spareRes, catRes] = await Promise.all([
                fetch(`/api/master/spare?${params}`),
                fetch('/api/master/spare-category')
            ])
            const spareJson = await spareRes.json()
            const catJson = await catRes.json()
            if (spareJson.success) setSpares(spareJson.data || [])
            if (catJson.success) setCategories(catJson.data || [])
        } catch { showError('โหลดข้อมูลไม่สำเร็จ') }
        finally { setLoading(false) }
    }

    const filtered = spares.filter(s =>
        !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())
    )

    const summary = {
        total: filtered.length,
        normal: filtered.filter(s => s.currentStock > s.minStock * 1.5).length,
        low: filtered.filter(s => s.currentStock > 0 && s.currentStock <= s.minStock * 1.5).length,
        out: filtered.filter(s => s.currentStock <= 0).length,
        totalValue: filtered.reduce((acc, s) => acc + (s.currentStock * s.costPrice), 0)
    }

    return (
        <MainLayout title={<><i className="ti ti-box me-2"></i>รายงานยอดคงเหลือ Stock</>} pretitle="รายงาน Inventory">
            <div className="row align-items-center mb-3">
                <div className="col-auto ms-auto btn-list">
                    <select className="form-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                        <option value="">ทุกหมวด</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button className="btn btn-primary"><i className="ti ti-file-export me-1"></i>Export Excel</button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row row-deck row-cards mb-3">
                {[
                    { label: 'รายการทั้งหมด', value: summary.total, color: 'bg-blue', icon: 'ti-box', suffix: '' },
                    { label: 'Stock ปกติ', value: summary.normal, color: 'bg-green', icon: 'ti-check', suffix: '' },
                    { label: 'ใกล้หมด/ต่ำ', value: summary.low, color: 'bg-yellow', icon: 'ti-alert-triangle', suffix: '' },
                    { label: 'หมด Stock', value: summary.out, color: 'bg-red', icon: 'ti-x', suffix: '' },
                ].map((card, i) => (
                    <div key={i} className="col-sm-6 col-lg-3">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <span className={`avatar ${card.color} me-3`}><i className={`ti ${card.icon}`}></i></span>
                                    <div>
                                        <div className="text-muted">{card.label}</div>
                                        <div className={`h2 mb-0 ${i === 2 ? 'text-yellow' : i === 3 ? 'text-red' : ''}`}>{card.value}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stock Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">รายการ Stock</h3>
                    <div className="card-actions">
                        <input
                            type="text" className="form-control" placeholder="ค้นหา..."
                            style={{ width: 200 }} value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th>รหัส</th><th>ชื่ออะไหล่</th><th>หมวด</th>
                                <th className="text-center">คงเหลือ</th><th className="text-center">Min</th><th className="text-center">Max</th>
                                <th className="text-end">ต้นทุน/หน่วย</th><th className="text-end">มูลค่าคงเหลือ</th><th>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="text-center py-4"><div className="spinner-border text-primary"></div></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={9} className="text-center text-muted py-4">ไม่มีข้อมูล</td></tr>
                            ) : filtered.map(s => (
                                <tr key={s.id} className={rowCls(s)}>
                                    <td><code>{s.code}</code></td>
                                    <td>{s.name}</td>
                                    <td>{s.category ? <span className="badge bg-blue-lt">{s.category.name}</span> : '-'}</td>
                                    <td className={`text-center fw-bold ${s.currentStock <= 0 ? 'text-danger' : s.currentStock <= s.minStock ? 'text-danger' : ''}`}>
                                        {s.currentStock}
                                    </td>
                                    <td className="text-center">{s.minStock}</td>
                                    <td className="text-center">{s.maxStock}</td>
                                    <td className="text-end">฿{fmt(s.costPrice)}</td>
                                    <td className="text-end">฿{fmt(s.currentStock * s.costPrice)}</td>
                                    <td><StockBadge spare={s} /></td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-light">
                            <tr>
                                <th colSpan={7}>รวมมูลค่าคงเหลือ</th>
                                <th className="text-end h4 text-primary">฿{fmt(summary.totalValue)}</th>
                                <th></th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </MainLayout>
    )
}
