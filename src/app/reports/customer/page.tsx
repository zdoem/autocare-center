'use client'

import { useState, useEffect, useCallback } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'

const fmt = (v: number) => v.toLocaleString('th-TH', { minimumFractionDigits: 2 })
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-'

const AVATAR_COLORS = ['bg-blue-lt', 'bg-pink-lt', 'bg-green-lt', 'bg-orange-lt', 'bg-cyan-lt', 'bg-purple-lt']

interface Customer {
    id: string; code: string; fullName: string; phone: string; email: string
    customerTypeName: string; carCount: number; jobCount: number
    totalSpend: number; lastJobDate: string | null
}
interface Summary { totalCustomers: number; vipCount: number; newThisMonth: number; totalCars: number }
interface Pagination { total: number; page: number; limit: number; totalPages: number }
interface CustomerData { customers: Customer[]; pagination: Pagination; summary: Summary }

export default function ReportCustomerPage() {
    const [data, setData] = useState<CustomerData | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [page, setPage] = useState(1)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({ page: String(page) })
            if (search) params.set('search', search)
            if (typeFilter) params.set('type', typeFilter)
            const res = await fetch(`/api/reports/customer?${params}`)
            const json = await res.json()
            if (json.success) setData(json.data)
            else showError('โหลดข้อมูลไม่สำเร็จ')
        } catch { showError('เกิดข้อผิดพลาด') }
        finally { setLoading(false) }
    }, [search, typeFilter, page])

    useEffect(() => { fetchData() }, [fetchData])

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchData() }

    const s = data?.summary
    const p = data?.pagination

    return (
        <MainLayout title={<><i className="ti ti-users me-2"></i>รายชื่อลูกค้าทั้งหมด</>} pretitle="รายงานลูกค้า">
            <div className="row align-items-center mb-3">
                <div className="col-auto ms-auto btn-list">
                    <form onSubmit={handleSearch} className="d-flex gap-2">
                        <input
                            type="text" className="form-control" placeholder="ค้นหาชื่อ / เบอร์ / รหัส..."
                            value={search} onChange={e => setSearch(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary"><i className="ti ti-search me-1"></i>ค้นหา</button>
                    </form>
                    <button className="btn btn-outline-success"><i className="ti ti-file-export me-1"></i>Export</button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row row-deck row-cards mb-3">
                {[
                    { label: 'ลูกค้าทั้งหมด', value: s?.totalCustomers || 0, cls: '', avatarCls: 'bg-blue', icon: 'ti-users' },
                    { label: 'VIP', value: s?.vipCount || 0, cls: 'bg-warning-lt', avatarCls: 'bg-warning', icon: 'ti-crown' },
                    { label: 'ลูกค้าใหม่เดือนนี้', value: s?.newThisMonth || 0, cls: '', avatarCls: 'bg-green', icon: 'ti-user-plus' },
                    { label: 'รถทั้งหมด', value: s?.totalCars || 0, cls: '', avatarCls: 'bg-cyan', icon: 'ti-car' },
                ].map((card, i) => (
                    <div key={i} className="col-sm-6 col-lg-3">
                        <div className={`card ${card.cls}`}>
                            <div className="card-body">
                                <span className={`avatar ${card.avatarCls} me-3 float-start`}><i className={`ti ${card.icon}`}></i></span>
                                <div className="text-muted">{card.label}</div>
                                <div className="h2 mb-0">{card.value.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Customer Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">รายชื่อลูกค้า</h3>
                    <div className="card-actions">
                        <select className="form-select form-select-sm" style={{ width: 130 }}
                            value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
                            <option value="">ทุกประเภท</option>
                            <option value="VIP">VIP</option>
                            <option value="ทั่วไป">ทั่วไป</option>
                        </select>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th>#</th><th>ลูกค้า</th><th>โทรศัพท์</th><th>Email</th>
                                <th>ประเภท</th><th className="text-center">รถ</th>
                                <th className="text-center">ครั้งที่มา</th><th className="text-end">ยอดใช้บริการ</th><th>ใช้ล่าสุด</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="text-center py-4"><div className="spinner-border text-primary"></div></td></tr>
                            ) : (data?.customers || []).length === 0 ? (
                                <tr><td colSpan={9} className="text-center text-muted py-4">
                                    <i className="ti ti-users fs-1 d-block mb-2"></i>ไม่พบข้อมูลลูกค้า
                                </td></tr>
                            ) : (data?.customers || []).map((c, i) => {
                                const absIdx = ((p?.page || 1) - 1) * (p?.limit || 20) + i + 1
                                return (
                                    <tr key={c.id}>
                                        <td>{absIdx}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <span className={`avatar avatar-sm ${AVATAR_COLORS[i % AVATAR_COLORS.length]} me-2`}>
                                                    {c.fullName.charAt(4) || c.fullName.charAt(0)}
                                                </span>
                                                <div>
                                                    <div className="fw-bold">{c.fullName}</div>
                                                    <small className="text-muted">{c.code}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{c.phone}</td>
                                        <td className="text-muted">{c.email || '-'}</td>
                                        <td>
                                            <span className={`badge ${c.customerTypeName.toLowerCase().includes('vip') ? 'bg-warning' : 'bg-secondary'}`}>
                                                {c.customerTypeName}
                                            </span>
                                        </td>
                                        <td className="text-center">{c.carCount}</td>
                                        <td className="text-center">{c.jobCount}</td>
                                        <td className="text-end fw-bold">฿{fmt(c.totalSpend)}</td>
                                        <td>{fmtDate(c.lastJobDate)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {p && p.totalPages > 1 && (
                    <div className="card-footer d-flex align-items-center">
                        <p className="m-0 text-muted">แสดง {((p.page - 1) * p.limit) + 1}–{Math.min(p.page * p.limit, p.total)} จาก {p.total.toLocaleString()} รายการ</p>
                        <ul className="pagination m-0 ms-auto">
                            <li className={`page-item ${p.page <= 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(p.page - 1)}><i className="ti ti-chevron-left"></i></button>
                            </li>
                            {Array.from({ length: Math.min(p.totalPages, 5) }, (_, idx) => idx + 1).map(pg => (
                                <li key={pg} className={`page-item ${pg === p.page ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => setPage(pg)}>{pg}</button>
                                </li>
                            ))}
                            <li className={`page-item ${p.page >= p.totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(p.page + 1)}><i className="ti ti-chevron-right"></i></button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </MainLayout>
    )
}
