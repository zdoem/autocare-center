/**
 * ไฟล์: app/ops/receive/page.tsx
 * จุดประสงค์: รับรถเข้าซ่อม - Quotation Driven Workflow
 * 
 * @author AutoCare Team
 * @created 2026-02-14
 * @updated 2026-02-15 - Refactor for Quotation Approval Process
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { showSuccess, showError } from '@/components/ui'

interface CarSearchResult {
    id: string
    licensePlate: string
    province: string | null
    carBrand: { nameThai: string; nameEnglish: string }
    carModel: { name: string }
    customer: { fullName: string; phone: string; type?: string }
}

interface Car {
    id: string
    code: string
    licensePlate: string
    province: string | null
    mileage: number
    color: string
    year: string
    carBrand: { nameThai: string; nameEnglish: string }
    carModel: { name: string }
    customer: { code: string; fullName: string; phone: string; type?: string }
}

export default function OpsReceivePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialCarId = searchParams.get('carId')

    // Step 0 = car search, Steps 1-4 = wizard
    const [currentStep, setCurrentStep] = useState(initialCarId ? 1 : 0)
    const totalSteps = 4

    // Car search state
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<CarSearchResult[]>([])
    const [searching, setSearching] = useState(false)

    // Selected car
    const [car, setCar] = useState<Car | null>(null)
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Form data
    const [formData, setFormData] = useState({
        carId: initialCarId || '',
        jobDate: new Date().toISOString().split('T')[0],
        mileage: 0,
        priority: 'NORMAL',
        customerRequest: '',
        requestedServices: [] as string[],
        initialNotes: '',
        estimatedDays: 1,
        technicianId: '',
        status: 'RECEIVED', // Default status: รอรับรถ / พร้อมเริ่มงาน
        workshopBay: '',
        appointmentDate: '',
        laborHours: 0,
        laborRate: 350,
    })

    // Step 2: Inspection Checklist (Scope of Work)
    const [inspectionChecklist, setInspectionChecklist] = useState({
        fluids: { engineOil: false, transmission: false, brake: false, coolant: false, washer: false },
        brakes: { frontPads: false, rearPads: false, system: false },
        tires: { pressure: false, tread: false, alignment: false },
        drivetrain: { engineSound: false, transmission: false, suspension: false },
        electrical: { lights: false, battery: false, ac: false, wipers: false },
        body: { scratches: false, dents: false }
    })
    const [inspectionNotes, setInspectionNotes] = useState('')
    const [technicians, setTechnicians] = useState<any[]>([])

    useEffect(() => {
        if (initialCarId) {
            fetchCarDetail(initialCarId)
        }
        fetchTechnicians()
    }, [])

    // Search for cars
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            showError('กรุณากรอกคำค้นหา')
            return
        }
        try {
            setSearching(true)
            const res = await fetch(`/api/ops/search?search=${encodeURIComponent(searchQuery)}&limit=10`)
            const json = await res.json()
            if (json.data) {
                setSearchResults(json.data)
                if (json.data.length === 0) showError('ไม่พบข้อมูล')
            } else {
                showError(json.error || 'ค้นหาไม่สำเร็จ')
            }
        } catch (error) {
            console.error('Error searching:', error)
            showError('เกิดข้อผิดพลาด')
        } finally {
            setSearching(false)
        }
    }

    // Select car from search results
    const handleSelectCar = async (carId: string) => {
        await fetchCarDetail(carId)
        setCurrentStep(1)
    }

    const fetchCarDetail = async (carId: string) => {
        try {
            setLoading(true)
            const res = await fetch(`/api/master/car/${carId}`)
            const json = await res.json()
            if (json.id) {
                setCar(json)
                setFormData(prev => ({
                    ...prev,
                    carId: json.id,
                    mileage: json.mileage || 0
                }))
            } else {
                showError('ไม่พบข้อมูลรถ')
            }
        } catch (error) {
            console.error('Error fetching car:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchTechnicians = async () => {
        try {
            const res = await fetch('/api/master/employee?positionCode=TECH&limit=999')
            const json = await res.json()
            if (json.success) setTechnicians(json.data)
        } catch (error) {
            console.error('Error fetching technicians:', error)
        }
    }

    const handleNext = () => {
        // Validation
        if (currentStep === 1) {
            if (!formData.carId || !formData.jobDate) {
                showError('กรุณากรอกข้อมูลให้ครบถ้วน')
                return
            }
        } else if (currentStep === 2) {
            if (!formData.customerRequest) {
                showError('กรุณาระบุอาการหรือปัญหาที่แจ้ง')
                return
            }
        }
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1)
    }

    const handlePrevious = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1)
    }

    const handleSubmit = async () => {
        try {
            setSubmitting(true)
            // Save logic
            const res = await fetch('/api/ops/job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    inspectionChecklist, // Save checklist data
                    inspectionNotes
                })
            })
            const json = await res.json()

            if (json.success) {
                showSuccess('บันทึกข้อมูลสำเร็จ')
                // Redirect to Job Detail (where Quotation print button exists)
                setTimeout(() => {
                    router.push(`/ops/job/${json.data.id}`)
                }, 1000)
            } else {
                showError(json.error || 'ไม่สามารถสร้างงานได้')
            }
        } catch (error) {
            console.error('Error creating service job:', error)
            showError('เกิดข้อผิดพลาด')
        } finally {
            setSubmitting(false)
        }
    }

    const commonServices = ['เปลี่ยนน้ำมันเครื่อง', 'เช็คระยะ', 'ตรวจเช็คเบรก', 'เปลี่ยนยาง', 'ซ่อมเครื่องยนต์', 'ซ่อมช่วงล่าง', 'เช็คระบบแอร์']

    const checklistGroups = [
        { key: 'fluids', label: 'น้ำมันและของเหลว', items: { engineOil: 'น้ำมันเครื่อง', transmission: 'น้ำมันเกียร์', brake: 'น้ำมันเบรก', coolant: 'น้ำยาหล่อเย็น' } },
        { key: 'brakes', label: 'ระบบเบรก', items: { frontPads: 'ผ้าเบรกหน้า', rearPads: 'ผ้าเบรกหลัง', system: 'ระบบเบรก' } },
        { key: 'tires', label: 'ยางและช่วงล่าง', items: { pressure: 'ลมยาง', tread: 'ดอกยาง', alignment: 'ตั้งศูนย์' } },
        { key: 'electrical', label: 'ระบบไฟฟ้า', items: { lights: 'ไฟส่องสว่าง', battery: 'แบตเตอรี่', ac: 'แอร์' } }
    ]

    if (loading) {
        return <MainLayout title="กำลังโหลด..."><div className="container-xl d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}><div className="spinner-border text-primary" /></div></MainLayout>
    }

    return (
        <MainLayout title="รับรถเข้าซ่อม" pretitle="งานรับรถ">
            <div className="container-xl">
                {/* Steps Indicator — only show during wizard (steps 1-4) */}
                {currentStep > 0 && (
                    <div className="card mb-3">
                        <div className="card-body py-3">
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                .wizard-steps { display: flex; align-items: center; justify-content: space-between; position: relative; }
                                .wizard-step { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; z-index: 1; }
                                .wizard-step-circle {
                                    width: 36px; height: 36px; border-radius: 50%;
                                    display: flex; align-items: center; justify-content: center;
                                    font-weight: 700; font-size: 14px;
                                    margin-bottom: 6px; transition: all 0.2s;
                                }
                                .wizard-step-label { font-size: 12px; font-weight: 500; text-align: center; }
                                /* Connector line between steps */
                                .wizard-step:not(:last-child)::after {
                                    content: ''; position: absolute; top: 18px; left: calc(50% + 22px); right: calc(-50% + 22px);
                                    height: 3px; background: #e0e0e0; z-index: 0;
                                }
                                /* States */
                                .wizard-step.is-done .wizard-step-circle { background: #2fb344; color: #fff; }
                                .wizard-step.is-done .wizard-step-label { color: #2fb344; font-weight: 600; }
                                .wizard-step.is-done:not(:last-child)::after { background: #2fb344; }
                                .wizard-step.is-active .wizard-step-circle { background: #2fb344; color: #fff; box-shadow: 0 0 0 4px rgba(47,179,68,0.2); }
                                .wizard-step.is-active .wizard-step-label { color: #2fb344; font-weight: 700; }
                                .wizard-step.is-pending .wizard-step-circle { background: #e0e0e0; color: #999; }
                                .wizard-step.is-pending .wizard-step-label { color: #999; }
                                @media (max-width: 576px) {
                                    .wizard-step-label { font-size: 10px; }
                                    .wizard-step-circle { width: 30px; height: 30px; font-size: 12px; }
                                }
                            `}} />
                            <div className="wizard-steps">
                                {[
                                    { step: 1, label: 'ข้อมูลรถ' },
                                    { step: 2, label: 'อาการ/เช็คลิสต์' },
                                    { step: 3, label: 'มอบหมายช่าง' },
                                    { step: 4, label: 'ยืนยัน/ใบเสนอราคา' },
                                ].map(({ step, label }) => {
                                    const state = currentStep > step ? 'is-done' : currentStep === step ? 'is-active' : 'is-pending'
                                    return (
                                        <div key={step} className={`wizard-step ${state}`}>
                                            <div className="wizard-step-circle">
                                                {currentStep > step ? '✓' : step}
                                            </div>
                                            <span className="wizard-step-label">{label}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 0: Search */}
                {currentStep === 0 && (
                    <div className="row">
                        <div className="col-lg-8 mx-auto">
                            <div className="card">
                                <div className="card-header"><h3 className="card-title"><i className="ti ti-search me-2"></i>ค้นหาลูกค้า/รถ</h3></div>
                                <div className="card-body">
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" placeholder="ทะเบียนรถ, ชื่อลูกค้า, เบอร์โทร..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
                                        <button className="btn btn-primary" onClick={handleSearch} disabled={searching}><i className="ti ti-search me-1"></i>{searching ? 'ค้นหา...' : 'ค้นหา'}</button>
                                    </div>
                                    {searchResults.length > 0 && (
                                        <div className="list-group list-group-flush">
                                            {searchResults.map((result) => (
                                                <button key={result.id} className="list-group-item list-group-item-action" onClick={() => handleSelectCar(result.id)}>
                                                    <div className="row align-items-center">
                                                        <div className="col-auto"><span className="avatar bg-blue-lt"><i className="ti ti-car"></i></span></div>
                                                        <div className="col">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <strong>{result.licensePlate} {result.province || ''}</strong>
                                                                <span className="badge bg-blue text-white fw-medium">
                                                                    {result.carBrand?.nameThai || result.carBrand?.nameEnglish || '-'} {result.carModel?.name || ''}
                                                                </span>
                                                            </div>
                                                            <div className="text-muted small">{result.customer?.fullName || '-'} | {result.customer?.phone || '-'}</div>
                                                        </div>
                                                        <div className="col-auto"><i className="ti ti-chevron-right"></i></div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="card-footer"><a href="/ops/register" className="btn btn-outline-primary"><i className="ti ti-plus me-1"></i>ลงทะเบียนรถใหม่</a></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Wizard Steps */}
                {currentStep > 0 && car && (
                    <div className="row row-cards">
                        {/* Left Column: Form/Content */}
                        <div className="col-lg-8">
                            {/* Step 1: Info */}
                            {currentStep === 1 && (
                                <div className="card">
                                    <div className="card-header bg-success text-white"><h3 className="card-title text-white">1. ข้อมูลรับรถ</h3></div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label required">วันที่รับรถ</label>
                                                <input type="date" className="form-control" value={formData.jobDate} onChange={(e) => setFormData(prev => ({ ...prev, jobDate: e.target.value }))} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label required">เลขไมล์ปัจจุบัน</label>
                                                <div className="input-group">
                                                    <input type="number" className="form-control" value={formData.mileage} onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) || 0 }))} />
                                                    <span className="input-group-text">km</span>
                                                </div>
                                                <small className="form-hint">ล่าสุด: {car.mileage?.toLocaleString()} km</small>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">ช่องซ่อม (Workshop Bay)</label>
                                                <select className="form-select" value={formData.workshopBay} onChange={(e) => setFormData(prev => ({ ...prev, workshopBay: e.target.value }))}>
                                                    <option value="">ไม่ระบุ</option>
                                                    <option value="1">ช่อง 1</option>
                                                    <option value="2">ช่อง 2</option>
                                                    <option value="3">ช่อง 3</option>
                                                    <option value="4">ช่อง 4</option>
                                                    <option value="5">ช่อง 5</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">ความเร่งด่วน</label>
                                                <select className="form-select" value={formData.priority} onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}>
                                                    <option value="LOW">ไม่เร่งด่วน</option>
                                                    <option value="NORMAL">ปกติ</option>
                                                    <option value="HIGH">เร่งด่วน</option>
                                                    <option value="URGENT">เร่งด่วนมาก</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-footer d-flex justify-content-between">
                                        <button className="btn btn-outline-secondary" onClick={() => setCurrentStep(0)}>เปลี่ยนรถ</button>
                                        <button className="btn btn-primary" onClick={handleNext}>ถัดไป <i className="ti ti-arrow-right ms-2"></i></button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Symptoms & Checklist */}
                            {currentStep === 2 && (
                                <div className="card">
                                    <div className="card-header bg-success text-white"><h3 className="card-title text-white">2. อาการและรายการตรวจเช็ค</h3></div>
                                    <div className="card-body">
                                        <div className="mb-4">
                                            <label className="form-label required">อาการที่ลูกค้าแจ้ง (Customer Request)</label>
                                            <textarea className="form-control" rows={4} placeholder="เช่น เครื่องสั่น, แอร์ไม่เย็น..." value={formData.customerRequest} onChange={(e) => setFormData(prev => ({ ...prev, customerRequest: e.target.value }))} />
                                        </div>

                                        <div className="mb-4">
                                            <h4 className="mb-3 border-bottom pb-2">รายการที่ต้องการ (Services)</h4>
                                            <div className="form-selectgroup">
                                                {commonServices.map(service => (
                                                    <label key={service} className="form-selectgroup-item">
                                                        <input type="checkbox" className="form-selectgroup-input" checked={formData.requestedServices.includes(service)} onChange={() => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                requestedServices: prev.requestedServices.includes(service) ? prev.requestedServices.filter(s => s !== service) : [...prev.requestedServices, service]
                                                            }))
                                                        }} />
                                                        <span className="form-selectgroup-label">{service}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <h4 className="mb-3 border-bottom pb-2">รายการตรวจเช็คเบื้องต้น (Pre-repair Checklist)</h4>
                                            <div className="row g-3">
                                                {checklistGroups.map(group => (
                                                    <div key={group.key} className="col-md-6">
                                                        <div className="form-label">{group.label}</div>
                                                        {Object.entries(group.items).map(([key, label]) => (
                                                            <label key={key} className="form-check">
                                                                <input type="checkbox" className="form-check-input"
                                                                    // @ts-ignore
                                                                    checked={inspectionChecklist[group.key]?.[key] || false}
                                                                    onChange={(e) => setInspectionChecklist(prev => ({
                                                                        ...prev,
                                                                        // @ts-ignore
                                                                        [group.key]: { ...prev[group.key], [key]: e.target.checked }
                                                                    }))}
                                                                />
                                                                <span className="form-check-label">{label}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-footer d-flex justify-content-between">
                                        <button className="btn btn-outline-secondary" onClick={handlePrevious}>ย้อนกลับ</button>
                                        <button className="btn btn-primary" onClick={handleNext}>ถัดไป <i className="ti ti-arrow-right ms-2"></i></button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Technician Assignment */}
                            {currentStep === 3 && (
                                <div className="card">
                                    <div className="card-header bg-success text-white"><h3 className="card-title text-white">3. มอบหมายช่าง</h3></div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-12">
                                                <label className="form-label">หมายเหตุเพิ่มเติม</label>
                                                <textarea className="form-control" rows={3} placeholder="บันทึกถึงช่าง..." value={formData.initialNotes} onChange={(e) => setFormData(prev => ({ ...prev, initialNotes: e.target.value }))} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">ช่างผู้รับผิดชอบ</label>
                                                <select className="form-select" value={formData.technicianId} onChange={(e) => setFormData(prev => ({ ...prev, technicianId: e.target.value }))}>
                                                    <option value="">ยังไม่ระบุ</option>
                                                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">ประเมินค่าแรง</label>
                                                <div className="row g-2">
                                                    <div className="col-6">
                                                        <div className="input-group">
                                                            <input type="number" className="form-control" placeholder="ชม." value={formData.laborHours} onChange={(e) => setFormData(prev => ({ ...prev, laborHours: parseFloat(e.target.value) || 0 }))} />
                                                            <span className="input-group-text">ชม.</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="input-group">
                                                            <span className="input-group-text">฿</span>
                                                            <input type="number" className="form-control" value={formData.laborRate} onChange={(e) => setFormData(prev => ({ ...prev, laborRate: parseInt(e.target.value) || 0 }))} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <small className="form-hint mt-1">รวมค่าแรง: ฿{(formData.laborHours * formData.laborRate).toLocaleString()}</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-footer d-flex justify-content-between">
                                        <button className="btn btn-outline-secondary" onClick={handlePrevious}>ย้อนกลับ</button>
                                        <button className="btn btn-primary" onClick={handleNext}>ถัดไป <i className="ti ti-arrow-right ms-2"></i></button>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Confirmation */}
                            {currentStep === 4 && (
                                <div className="card">
                                    <div className="card-header bg-success text-white"><h3 className="card-title text-white">4. ยืนยันและออกใบเสนอราคา</h3></div>
                                    <div className="card-body">
                                        <div className="alert alert-success">
                                            <div className="d-flex">
                                                <div><i className="ti ti-check icon alert-icon"></i></div>
                                                <div>กำลังสร้างงานในสถานะ: <strong>Quotation (รออนุมัติ)</strong></div>
                                            </div>
                                        </div>

                                        <div className="card card-sm mb-3">
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-md-6 mb-2"><strong>รถ:</strong> {car.licensePlate} {car.carBrand.nameThai}</div>
                                                    <div className="col-md-6 mb-2"><strong>ลูกค้า:</strong> {car.customer.fullName}</div>
                                                    <div className="col-12 mb-2"><strong>อาการที่แจ้ง:</strong> {formData.customerRequest}</div>
                                                    <div className="col-12"><strong>บริการที่เลือก:</strong> {formData.requestedServices.join(', ') || '-'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-footer d-flex justify-content-between">
                                        <button className="btn btn-outline-secondary" onClick={handlePrevious} disabled={submitting}>ย้อนกลับ</button>
                                        <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
                                            <i className="ti ti-printer me-2"></i>
                                            {submitting ? 'กำลังบันทึก...' : 'บันทึกและพิมพ์ใบเสนอราคา'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Car Details (Side Panel) */}
                        <div className="col-lg-4">
                            <div className="card mb-3">
                                <div className="card-header"><h3 className="card-title"><i className="ti ti-user me-2"></i>ข้อมูลลูกค้า</h3></div>
                                <div className="card-body">
                                    <div className="datagrid">
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">ชื่อลูกค้า</div>
                                            <div className="datagrid-content">{car.customer.fullName}</div>
                                        </div>
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">เบอร์โทร</div>
                                            <div className="datagrid-content">{car.customer.phone}</div>
                                        </div>
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">ประเภท</div>
                                            <div className="datagrid-content"><span className="badge bg-gold-lt">{car.customer.type || 'General'}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-header"><h3 className="card-title"><i className="ti ti-car me-2"></i>ข้อมูลรถ</h3></div>
                                <div className="card-body">
                                    <div className="datagrid">
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">ทะเบียน</div>
                                            <div className="datagrid-content fw-bold h3 text-primary">{car.licensePlate}</div>
                                        </div>
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">ยี่ห้อ/รุ่น</div>
                                            <div className="datagrid-content">{car.carBrand.nameThai} {car.carModel.name}</div>
                                        </div>
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">ปี/สี</div>
                                            <div className="datagrid-content">{car.year || '-'} / {car.color || '-'}</div>
                                        </div>
                                        <div className="datagrid-item">
                                            <div className="datagrid-title">เลขเครื่อง/ตัวถัง</div>
                                            <div className="datagrid-content text-muted small">{car.code || '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    )
}
