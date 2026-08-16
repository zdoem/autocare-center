/**
 * ไฟล์: app/cash/receipt/[id]/page.tsx
 * จุดประสงค์: หน้าสำหรับพิมพ์ใบเสร็จรับเงิน (Cash Receipt)
 *             ออกแบบ PDF A4 / Print-friendly layout
 */

'use client'

import { useState, useEffect, use } from 'react'
import { COMPANY } from '@/lib/companyConfig'

// ─── Helpers ────────────────────────────────────────────────

const fmtNumber = (n: number) =>
    new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

const fmtDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric',
    })

// ─── Print CSS ──────────────────────────────────────────────

const PRINT_STYLES = `
/* ── Base Reset for Print ── */
@media print {
    @page {
        size: A4 portrait;
        margin: 12mm 15mm;
    }
    html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
    /* Hide everything outside print area */
    .no-print { display: none !important; }
    aside, header, footer, nav,
    .page-header, .navbar { display: none !important; }
}

/* ── A4 Container ── */
.a4-page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 15mm;
    background: #fff;
    font-family: 'Noto Sans Thai', 'Sarabun', 'Tahoma', sans-serif;
    font-size: 11pt;
    color: #000;
    line-height: 1.5;
    box-sizing: border-box;
}

/* On screen: show shadow for preview */
@media screen {
    .a4-page {
        box-shadow: 0 0 12px rgba(0,0,0,0.15);
        margin-top: 20px;
        margin-bottom: 20px;
    }
    body {
        background: #e8e8e8 !important;
    }
}

/* ── Document Header ── */
.doc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8mm;
    padding-bottom: 4mm;
    border-bottom: 3px solid #2697cb;
}

.doc-company {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.doc-company-logo {
    flex-shrink: 0;
}

.doc-company-logo img {
    object-fit: contain;
}

.doc-company-info h1 {
    font-size: 16pt;
    font-weight: 700;
    margin: 0 0 2px 0;
    color: #2697cb;
}

.doc-company-info p {
    margin: 0;
    font-size: 9pt;
    color: #000;
}

.doc-title-block {
    text-align: right;
    flex-shrink: 0;
}

.doc-title-block h2 {
    font-size: 18pt;
    font-weight: 700;
    margin: 0 0 2px 0;
    color: #2697cb;
}

.doc-title-block .doc-subtitle {
    font-size: 11pt;
    color: #333;
    margin: 0;
}

.doc-title-block .doc-meta {
    font-size: 10pt;
    color: #000;
    margin: 2px 0 0;
}

/* ── Info Sections ── */
.doc-info-row {
    display: flex;
    gap: 10mm;
    margin-bottom: 6mm;
}

.doc-info-block {
    flex: 1;
    border: 1px solid #b3ddf0;
    border-radius: 4px;
    padding: 8px 12px;
    background: #f7fbfe;
}

.doc-info-block h3 {
    font-size: 10pt;
    font-weight: 700;
    color: #2697cb;
    margin: 0 0 4px 0;
    padding-bottom: 3px;
    border-bottom: 1px solid #b3ddf0;
    text-transform: uppercase;
}

.doc-info-block .info-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1px 8px;
    font-size: 10pt;
}

.doc-info-block .info-label {
    font-weight: 600;
    white-space: nowrap;
    color: #000;
}

.doc-info-block .info-value {
    color: #000;
}

/* ── Items Table ── */
.doc-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 4mm;
    font-size: 10pt;
}

.doc-table th {
    background: #d0eaf6;
    color: #1a6f96;
    padding: 6px 8px;
    text-align: left;
    font-weight: 600;
    font-size: 9.5pt;
    border: 1px solid #b3ddf0;
}

.doc-table th.text-center { text-align: center; }
.doc-table th.text-right  { text-align: right; }

.doc-table td {
    padding: 5px 8px;
    border: 1px solid #ccc;
    color: #000;
    vertical-align: top;
}

.doc-table td.text-center { text-align: center; }
.doc-table td.text-right  { text-align: right; }

.doc-table tbody tr:nth-child(even) {
    background: #e8f4fa;
}

.doc-table .item-desc {
    font-weight: 500;
}

.doc-table .item-type {
    font-size: 8.5pt;
    color: #555;
}

.doc-table .empty-row td {
    text-align: center;
    color: #888;
    padding: 16px;
    font-style: italic;
}

/* ── Summary / Totals ── */
.doc-summary {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 6mm;
}

.doc-summary-table {
    width: 55%;
    border-collapse: collapse;
    font-size: 10pt;
}

.doc-summary-table td {
    padding: 4px 8px;
    color: #000;
}

.doc-summary-table .label-cell {
    text-align: right;
    font-weight: 500;
}

.doc-summary-table .value-cell {
    text-align: right;
    min-width: 120px;
}

.doc-summary-table .grand-total td {
    font-size: 13pt;
    font-weight: 700;
    border-top: 2px solid #2697cb;
    padding-top: 6px;
    color: #000;
}

/* ── Notes ── */
.doc-notes {
    margin-bottom: 6mm;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 9pt;
    color: #000;
}

.doc-notes h4 {
    font-size: 9.5pt;
    font-weight: 700;
    margin: 0 0 4px 0;
    color: #000;
}

.doc-notes ul {
    margin: 0;
    padding-left: 18px;
}

.doc-notes li {
    margin-bottom: 2px;
}

/* ── Signatures ── */
.doc-signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 15mm;
    page-break-inside: avoid;
}

.doc-sig-block {
    width: 40%;
    text-align: center;
}

.doc-sig-line {
    border-top: 1px solid #000;
    margin-top: 25mm;
    padding-top: 4px;
    font-size: 10pt;
    font-weight: 600;
    color: #000;
}

.doc-sig-sublabel {
    font-size: 8.5pt;
    color: #555;
    margin-top: 2px;
}

.doc-sig-date {
    font-size: 8.5pt;
    color: #000;
    margin-top: 4px;
}

/* ── Footer ── */
.doc-footer {
    text-align: center;
    font-size: 8pt;
    color: #888;
    margin-top: 10mm;
    padding-top: 4px;
    border-top: 1px solid #ddd;
}

/* ── Toolbar ── */
.print-toolbar {
    max-width: 210mm;
    margin: 0 auto;
    padding: 12px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
}
`

