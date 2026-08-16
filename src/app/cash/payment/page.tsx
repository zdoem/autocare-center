'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { showError, showCreateSuccess } from '@/components/ui'
import generatePayload from 'promptpay-qr'
import { QRCodeSVG } from 'qrcode.react'
import Swal from 'sweetalert2'

// --- Interfaces ---
interface ServiceJob {
    id: string
    jobNo: string
    jobDate: string
    status: string
    isPaid: boolean
    grandTotal: number
    totalCost: number
    laborCost: number
    partsCost: number
    vatAmount: number
    discount: number
    customerRequest: string | null
    mileage: number | null
    car: {
        licensePlate: string
        province: string | null
        carBrand: { nameEnglish: string; nameThai: string }
        carModel: { name: string }
        color: string | null
    }
    customer: {
        fullName: string
        phone: string
    }
    items: {
        id: string
        description: string
        unitPrice: number
        quantity: number
        totalPrice: number
    }[]
}

interface PaymentType {
    id: string
    code: string
    name: string
}

const formatMoney = (amount: number | string) => {
    return Number(amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

const CARD_BRANDS = [
    {
        id: 'Visa',
        name: 'Visa',
        icon: (
            <svg width="34" height="22" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2 flex-shrink-0">
                <rect width="36" height="24" rx="3" fill="#1A1F71"/>
                <text x="18" y="16" fill="#ffffff" fontSize="11" fontWeight="bold" fontStyle="italic" textAnchor="middle" fontFamily="sans-serif">VISA</text>
            </svg>
        )
    },
    {
        id: 'Mastercard',
        name: 'Mastercard',
        icon: (
            <svg width="34" height="22" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2 flex-shrink-0">
                <rect width="36" height="24" rx="3" fill="#252525"/>
                <circle cx="14" cy="12" r="7" fill="#EB001B"/>
                <circle cx="22" cy="12" r="7" fill="#F79E1B" fillOpacity="0.85"/>
            </svg>
        )
    },
    {
        id: 'JCB',
        name: 'JCB',
        icon: (
            <svg width="34" height="22" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2 flex-shrink-0">
                <rect width="36" height="24" rx="3" fill="#ffffff" stroke="#cbd5e1"/>
                <rect x="5" y="4" width="7" height="16" rx="2" fill="#006CB7"/>
                <rect x="14" y="4" width="7" height="16" rx="2" fill="#E60012"/>
                <rect x="23" y="4" width="7" height="16" rx="2" fill="#008837"/>
                <text x="18" y="15" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">JCB</text>
            </svg>
        )
    },
    {
        id: 'UnionPay',
        name: 'UnionPay',
        icon: (
            <svg width="34" height="22" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2 flex-shrink-0">
                <rect width="36" height="24" rx="3" fill="#005B82"/>
                <text x="18" y="15" fill="#ffffff" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">UnionPay</text>
            </svg>
        )
    }
]

function PaymentContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const jobId = searchParams.get('jobId')

    const [job, setJob] = useState<ServiceJob | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([])

    const [activeMethod, setActiveMethod] = useState<'cash' | 'transfer' | 'credit'>('cash')

    // Cash Form State
    const [cashReceived, setCashReceived] = useState<string>('')
    const [changeAmount, setChangeAmount] = useState<number>(0)

    // PromptPay QR State
    const promptPayId = process.env.NEXT_PUBLIC_PROMPTPAY_ID || '0841013129'
    const [qrPayload, setQrPayload] = useState<string>('')
    const [qrConfirmed, setQrConfirmed] = useState(false)

    // Credit Card State
    const [creditMode, setCreditMode] = useState<'edc' | 'online'>('edc')
    const [creditForm, setCreditForm] = useState({ reference: '', cardType: 'Visa' })
    const [onlineLinkSent, setOnlineLinkSent] = useState(false)

    useEffect(() => {
        if (jobId) {
            fetchJob()
            fetchPaymentTypes()
        } else {
            router.push('/cash/pending')
        }
    }, [jobId])

    const fetchJob = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/ops/job/${jobId}`)
            const json = await res.json()
            if (json.success) {
                setJob(json.data)
                setCashReceived(json.data.grandTotal.toString())
                
                // Generate QR Payload
                const payload = generatePayload(promptPayId, { amount: Number(json.data.grandTotal) })
                setQrPayload(payload)
            } else {
                showError('ไม่พบข้อมูลบิล หรือข้อมูลถูกลบไปแล้ว')
                router.push('/cash/pending')
            }
        } catch (error) {
            showError('โหลดข้อมูลไม่สำเร็จ')
        } finally {
            setLoading(false)
        }
    }

    const fetchPaymentTypes = async () => {
        try {
            const res = await fetch('/api/cash/payment-types')
            const json = await res.json()
            if (json.success) setPaymentTypes(json.data || [])
        } catch (e) { console.error(e) }
    }

    // Calc Change
    useEffect(() => {
        if (job) {
            const received = Number(cashReceived) || 0
            const total = Number(job.grandTotal)
            setChangeAmount(Math.max(0, received - total))
        }
    }, [cashReceived, job])

    const getPaymentTypeIdByCode = (code: string) => {
        // Try to find exact match or fallback to the first one available
        return paymentTypes.find(p => p.code === code)?.id || paymentTypes.find(p => p.name.toUpperCase().includes(code))?.id || paymentTypes[0]?.id
    }

    const handleSubmitPayment = async () => {
        if (!job) return

        let finalPaymentTypeId = ''
        let finalReference = ''
        let finalNotes = ''

        if (activeMethod === 'cash') {
            const r = Number(cashReceived) || 0
            if (r < job.grandTotal) {
                return showError('ยอดรับเงินน้อยกว่ายอดที่ต้องชำระ')
            }
            finalPaymentTypeId = getPaymentTypeIdByCode('CASH')
            finalNotes = `รับเงิน: ${r}, เงินทอน: ${r - job.grandTotal}`
        } else if (activeMethod === 'transfer') {
            if (!qrConfirmed) {
                return showError('กรุณายืนยันว่าได้รับเงินโอนแล้ว')
            }
            finalPaymentTypeId = getPaymentTypeIdByCode('TRANSFER')
            finalNotes = 'ชำระผ่าน PromptPay QR'
        } else if (activeMethod === 'credit') {
            finalPaymentTypeId = getPaymentTypeIdByCode('CREDIT')
            if (creditMode === 'edc') {
                if (!creditForm.reference) return showError('กรุณากรอกเลขอ้างอิงจากเครื่อง EDC')
                finalReference = creditForm.reference
                finalNotes = `EDC: ${creditForm.cardType}`
            } else {
                if (!onlineLinkSent) return showError('กรุณาสร้างลิงก์และรอให้ลูกค้าชำระเงินให้เสร็จสิ้น')
                finalNotes = 'Online Gateway Checkout'
            }
        }

        setSubmitting(true)
        try {
            const res = await fetch('/api/cash/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceJobId: job.id,
                    paymentTypeId: finalPaymentTypeId,
                    amount: job.grandTotal,
                    reference: finalReference || undefined,
                    notes: finalNotes
                })
            })

            const json = await res.json()
            if (res.ok && json.success) {
                showCreateSuccess('รับชำระเงินและออกใบเสร็จเรียบร้อยแล้ว')
                router.push('/cash/pending')
            } else {
                showError(json.error || 'เกิดข้อผิดพลาดในการชำระเงิน')
            }
        } catch (error) {
            showError('ไม่สามารถบันทึกข้อมูลได้')
        } finally {
            setSubmitting(false)
        }
    }

    const handleGenerateLink = () => {
        Swal.fire({
            title: 'สร้างลิงก์ชำระเงินสำเร็จ',
            text: 'ส่ง SMS ลิงก์ชำระเงินออนไลน์ให้ลูกค้าแล้ว ระบบกำลังรอการตอบกลับจาก Gateway...',
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'ยืนยัน (ลูกค้าชำระสำเร็จ)',
            cancelButtonText: 'ปิดหน้าต่าง'
        }).then((result) => {
            if (result.isConfirmed) {
                setOnlineLinkSent(true)
            }
        })
    }

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
    if (!job) return null

    return (
        <div className="row">
            {/* Left Column: Job Details & Payment Options (7) */}
            <div className="col-lg-7">
                {/* Customer Info Card */}
                <div className="card mb-3">
                    <div className="card-body">
                        <div className="row align-items-center">
                            <div className="col-auto">
                                <span className="avatar avatar-lg bg-blue-lt"><i className="ti ti-car fs-2"></i></span>
                            </div>
                            <div className="col">
                                <div className="d-flex align-items-center">
                                    <span className="badge bg-blue fs-4 me-2">{job.car.licensePlate}</span>
                                </div>
                                <div className="text-muted mt-1">
                                    {job.car.carBrand.nameThai || job.car.carBrand.nameEnglish} {job.car.carModel.name}
                                    {job.car.color && ` (${job.car.color})`} | ไมล์ {job.mileage ? job.mileage.toLocaleString() : '-'}
                                </div>
                            </div>
                            <div className="col-auto text-end">
                                <div className="fw-bold">{job.customer.fullName}</div>
                                <div className="text-muted"><a href={`tel:${job.customer.phone}`}>{job.customer.phone}</a></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Summarized */}
                <div className="card mb-3">
                    <div className="card-header">
                        <h3 className="card-title"><i className="ti ti-list-check me-2"></i>รายการซ่อม/บริการ</h3>
                    </div>
                    <div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        <table className="table table-vcenter card-table table-sm">
                            <thead>
                                <tr>
                                    <th>รายการ</th>
                                    <th className="text-center">จำนวน</th>
                                    <th className="text-end">รวม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {job.items.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.description}</td>
                                        <td className="text-center">x{item.quantity}</td>
                                        <td className="text-end">฿{formatMoney(item.totalPrice)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title"><i className="ti ti-wallet me-2"></i>เลือกวิธีชำระเงิน</h3>
                    </div>
                    <div className="card-body">
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <div 
                                    className={`card payment-method-btn ${activeMethod === 'cash' ? 'active shadow-sm' : ''}`}
                                    onClick={() => setActiveMethod('cash')}
                                    style={{ cursor: 'pointer', transition: 'all 0.2s', border: activeMethod === 'cash' ? '2px solid #206bc4' : '' }}
                                >
                                    <div className="card-body text-center py-3">
                                        <i className="ti ti-cash fs-1 text-success mb-2"></i>
                                        <h4 className="mb-0">เงินสด</h4>
                                        <small className="text-muted">Cash</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div 
                                    className={`card payment-method-btn ${activeMethod === 'transfer' ? 'active shadow-sm' : ''}`}
                                    onClick={() => setActiveMethod('transfer')}
                                    style={{ cursor: 'pointer', transition: 'all 0.2s', border: activeMethod === 'transfer' ? '2px solid #206bc4' : '' }}
                                >
                                    <div className="card-body text-center py-3">
                                        <i className="ti ti-qrcode fs-1 text-primary mb-2"></i>
                                        <h4 className="mb-0">โอน/QR</h4>
                                        <small className="text-muted">PromptPay</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div 
                                    className={`card payment-method-btn ${activeMethod === 'credit' ? 'active shadow-sm' : ''}`}
                                    onClick={() => setActiveMethod('credit')}
                                    style={{ cursor: 'pointer', transition: 'all 0.2s', border: activeMethod === 'credit' ? '2px solid #206bc4' : '' }}
                                >
                                    <div className="card-body text-center py-3">
                                        <i className="ti ti-credit-card fs-1 text-purple mb-2"></i>
                                        <h4 className="mb-0">บัตรเครดิต</h4>
                                        <small className="text-muted">EDC / Online</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Context Area */}
                        <div className="p-3 bg-light rounded border">
                            {/* Cash Section */}
                            {activeMethod === 'cash' && (
                                <div className="row align-items-end">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <label className="form-label">รับเงินมา</label>
                                        <div className="input-group input-group-lg">
                                            <span className="input-group-text">฿</span>
                                            <input 
                                                type="number" 
                                                className="form-control form-control-lg fw-bold" 
                                                value={cashReceived}
                                                onChange={(e) => setCashReceived(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className={`p-3 rounded-3 mb-0 border ${changeAmount >= 0 ? 'bg-success-lt text-success border-success-subtle' : 'bg-danger-lt text-danger border-danger-subtle'}`}>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-medium"><i className="ti ti-arrow-back-up me-1"></i>เงินทอน</span>
                                                <span className="fs-2 fw-bold">฿{formatMoney(changeAmount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PromptPay QR Section */}
                            {activeMethod === 'transfer' && (
                                <div className="text-center py-2">
                                    <div className="mb-3 bg-white p-3 d-inline-block rounded shadow-sm border">
                                        {qrPayload ? (
                                            <QRCodeSVG value={qrPayload} size={200} level="M" includeMargin={true} />
                                        ) : (
                                            <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span className="spinner-border text-primary"></span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="h3 text-primary mb-1">สแกนเพื่อชำระเงิน</div>
                                    <div className="text-muted mb-3">PromptPay ID: {promptPayId}</div>
                                    <div className="form-check form-switch d-inline-block">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            role="switch" 
                                            id="flexSwitchCheckDefault"
                                            checked={qrConfirmed}
                                            onChange={(e) => setQrConfirmed(e.target.checked)}
                                        />
                                        <label className="form-check-label fs-4" htmlFor="flexSwitchCheckDefault">
                                            ยืนยันตรวจสอบยอดเงินเข้าบัญชีแล้ว
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Credit Card Section */}
                            {activeMethod === 'credit' && (
                                <div>
                                    <ul className="nav nav-pills mb-3 justify-content-center">
                                        <li className="nav-item">
                                            <a className={`nav-link ${creditMode === 'edc' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setCreditMode('edc'); }}>
                                                เครื่อง EDC
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a className={`nav-link ${creditMode === 'online' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setCreditMode('online'); }}>
                                                Online Gateway
                                            </a>
                                        </li>
                                    </ul>

                                    {creditMode === 'edc' ? (
                                        <div>
                                            <div className="mb-3">
                                                <label className="form-label required">ประเภทบัตร (Card Type)</label>
                                                <div className="row g-2">
                                                    {CARD_BRANDS.map(brand => {
                                                        const isSelected = creditForm.cardType === brand.id
                                                        return (
                                                            <div key={brand.id} className="col-6 col-sm-3">
                                                                <button
                                                                    type="button"
                                                                    className={`btn w-100 d-flex align-items-center justify-content-center py-2 ${
                                                                        isSelected ? 'btn-primary shadow-sm' : 'btn-outline-secondary bg-white'
                                                                    }`}
                                                                    onClick={() => setCreditForm({ ...creditForm, cardType: brand.id })}
                                                                >
                                                                    {brand.icon}
                                                                    <span className="fw-bold">{brand.name}</span>
                                                                </button>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-12 mb-3">
                                                    <label className="form-label required">เลขอ้างอิงจากสลิปเครื่องรูด (EDC Ref No. / Approval Code)</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light">
                                                            {CARD_BRANDS.find(b => b.id === creditForm.cardType)?.icon}
                                                            <span className="fw-medium ms-1">{creditForm.cardType}</span>
                                                        </span>
                                                        <input 
                                                            type="text" 
                                                            className="form-control" 
                                                            placeholder="เช่น Ref No. หรือ Approval Code จากสลิป"
                                                            value={creditForm.reference}
                                                            onChange={(e) => setCreditForm({ ...creditForm, reference: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-3">
                                            <p className="text-muted mb-3">ส่งลิงก์ชำระเงินผ่าน SMS หรือ LINE ให้ลูกค้าทำรายการบนมือถือตนเอง</p>
                                            {onlineLinkSent ? (
                                                <div className="alert alert-success d-inline-flex align-items-center">
                                                    <i className="ti ti-check me-2"></i> ลูกค้าทำรายการชำระเงินสำเร็จ
                                                </div>
                                            ) : (
                                                <button className="btn btn-outline-primary" onClick={handleGenerateLink}>
                                                    <i className="ti ti-link me-1"></i> สร้างลิงก์ชำระเงิน (Payment Link)
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Summary Panel (5) */}
            <div className="col-lg-5">
                <div className="card sticky-top" style={{ top: '1rem' }}>
                    <div className="card-header bg-primary text-white">
                        <h3 className="card-title text-white"><i className="ti ti-receipt me-2"></i>สรุปยอดชำระ: {job.jobNo}</h3>
                    </div>
                    <div className="card-body">
                        <table className="table table-borderless table-sm fs-5">
                            <tbody>
                                <tr>
                                    <td className="text-muted">ค่าอะไหล่/บริการ</td>
                                    <td className="text-end">฿{formatMoney(job.totalCost)}</td>
                                </tr>
                                <tr>
                                    <td className="text-muted">ค่าแรง</td>
                                    <td className="text-end">฿{formatMoney(job.laborCost)}</td>
                                </tr>
                                {Number(job.discount) > 0 && (
                                    <tr>
                                        <td className="text-danger">ส่วนลด</td>
                                        <td className="text-end text-danger">-฿{formatMoney(job.discount)}</td>
                                    </tr>
                                )}
                                <tr className="border-top">
                                    <td><strong>รวมก่อน VAT</strong></td>
                                    <td className="text-end"><strong>฿{formatMoney(job.grandTotal - job.vatAmount)}</strong></td>
                                </tr>
                                <tr>
                                    <td className="text-muted">VAT 7%</td>
                                    <td className="text-end">฿{formatMoney(job.vatAmount)}</td>
                                </tr>
                            </tbody>
                        </table>
                        <hr className="my-3" />
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="h4 mb-0">ยอดสุทธิ</span>
                            <span className="display-6 fw-bold text-primary">฿{formatMoney(job.grandTotal)}</span>
                        </div>

                        <div className="p-3 bg-blue-lt text-blue rounded-3 mb-4 border border-blue-subtle">
                            <i className="ti ti-info-circle me-2"></i>วิธีชำระ: 
                            <strong className="ms-1">
                                {activeMethod === 'cash' ? 'เงินสด' : activeMethod === 'transfer' ? 'โอน/QR PromptPay' : 'บัตรเครดิต'}
                            </strong>
                        </div>

                        <div className="d-grid gap-2">
                            <button 
                                className="btn btn-success btn-lg" 
                                onClick={handleSubmitPayment}
                                disabled={submitting || (activeMethod === 'cash' && Number(cashReceived) < job.grandTotal)}
                            >
                                {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="ti ti-check me-2"></i>}
                                ยืนยันรับชำระเงิน
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function PaymentPage() {
    return (
        <MainLayout
            title={<><i className="ti ti-cash me-2"></i>รับชำระเงิน</>}
            pretitle="แคชเชียร์"
        >
            <Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary"></div></div>}>
                <PaymentContent />
            </Suspense>
        </MainLayout>
    )
}
