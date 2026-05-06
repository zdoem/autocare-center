/**
 * ไฟล์: app/ops/job/create/page.tsx
 * จุดประสงค์: เปิดงานซ่อม (Open Job) - ระบุอาการ/เลขไมล์
 * (Moved logic from old ops/register)
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormInput, showCreateSuccess, showError } from '@/components/ui'

function CreateJobContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const carId = searchParams.get('carId')

    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [car, setCar] = useState<any>(null)

    const [formData, setFormData] = useState({
        mileage: 0,
        customerRequest: '',
        notes: '',
        priority: 'NORMAL',
        technicianId: ''
    })

    useEffect(() => {
        if (!carId) {
            showError('ไม่พบข้อมูลรถยนต์')
            router.push('/ops/search')
            return
        }
        fetchCarDetails(carId)
    }, [carId])

    const fetchCarDetails = async (id: string) => {
        try {
            setLoading(true)
            const res = await fetch(`/api/master/car/${id}`)
            const json = await res.json()
            if (json.id) {
                setCar(json)
                setFormData(prev => ({ ...prev, mileage: json.mileage || 0 }))
            } else {
                showError('ไม่พบข้อมูลรถยนต์')
                router.push('/ops/search')
            }
        } catch (error) {
            showError('เกิดข้อผิดพลาดในการโหลดข้อมูลรถ')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!car) return
        if (formData.mileage < 0) {
            showError('เลขไมล์ต้องไม่ติดลบ')
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch('/api/ops/job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    carId: car.id,
                    customerId: car.customerId,
                    mileage: Number(formData.mileage),
                    customerRequest: formData.customerRequest,
                    notes: formData.notes,
                    priority: formData.priority,
                    technicianId: formData.technicianId || undefined
                })
            })

            const json = await res.json()

            if (res.ok) {
                showCreateSuccess('เปิดงานซ่อมเรียบร้อยแล้ว')
                // Redirect to Job Detail
                router.push(`/ops/job/${json.data.id}`)
            } else {
                showError(json.error || 'เกิดข้อผิดพลาดในการบันทึก')
            }
        } catch (error) {
            showError('ไม่สามารถบันทึกข้อมูลได้')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className="text-center py-5"><div className="spinner-border"></div></div>
    }

    if (!car) return null

    return (
        <div className="row justify-content-center">
            <div className="col-lg-8">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">เปิดงานซ่อม (New Job)</h3>
                    </div>
                    <div className="card-body">
                        {/* Car Info */}
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <h4 className="text-primary mb-3">ข้อมูลรถยนต์</h4>
                                <table className="table table-sm table-borderless">
                                    <tbody>
                                        <tr>
                                            <td className="text-muted" width="120">ทะเบียน:</td>
                                            <td className="fw-bold fs-3">{car.licensePlate} {car.province}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted">ยี่ห้อ/รุ่น:</td>
                                            <td>{car.carBrand?.nameEnglish} {car.carModel?.name}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-md-6">
                                <h4 className="text-primary mb-3">ข้อมูลลูกค้า</h4>
                                <table className="table table-sm table-borderless">
                                    <tbody>
                                        <tr>
                                            <td className="text-muted" width="120">ชื่อ-นามสกุล:</td>
                                            <td className="fw-bold">{car.customer?.fullName}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted">เบอร์โทร:</td>
                                            <td>{car.customer?.phone}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <hr />

                        {/* Job Form */}
                        <h4 className="text-primary mb-3">รายละเอียดงานซ่อม</h4>
                        <div className="row">
                            <div className="col-md-6">
                                <FormInput
                                    label="เลขไมล์ปัจจุบัน (km)"
                                    type="number"
                                    required
                                    value={formData.mileage}
                                    onChange={(e) => setFormData(prev => ({ ...prev, mileage: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label">ความเร่งด่วน</label>
                                    <select
                                        className="form-select"
                                        value={formData.priority}
                                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                                    >
                                        <option value="LOW">ต่ำ (Low)</option>
                                        <option value="NORMAL">ปกติ (Normal)</option>
                                        <option value="HIGH">สูง (High)</option>
                                        <option value="URGENT">เร่งด่วน (Urgent)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="mb-3">
                                    <label className="form-label required">อาการที่แจ้ง / คำขอของลูกค้า</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        placeholder="ระบุอาการผิดปกติ, เสียงดัง, หรือรายการเช็คระยะ..."
                                        value={formData.customerRequest}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customerRequest: e.target.value }))}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="mb-3">
                                    <label className="form-label">หมายเหตุเพิ่มเติม (ภายใน)</label>
                                    <textarea
                                        className="form-control"
                                        rows={2}
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-footer text-end">
                        <button
                            className="btn btn-secondary me-2"
                            onClick={() => router.back()}
                            disabled={submitting}
                        >
                            ยกเลิก
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="ti ti-device-floppy me-2"></i>}
                            เปิดใบงาน (Create Job)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CreateJobPage() {
    return (
        <MainLayout
            title={<><i className="ti ti-plus me-2"></i>เปิดงานซ่อม (New Job)</>}
            pretitle="Operations"
        >
            <Suspense fallback={<div>Loading...</div>}>
                <CreateJobContent />
            </Suspense>
        </MainLayout>
    )
}
