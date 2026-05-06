/**
 * ไฟล์: app/ops/register/page.tsx
 * จุดประสงค์: ลงทะเบียนรถใหม่ - ตาม UI mockup
 * 
 * @author AutoCare Team
 * @created 2026-02-14
 * @updated 2026-02-14 - Redesigned to match mockup exactly
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { showSuccess, showError } from '@/components/ui'

interface Customer {
    id: string
    code: string
    firstName: string
    lastName: string
    fullName: string
    phone: string
    email?: string
    customerType?: {
        name: string
    }
}

export default function RegisterCarPage() {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [brands, setBrands] = useState<any[]>([])
    const [models, setModels] = useState<any[]>([])
    const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null)
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Photo upload state
    const [photos, setPhotos] = useState<File[]>([])
    const [photoPreview, setPhotoPreview] = useState<string[]>([])

    // Form Data
    const [formData, setFormData] = useState({
        // Car
        licensePlate: '',
        province: 'กรุงเทพมหานคร',
        carBrandId: '',
        carModelId: '',
        year: new Date().getFullYear() + 543, // Thai Buddhist year
        color: '',
        mileage: 0,
        vin: '',
        engineNo: '',
        // Customer
        customerId: '',
        // New Customer (if adding)
        newCustomerFirstName: '',
        newCustomerLastName: '',
        newCustomerPhone: '',
        newCustomerEmail: '',
    })

    useEffect(() => {
        // Load Car Brands
        fetch('/api/master/car-brand?limit=999')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setBrands(data.data)
                }
            })
            .catch(err => console.error('Error loading brands:', err))
    }, [])

    useEffect(() => {
        // Load Car Models when brand is selected
        if (formData.carBrandId) {
            fetch(`/api/master/car-model?carBrandId=${formData.carBrandId}&limit=999`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data) {
                        setModels(data.data)
                    }
                })
                .catch(err => console.error('Error loading models:', err))
        } else {
            setModels([])
        }
    }, [formData.carBrandId])

    const handleCustomerSearch = async () => {
        if (!searchQuery.trim()) {
            showError('กรุณากรอกคำค้นหา')
            return
        }

        try {
            const res = await fetch(`/api/master/customer?search=${encodeURIComponent(searchQuery)}&limit=10`)
            const json = await res.json()

            if (json.success && json.data && json.data.length > 0) {
                const customer = json.data[0]
                setFoundCustomer(customer)
                setFormData(prev => ({ ...prev, customerId: customer.id }))
                setShowNewCustomerForm(false)
                showSuccess('พบข้อมูลลูกค้า')
            } else {
                setFoundCustomer(null)
                setFormData(prev => ({ ...prev, customerId: '' }))
                showError('ไม่พบข้อมูลลูกค้า')
            }
        } catch (error) {
            console.error('Error searching customer:', error)
            showError('เกิดข้อผิดพลาดในการค้นหา')
        }
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        setPhotos(files)

        // Generate preview URLs
        const previews = files.map(file => URL.createObjectURL(file))
        setPhotoPreview(previews)
    }

    const handleSubmit = async (openJob: boolean) => {
        // Validation
        if (!formData.licensePlate || !formData.carBrandId || !formData.carModelId) {
            showError('กรุณากรอกข้อมูลรถให้ครบถ้วน (ทะเบียน, ยี่ห้อ, รุ่น)')
            return
        }

        if (!foundCustomer && !showNewCustomerForm) {
            showError('กรุณาระบุลูกค้า หรือเพิ่มลูกค้าใหม่')
            return
        }

        if (showNewCustomerForm && (!formData.newCustomerFirstName || !formData.newCustomerPhone)) {
            showError('กรุณากรอกข้อมูลลูกค้าใหม่ให้ครบถ้วน')
            return
        }

        setSubmitting(true)
        try {
            let customerId = formData.customerId

            // 1. Create Customer if new
            if (showNewCustomerForm && !foundCustomer) {
                const custRes = await fetch('/api/master/customer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        firstName: formData.newCustomerFirstName,
                        lastName: formData.newCustomerLastName || '-',
                        phone: formData.newCustomerPhone,
                        email: formData.newCustomerEmail || null,
                        customerTypeId: 'C-GENERAL', // Default customer type
                    })
                })
                const custJson = await custRes.json()

                if (!custRes.ok || !custJson.success) {
                    throw new Error(custJson.error || 'สร้างลูกค้าไม่สำเร็จ')
                }
                customerId = custJson.data.id
            }

            // 2. Create Car
            const carPayload = {
                licensePlate: formData.licensePlate,
                province: formData.province,
                carBrandId: formData.carBrandId,
                carModelId: formData.carModelId,
                customerId: customerId,
                year: Number(formData.year),
                color: formData.color || null,
                mileage: Number(formData.mileage) || 0,
                vin: formData.vin || null,
                engineNo: formData.engineNo || null,
            }

            const carRes = await fetch('/api/master/car', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(carPayload)
            })
            const carJson = await carRes.json()

            if (!carRes.ok || !carJson.success) {
                throw new Error(carJson.error || 'สร้างรถไม่สำเร็จ')
            }

            const carId = carJson.data.id

            // 3. TODO: Upload photos if any (future enhancement)
            // For now, we skip photo upload as it requires file upload API

            showSuccess('✅ บันทึกข้อมูลรถเรียบร้อย')

            // Redirect based on action
            setTimeout(() => {
                if (openJob) {
                    router.push(`/ops/receive?carId=${carId}`)
                } else {
                    router.push(`/ops/car-detail/${carId}`)
                }
            }, 500)

        } catch (error: any) {
            console.error('Error submitting:', error)
            showError(error.message || 'เกิดข้อผิดพลาด')
        } finally {
            setSubmitting(false)
        }
    }

    // Get selected brand and model names for preview
    const selectedBrand = brands.find(b => b.id === formData.carBrandId)
    const selectedModel = models.find(m => m.id === formData.carModelId)

    return (
        <MainLayout
            title={<><i className="ti ti-car-garage me-2"></i>ลงทะเบียนรถใหม่</>}
            pretitle="Operations"
        >
            <div className="row">
                {/* Left Column - Forms */}
                <div className="col-lg-8">
                    {/* Card 1: ข้อมูลรถ */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="ti ti-car me-2"></i>ข้อมูลรถ
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                {/* License Plate - Large */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label required">ทะเบียนรถ</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        placeholder="เช่น กข-1234 หรือ 1กก-1234"
                                        value={formData.licensePlate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                                    />
                                </div>
                                {/* Province - Large */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">จังหวัด</label>
                                    <select
                                        className="form-select form-select-lg"
                                        value={formData.province}
                                        onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                                    >
                                        <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                                        <option value="นนทบุรี">นนทบุรี</option>
                                        <option value="ปทุมธานี">ปทุมธานี</option>
                                        <option value="สมุทรปราการ">สมุทรปราการ</option>
                                        <option value="นครปฐม">นครปฐม</option>
                                        <option value="สมุทรสาคร">สมุทรสาคร</option>
                                    </select>
                                </div>
                                {/* Brand */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label required">ยี่ห้อ</label>
                                    <select
                                        className="form-select"
                                        value={formData.carBrandId}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            carBrandId: e.target.value,
                                            carModelId: '' // Reset model
                                        }))}
                                    >
                                        <option value="">-- เลือก --</option>
                                        {brands.map(brand => (
                                            <option key={brand.id} value={brand.id}>
                                                {brand.nameEnglish || brand.nameThai}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {/* Model */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label required">รุ่น</label>
                                    <select
                                        className="form-select"
                                        value={formData.carModelId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, carModelId: e.target.value }))}
                                        disabled={!formData.carBrandId}
                                    >
                                        <option value="">-- เลือก --</option>
                                        {models.map(model => (
                                            <option key={model.id} value={model.id}>
                                                {model.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {/* Year */}
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">ปีรถ (พ.ศ.)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="2567"
                                        value={formData.year}
                                        onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
                                    />
                                </div>
                                {/* Color */}
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">สี</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="ขาว"
                                        value={formData.color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                    />
                                </div>
                                {/* Mileage */}
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">เลขไมล์</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="50000"
                                        value={formData.mileage || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, mileage: Number(e.target.value) }))}
                                    />
                                </div>
                                {/* VIN */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">เลขตัวถัง (VIN)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder=""
                                        value={formData.vin}
                                        onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value }))}
                                    />
                                </div>
                                {/* Engine No */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">เลขเครื่อง</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder=""
                                        value={formData.engineNo}
                                        onChange={(e) => setFormData(prev => ({ ...prev, engineNo: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: เจ้าของรถ */}
                    <div className="card mt-3">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="ti ti-user me-2"></i>เจ้าของรถ
                            </h3>
                        </div>
                        <div className="card-body">
                            {/* Customer Search */}
                            <div className="mb-3">
                                <label className="form-label">ค้นหาลูกค้า</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="พิมพ์ชื่อ, เบอร์โทร..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleCustomerSearch()}
                                    />
                                    <button
                                        className="btn btn-primary"
                                        type="button"
                                        onClick={handleCustomerSearch}
                                    >
                                        <i className="ti ti-search"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Found Customer Alert */}
                            {foundCustomer && (
                                <div className="alert alert-info">
                                    <div className="d-flex align-items-center">
                                        <span className="avatar avatar-lg bg-blue-lt me-3">
                                            {foundCustomer.firstName?.charAt(0) || 'C'}
                                        </span>
                                        <div>
                                            <h4 className="alert-title mb-0">{foundCustomer.fullName}</h4>
                                            <div>
                                                {foundCustomer.phone}
                                                {foundCustomer.email && ` | ${foundCustomer.email}`}
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-outline-danger ms-auto"
                                            onClick={() => {
                                                setFoundCustomer(null)
                                                setFormData(prev => ({ ...prev, customerId: '' }))
                                                setSearchQuery('')
                                            }}
                                        >
                                            <i className="ti ti-x"></i>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            {!foundCustomer && !showNewCustomerForm && (
                                <>
                                    <div className="text-center text-muted">- หรือ -</div>
                                    <button
                                        className="btn btn-outline-success w-100 mt-2"
                                        onClick={() => setShowNewCustomerForm(true)}
                                    >
                                        <i className="ti ti-user-plus me-1"></i>เพิ่มลูกค้าใหม่
                                    </button>
                                </>
                            )}

                            {/* New Customer Form */}
                            {showNewCustomerForm && !foundCustomer && (
                                <div className="card bg-success-lt mt-3">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h4 className="mb-0">
                                                <i className="ti ti-user-plus me-2"></i>ลงทะเบียนลูกค้าใหม่
                                            </h4>
                                            <button
                                                className="btn btn-sm btn-ghost-secondary"
                                                onClick={() => setShowNewCustomerForm(false)}
                                            >
                                                <i className="ti ti-x"></i>
                                            </button>
                                        </div>
                                        <div className="row g-2">
                                            <div className="col-md-6">
                                                <label className="form-label required">ชื่อ</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.newCustomerFirstName}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, newCustomerFirstName: e.target.value }))}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">นามสกุล</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.newCustomerLastName}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, newCustomerLastName: e.target.value }))}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label required">เบอร์โทร</label>
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    value={formData.newCustomerPhone}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, newCustomerPhone: e.target.value }))}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">อีเมล</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={formData.newCustomerEmail}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, newCustomerEmail: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Preview & Actions */}
                <div className="col-lg-4">
                    {/* Preview Card */}
                    <div className="card bg-azure-lt">
                        <div className="card-body text-center">
                            <i className="ti ti-car fs-1 text-azure mb-2"></i>
                            <h3>Preview</h3>
                            <div className="display-6 mb-2">
                                {formData.licensePlate || 'กข-1234'}
                            </div>
                            <div className="h4 text-muted">
                                {selectedBrand ? (selectedBrand.nameEnglish || selectedBrand.nameThai) : 'Toyota'}{' '}
                                {selectedModel ? selectedModel.name : 'Camry'}
                            </div>
                            <div className="text-muted">
                                ปี {formData.year || '2567'}
                                {formData.color && ` | สี${formData.color}`}
                            </div>
                        </div>
                    </div>

                    {/* Photo Upload Card */}
                    <div className="card mt-3">
                        <div className="card-body">
                            <h4 className="mb-3">
                                <i className="ti ti-camera me-2"></i>รูปถ่ายรถ
                            </h4>
                            <div className="mb-3">
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePhotoChange}
                                />
                            </div>
                            {/* Photo Preview Grid */}
                            <div className="row g-2">
                                {[0, 1, 2].map(index => (
                                    <div key={index} className="col-4">
                                        <div className="ratio ratio-1x1 bg-light border rounded d-flex align-items-center justify-content-center">
                                            {photoPreview[index] ? (
                                                <img
                                                    src={photoPreview[index]}
                                                    alt={`Preview ${index + 1}`}
                                                    className="img-fluid rounded"
                                                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                                />
                                            ) : (
                                                <i className="ti ti-photo text-muted fs-1"></i>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-grid gap-2 mt-3">
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => handleSubmit(false)}
                            disabled={submitting}
                        >
                            <i className="ti ti-device-floppy me-1"></i>
                            {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูลรถ'}
                        </button>
                        <button
                            className="btn btn-success btn-lg"
                            onClick={() => handleSubmit(true)}
                            disabled={submitting}
                        >
                            <i className="ti ti-plus me-1"></i>บันทึก + เปิดงานซ่อม
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
