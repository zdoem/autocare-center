import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import MainLayout from '@/components/layout/MainLayout'

export default async function CashierDashboardPage() {
    const session = await auth()

    if (!session) {
        redirect('/login')
    }

    const userName = session.user?.name?.split(' ')[0] || 'User'

    // Fetch live pending jobs and recent payments
    let pendingJobs: any[] = []
    let recentPayments: any[] = []
    try {
        pendingJobs = await prisma.serviceJob.findMany({
            where: { isPaid: false },
            include: {
                car: {
                    include: {
                        carBrand: true,
                        carModel: true,
                    },
                },
                customer: true,
            },
            orderBy: { jobDate: 'desc' },
            take: 10,
        })

        recentPayments = await prisma.payment.findMany({
            include: {
                paymentType: true,
                serviceJob: {
                    include: {
                        car: true,
                        customer: true,
                    },
                },
            },
            orderBy: { paymentDate: 'desc' },
            take: 5,
        })
    } catch (err) {
        console.error('Error fetching cashier dashboard data:', err)
    }

    const totalPendingAmount = pendingJobs.reduce((sum, j) => sum + Number(j.grandTotal || 0), 0)
    const todayReceiptsTotal = recentPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)

    const formatMoney = (amount: number | string) =>
        Number(amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

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
                                    <div className="h1 mb-0">฿{formatMoney(todayReceiptsTotal)}</div>
                                    <div className="text-white-50">ยอดรับชำระแล้ว</div>
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
                                    <div className="h1 mb-0">{recentPayments.length}</div>
                                    <div className="text-white-50">ใบเสร็จในระบบ</div>
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
                                    <div className="h1 mb-0">{pendingJobs.length}</div>
                                    <div className="text-white-50">รอชำระเงิน (฿{formatMoney(totalPendingAmount)})</div>
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
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h3 className="card-title mb-0"><i className="ti ti-clock me-2"></i>รายการรอชำระเงิน</h3>
                            <Link href="/cash/pending" className="btn btn-sm btn-outline-primary">
                                ดูงานรอชำระทั้งหมด ({pendingJobs.length})
                            </Link>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-vcenter card-table table-hover">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>เลขที่งาน</th>
                                        <th>ทะเบียน</th>
                                        <th>ลูกค้า</th>
                                        <th>โทรศัพท์</th>
                                        <th>อาการ / งานซ่อม</th>
                                        <th className="text-end">ยอดรวม</th>
                                        <th className="w-1 text-end">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingJobs.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-5 text-muted">
                                                <i className="ti ti-check-circle text-success" style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}></i>
                                                <h4 className="text-muted mb-1">ไม่มีงานค้างชำระ</h4>
                                                <p className="text-muted mb-0">ยอดเยี่ยม! ทุกงานได้รับการชำระเงินเรียบร้อยแล้ว</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        pendingJobs.map((job, idx) => (
                                            <tr key={job.id}>
                                                <td>{idx + 1}</td>
                                                <td>
                                                    <Link href={`/ops/job/${job.id}`} className="fw-bold text-decoration-none">
                                                        {job.jobNo}
                                                    </Link>
                                                </td>
                                                <td>
                                                    <span className="badge bg-blue-lt fw-bold">{job.car?.licensePlate || '-'}</span>
                                                    {job.car?.province && <small className="text-muted d-block">{job.car.province}</small>}
                                                </td>
                                                <td>{job.customer?.fullName || '-'}</td>
                                                <td>
                                                    {job.customer?.phone ? (
                                                        <a href={`tel:${job.customer.phone}`} className="text-decoration-none">{job.customer.phone}</a>
                                                    ) : '-'}
                                                </td>
                                                <td>{job.customerRequest || job.description || 'ตรวจเช็คตามระยะ'}</td>
                                                <td className="text-end fw-bold text-primary fs-4">
                                                    ฿{formatMoney(job.grandTotal)}
                                                </td>
                                                <td className="text-end">
                                                    <Link href={`/cash/payment?jobId=${job.id}`} className="btn btn-success">
                                                        <i className="ti ti-cash me-1"></i>รับชำระ
                                                    </Link>
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

            {/* Payment Summary & Recent Receipts */}
            <div className="row mt-3">
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title"><i className="ti ti-chart-pie me-2"></i>ภาพรวมการชำระเงิน</h3>
                        </div>
                        <div className="card-body">
                            <div className="row g-3 align-items-center">
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center mb-3">
                                        <span className="avatar bg-success-lt me-3">
                                            <i className="ti ti-cash"></i>
                                        </span>
                                        <div>
                                            <div className="text-muted small">ยอดรับชำระสะสม</div>
                                            <div className="h3 mb-0">฿{formatMoney(todayReceiptsTotal)}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="avatar bg-warning-lt me-3">
                                            <i className="ti ti-clock"></i>
                                        </span>
                                        <div>
                                            <div className="text-muted small">ยอดรอรับชำระ</div>
                                            <div className="h3 mb-0">฿{formatMoney(totalPendingAmount)}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 d-flex align-items-center justify-content-center border-start">
                                    <div className="text-center py-2">
                                        <div className="display-6 fw-bold text-success">฿{formatMoney(todayReceiptsTotal)}</div>
                                        <div className="text-muted">ยอดรวมรับชำระ</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h3 className="card-title mb-0"><i className="ti ti-receipt me-2"></i>ใบเสร็จล่าสุด</h3>
                            <Link href="/cash/payment" className="btn btn-sm btn-outline-secondary">
                                ไปหน้ารับชำระเงิน
                            </Link>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-vcenter card-table table-hover">
                                <thead>
                                    <tr>
                                        <th>เลขที่ใบเสร็จ / งาน</th>
                                        <th>ลูกค้า</th>
                                        <th className="text-end">ยอด</th>
                                        <th className="text-end">พิมพ์</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-4 text-muted">
                                                ยังไม่มีประวัติการชำระเงินล่าสุด
                                            </td>
                                        </tr>
                                    ) : (
                                        recentPayments.map(p => (
                                            <tr key={p.id}>
                                                <td>
                                                    <span className="fw-bold">{p.receiptNo || p.paymentNo || 'RC-AUTO'}</span>
                                                    <small className="text-muted d-block">{p.serviceJob?.jobNo || ''}</small>
                                                </td>
                                                <td>{p.serviceJob?.customer?.fullName || '-'}</td>
                                                <td className="text-end fw-bold text-success">฿{formatMoney(p.amount)}</td>
                                                <td className="text-end">
                                                    {p.serviceJobId && (
                                                        <Link
                                                            href={`/ops/job/print/${p.serviceJobId}?type=receipt`}
                                                            target="_blank"
                                                            className="btn btn-sm btn-outline-primary"
                                                        >
                                                            <i className="ti ti-printer me-1"></i>ใบเสร็จ
                                                        </Link>
                                                    )}
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
