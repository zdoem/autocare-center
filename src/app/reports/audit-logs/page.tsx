'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'

interface AuditLog {
    id: string
    action: string
    entity: string
    entityId: string | null
    entityCode: string | null
    details: any
    ipAddress: string | null
    userAgent: string | null
    userId: string | null
    userName: string | null
    userEmail: string | null
    userRole: string | null
    status: string
    createdAt: string
}

const ACTION_CONFIG: Record<string, { label: string; badgeClass: string; icon: string }> = {
    CREATE:       { label: 'สร้างใหม่',     badgeClass: 'bg-green text-white',      icon: 'ti-plus' },
    UPDATE:       { label: 'แก้ไขข้อมูล',   badgeClass: 'bg-blue text-white',       icon: 'ti-pencil' },
    DELETE:       { label: 'ลบรายการ',     badgeClass: 'bg-danger text-white',     icon: 'ti-trash' },
    CANCEL_ITEM:  { label: 'ยกเลิกรายการ',  badgeClass: 'bg-orange text-white',     icon: 'ti-ban' },
    STATUS_CHANGE:{ label: 'เปลี่ยนสถานะ', badgeClass: 'bg-cyan text-white',       icon: 'ti-arrows-shuffle' },
    PAYMENT:      { label: 'รับชำระเงิน',   badgeClass: 'bg-purple text-white',     icon: 'ti-cash' },
    LOGIN:        { label: 'เข้าสู่ระบบ',   badgeClass: 'bg-teal text-white',       icon: 'ti-login' },
    LOGOUT:       { label: 'ออกจากระบบ',   badgeClass: 'bg-secondary text-white',  icon: 'ti-logout' },
    BACKUP:       { label: 'สำรองข้อมูล',   badgeClass: 'bg-indigo text-white',     icon: 'ti-database' },
    EXPORT:       { label: 'ส่งออกข้อมูล',  badgeClass: 'bg-azure text-white',      icon: 'ti-download' },
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)

    // Filters
    const [actionFilter, setActionFilter] = useState('')
    const [entityFilter, setEntityFilter] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // Summary counts
    const [summary, setSummary] = useState({
        total: 0,
        totalCreates: 0,
        totalUpdates: 0,
        totalDeletes: 0,
    })

    // Selected modal detail
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

    useEffect(() => {
        fetchAuditLogs()
    }, [page, actionFilter, entityFilter, startDate, endDate])

    const fetchAuditLogs = async () => {
        try {
            setLoading(true)
            const query = new URLSearchParams()
            query.append('page', page.toString())
            query.append('limit', '20')
            if (actionFilter) query.append('action', actionFilter)
            if (entityFilter) query.append('entity', entityFilter)
            if (searchQuery) query.append('search', searchQuery)
            if (startDate) query.append('startDate', startDate)
            if (endDate) query.append('endDate', endDate)

            const res = await fetch(`/api/system/audit-logs?${query.toString()}`)
            const json = await res.json()
            if (json.success) {
                setLogs(json.data || [])
                setTotalPages(json.pagination.totalPages)
                setTotalCount(json.pagination.total)
                if (json.summary) setSummary(json.summary)
            } else {
                showError('โหลดข้อมูล Audit Logs ไม่สำเร็จ')
            }
        } catch (error) {
            showError('เกิดข้อผิดพลาดในการโหลด Audit Logs')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        fetchAuditLogs()
    }

    const handleExportJson = () => {
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit_logs_export_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString('th-TH', { year: '2-digit', month: '2-digit', day: '2-digit' }) +
               ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }

    const getActionBadge = (action: string) => {
        const conf = ACTION_CONFIG[action] || { label: action, badgeClass: 'bg-secondary text-white', icon: 'ti-activity' }
        return (
            <span className={`badge ${conf.badgeClass}`}>
                <i className={`ti ${conf.icon} me-1`}></i>{conf.label}
            </span>
        )
    }

    return (
        <MainLayout
            title={<><i className="ti ti-shield-lock me-2"></i>บันทึกประวัติการกระทำ (Audit Logs)</>}
            pretitle="ความปลอดภัยและการตรวจสอบระบบ (Security & Audit Trail)"
        >
            {/* KPI Cards */}
            <div className="row g-3 mb-3">
                <div className="col-sm-6 col-lg-3">
                    <div className="card card-sm">
                        <div className="card-body">
                            <div className="row align-items-center">
                                <div className="col-auto">
                                    <span className="bg-primary text-white avatar">
                                        <i className="ti ti-list-details fs-2"></i>
                                    </span>
                                </div>
                                <div className="col">
                                    <div className="font-weight-medium">บันทึกทั้งหมด</div>
                                    <div className="text-dark fs-3 fw-bold">{summary.total || totalCount} รายการ</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                    <div className="card card-sm">
                        <div className="card-body">
                            <div className="row align-items-center">
                                <div className="col-auto">
                                    <span className="bg-green text-white avatar">
                                        <i className="ti ti-plus fs-2"></i>
                                    </span>
                                </div>
                                <div className="col">
                                    <div className="font-weight-medium">สร้างรายการใหม่ (Create)</div>
                                    <div className="text-green fs-3 fw-bold">{summary.totalCreates} รายการ</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                    <div className="card card-sm">
                        <div className="card-body">
                            <div className="row align-items-center">
                                <div className="col-auto">
                                    <span className="bg-blue text-white avatar">
                                        <i className="ti ti-edit fs-2"></i>
                                    </span>
                                </div>
                                <div className="col">
                                    <div className="font-weight-medium">แก้ไข / ปรับปรุง (Update)</div>
                                    <div className="text-blue fs-3 fw-bold">{summary.totalUpdates} รายการ</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                    <div className="card card-sm">
                        <div className="card-body">
                            <div className="row align-items-center">
                                <div className="col-auto">
                                    <span className="bg-danger text-white avatar">
                                        <i className="ti ti-trash fs-2"></i>
                                    </span>
                                </div>
                                <div className="col">
                                    <div className="font-weight-medium">ลบรายการ (Delete)</div>
                                    <div className="text-danger fs-3 fw-bold">{summary.totalDeletes} รายการ</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card mb-3">
                <div className="card-body">
                    <form onSubmit={handleSearch} className="row g-2 align-items-center">
                        <div className="col-lg-3">
                            <div className="input-icon">
                                <span className="input-icon-addon"><i className="ti ti-search"></i></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="ค้นหารหัส, ผู้กระทำ, อีเมล, IP..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <select
                                className="form-select"
                                value={actionFilter}
                                onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
                            >
                                <option value="">ทุกการกระทำ (All Actions)</option>
                                <option value="CREATE">➕ สร้างใหม่ (CREATE)</option>
                                <option value="UPDATE">✏️ แก้ไขข้อมูล (UPDATE)</option>
                                <option value="CANCEL_ITEM">🚫 ยกเลิกรายการ (CANCEL)</option>
                                <option value="STATUS_CHANGE">🔄 เปลี่ยนสถานะ (STATUS)</option>
                                <option value="PAYMENT">💳 รับชำระเงิน (PAYMENT)</option>
                                <option value="LOGIN">🔑 เข้าสู่ระบบ (LOGIN)</option>
                                <option value="BACKUP">💾 สำรองข้อมูล (BACKUP)</option>
                                <option value="DELETE">🗑️ ลบรายการ (DELETE)</option>
                            </select>
                        </div>
                        <div className="col-lg-2">
                            <select
                                className="form-select"
                                value={entityFilter}
                                onChange={(e) => { setEntityFilter(e.target.value); setPage(1) }}
                            >
                                <option value="">ทุกโมดูล (All Entities)</option>
                                <option value="ServiceJob">🚗 ใบงานซ่อม (ServiceJob)</option>
                                <option value="ServiceJobItem">🔧 รายการซ่อม (ServiceJobItem)</option>
                                <option value="Spare">📦 อะไหล่ (Spare)</option>
                                <option value="Payment">💵 การเงิน (Payment)</option>
                                <option value="Customer">👤 ลูกค้า (Customer)</option>
                                <option value="Settings">⚙️ ตั้งค่าระบบ (Settings)</option>
                                <option value="Auth">🛡️ ความปลอดภัย (Auth)</option>
                            </select>
                        </div>
                        <div className="col-lg-2">
                            <input
                                type="date"
                                className="form-control"
                                title="ตั้งแต่วันที่"
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
                            />
                        </div>
                        <div className="col-lg-2">
                            <input
                                type="date"
                                className="form-control"
                                title="ถึงวันที่"
                                value={endDate}
                                onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
                            />
                        </div>
                        <div className="col-lg-1 d-flex gap-1">
                            <button type="submit" className="btn btn-primary flex-fill" title="ค้นหา">
                                <i className="ti ti-search"></i>
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-success"
                                title="ส่งออก JSON"
                                onClick={handleExportJson}
                            >
                                <i className="ti ti-download"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Audit Logs Table */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title"><i className="ti ti-history me-2"></i>ประวัติการตรวจสอบย้อนหลัง</h3>
                    <div className="card-actions text-muted small">
                        แสดง {logs.length} จาก {totalCount} รายการ (หน้า {page}/{totalPages})
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter table-hover card-table">
                        <thead>
                            <tr>
                                <th style={{ width: '150px' }}>วัน-เวลา</th>
                                <th style={{ width: '130px' }}>การกระทำ</th>
                                <th style={{ width: '130px' }}>โมดูล/Entity</th>
                                <th>รหัสอ้างอิง</th>
                                <th>ผู้ดำเนินการ</th>
                                <th>IP Address</th>
                                <th className="text-center" style={{ width: '80px' }}>สถานะ</th>
                                <th className="text-end" style={{ width: '100px' }}>รายละเอียด</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center text-muted py-4">
                                        ไม่พบบันทึก Audit Logs ตามเงื่อนไขที่เลือก
                                    </td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id}>
                                        <td className="small text-muted">{formatDate(log.createdAt)}</td>
                                        <td>{getActionBadge(log.action)}</td>
                                        <td>
                                            <span className="badge bg-blue-lt">{log.entity}</span>
                                        </td>
                                        <td>
                                            {log.entityCode ? (
                                                <code className="text-primary fw-bold">{log.entityCode}</code>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="fw-medium text-dark">{log.userName || 'System'}</div>
                                            {log.userRole && (
                                                <span className="small text-muted">{log.userRole}</span>
                                            )}
                                        </td>
                                        <td className="small font-monospace text-muted">{log.ipAddress || '-'}</td>
                                        <td className="text-center">
                                            <span className={`badge ${log.status === 'SUCCESS' ? 'bg-success' : 'bg-danger'} text-white`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-ghost-primary"
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                <i className="ti ti-eye me-1"></i>ดูข้อมูล
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="card-footer d-flex align-items-center justify-content-between">
                        <div className="text-muted small">
                            หน้า {page} จากทั้งหมด {totalPages} หน้า
                        </div>
                        <ul className="pagination m-0 ms-auto">
                            <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>
                                    <i className="ti ti-chevron-left me-1"></i>ก่อนหน้า
                                </button>
                            </li>
                            <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                                    ถัดไป<i className="ti ti-chevron-right ms-1"></i>
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Audit Log Detail Modal */}
            {selectedLog && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal modal-blur fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title">
                                        <i className="ti ti-file-analytics me-2"></i>
                                        รายละเอียด Audit Log #{selectedLog.id}
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedLog(null)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-4">
                                            <label className="text-muted small">การกระทำ (Action)</label>
                                            <div>{getActionBadge(selectedLog.action)}</div>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="text-muted small">โมดูล (Entity)</label>
                                            <div className="fw-bold fs-4">{selectedLog.entity}</div>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="text-muted small">รหัสอ้างอิง (Ref Code)</label>
                                            <div className="fw-bold fs-4 text-primary">{selectedLog.entityCode || '-'}</div>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="text-muted small">ผู้ดำเนินการ (User)</label>
                                            <div className="fw-medium">{selectedLog.userName} ({selectedLog.userRole || 'User'})</div>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="text-muted small">IP Address</label>
                                            <div className="font-monospace">{selectedLog.ipAddress || '-'}</div>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="text-muted small">วัน-เวลาบันทึก</label>
                                            <div>{formatDate(selectedLog.createdAt)}</div>
                                        </div>
                                    </div>

                                    <hr className="my-2" />

                                    <div>
                                        <label className="form-label fw-bold"><i className="ti ti-code me-1 text-primary"></i>ข้อมูลรายละเอียดการเปลี่ยนแปลง (Payload Diff / Details):</label>
                                        <pre className="bg-dark text-light p-3 rounded-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            <code>{JSON.stringify(selectedLog.details, null, 2)}</code>
                                        </pre>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setSelectedLog(null)}>
                                        ปิดหน้าต่าง
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </MainLayout>
    )
}
