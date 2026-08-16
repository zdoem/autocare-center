/**
 * ไฟล์: app/dashboard/technician/page.tsx
 * จุดประสงค์: Technician Dashboard - ภาพรวมสำหรับช่างซ่อม
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'

export default async function TechnicianDashboardPage() {
    const session = await auth()

    if (!session) {
        redirect('/login')
    }

    const userName = session.user?.name?.split(' ')[0] || 'User'

    return (
        <MainLayout title={<><i className="ti ti-wrench me-2"></i>Technician Dashboard</>} pretitle={`สวัสดี ${userName}`}>
            {/* Summary Cards */}
            <div className="row row-deck row-cards">
                <div className="col-sm-6 col-lg-4">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <span className="avatar avatar-lg bg-white-lt">
                                        <i className="ti ti-clipboard-list text-white"></i>
                                    </span>
                                </div>
                                <div>
                                    <div className="h1 mb-0">5</div>
                                    <div className="text-white-50">งานวันนี้</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-lg-4">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <span className="avatar avatar-lg bg-white-lt">
                                        <i className="ti ti-check text-white"></i>
                                    </span>
                                </div>
                                <div>
                                    <div className="h1 mb-0">2</div>
                                    <div className="text-white-50">เสร็จแล้ว</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-lg-4">
                    <div className="card bg-azure text-white">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <span className="avatar avatar-lg bg-white-lt">
                                        <i className="ti ti-clock text-white"></i>
                                    </span>
                                </div>
                                <div>
                                    <div className="h1 mb-0">4.5 <small>ชม.</small></div>
                                    <div className="text-white-50">ชั่วโมงงานวันนี้</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="row mt-3">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-bolt me-2"></i>Quick Actions</h3>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-6 col-md-3">
                                    <a href="#" className="btn btn-outline-primary w-100">
                                        <i className="ti ti-player-play me-2"></i>เริ่มงาน
                                    </a>
                                </div>
                                <div className="col-6 col-md-3">
                                    <a href="#" className="btn btn-outline-warning w-100">
                                        <i className="ti ti-package me-2"></i>เบิกอะไหล่
                                    </a>
                                </div>
                                <div className="col-6 col-md-3">
                                    <a href="#" className="btn btn-outline-danger w-100">
                                        <i className="ti ti-alert-circle me-2"></i>บันทึกปัญหา
                                    </a>
                                </div>
                                <div className="col-6 col-md-3">
                                    <a href="#" className="btn btn-success w-100">
                                        <i className="ti ti-check me-2"></i>งานเสร็จ
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Job List */}
            <div className="row mt-3">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-clipboard-list me-2"></i>งานที่ได้รับมอบหมาย</h3>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-vcenter card-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>ทะเบียน</th>
                                        <th>ยี่ห้อ/รุ่น</th>
                                        <th>ลูกค้า</th>
                                        <th>งาน</th>
                                        <th>สถานะ</th>
                                        <th>เวลาโดยประมาณ</th>
                                        <th className="w-1"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td><span className="badge bg-blue-lt">กข-1234</span></td>
                                        <td>Toyota Camry</td>
                                        <td>คุณสมศักดิ์ พานทอง</td>
                                        <td>เปลี่ยนถ่ายน้ำมันเครื่อง</td>
                                        <td>
                                            <span className="badge bg-yellow">
                                                <i className="ti ti-loader me-1"></i>กำลังทำ
                                            </span>
                                        </td>
                                        <td>2 ชม.</td>
                                        <td>
                                            <div className="btn-list flex-nowrap">
                                                <a href="#" className="btn btn-sm btn-success">เสร็จ</a>
                                                <a href="#" className="btn btn-sm btn-outline-secondary">รายละเอียด</a>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td><span className="badge bg-blue-lt">ขข-5678</span></td>
                                        <td>Honda Civic</td>
                                        <td>คุณวิภา สุขใจ</td>
                                        <td>เช็คระยะ 10,000 กม.</td>
                                        <td>
                                            <span className="badge bg-red">
                                                <i className="ti ti-clock me-1"></i>รอ
                                            </span>
                                        </td>
                                        <td>3 ชม.</td>
                                        <td>
                                            <div className="btn-list flex-nowrap">
                                                <a href="#" className="btn btn-sm btn-primary">เริ่มงาน</a>
                                                <a href="#" className="btn btn-sm btn-outline-secondary">รายละเอียด</a>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>3</td>
                                        <td><span className="badge bg-blue-lt">คค-9999</span></td>
                                        <td>Mazda 3</td>
                                        <td>คุณประยุทธ์ ดีมาก</td>
                                        <td>เปลี่ยนผ้าเบรกหน้า-หลัง</td>
                                        <td>
                                            <span className="badge bg-red">
                                                <i className="ti ti-clock me-1"></i>รอ
                                            </span>
                                        </td>
                                        <td>1.5 ชม.</td>
                                        <td>
                                            <div className="btn-list flex-nowrap">
                                                <a href="#" className="btn btn-sm btn-primary">เริ่มงาน</a>
                                                <a href="#" className="btn btn-sm btn-outline-secondary">รายละเอียด</a>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="bg-success-lt">
                                        <td>4</td>
                                        <td><span className="badge bg-blue-lt">งง-1111</span></td>
                                        <td>Nissan Almera</td>
                                        <td>คุณมานะ ตั้งใจ</td>
                                        <td>เปลี่ยนกรองอากาศ</td>
                                        <td>
                                            <span className="badge bg-green">
                                                <i className="ti ti-check me-1"></i>เสร็จแล้ว
                                            </span>
                                        </td>
                                        <td>0.5 ชม.</td>
                                        <td>
                                            <div className="btn-list flex-nowrap">
                                                <a href="#" className="btn btn-sm btn-outline-secondary">รายละเอียด</a>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="bg-success-lt">
                                        <td>5</td>
                                        <td><span className="badge bg-blue-lt">จจ-2222</span></td>
                                        <td>Ford Ranger</td>
                                        <td>คุณสมหมาย รักษ์ดี</td>
                                        <td>ตรวจเช็คช่วงล่าง</td>
                                        <td>
                                            <span className="badge bg-green">
                                                <i className="ti ti-check me-1"></i>เสร็จแล้ว
                                            </span>
                                        </td>
                                        <td>1 ชม.</td>
                                        <td>
                                            <div className="btn-list flex-nowrap">
                                                <a href="#" className="btn btn-sm btn-outline-secondary">รายละเอียด</a>
                                            </div>
                                        </td>
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
