'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'

const formatMoney = (amount: number) => {
    return amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

interface RepeatCustomer {
    rank: number
    name: string
    phone: string
    totalVisits: number
    monthlyVisits: number
    firstVisit: string
    lastVisit: string
    totalSpent: number
}

const mockData: RepeatCustomer[] = [
    { rank: 1, name: 'คุณสมศักดิ์ พานทอง', phone: '081-234-5678', totalVisits: 28, monthlyVisits: 3, firstVisit: '15/03/65', lastVisit: '18/01/67', totalSpent: 285600 },
    { rank: 2, name: 'คุณวิภา สุขใจ', phone: '089-999-8888', totalVisits: 24, monthlyVisits: 2, firstVisit: '20/05/65', lastVisit: '17/01/67', totalSpent: 215200 },
    { rank: 3, name: 'คุณชัยวัฒน์ มั่งมี', phone: '086-777-8888', totalVisits: 22, monthlyVisits: 1, firstVisit: '01/01/65', lastVisit: '15/01/67', totalSpent: 198500 },
    { rank: 4, name: 'คุณประยุทธ์ ใจดี', phone: '086-555-4444', totalVisits: 18, monthlyVisits: 2, firstVisit: '10/06/65', lastVisit: '16/01/67', totalSpent: 145000 },
    { rank: 5, name: 'คุณอรุณ แสงทอง', phone: '084-333-4444', totalVisits: 15, monthlyVisits: 1, firstVisit: '15/08/65', lastVisit: '12/01/67', totalSpent: 125800 },
]

export default function RepeatCustomerReportPage() {
    const [month, setMonth] = useState('2024-01')

    return (
        <MainLayout
            title={<><i className="ti ti-repeat me-2"></i>รายงานลูกค้ากลับมาใช้บริการ (Repeat Customers)</>}
            pretitle="รายงานลูกค้า"
        >
            <div className="row align-items-center mb-3">
                <div className="col-auto ms-auto btn-list">
                    <input
                        type="month"
                        className="form-control"
                        value={month}
                        onChange={e => setMonth(e.target.value)}
                    />
                    <button className="btn btn-outline-secondary" onClick={() => window.print()}>
                        <i className="ti ti-printer me-1"></i>พิมพ์
                    </button>
                </div>
            </div>

            {/* Retention Stats */}
            <div className="row row-deck row-cards mb-3">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h3 className="card-title">Retention Rate (อัตราลูกค้าซื้อซ้ำ)</h3>
                            <div className="display-5 fw-bold text-center text-success mb-3">72%</div>
                            <div className="progress progress-lg">
                                <div className="progress-bar bg-success" style={{ width: '72%' }}></div>
                            </div>
                            <div className="text-muted text-center mt-2">
                                ลูกค้า 617 คน จาก 856 คน กลับมาใช้บริการมากกว่า 1 ครั้ง
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h3 className="card-title">สถิติความถี่การกลับมา</h3>
                            <div className="row text-center my-2">
                                <div className="col border-end">
                                    <div className="h1 mb-0 text-blue">239</div>
                                    <small className="text-muted">ลูกค้าใหม่ (1 ครั้ง)</small>
                                </div>
                                <div className="col border-end">
                                    <div className="h1 mb-0 text-green">425</div>
                                    <small className="text-muted">2-5 ครั้ง</small>
                                </div>
                                <div className="col border-end">
                                    <div className="h1 mb-0 text-orange">147</div>
                                    <small className="text-muted">6-10 ครั้ง</small>
                                </div>
                                <div className="col">
                                    <div className="h1 mb-0 text-danger">45</div>
                                    <small className="text-muted">&gt;10 ครั้ง</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Repeat Customers Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">ลูกค้าที่กลับมาบ่อย (เรียงตามจำนวนครั้ง)</h3>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>ลูกค้า</th>
                                <th>โทรศัพท์</th>
                                <th className="text-center">ครั้งทั้งหมด</th>
                                <th className="text-center">เดือนนี้</th>
                                <th>มาครั้งแรก</th>
                                <th>มาล่าสุด</th>
                                <th className="text-end">ยอดสะสม</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockData.map(c => (
                                <tr key={c.rank}>
                                    <td>
                                        <span className={`badge ${c.rank === 1 ? 'bg-warning text-dark' : c.rank === 2 ? 'bg-secondary' : c.rank === 3 ? 'bg-orange' : 'bg-light text-dark'} fs-5`}>
                                            {c.rank}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <span className="avatar avatar-sm bg-blue-lt me-2">{c.name.charAt(3)}</span>
                                            <div className="fw-bold">{c.name}</div>
                                        </div>
                                    </td>
                                    <td>{c.phone}</td>
                                    <td className="text-center">
                                        <span className="badge bg-primary fs-5">{c.totalVisits}</span>
                                    </td>
                                    <td className="text-center">{c.monthlyVisits}</td>
                                    <td>{c.firstVisit}</td>
                                    <td>{c.lastVisit}</td>
                                    <td className="text-end fw-bold text-success">฿{formatMoney(c.totalSpent)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </MainLayout>
    )
}
