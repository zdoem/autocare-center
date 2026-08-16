/**
 * ไฟล์: app/dashboard/cashier/page.tsx
 * จุดประสงค์: Cashier Dashboard - ภาพรวมสำหรับแคชเชียร์
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'

export default async function CashierDashboardPage() {
    const session = await auth()

    if (!session) {
        redirect('/login')
    }

    const userName = session.user?.name?.split(' ')[0] || 'User'

    return (
        <MainLayout title={<><i className="ti ti-cash me-2"></i>Cashier Dashboard</>} pretitle={`สวัสดี ${userName}`}>
            {/* Summary Cards */}
            <div className="row row-deck row-cards">
                <div className="col-sm-6 col-lg-4">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <span className="avatar avatar-lg bg-white-lt">
                                        <i className="ti ti-currency-baht text-white"></i>
                                    </span>
                                </div>
                                <div>
                                    <div className="h1 mb-0">฿45,600</div>
                                    <div className="text-white-50">ยอดวันนี้</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-lg-4">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <span className="avatar avatar-lg bg-white-lt">
                                        <i className="ti ti-receipt text-white"></i>
                                    </span>
                                </div>
                                <div>
                                    <div className="h1 mb-0">8</div>
                                    <div className="text-white-50">ใบเสร็จวันนี้</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-lg-4">
                    <div className="card bg-warning text-white">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <span className="avatar avatar-lg bg-white-lt">
                                        <i className="ti ti-clock text-white"></i>
                                    </span>
                                </div>
                                <div>
                                    <div className="h1 mb-0">3</div>
                                    <div className="text-white-50">รอชำระเงิน</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Payments */}
            <div className="row mt-3">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-clock me-2"></i>รายการรอชำระเงิน</h3>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-vcenter card-table table-hover">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>ทะเบียน</th>
                                        <th>ลูกค้า</th>
                                        <th>โทร</th>
                                        <th>รายการ</th>
                                        <th className="text-end">ยอดรวม</th>
                                        <th className="w-1"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td><span className="badge bg-blue-lt">กข-1234</span></td>
                                        <td>คุณสมศักดิ์ พานทอง</td>
                                        <td>081-234-5678</td>
                                        <td>เปลี่ยนน้ำมัน + กรอง</td>
                                        <td className="text-end fw-bold">฿3,500</td>
                                        <td>
                                            <Link href="/cash/payment" className="btn btn-success">
                                                <i className="ti ti-cash me-1"></i>ชำระเงิน
                                            </Link>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td><span className="badge bg-blue-lt">ขข-5678</span></td>
                                        <td>คุณวิภา สุขใจ</td>
                                        <td>089-999-8888</td>
                                        <td>เช็คระยะ 10,000</td>
                                        <td className="text-end fw-bold">฿12,800</td>
                                        <td>
                                            <Link href="/cash/payment" className="btn btn-success">
                                                <i className="ti ti-cash me-1"></i>ชำระเงิน
                                            </Link>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>3</td>
                                        <td><span className="badge bg-blue-lt">คค-9999</span></td>
                                        <td>คุณประยุทธ์ ดีมาก</td>
                                        <td>062-111-2222</td>
                                        <td>เปลี่ยนผ้าเบรก 4 ล้อ</td>
                                        <td className="text-end fw-bold">฿8,500</td>
                                        <td>
                                            <Link href="/cash/payment" className="btn btn-success">
                                                <i className="ti ti-cash me-1"></i>ชำระเงิน
                                            </Link>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Summary & Recent Receipts */}
            <div className="row mt-3">
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-chart-pie me-2"></i>สรุปการชำระเงินวันนี้</h3>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center mb-3">
                                        <span className="avatar bg-success-lt me-3">
                                            <i className="ti ti-cash"></i>
                                        </span>
                                        <div>
                                            <div className="text-muted">เงินสด</div>
                                            <div className="h3 mb-0">฿25,000</div>
                                        </div>
                                        <div className="ms-auto">
                                            <span className="badge bg-success-lt">55%</span>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center mb-3">
                                        <span className="avatar bg-primary-lt me-3">
                                            <i className="ti ti-qrcode"></i>
                                        </span>
                                        <div>
                                            <div className="text-muted">โอน/QR</div>
                                            <div className="h3 mb-0">฿15,600</div>
                                        </div>
                                        <div className="ms-auto">
                                            <span className="badge bg-primary-lt">34%</span>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="avatar bg-purple-lt me-3">
                                            <i className="ti ti-credit-card"></i>
                                        </span>
                                        <div>
                                            <div className="text-muted">บัตรเครดิต</div>
                                            <div className="h3 mb-0">฿5,000</div>
                                        </div>
                                        <div className="ms-auto">
                                            <span className="badge bg-purple-lt">11%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 d-flex align-items-center justify-content-center">
                                    <div className="text-center">
                                        <div className="display-6 fw-bold text-success">฿45,600</div>
                                        <div className="text-muted">ยอดรวมวันนี้</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-receipt me-2"></i>ใบเสร็จล่าสุด</h3>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-vcenter card-table">
                                <thead>
                                    <tr>
                                        <th>เลขที่</th>
                                        <th>ลูกค้า</th>
                                        <th className="text-end">ยอด</th>
                                        <th>เวลา</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><a href="#">INV-2024-0156</a></td>
                                        <td>คุณมานะ</td>
                                        <td className="text-end">฿4,200</td>
                                        <td>12:45</td>
                                    </tr>
                                    <tr>
                                        <td><a href="#">INV-2024-0155</a></td>
                                        <td>คุณสมหมาย</td>
                                        <td className="text-end">฿8,900</td>
                                        <td>11:30</td>
                                    </tr>
                                    <tr>
                                        <td><a href="#">INV-2024-0154</a></td>
                                        <td>คุณนภา</td>
                                        <td className="text-end">฿2,500</td>
                                        <td>10:15</td>
                                    </tr>
                                    <tr>
                                        <td><a href="#">INV-2024-0153</a></td>
                                        <td>คุณวิชัย</td>
                                        <td className="text-end">฿15,000</td>
                                        <td>09:00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
