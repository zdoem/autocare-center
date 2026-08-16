import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import MainLayout from '@/components/layout/MainLayout'

export default async function TechnicianDashboardPage() {
    const session = await auth()

    if (!session) {
        redirect('/login')
    }

    const userName = session.user?.name?.split(' ')[0] || 'User'

    // Fetch real jobs from database
    let dbJobs: any[] = []
    try {
        dbJobs = await prisma.serviceJob.findMany({
            include: {
                car: {
                    include: {
                        carBrand: true,
                        carModel: true,
                    },
                },
                customer: true,
                technician: true,
            },
            orderBy: { jobDate: 'desc' },
            take: 10,
        })
    } catch (err) {
        console.error('Error fetching technician jobs:', err)
    }

    const totalJobsToday = dbJobs.length
    const completedJobsToday = dbJobs.filter(j => j.status === 'COMPLETED' || j.status === 'DELIVERED').length
    const inProgressJobsToday = dbJobs.filter(j => ['IN_PROGRESS', 'INSPECTION', 'WAITING_PARTS', 'QC_CHECK'].includes(j.status)).length

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'RECEIVED':
            case 'APPROVED':
                return <span className="badge bg-yellow text-dark fw-bold"><i className="ti ti-clock me-1"></i>รอรับรถ/คิว</span>
            case 'IN_PROGRESS':
                return <span className="badge bg-azure text-white fw-medium"><i className="ti ti-loader me-1"></i>กำลังทำ</span>
            case 'INSPECTION':
                return <span className="badge bg-info text-white fw-medium"><i className="ti ti-search me-1"></i>ตรวจเช็ค</span>
            case 'WAITING_PARTS':
                return <span className="badge bg-orange text-white fw-medium"><i className="ti ti-package me-1"></i>รออะไหล่</span>
            case 'QC_CHECK':
                return <span className="badge bg-purple text-white fw-medium"><i className="ti ti-check me-1"></i>QC ตรวจสอบ</span>
            case 'WAITING_PAYMENT':
                return <span className="badge bg-warning text-dark fw-bold"><i className="ti ti-cash me-1"></i>รอชำระเงิน</span>
            case 'COMPLETED':
            case 'DELIVERED':
                return <span className="badge bg-green text-white fw-medium"><i className="ti ti-circle-check me-1"></i>เสร็จแล้ว</span>
            case 'CANCELLED':
                return <span className="badge bg-secondary text-white fw-medium"><i className="ti ti-x me-1"></i>ยกเลิก</span>
            default:
                return <span className="badge bg-secondary text-white fw-medium">{status || 'รอดำเนินการ'}</span>
        }
    }

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
                                    <div className="h1 mb-0">{totalJobsToday || 0}</div>
                                    <div className="text-white-50">งานทั้งหมดในระบบ</div>
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
                                    <div className="h1 mb-0">{completedJobsToday || 0}</div>
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
                                        <i className="ti ti-tool text-white"></i>
                                    </span>
                                </div>
                                <div>
                                    <div className="h1 mb-0">{inProgressJobsToday || 0}</div>
                                    <div className="text-white-50">กำลังดำเนินการซ่อม</div>
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
                                    <Link href="/service/jobs" className="btn btn-outline-primary w-100">
                                        <i className="ti ti-player-play me-2"></i>รายการงานซ่อม
                                    </Link>
                                </div>
                                <div className="col-6 col-md-3">
                                    <Link href="/inventory/movement" className="btn btn-outline-warning w-100">
                                        <i className="ti ti-package me-2"></i>เบิกอะไหล่
                                    </Link>
                                </div>
                                <div className="col-6 col-md-3">
                                    <Link href="/ops/search" className="btn btn-outline-info w-100">
                                        <i className="ti ti-search me-2"></i>ค้นหารถ / ประวัติ
                                    </Link>
                                </div>
                                <div className="col-6 col-md-3">
                                    <Link href="/ops/receive" className="btn btn-success w-100">
                                        <i className="ti ti-plus me-2"></i>รับรถเข้าซ่อม
                                    </Link>
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
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h3 className="card-title mb-0"><i className="ti ti-clipboard-list me-2"></i>งานที่ได้รับมอบหมาย</h3>
                            <Link href="/service/jobs" className="btn btn-sm btn-outline-primary">
                                ดูงานทั้งหมด ({totalJobsToday})
                            </Link>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-vcenter card-table table-hover">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>ทะเบียน</th>
                                        <th>ยี่ห้อ/รุ่น</th>
                                        <th>ลูกค้า</th>
                                        <th>อาการ / งานซ่อม</th>
                                        <th>สถานะ</th>
                                        <th>ผู้รับผิดชอบ</th>
                                        <th className="w-1 text-end">การจัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dbJobs.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-5 text-muted">
                                                ยังไม่มีรายการงานซ่อมในระบบ
                                                <div className="mt-2">
                                                    <Link href="/ops/receive" className="btn btn-sm btn-primary">
                                                        <i className="ti ti-plus me-1"></i>เปิดรับรถเข้าซ่อมใหม่
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        dbJobs.map((job, idx) => (
                                            <tr key={job.id} className={job.status === 'COMPLETED' ? 'bg-success-lt' : ''}>
                                                <td>{idx + 1}</td>
                                                <td>
                                                    <span className="badge bg-blue-lt fw-bold">
                                                        {job.car?.licensePlate || '-'}
                                                    </span>
                                                    {job.car?.province && <small className="text-muted d-block">{job.car.province}</small>}
                                                </td>
                                                <td>
                                                    {job.car?.carBrand?.nameThai || job.car?.carBrand?.nameEnglish || '-'} {job.car?.carModel?.name || ''}
                                                </td>
                                                <td>{job.customer?.fullName || '-'}</td>
                                                <td>{job.customerRequest || job.description || 'ตรวจเช็คตามระยะ'}</td>
                                                <td>{getStatusBadge(job.status)}</td>
                                                <td>{job.technician?.firstName || job.technician?.name || '-'}</td>
                                                <td className="text-end">
                                                    <div className="btn-list flex-nowrap justify-content-end">
                                                        <Link
                                                            href={`/ops/job/${job.id}`}
                                                            className="btn btn-sm btn-primary"
                                                            title="เปิดหน้ารายละเอียดงานซ่อม"
                                                        >
                                                            <i className="ti ti-file-text me-1"></i>รายละเอียด
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
