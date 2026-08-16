'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { showError } from '@/components/ui'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
)

interface ApiUsageLog {
    id: string
    endpoint: string
    method: string
    statusCode: number
    responseTime: number
    ipAddress: string | null
    userId: string | null
    errorMessage: string | null
    createdAt: string
}

interface EndpointMetric {
    endpoint: string
    method: string
    count: number
    avgLatency: number
    errorRate: number
}

interface MetricsSummary {
    totalRequests: number
    avgLatency: number
    successRate: number
    status2xx: number
    status4xx: number
    status5xx: number
    topEndpoints: EndpointMetric[]
    slowestEndpoints: EndpointMetric[]
}

const METHOD_COLORS: Record<string, string> = {
    GET: 'bg-blue text-white',
    POST: 'bg-green text-white',
    PUT: 'bg-yellow text-white',
    PATCH: 'bg-orange text-white',
    DELETE: 'bg-danger text-white',
}

export default function ApiUsageReportPage() {
    const [logs, setLogs] = useState<ApiUsageLog[]>([])
    const [metrics, setMetrics] = useState<MetricsSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)

    // Filters
    const [methodFilter, setMethodFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [autoRefresh, setAutoRefresh] = useState(false)

    useEffect(() => {
        fetchApiUsage()
    }, [page, methodFilter, statusFilter])

    useEffect(() => {
        let interval: any
        if (autoRefresh) {
            interval = setInterval(() => {
                fetchApiUsage()
            }, 5000)
        }
        return () => {
            if (interval) clearInterval(interval)
        }
    }, [autoRefresh, page, methodFilter, statusFilter, searchQuery])

    const fetchApiUsage = async () => {
        try {
            setLoading(true)
            const query = new URLSearchParams()
            query.append('page', page.toString())
            query.append('limit', '25')
            if (methodFilter) query.append('method', methodFilter)
            if (statusFilter) query.append('statusCode', statusFilter)
            if (searchQuery) query.append('search', searchQuery)

            const res = await fetch(`/api/system/api-usage?${query.toString()}`)
            const json = await res.json()
            if (json.success) {
                setLogs(json.data || [])
                setTotalPages(json.pagination.totalPages)
                setTotalCount(json.pagination.total)
                if (json.metrics) setMetrics(json.metrics)
            } else {
                showError('โหลดสถิติ API ไม่สำเร็จ')
            }
        } catch (error) {
            showError('เกิดข้อผิดพลาดในการโหลดสถิติ API')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        fetchApiUsage()
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString('th-TH', { year: '2-digit', month: '2-digit', day: '2-digit' }) +
               ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }

    const getStatusBadge = (code: number) => {
        if (code >= 200 && code < 300) return <span className="badge bg-green text-white font-monospace">{code} OK</span>
        if (code >= 300 && code < 400) return <span className="badge bg-blue text-white font-monospace">{code}</span>
        if (code >= 400 && code < 500) return <span className="badge bg-warning text-white font-monospace">{code} Bad Req</span>
        return <span className="badge bg-danger text-white font-monospace">{code} Error</span>
    }

    const getLatencyBadge = (ms: number) => {
        if (ms < 100) return <span className="badge bg-green-lt text-green font-monospace fw-bold">{ms} ms</span>
        if (ms < 300) return <span className="badge bg-yellow-lt text-yellow font-monospace fw-bold">{ms} ms</span>
        return <span className="badge bg-danger-lt text-danger font-monospace fw-bold">{ms} ms</span>
    }

    // Chart Data 1: Top Endpoints Calls & Latency
    const topEndpointsData = {
        labels: metrics?.topEndpoints.slice(0, 6).map(e => e.endpoint.length > 22 ? e.endpoint.slice(0, 20) + '...' : e.endpoint) || [],
        datasets: [
            {
                label: 'จำนวนครั้งที่เรียก (Calls)',
                data: metrics?.topEndpoints.slice(0, 6).map(e => e.count) || [],
                backgroundColor: 'rgba(32, 107, 196, 0.85)',
                borderColor: '#206bc4',
                borderWidth: 1,
                borderRadius: 4,
                yAxisID: 'y',
            },
            {
                label: 'เวลาตอบสนองเฉลี่ย (ms)',
                data: metrics?.topEndpoints.slice(0, 6).map(e => e.avgLatency) || [],
                backgroundColor: 'rgba(247, 103, 7, 0.85)',
                borderColor: '#f76707',
                borderWidth: 1,
                borderRadius: 4,
                yAxisID: 'y1',
            }
        ]
    }

    const topEndpointsOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' as const },
            tooltip: { mode: 'index' as const, intersect: false }
        },
        scales: {
            x: { grid: { display: false } },
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: { display: true, text: 'จำนวนครั้ง (Calls)' },
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                grid: { drawOnChartArea: false },
                title: { display: true, text: 'Latency (ms)' },
            }
        }
    }

    // Chart Data 2: Status Code Doughnut
    const statusCodeData = {
        labels: ['2xx สำเร็จ (Success)', '4xx Client Error', '5xx Server Error'],
        datasets: [
            {
                data: [
                    metrics?.status2xx || (metrics?.totalRequests ? metrics.totalRequests : 1),
                    metrics?.status4xx || 0,
                    metrics?.status5xx || 0,
                ],
                backgroundColor: ['#2fb344', '#f59f00', '#d63939'],
                borderColor: ['#ffffff', '#ffffff', '#ffffff'],
                borderWidth: 2,
            }
        ]
    }

    const statusCodeOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const }
        },
        cutout: '70%',
    }

    return (
        <MainLayout
            title={<><i className="ti ti-activity me-2"></i>สถิติการใช้งาน API & สุขภาพระบบ</>}
            pretitle="การตรวจสอบประสิทธิภาพและความพร้อมใช้งาน (API Telemetry & Health)"
        >
            {/* Top Metrics Cards */}
            <div className="row g-3 mb-3">
                <div className="col-sm-6 col-lg-3">
                    <div className="card card-sm">
                        <div className="card-body">
                            <div className="row align-items-center">
                                <div className="col-auto">
                                    <span className="bg-primary text-white avatar">
                                        <i className="ti ti-access-point fs-2"></i>
                                    </span>
                                </div>
                                <div className="col">
                                    <div className="font-weight-medium">คำขอทั้งหมด (Total Calls)</div>
                                    <div className="text-dark fs-3 fw-bold">{metrics?.totalRequests || totalCount} ครั้ง</div>
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
                                    <span className="bg-cyan text-white avatar">
                                        <i className="ti ti-bolt fs-2"></i>
                                    </span>
                                </div>
                                <div className="col">
                                    <div className="font-weight-medium">ความเร็วเฉลี่ย (Avg Latency)</div>
                                    <div className="text-cyan fs-3 fw-bold">{metrics?.avgLatency || 0} ms</div>
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
                                        <i className="ti ti-circle-check fs-2"></i>
                                    </span>
                                </div>
                                <div className="col">
                                    <div className="font-weight-medium">อัตราสำเร็จ (Success Rate)</div>
                                    <div className="text-green fs-3 fw-bold">{metrics?.successRate || 100}%</div>
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
                                        <i className="ti ti-alert-triangle fs-2"></i>
                                    </span>
                                </div>
                                <div className="col">
                                    <div className="font-weight-medium">ข้อผิดพลาด (Errors)</div>
                                    <div className="text-danger fs-3 fw-bold">
                                        {(metrics?.status4xx || 0) + (metrics?.status5xx || 0)} รายการ
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 📊 Interactive Charts Row */}
            <div className="row g-3 mb-3">
                {/* Chart 1: Bar Chart of Top Endpoints & Latency */}
                <div className="col-lg-8">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h3 className="card-title">
                                <i className="ti ti-chart-bar me-2 text-primary"></i>
                                กราฟแสดงความถี่การเรียกใช้งานและเวลาตอบสนอง (Top API Endpoints & Latency)
                            </h3>
                            <span className="badge bg-blue-lt">Real-time Telemetry</span>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '280px' }}>
                                <Bar data={topEndpointsData} options={topEndpointsOptions} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart 2: Doughnut Chart of HTTP Status Codes */}
                <div className="col-lg-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="ti ti-chart-pie me-2 text-success"></i>
                                สัดส่วนสถานะการตอบกลับ (HTTP Status)
                            </h3>
                        </div>
                        <div className="card-body d-flex flex-column align-items-center justify-content-center">
                            <div style={{ height: '210px', width: '100%' }}>
                                <Doughnut data={statusCodeData} options={statusCodeOptions} />
                            </div>
                            <div className="d-flex justify-content-around w-100 mt-2 text-center small">
                                <div>
                                    <div className="text-success fw-bold">{metrics?.status2xx || 0}</div>
                                    <span className="text-muted">2xx สำเร็จ</span>
                                </div>
                                <div>
                                    <div className="text-warning fw-bold">{metrics?.status4xx || 0}</div>
                                    <span className="text-muted">4xx ผิดพลาด</span>
                                </div>
                                <div>
                                    <div className="text-danger fw-bold">{metrics?.status5xx || 0}</div>
                                    <span className="text-muted">5xx ระบบล่ม</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table of Top 10 Most Active Endpoints */}
            <div className="card mb-3">
                <div className="card-header">
                    <h3 className="card-title"><i className="ti ti-list-numbers me-2 text-primary"></i>ตารางแจกแจง 10 อันดับ API ที่ถูกเรียกใช้งานสูงสุด</h3>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter table-hover card-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>Method</th>
                                <th>Endpoint Path</th>
                                <th className="text-center" style={{ width: '110px' }}>จำนวนครั้งที่เรียก</th>
                                <th className="text-center" style={{ width: '120px' }}>เวลาเฉลี่ย (Latency)</th>
                                <th className="text-center" style={{ width: '100px' }}>อัตรา Error</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!metrics || metrics.topEndpoints.length === 0 ? (
                                <tr><td colSpan={5} className="text-center text-muted py-3">ยังไม่มีข้อมูลสถิติ</td></tr>
                            ) : (
                                metrics.topEndpoints.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <span className={`badge ${METHOD_COLORS[item.method] || 'bg-secondary'}`}>
                                                {item.method}
                                            </span>
                                        </td>
                                        <td><code className="text-dark fw-bold">{item.endpoint}</code></td>
                                        <td className="text-center fw-bold">{item.count.toLocaleString()} ครั้ง</td>
                                        <td className="text-center">{getLatencyBadge(item.avgLatency)}</td>
                                        <td className="text-center">
                                            <span className={`badge ${item.errorRate > 0 ? 'bg-danger text-white' : 'bg-green-lt text-green'}`}>
                                                {item.errorRate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card mb-3">
                <div className="card-body">
                    <form onSubmit={handleSearch} className="row g-2 align-items-center">
                        <div className="col-lg-4">
                            <div className="input-icon">
                                <span className="input-icon-addon"><i className="ti ti-search"></i></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="ค้นหา Endpoint, IP, ข้อความ Error..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-lg-3">
                            <select
                                className="form-select"
                                value={methodFilter}
                                onChange={(e) => { setMethodFilter(e.target.value); setPage(1) }}
                            >
                                <option value="">ทุก Method (ALL)</option>
                                <option value="GET">GET (เรียกดู)</option>
                                <option value="POST">POST (สร้างข้อมูล)</option>
                                <option value="PUT">PUT (อัปเดต)</option>
                                <option value="PATCH">PATCH (ปรับปรุง)</option>
                                <option value="DELETE">DELETE (ลบข้อมูล)</option>
                            </select>
                        </div>
                        <div className="col-lg-3">
                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                            >
                                <option value="">ทุก HTTP Status</option>
                                <option value="200">200 OK</option>
                                <option value="201">201 Created</option>
                                <option value="400">400 Bad Request</option>
                                <option value="404">404 Not Found</option>
                                <option value="500">500 Internal Error</option>
                            </select>
                        </div>
                        <div className="col-lg-2 d-flex gap-2">
                            <button type="submit" className="btn btn-primary flex-fill">
                                <i className="ti ti-search me-1"></i>ค้นหา
                            </button>
                            <button
                                type="button"
                                className={`btn ${autoRefresh ? 'btn-success' : 'btn-outline-secondary'}`}
                                title="เปิด/ปิดการรีเฟรชสดอัตโนมัติทุก 5 วินาที"
                                onClick={() => setAutoRefresh(!autoRefresh)}
                            >
                                <i className={`ti ti-refresh ${autoRefresh ? 'spin' : ''}`}></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Live Request Log Table */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title"><i className="ti ti-history me-2"></i>ประวัติการเรียกใช้งาน API (Live Request Log)</h3>
                    <div className="card-actions text-muted small">
                        แสดง {logs.length} จาก {totalCount} รายการ (หน้า {page}/{totalPages})
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-vcenter table-hover card-table">
                        <thead>
                            <tr>
                                <th style={{ width: '150px' }}>วัน-เวลา</th>
                                <th style={{ width: '80px' }}>Method</th>
                                <th>Endpoint Path</th>
                                <th className="text-center" style={{ width: '130px' }}>Status</th>
                                <th className="text-center" style={{ width: '110px' }}>Response Time</th>
                                <th>IP Address</th>
                                <th>ข้อความ Error (ถ้ามี)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center text-muted py-4">
                                        ไม่พบประวัติการเรียกใช้งาน API ตามเงื่อนไข
                                    </td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id}>
                                        <td className="small text-muted">{formatDate(log.createdAt)}</td>
                                        <td>
                                            <span className={`badge ${METHOD_COLORS[log.method] || 'bg-secondary'}`}>
                                                {log.method}
                                            </span>
                                        </td>
                                        <td><code className="text-dark fw-bold">{log.endpoint}</code></td>
                                        <td className="text-center">{getStatusBadge(log.statusCode)}</td>
                                        <td className="text-center">{getLatencyBadge(log.responseTime)}</td>
                                        <td className="small font-monospace text-muted">{log.ipAddress || '-'}</td>
                                        <td>
                                            {log.errorMessage ? (
                                                <span className="text-danger small">{log.errorMessage}</span>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
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
        </MainLayout>
    )
}
