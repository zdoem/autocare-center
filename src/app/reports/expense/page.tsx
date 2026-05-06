'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'

interface Purchase { id: string; purchaseNo: string; purchaseDate: string; grandTotal: number; vendor: { name: string } }
interface Employee { id: string; name: string; salary: number; position: { name: string } }

const formatMoney = (v: number) => v.toLocaleString('th-TH', { minimumFractionDigits: 2 })
const pct = (part: number, total: number) => total > 0 ? Math.round((part / total) * 100) : 0

export default function ReportExpensePage() {
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [filterMonth, setFilterMonth] = useState(() => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    })

    useEffect(() => { fetchData() }, [filterMonth])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [poRes, empRes] = await Promise.all([
                fetch('/api/inventory/purchase'),
                fetch('/api/master/employee?isActive=true')
            ])
            const poJson = await poRes.json()
            const empJson = await empRes.json()

            if (poJson.success) {
                const [year, month] = filterMonth.split('-').map(Number)
                const filtered = (poJson.data as Purchase[]).filter(p => {
                    const d = new Date(p.purchaseDate)
                    return d.getFullYear() === year && d.getMonth() + 1 === month && p
                })
                setPurchases(filtered)
            }
            if (empJson.success) setEmployees(empJson.data || [])
        } catch { showError('โหลดข้อมูลไม่สำเร็จ') }
        finally { setLoading(false) }
    }

    const sparesCost = purchases.reduce((s, p) => s + p.grandTotal, 0)
    const salaryCost = employees.reduce((s, e) => s + Number(e.salary), 0)
    // Simulate utility & other costs (in real system these come from a SystemSetting or manual entry table)
    const utilityCost = 25200
    const otherCost = 25000
    const totalExpense = sparesCost + salaryCost + utilityCost + otherCost

    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(); d.setMonth(d.getMonth() - i)
        const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
        return { val, label }
    })

    return (
        <MainLayout title={<><i className="ti ti-receipt-off me-2"></i>รายงานค่าใช้จ่ายรายเดือน</>} pretitle="รายงาน">
            <div className="row align-items-center mb-3">
                <div className="col-auto ms-auto btn-list">
                    <select className="form-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                        {monthOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                    </select>
                    <button className="btn btn-primary" onClick={() => window.print()}>
                        <i className="ti ti-printer me-1"></i>พิมพ์
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="row row-deck row-cards mb-3">
                <div className="col-lg-3">
                    <div className="card bg-danger-lt">
                        <div className="card-body">
                            <div className="text-muted">ค่าใช้จ่ายรวม</div>
                            <div className="display-6 fw-bold text-danger">฿{formatMoney(totalExpense)}</div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-9">
                    <div className="card">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3 text-center border-end">
                                    <div className="text-muted">ค่าอะไหล่</div>
                                    <div className="h2 mb-0">฿{formatMoney(sparesCost)}</div>
                                    <small className="text-muted">{pct(sparesCost, totalExpense)}%</small>
                                </div>
                                <div className="col-md-3 text-center border-end">
                                    <div className="text-muted">เงินเดือน</div>
                                    <div className="h2 mb-0">฿{formatMoney(salaryCost)}</div>
                                    <small className="text-muted">{pct(salaryCost, totalExpense)}%</small>
                                </div>
                                <div className="col-md-3 text-center border-end">
                                    <div className="text-muted">ค่าน้ำ/ไฟ</div>
                                    <div className="h2 mb-0">฿{formatMoney(utilityCost)}</div>
                                    <small className="text-muted">{pct(utilityCost, totalExpense)}%</small>
                                </div>
                                <div className="col-md-3 text-center">
                                    <div className="text-muted">อื่นๆ</div>
                                    <div className="h2 mb-0">฿{formatMoney(otherCost)}</div>
                                    <small className="text-muted">{pct(otherCost, totalExpense)}%</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Spares Cost */}
                <div className="col-lg-6">
                    <div className="card mb-3">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-package me-2"></i>ค่าสั่งซื้ออะไหล่</h3>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-vcenter card-table">
                                <thead>
                                    <tr>
                                        <th>PO No.</th>
                                        <th>Vendor</th>
                                        <th>วันที่</th>
                                        <th className="text-end">ยอด</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={4} className="text-center py-3"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                                    ) : purchases.length === 0 ? (
                                        <tr><td colSpan={4} className="text-center text-muted py-3">ไม่มีข้อมูล</td></tr>
                                    ) : purchases.map(p => (
                                        <tr key={p.id}>
                                            <td><span className="text-primary fw-bold">{p.purchaseNo}</span></td>
                                            <td>{p.vendor.name}</td>
                                            <td>{new Date(p.purchaseDate).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' })}</td>
                                            <td className="text-end">฿{formatMoney(p.grandTotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-light">
                                    <tr>
                                        <th colSpan={3}>รวม</th>
                                        <th className="text-end text-danger">฿{formatMoney(sparesCost)}</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Salary */}
                <div className="col-lg-6">
                    <div className="card mb-3">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-users me-2"></i>เงินเดือนพนักงาน</h3>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-vcenter card-table">
                                <thead>
                                    <tr>
                                        <th>พนักงาน</th>
                                        <th>ตำแหน่ง</th>
                                        <th className="text-end">เงินเดือน</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={3} className="text-center py-3"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                                    ) : employees.length === 0 ? (
                                        <tr><td colSpan={3} className="text-center text-muted py-3">ไม่มีข้อมูล</td></tr>
                                    ) : employees.map(e => (
                                        <tr key={e.id}>
                                            <td>{e.name}</td>
                                            <td>{e.position?.name || '-'}</td>
                                            <td className="text-end">฿{formatMoney(Number(e.salary))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-light">
                                    <tr>
                                        <th colSpan={2}>รวม</th>
                                        <th className="text-end text-danger">฿{formatMoney(salaryCost)}</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Other Expenses (Static placeholder) */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title"><i className="ti ti-building me-2"></i>ค่าใช้จ่ายอื่นๆ (สาธารณูปโภค)</h3>
                    <div className="card-actions text-muted small">* ข้อมูลตัวอย่าง — เชื่อมต่อกับตาราง SystemExpense ในอนาคต</div>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th>รายการ</th>
                                <th>หมวด</th>
                                <th className="text-end">ยอด</th>
                                <th>หมายเหตุ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'ค่าไฟฟ้า', cat: 'สาธารณูปโภค', amount: 18500, note: 'บิลเดือนก่อน' },
                                { name: 'ค่าน้ำประปา', cat: 'สาธารณูปโภค', amount: 3200, note: 'บิลเดือนก่อน' },
                                { name: 'ค่าอินเทอร์เน็ต', cat: 'สาธารณูปโภค', amount: 1500, note: 'รายเดือน' },
                                { name: 'ค่าโทรศัพท์', cat: 'สาธารณูปโภค', amount: 2000, note: '' },
                                { name: 'อุปกรณ์สำนักงาน', cat: 'อื่นๆ', amount: 5000, note: 'กระดาษ, หมึก' },
                                { name: 'ซ่อมบำรุง/อื่นๆ', cat: 'อื่นๆ', amount: 15000, note: '' },
                            ].map((item, i) => (
                                <tr key={i}>
                                    <td>{item.name}</td>
                                    <td><span className={`badge ${item.cat === 'สาธารณูปโภค' ? 'bg-yellow-lt' : 'bg-cyan-lt'}`}>{item.cat}</span></td>
                                    <td className="text-end">฿{formatMoney(item.amount)}</td>
                                    <td className="text-muted small">{item.note}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-light">
                            <tr>
                                <th colSpan={2}>รวม</th>
                                <th className="text-end text-danger">฿{formatMoney(utilityCost + otherCost)}</th>
                                <th></th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </MainLayout>
    )
}
