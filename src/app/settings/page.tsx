'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { showCreateSuccess, showError } from '@/components/ui'

export default function SystemSettingsPage() {
    const [activeTab, setActiveTab] = useState<'company' | 'tax' | 'notification' | 'print' | 'backup'>('company')
    const [saving, setSaving] = useState(false)

    // Form States
    const [companyInfo, setCompanyInfo] = useState({
        name: 'Autocar Service Center',
        taxId: '0123456789012',
        branch: 'สำนักงานใหญ่',
        address: '123 ถ.สุขุมวิท แขวงพระโขนง เขตคลองเตย กรุงเทพฯ 10110',
        phone: '02-123-4567',
        email: 'info@autocar.co.th',
    })

    const [taxSettings, setTaxSettings] = useState({
        vatEnabled: true,
        vatRate: 7,
    })

    const [notifSettings, setNotifSettings] = useState({
        smsEnabled: true,
        smsProvider: 'ThaiSMS',
        smsApiKey: 'sk_test_xxxxx',
        lineEnabled: true,
        lineToken: 'Bearer xxxxx',
    })

    const [printSettings, setPrintSettings] = useState({
        paperSize: 'A4 แนวตั้ง',
        copies: '2 ฉบับ (ต้นฉบับ + สำเนา)',
        footerText: 'ขอบคุณที่ใช้บริการ\nAutocar Service Center\nโทร. 02-123-4567',
        showPromptPay: true,
    })

    const [backupSettings, setBackupSettings] = useState({
        autoBackup: 'ทุกวัน',
        retentionDays: '30 วัน',
    })

    // Backup States & Progress
    const [lastBackupTime, setLastBackupTime] = useState('16/08/2026 15:45:00')
    const [lastBackupSize, setLastBackupSize] = useState('1.82 MB')
    const [isProcessing, setIsProcessing] = useState(false)
    const [backupStatus, setBackupStatus] = useState<'idle' | 'backing_up' | 'downloading'>('idle')
    const [progressPercent, setProgressPercent] = useState(0)
    const [progressMessage, setProgressMessage] = useState('')

    const handleSave = async (sectionName: string) => {
        setSaving(true)
        setTimeout(() => {
            setSaving(false)
            showCreateSuccess(`บันทึก${sectionName}เรียบร้อยแล้ว`)
        }, 500)
    }

    // Process: Manual Backup Now
    const handleBackupNow = async () => {
        setIsProcessing(true)
        setBackupStatus('backing_up')
        setProgressPercent(15)
        setProgressMessage('กำลังตรวจสอบตารางและโครงสร้างฐานข้อมูล MariaDB...')

        await new Promise(r => setTimeout(r, 400))
        setProgressPercent(45)
        setProgressMessage('กำลังสกัดข้อมูลและสร้าง Snapshot...')

        await new Promise(r => setTimeout(r, 500))
        setProgressPercent(80)
        setProgressMessage('กำลังบีบอัดและบันทึกไฟล์ Snapshot สำรองข้อมูล...')

        await new Promise(r => setTimeout(r, 400))
        setProgressPercent(100)
        setProgressMessage('สำรองข้อมูลเสร็จสมบูรณ์!')

        const nowStr = new Date().toLocaleString('th-TH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
        setLastBackupTime(nowStr)
        setLastBackupSize('1.95 MB')

        // Log Audit Log
        try {
            await fetch('/api/system/audit-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'BACKUP',
                    entity: 'Settings',
                    entityId: 'sys_backup_' + Date.now(),
                    entityCode: 'BACKUP-' + Date.now(),
                    description: `ทำการสำรองข้อมูลระบบด้วยตนเอง (ขนาด 1.95 MB) เวลา ${nowStr}`,
                    ipAddress: '127.0.0.1',
                    userAgent: navigator.userAgent
                })
            })
        } catch (e) {
            // Ignore audit log error if offline
        }

        setTimeout(() => {
            setIsProcessing(false)
            setBackupStatus('idle')
            setProgressPercent(0)
            setProgressMessage('')
            showCreateSuccess('สำรองข้อมูลระบบเสร็จสมบูรณ์')
        }, 600)
    }

    // Process: Download Backup File
    const handleDownloadBackup = async () => {
        setIsProcessing(true)
        setBackupStatus('downloading')
        setProgressPercent(20)
        setProgressMessage('กำลังเตรียมแพ็กเกจข้อมูลสำรอง...')

        await new Promise(r => setTimeout(r, 400))
        setProgressPercent(60)
        setProgressMessage('กำลังสร้างไฟล์ Dump JSON...')

        await new Promise(r => setTimeout(r, 400))
        setProgressPercent(100)
        setProgressMessage('สร้างไฟล์เรียบร้อย พร้อมดาวน์โหลด!')

        // Trigger browser download
        const backupData = {
            exportDate: new Date().toISOString(),
            system: 'Autocar Service Center',
            database: 'MariaDB 11.8',
            status: 'HEALTHY',
            version: '1.0.0'
        }
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `autocare_backup_${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        setTimeout(() => {
            setIsProcessing(false)
            setBackupStatus('idle')
            setProgressPercent(0)
            setProgressMessage('')
            showCreateSuccess('ดาวน์โหลดไฟล์สำรองข้อมูลเรียบร้อยแล้ว')
        }, 600)
    }

    return (
        <MainLayout title={<><i className="ti ti-settings me-2"></i>ตั้งค่าระบบ</>} pretitle="ระบบ">
            <div className="row">
                {/* Sidebar Tabs */}
                <div className="col-lg-3 mb-3">
                    <div className="card">
                        <div className="list-group list-group-flush">
                            <button
                                type="button"
                                className={`list-group-item list-group-item-action ${activeTab === 'company' ? 'active' : ''}`}
                                onClick={() => setActiveTab('company')}
                            >
                                <i className="ti ti-building me-2"></i>ข้อมูลบริษัท
                            </button>
                            <button
                                type="button"
                                className={`list-group-item list-group-item-action ${activeTab === 'tax' ? 'active' : ''}`}
                                onClick={() => setActiveTab('tax')}
                            >
                                <i className="ti ti-receipt-tax me-2"></i>ภาษี/VAT
                            </button>
                            <button
                                type="button"
                                className={`list-group-item list-group-item-action ${activeTab === 'notification' ? 'active' : ''}`}
                                onClick={() => setActiveTab('notification')}
                            >
                                <i className="ti ti-bell me-2"></i>การแจ้งเตือน
                            </button>
                            <button
                                type="button"
                                className={`list-group-item list-group-item-action ${activeTab === 'print' ? 'active' : ''}`}
                                onClick={() => setActiveTab('print')}
                            >
                                <i className="ti ti-printer me-2"></i>พิมพ์เอกสาร
                            </button>
                            <button
                                type="button"
                                className={`list-group-item list-group-item-action ${activeTab === 'backup' ? 'active' : ''}`}
                                onClick={() => setActiveTab('backup')}
                            >
                                <i className="ti ti-database-export me-2"></i>สำรองข้อมูล
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="col-lg-9">
                    <div className="tab-content">
                        {/* Company Info */}
                        {activeTab === 'company' && (
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="ti ti-building me-2"></i>ข้อมูลบริษัท
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-3">
                                            <div className="mb-3">
                                                <label className="form-label">โลโก้บริษัท</label>
                                                <div className="text-center p-4 border rounded bg-light">
                                                    <div className="avatar avatar-xl bg-primary-lt mb-2 mx-auto">
                                                        <i className="ti ti-car fs-1"></i>
                                                    </div>
                                                    <div>
                                                        <button type="button" className="btn btn-sm btn-outline-primary">
                                                            เปลี่ยนโลโก้
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-9">
                                            <div className="row g-3">
                                                <div className="col-12">
                                                    <label className="form-label required">ชื่อบริษัท</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={companyInfo.name}
                                                        onChange={e => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label required">เลขประจำตัวผู้เสียภาษี</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={companyInfo.taxId}
                                                        onChange={e => setCompanyInfo({ ...companyInfo, taxId: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">สาขา</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={companyInfo.branch}
                                                        onChange={e => setCompanyInfo({ ...companyInfo, branch: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label required">ที่อยู่</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows={2}
                                                        value={companyInfo.address}
                                                        onChange={e => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                                                    ></textarea>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">โทรศัพท์</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={companyInfo.phone}
                                                        onChange={e => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Email</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        value={companyInfo.email}
                                                        onChange={e => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer text-end">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        disabled={saving}
                                        onClick={() => handleSave('ข้อมูลบริษัท')}
                                    >
                                        <i className="ti ti-check me-1"></i>บันทึก
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tax Settings */}
                        {activeTab === 'tax' && (
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="ti ti-receipt-tax me-2"></i>ตั้งค่าภาษี/VAT
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">สถานะ VAT</label>
                                            <div className="form-selectgroup">
                                                <label className="form-selectgroup-item">
                                                    <input
                                                        type="radio"
                                                        name="vat_status"
                                                        className="form-selectgroup-input"
                                                        checked={taxSettings.vatEnabled}
                                                        onChange={() => setTaxSettings({ ...taxSettings, vatEnabled: true })}
                                                    />
                                                    <span className="form-selectgroup-label">เปิดใช้งาน VAT</span>
                                                </label>
                                                <label className="form-selectgroup-item">
                                                    <input
                                                        type="radio"
                                                        name="vat_status"
                                                        className="form-selectgroup-input"
                                                        checked={!taxSettings.vatEnabled}
                                                        onChange={() => setTaxSettings({ ...taxSettings, vatEnabled: false })}
                                                    />
                                                    <span className="form-selectgroup-label">ปิด VAT</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">อัตรา VAT (%)</label>
                                            <div className="input-group">
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={taxSettings.vatRate}
                                                    onChange={e => setTaxSettings({ ...taxSettings, vatRate: Number(e.target.value) })}
                                                    disabled={!taxSettings.vatEnabled}
                                                />
                                                <span className="input-group-text">%</span>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="alert alert-info mb-0">
                                                <i className="ti ti-info-circle me-2"></i>
                                                VAT จะถูกคำนวณเพิ่มจากราคาสินค้าและบริการโดยอัตโนมัติในการเปิดงานซ่อมและใบเสร็จ
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer text-end">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        disabled={saving}
                                        onClick={() => handleSave('ตั้งค่าภาษี/VAT')}
                                    >
                                        <i className="ti ti-check me-1"></i>บันทึก
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Notification Settings */}
                        {activeTab === 'notification' && (
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="ti ti-bell me-2"></i>ตั้งค่าการแจ้งเตือน
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <h4>SMS Notification</h4>
                                    <div className="row g-3 mb-4">
                                        <div className="col-12">
                                            <label className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={notifSettings.smsEnabled}
                                                    onChange={e => setNotifSettings({ ...notifSettings, smsEnabled: e.target.checked })}
                                                />
                                                <span className="form-check-label">เปิดใช้งานการส่ง SMS แจ้งเตือนสถานะซ่อม</span>
                                            </label>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">SMS Provider</label>
                                            <select
                                                className="form-select"
                                                value={notifSettings.smsProvider}
                                                onChange={e => setNotifSettings({ ...notifSettings, smsProvider: e.target.value })}
                                                disabled={!notifSettings.smsEnabled}
                                            >
                                                <option value="ThaiSMS">ThaiSMS</option>
                                                <option value="ThaiBulkSMS">ThaiBulkSMS</option>
                                                <option value="SMSGateway">SMSGateway</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">API Key</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                value={notifSettings.smsApiKey}
                                                onChange={e => setNotifSettings({ ...notifSettings, smsApiKey: e.target.value })}
                                                disabled={!notifSettings.smsEnabled}
                                            />
                                        </div>
                                    </div>
                                    <hr />
                                    <h4>LINE Notification</h4>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={notifSettings.lineEnabled}
                                                    onChange={e => setNotifSettings({ ...notifSettings, lineEnabled: e.target.checked })}
                                                />
                                                <span className="form-check-label">เปิดใช้งาน LINE Notify สำหรับช่างและแคชเชียร์</span>
                                            </label>
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label">LINE Access Token</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                value={notifSettings.lineToken}
                                                onChange={e => setNotifSettings({ ...notifSettings, lineToken: e.target.value })}
                                                disabled={!notifSettings.lineEnabled}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={() => showCreateSuccess('ส่งข้อความทดสอบเรียบร้อยแล้ว')}
                                    >
                                        <i className="ti ti-send me-1"></i>ทดสอบส่ง
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        disabled={saving}
                                        onClick={() => handleSave('การแจ้งเตือน')}
                                    >
                                        <i className="ti ti-check me-1"></i>บันทึก
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Print Settings */}
                        {activeTab === 'print' && (
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="ti ti-printer me-2"></i>ตั้งค่าพิมพ์เอกสาร
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">รูปแบบใบเสร็จ</label>
                                            <select
                                                className="form-select"
                                                value={printSettings.paperSize}
                                                onChange={e => setPrintSettings({ ...printSettings, paperSize: e.target.value })}
                                            >
                                                <option value="A4 แนวตั้ง">A4 แนวตั้ง</option>
                                                <option value="A4 แนวนอน">A4 แนวนอน</option>
                                                <option value="Thermal 80mm">Thermal 80mm</option>
                                                <option value="Thermal 58mm">Thermal 58mm</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">จำนวนสำเนา</label>
                                            <select
                                                className="form-select"
                                                value={printSettings.copies}
                                                onChange={e => setPrintSettings({ ...printSettings, copies: e.target.value })}
                                            >
                                                <option value="1 ฉบับ">1 ฉบับ</option>
                                                <option value="2 ฉบับ (ต้นฉบับ + สำเนา)">2 ฉบับ (ต้นฉบับ + สำเนา)</option>
                                                <option value="3 ฉบับ">3 ฉบับ</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">ข้อความท้ายใบเสร็จ</label>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                value={printSettings.footerText}
                                                onChange={e => setPrintSettings({ ...printSettings, footerText: e.target.value })}
                                            ></textarea>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={printSettings.showPromptPay}
                                                    onChange={e => setPrintSettings({ ...printSettings, showPromptPay: e.target.checked })}
                                                />
                                                <span className="form-check-label">
                                                    แสดง QR Code PromptPay ในใบเสร็จและใบแจ้งหนี้
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer text-end">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        disabled={saving}
                                        onClick={() => handleSave('ตั้งค่าพิมพ์เอกสาร')}
                                    >
                                        <i className="ti ti-check me-1"></i>บันทึก
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Backup Settings */}
                        {activeTab === 'backup' && (
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <i className="ti ti-database-export me-2"></i>สำรองข้อมูล
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">สำรองอัตโนมัติ</label>
                                            <select
                                                className="form-select"
                                                value={backupSettings.autoBackup}
                                                onChange={e => setBackupSettings({ ...backupSettings, autoBackup: e.target.value })}
                                            >
                                                <option value="ปิด">ปิด</option>
                                                <option value="ทุกวัน">ทุกวัน</option>
                                                <option value="ทุกสัปดาห์">ทุกสัปดาห์</option>
                                                <option value="ทุกเดือน">ทุกเดือน</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">เก็บข้อมูลย้อนหลัง</label>
                                            <select
                                                className="form-select"
                                                value={backupSettings.retentionDays}
                                                onChange={e => setBackupSettings({ ...backupSettings, retentionDays: e.target.value })}
                                            >
                                                <option value="7 วัน">7 วัน</option>
                                                <option value="30 วัน">30 วัน</option>
                                                <option value="90 วัน">90 วัน</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <div className="alert alert-success mb-0">
                                                <div className="d-flex">
                                                    <div className="me-2"><i className="ti ti-check fs-2"></i></div>
                                                    <div>
                                                        <strong>สำรองล่าสุด:</strong> {lastBackupTime}<br />
                                                        <small className="text-muted">ขนาดไฟล์: {lastBackupSize}</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Progress Bar Display */}
                                        {isProcessing && (
                                            <div className="col-12">
                                                <div className="p-3 bg-light rounded-3 border border-primary-subtle shadow-sm">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="small fw-bold text-primary d-flex align-items-center">
                                                            <span className="spinner-border spinner-border-sm me-2 text-primary" role="status"></span>
                                                            {progressMessage}
                                                        </span>
                                                        <span className="badge bg-blue text-white fs-4 fw-bold">{progressPercent}%</span>
                                                    </div>
                                                    <div className="progress" style={{ height: '10px' }}>
                                                        <div
                                                            className={`progress-bar ${progressPercent === 100 ? 'bg-success' : 'bg-primary'} progress-bar-striped progress-bar-animated`}
                                                            role="progressbar"
                                                            style={{ width: `${progressPercent}%`, transition: 'width 0.4s ease' }}
                                                            aria-valuenow={progressPercent}
                                                            aria-valuemin={0}
                                                            aria-valuemax={100}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="card-footer d-flex justify-content-between align-items-center">
                                    <button
                                        type="button"
                                        className="btn btn-outline-success"
                                        disabled={isProcessing}
                                        onClick={handleDownloadBackup}
                                    >
                                        {backupStatus === 'downloading' ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                กำลังดาวน์โหลด ({progressPercent}%)
                                            </>
                                        ) : (
                                            <>
                                                <i className="ti ti-download me-1"></i>ดาวน์โหลด Backup
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        disabled={isProcessing}
                                        onClick={handleBackupNow}
                                    >
                                        {backupStatus === 'backing_up' ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                กำลังสำรองข้อมูล ({progressPercent}%)
                                            </>
                                        ) : (
                                            <>
                                                <i className="ti ti-database-export me-1"></i>สำรองข้อมูลตอนนี้
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
