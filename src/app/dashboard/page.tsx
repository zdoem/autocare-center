/**
 * ไฟล์: app/dashboard/page.tsx
 * จุดประสงค์: Admin Dashboard - ภาพรวมระบบสำหรับผู้ดูแล
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'

export default async function AdminDashboardPage() {
    const session = await auth()

    if (!session) {
        redirect('/login')
    }

    return (
        <MainLayout title={<><i className="ti ti-chart-pie me-2"></i>Admin Dashboard</>} pretitle="ภาพรวม">
            {/* Summary Cards */}
            <div className="row row-deck row-cards">
                <div className="col-sm-6 col-lg-3">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="subheader">รายได้วันนี้</div>
                                <div className="ms-auto lh-1">
                                    <span className="text-green d-inline-flex align-items-center lh-1">
                                        12% <i className="ti ti-trending-up ms-1"></i>
                                    </span>
                                </div>
                            </div>
                            <div className="h1 mb-3">฿45,600</div>
                            <div className="d-flex mb-2">
                                <div>เทียบกับเมื่อวาน</div>
                            </div>
                            <div className="progress progress-sm">
                                <div className="progress-bar bg-primary" style={{ width: '75%' }} role="progressbar"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="subheader">งานซ่อมวันนี้</div>
                            </div>
                            <div className="h1 mb-3">12 <small className="text-muted">งาน</small></div>
                            <div className="d-flex mb-2">
                                <div>เสร็จแล้ว 8 งาน</div>
                            </div>
                            <div className="progress progress-sm">
                                <div className="progress-bar bg-success" style={{ width: '67%' }} role="progressbar"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="subheader">รอรับรถ</div>
                            </div>
                            <div className="h1 mb-3">5 <small className="text-muted">คัน</small></div>
                            <div className="d-flex mb-2">
                                <div>รอลูกค้ามารับ</div>
                            </div>
                            <div className="progress progress-sm">
                                <div className="progress-bar bg-warning" style={{ width: '42%' }} role="progressbar"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="subheader">Stock Alert</div>
                            </div>
                            <div className="h1 mb-3 text-danger">8 <small className="text-muted">รายการ</small></div>
                            <div className="d-flex mb-2">
                                <div>อะไหล่ใกล้หมด</div>
                            </div>
                            <div className="progress progress-sm">
                                <div className="progress-bar bg-danger" style={{ width: '100%' }} role="progressbar"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="row row-deck row-cards mt-3">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-chart-line me-2"></i>รายได้ 7 วันล่าสุด</h3>
                        </div>
                        <div className="card-body">
                            <div id="chart-revenue" style={{ height: '240px' }}>
                                {/* Chart placeholder */}
                                <div className="d-flex align-items-end h-100 gap-2 pb-3 px-3">
                                    <div className="bg-primary rounded" style={{ height: '60%', width: '12%' }}></div>
                                    <div className="bg-primary rounded" style={{ height: '80%', width: '12%' }}></div>
                                    <div className="bg-primary rounded" style={{ height: '45%', width: '12%' }}></div>
                                    <div className="bg-primary rounded" style={{ height: '90%', width: '12%' }}></div>
                                    <div className="bg-primary rounded" style={{ height: '70%', width: '12%' }}></div>
                                    <div className="bg-primary rounded" style={{ height: '55%', width: '12%' }}></div>
                                    <div className="bg-primary-lt rounded" style={{ height: '65%', width: '12%' }}></div>
                                </div>
                                <div className="d-flex justify-content-around text-muted small">
                                    <span>จ</span><span>อ</span><span>พ</span><span>พฤ</span><span>ศ</span><span>ส</span><span>อา</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-chart-pie me-2"></i>สถานะงานซ่อม</h3>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-6">
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="legend me-2 bg-yellow"></span>
                                        <span>รอรับรถ</span>
                                        <span className="ms-auto">15%</span>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="legend me-2 bg-primary"></span>
                                        <span>กำลังซ่อม</span>
                                        <span className="ms-auto">45%</span>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="legend me-2 bg-orange"></span>
                                        <span>รอชำระ</span>
                                        <span className="ms-auto">25%</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="legend me-2 bg-green"></span>
                                        <span>เสร็จแล้ว</span>
                                        <span className="ms-auto">15%</span>
                                    </div>
                                </div>
                                <div className="col-6 d-flex align-items-center justify-content-center">
                                    <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                                        <svg viewBox="0 0 36 36" style={{ width: '120px', height: '120px' }}>
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#eee"
                                                strokeWidth="3"
                                            />
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#206bc4"
                                                strokeWidth="3"
                                                strokeDasharray="75, 100"
                                            />
                                        </svg>
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                            <strong className="h3">75%</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Tables Row */}
            <div className="row row-deck row-cards mt-3">
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-trophy me-2"></i>Top Services เดือนนี้</h3>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-vcenter card-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>บริการ</th>
                                        <th className="text-end">จำนวน</th>
                                        <th className="text-end">รายได้</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><span className="badge bg-warning">1</span></td>
                                        <td>เปลี่ยนถ่ายน้ำมันเครื่อง</td>
                                        <td className="text-end">45</td>
                                        <td className="text-end">฿67,500</td>
                                    </tr>
                                    <tr>
                                        <td><span className="badge bg-secondary">2</span></td>
                                        <td>เช็คระยะ 10,000 กม.</td>
                                        <td className="text-end">32</td>
                                        <td className="text-end">฿128,000</td>
                                    </tr>
                                    <tr>
                                        <td><span className="badge bg-orange">3</span></td>
                                        <td>เปลี่ยนผ้าเบรก</td>
                                        <td className="text-end">18</td>
                                        <td className="text-end">฿54,000</td>
                                    </tr>
                                    <tr>
                                        <td>4</td>
                                        <td>เปลี่ยนยาง</td>
                                        <td className="text-end">15</td>
                                        <td className="text-end">฿180,000</td>
                                    </tr>
                                    <tr>
                                        <td>5</td>
                                        <td>ซ่อมแอร์</td>
                                        <td className="text-end">12</td>
                                        <td className="text-end">฿84,000</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-calendar-event me-2"></i>งานกำหนดส่งมอบวันนี้</h3>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-vcenter card-table">
                                <thead>
                                    <tr>
                                        <th>ทะเบียน</th>
                                        <th>ลูกค้า</th>
                                        <th>งาน</th>
                                        <th className="text-end">เวลา</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><span className="badge bg-blue-lt">กข-1234</span></td>
                                        <td>คุณสมศักดิ์</td>
                                        <td>เปลี่ยนถ่ายน้ำมัน</td>
                                        <td className="text-end">10:00 น.</td>
                                    </tr>
                                    <tr>
                                        <td><span className="badge bg-blue-lt">ขข-5678</span></td>
                                        <td>คุณวิภา</td>
                                        <td>เช็คระยะ 10,000</td>
                                        <td className="text-end">14:00 น.</td>
                                    </tr>
                                    <tr>
                                        <td><span className="badge bg-blue-lt">คค-9999</span></td>
                                        <td>คุณประยุทธ์</td>
                                        <td>เปลี่ยนผ้าเบรก</td>
                                        <td className="text-end">16:30 น.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts Row */}
            <div className="row mt-3">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-bell text-danger me-2"></i>การแจ้งเตือน</h3>
                        </div>
                        <div className="list-group list-group-flush">
                            <div className="list-group-item list-group-item-action">
                                <div className="row align-items-center">
                                    <div className="col-auto">
                                        <span className="status-dot status-dot-animated bg-red d-block"></span>
                                    </div>
                                    <div className="col">
                                        <span className="text-danger fw-bold">Stock Alert:</span> อะไหล่ "กรองน้ำมันเครื่อง" เหลือ 2 ชิ้น (Min: 10)
                                    </div>
                                    <div className="col-auto">
                                        <a href="#" className="btn btn-sm btn-primary">สั่งซื้อ</a>
                                    </div>
                                </div>
                            </div>
                            <div className="list-group-item list-group-item-action">
                                <div className="row align-items-center">
                                    <div className="col-auto">
                                        <span className="status-dot bg-yellow d-block"></span>
                                    </div>
                                    <div className="col">
                                        <span className="text-warning fw-bold">Payment:</span> รถทะเบียน กข-1234 รอชำระเงิน 3 วันแล้ว
                                    </div>
                                    <div className="col-auto">
                                        <a href="#" className="btn btn-sm btn-outline-primary">ดูรายละเอียด</a>
                                    </div>
                                </div>
                            </div>
                            <div className="list-group-item list-group-item-action">
                                <div className="row align-items-center">
                                    <div className="col-auto">
                                        <span className="status-dot bg-blue d-block"></span>
                                    </div>
                                    <div className="col">
                                        <span className="text-primary fw-bold">Workload:</span> ช่างสมชาย มีงานค้าง 5 งาน
                                    </div>
                                    <div className="col-auto">
                                        <a href="#" className="btn btn-sm btn-outline-primary">จัดการงาน</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