// ─── Component ──────────────────────────────────────────────

export default function CashReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)

    const [receipt, setReceipt] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetch(`/api/cash/receipt/${id}`)
            .then(res => res.json())
            .then(json => {
                if (json.success) {
                    setReceipt(json.data)
                } else {
                    setError(json.error || 'ไม่พบข้อมูล')
                }
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
                setLoading(false)
            })
    }, [id])

    // ── Loading / Error ──
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#e8e8e8' }}>
                <div style={{ textAlign: 'center', color: '#666' }}>
                    <div className="spinner-border text-primary mb-3" />
                    <div>กำลังโหลดข้อมูล...</div>
                </div>
            </div>
        )
    }

    if (error || !receipt) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#e8e8e8' }}>
                <div style={{ textAlign: 'center', color: '#c00', fontSize: '14pt' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
                    <div>{error || 'ไม่พบข้อมูล'}</div>
                </div>
            </div>
        )
    }

    const job = receipt.serviceJob
    const items = job?.items || []

    const subtotal = Number(job?.laborCost || 0) + Number(job?.partsCost || 0)
    const discount = Number(job?.discount || 0)
    const vatAmount = Number(receipt.vat || 0)
    const grandTotal = Number(receipt.total || 0)

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />

            {/* ── Toolbar (hidden on print) ── */}
            <div className="print-toolbar no-print">
                <button
                    className="btn btn-secondary"
                    onClick={() => window.history.back()}
                    style={{ minWidth: 120 }}
                >
                    <i className="ti ti-arrow-left me-2" />ย้อนกลับ
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => window.close()}
                    >
                        ปิดหน้าต่าง
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.print()}
                    >
                        <i className="ti ti-printer me-2" />พิมพ์ใบเสร็จ
                    </button>
                </div>
            </div>

            {/* ── A4 Page ── */}
            <div className="a4-page">

                {/* ── Document Header ── */}
                <div className="doc-header">
                    <div className="doc-company">
                        <div className="doc-company-logo">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={COMPANY.logo}
                                alt={COMPANY.nameEn}
                                width={COMPANY.logoWidth}
                                height={COMPANY.logoHeight}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none'
                                }}
                            />
                        </div>
                        <div className="doc-company-info">
                            <h1>{COMPANY.nameEn}</h1>
                            {COMPANY.nameTh && <p style={{ fontSize: '10pt', fontWeight: 500 }}>{COMPANY.nameTh}</p>}
                            <p>{COMPANY.address}</p>
                            <p>โทร: {COMPANY.phone}{COMPANY.fax ? ` | แฟกซ์: ${COMPANY.fax}` : ''}</p>
                            <p>เลขประจำตัวผู้เสียภาษี: {COMPANY.taxId}</p>
                        </div>
                    </div>
                    <div className="doc-title-block">
                        <h2>ใบเสร็จรับเงิน</h2>
                        <p className="doc-subtitle">CASH RECEIPT</p>
                        <p className="doc-meta">เลขที่ใบเสร็จ: <strong>{receipt.receiptNo}</strong></p>
                        <p className="doc-meta">วันที่: {fmtDate(receipt.receiptDate)}</p>
                        {job && <p className="doc-meta" style={{ fontSize: '9pt', color: '#555' }}>อ้างอิง: {job.jobNo}</p>}
                    </div>
                </div>

                {/* ── Customer & Vehicle Info ── */}
                <div className="doc-info-row">
                    <div className="doc-info-block">
                        <h3>ข้อมูลลูกค้า (Customer)</h3>
                        <div className="info-grid">
                            <span className="info-label">ชื่อ:</span>
                            <span className="info-value">{job?.customer?.fullName || '-'}</span>
                            <span className="info-label">โทรศัพท์:</span>
                            <span className="info-value">{job?.customer?.phone || '-'}</span>
                            {job?.customer?.email && (
                                <>
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">{job.customer.email}</span>
                                </>
                            )}
                            {job?.customer?.address && (
                                <>
                                    <span className="info-label">ที่อยู่:</span>
                                    <span className="info-value">{job.customer.address}</span>
                                </>
                            )}
                            {job?.customer?.taxId && (
                                <>
                                    <span className="info-label">เลขภาษี:</span>
                                    <span className="info-value">{job.customer.taxId}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="doc-info-block">
                        <h3>ข้อมูลรถยนต์ (Vehicle)</h3>
                        <div className="info-grid">
                            <span className="info-label">ทะเบียน:</span>
                            <span className="info-value" style={{ fontWeight: 700 }}>
                                {job?.car?.licensePlate || '-'} {job?.car?.province || ''}
                            </span>
                            <span className="info-label">ยี่ห้อ/รุ่น:</span>
                            <span className="info-value">
                                {job?.car?.carBrand?.nameThai || job?.car?.carBrand?.name || ''} {job?.car?.carModel?.name || ''}
                            </span>
                            {job?.car?.year && (
                                <>
                                    <span className="info-label">ปี:</span>
                                    <span className="info-value">{job.car.year}</span>
                                </>
                            )}
                            <span className="info-label">เลขไมล์:</span>
                            <span className="info-value">{job?.mileage?.toLocaleString() || '0'} km</span>
                            {job?.car?.vin && (
                                <>
                                    <span className="info-label">VIN:</span>
                                    <span className="info-value">{job.car.vin}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Items Table ── */}
                <table className="doc-table">
                    <thead>
                        <tr>
                            <th className="text-center" style={{ width: '5%' }}>#</th>
                            <th style={{ width: '45%' }}>รายการ (Description)</th>
                            <th className="text-center" style={{ width: '8%' }}>ประเภท</th>
                            <th className="text-center" style={{ width: '8%' }}>จำนวน</th>
                            <th className="text-right" style={{ width: '14%' }}>ราคา/หน่วย</th>
                            <th className="text-right" style={{ width: '10%' }}>ส่วนลด</th>
                            <th className="text-right" style={{ width: '14%' }}>รวมเงิน</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length > 0 ? (
                            items.map((item: any, i: number) => (
                                <tr key={item.id}>
                                    <td className="text-center">{i + 1}</td>
                                    <td>
                                        <span className="item-desc">{item.description}</span>
                                    </td>
                                    <td className="text-center">
                                        <span className="item-type">
                                            {item.itemType === 'SERVICE' ? 'บริการ' : 'อะไหล่'}
                                        </span>
                                    </td>
                                    <td className="text-center">{Number(item.quantity || 0)}</td>
                                    <td className="text-right">{fmtNumber(Number(item.unitPrice || 0))}</td>
                                    <td className="text-right">
                                        {Number(item.discount) > 0 ? fmtNumber(Number(item.discount)) : '-'}
                                    </td>
                                    <td className="text-right" style={{ fontWeight: 600 }}>
                                        {fmtNumber(Number(item.total || 0))}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr className="empty-row">
                                <td colSpan={7}>— ไม่มีรายการ —</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* ── Summary ── */}
                <div className="doc-summary">
                    <table className="doc-summary-table">
                        <tbody>
                            <tr>
                                <td className="label-cell">รวมเป็นเงิน (Subtotal)</td>
                                <td className="value-cell" style={{ fontWeight: 600 }}>{fmtNumber(subtotal)}</td>
                                <td>บาท</td>
                            </tr>
                            {discount > 0 && (
                                <tr>
                                    <td className="label-cell">ส่วนลด (Discount)</td>
                                    <td className="value-cell" style={{ color: '#c00' }}>-{fmtNumber(discount)}</td>
                                    <td>บาท</td>
                                </tr>
                            )}
                            <tr>
                                <td className="label-cell">มูลค่าหลังหักส่วนลด (Amount after discount)</td>
                                <td className="value-cell">{fmtNumber(Number(receipt.amount || 0))}</td>
                                <td>บาท</td>
                            </tr>
                            <tr>
                                <td className="label-cell">ภาษีมูลค่าเพิ่ม VAT 7%</td>
                                <td className="value-cell">{fmtNumber(vatAmount)}</td>
                                <td>บาท</td>
                            </tr>
                            <tr className="grand-total">
                                <td className="label-cell">ยอดชำระสุทธิ (Grand Total)</td>
                                <td className="value-cell">{fmtNumber(grandTotal)}</td>
                                <td style={{ fontWeight: 700, fontSize: '13pt' }}>บาท</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* ── Notes ── */}
                {receipt.notes && (
                    <div className="doc-notes">
                        <h4>หมายเหตุ (Remarks):</h4>
                        <p style={{ margin: 0 }}>{receipt.notes}</p>
                    </div>
                )}

                {/* ── Signatures ── */}
                <div className="doc-signatures">
                    <div className="doc-sig-block">
                        <div className="doc-sig-line">ผู้ชำระเงิน (Payer)</div>
                        <div className="doc-sig-sublabel">ลูกค้ายืนยันการรับบริการ</div>
                        <div className="doc-sig-date">วันที่ ____/____/________</div>
                    </div>
                    <div className="doc-sig-block">
                        <div className="doc-sig-line">ผู้รับเงิน (Receiver)</div>
                        <div className="doc-sig-sublabel">{receipt.receivedBy || 'แคชเชียร์'}</div>
                        <div className="doc-sig-date">วันที่ ____/____/________</div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="doc-footer">
                    {COMPANY.nameEn} | {COMPANY.phone} | {COMPANY.website}
                    <br />
                    เอกสารนี้สร้างโดยระบบ AutoCare เมื่อ {new Date().toLocaleString('th-TH')}
                </div>

            </div>
        </>
    )
}
