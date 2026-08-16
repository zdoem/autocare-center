/**
 * ไฟล์: app/ops/car-history/[id]/page.tsx
 * จุดประสงค์: แสดงประวัติการซ่อมทั้งหมด (Full History)
 * Ref: ops-car-history.html
 */

'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { showSuccess, showError } from '@/components/ui'

export default function CarHistoryPage() {
    const router = useRouter()
    const routeParams = useParams()
    const carId = (routeParams?.id as string) || ''
    const [loading, setLoading] = useState(true)
    const [car, setCar] = useState<any>(null)
    const [history, setHistory] = useState<any[]>([])

    useEffect(() => {
        if (carId) {
            fetchData(carId)
        }
    }, [carId])

    const fetchData = async (carId: string) => {
        try {
            setLoading(true)

            // Fetch Car Basic Info
            const carRes = await fetch(`/api/master/car/${carId}`)
            const carJson = await carRes.json()
            if (carJson.id) setCar(carJson)

            // Fetch Full History
            const histRes = await fetch(`/api/ops/history/${carId}`)
            const histJson = await histRes.json()

            if (histJson.success) {
                setHistory(histJson.data)
            }

        } catch (error) {
            showError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <span className="badge bg-yellow">รอคิว</span>
            case 'IN_PROGRESS': return <span className="badge bg-azure"><i className="ti ti-loader me-1"></i>กำลังซ่อม</span>
            case 'COMPLETED': return <span className="badge bg-green">เสร็จสิ้น</span>
            default: return <span className="badge bg-secondary">{status}</span>
        }
    }

    if (loading) {
        return <MainLayout title="กำลังโหลด..."><div className="text-center py-5"><div className="spinner-border"></div></div></MainLayout>
    }

    return (
        <MainLayout
            title={<><i className="ti ti-history me-2"></i>ประวัติการซ่อมทั้งหมด</>}
            pretitle={car ? `${car.licensePlate} - ${car.carBrand?.nameEnglish}` : 'Operations'}
        >
            <div className="page-body">
                <div className="container-xl">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">รายการประวัติ ({history.length})</h3>
                            <div className="card-actions">
                                <Link href={`/ops/car-detail/${id}`} className="btn btn-outline-secondary">
                                    <i className="ti ti-arrow-left me-2"></i> กลับไปหน้ารายละเอียด
                                </Link>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-vcenter card-table table-hover">
                                <thead>
                                    <tr>
                                        <th>วันที่</th>
                                        <th>เลขงาน</th>
                                        <th>เลขไมล์</th>
                                        <th>อาการ/งานซ่อม</th>
                                        <th className="text-end">ยอดรวม</th>
                                        <th>ผู้รับผิดชอบ</th>
                                        <th>สถานะ</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((job) => (
                                        <tr key={job.id}>
                                            <td>{new Date(job.jobDate).toLocaleDateString('th-TH')}</td>
                                            <td><div className="fw-bold">{job.jobNumber}</div></td>
                                            <td>{job.mileageIn?.toLocaleString()}</td>
                                            <td>{job.customerRequest || '-'}</td>
                                            <td className="text-end">{job.grandTotal?.toLocaleString()}</td>
                                            <td>{job.technician?.firstName || '-'}</td>
                                            <td>{getStatusBadge(job.status)}</td>
                                            <td className="text-end">
                                                <Link href={`/ops/job/${job.id}`} className="btn btn-primary btn-sm">
                                                    <i className="ti ti-eye me-1"></i> รายละเอียด
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="text-center py-5 text-muted">
                                                ยังไม่มีประวัติการซ่อม
                                            </td>
                                        </tr>
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
