/**
 * ไฟล์: lib/companyConfig.ts
 * จุดประสงค์: ข้อมูลบริษัทศูนย์กลาง — แก้ไขที่นี่ที่เดียว ใช้ได้ทั้ง project
 * 
 * 📌 วิธีเปลี่ยน Logo:
 *    1. วาง logo ไว้ที่ /public/images/logo.png
 *    2. แก้ค่า logo ด้านล่าง
 * 
 * 📌 วิธีเปลี่ยนข้อมูลบริษัท:
 *    แก้ค่าด้านล่างตามต้องการ แล้ว restart server
 * 
 * @author AutoCare Team
 * @created 2026-02-15
 */

export const COMPANY = {
    /** ชื่อบริษัท (ภาษาไทย) */
    nameTh: 'ออโต้แคร์ เซอร์วิส เซ็นเตอร์',
    /** ชื่อบริษัท (English) */
    nameEn: 'AutoCare Service Center',
    /** ที่อยู่ */
    address: '123 ถ.สุขุมวิท เขตวัฒนา กรุงเทพฯ 10110',
    /** เบอร์โทรศัพท์ */
    phone: '02-123-4567',
    /** Fax (ถ้ามี) */
    fax: '',
    /** Email */
    email: 'info@autocare.co.th',
    /** เลขประจำตัวผู้เสียภาษี */
    taxId: '0105551234567',
    /** URL ของ Logo — วางไฟล์ที่ /public/images/logo.png */
    logo: '/images/logo.png',
    /** ขนาด Logo (px) */
    logoWidth: 60,
    logoHeight: 60,
    /** Website */
    website: 'www.autocare.co.th',
}

/**
 * ข้อมูลเอกสารเฉพาะประเภท
 */
export const DOCUMENT_CONFIG = {
    quotation: {
        /** ชื่อเอกสาร */
        titleTh: 'ใบเสนอราคา',
        titleEn: 'Quotation',
        /** จำนวนวันที่ใบเสนอราคามีผลบังคับใช้ */
        validDays: 7,
        /** หมายเหตุท้ายเอกสาร */
        notes: [
            'ใบเสนอราคานี้มีผลบังคับใช้ 7 วันนับจากวันที่ออกเอกสาร',
            'ราคาดังกล่าวยังไม่รวมภาษีมูลค่าเพิ่ม (VAT 7%) ยกเว้นระบุไว้เป็นอย่างอื่น',
            'กรุณาตรวจสอบความถูกต้องของรายการและราคาก่อนอนุมัติ',
        ],
        /** ช่องลงนาม */
        signatures: {
            left: { label: 'ผู้เสนอราคา', sublabel: 'Authorized Signature' },
            right: { label: 'ผู้อนุมัติ (ลูกค้า)', sublabel: 'Customer Approval' },
        },
    },
    invoice: {
        titleTh: 'ใบแจ้งหนี้',
        titleEn: 'Invoice',
        validDays: 30,
        notes: [
            'กรุณาชำระเงินภายใน 30 วันนับจากวันที่ออกเอกสาร',
            'การชำระเงินถือว่ายอมรับเงื่อนไขทั้งหมดของเอกสาร',
        ],
        signatures: {
            left: { label: 'ผู้ออกเอกสาร', sublabel: 'Issued By' },
            right: { label: 'ผู้รับเอกสาร', sublabel: 'Received By' },
        },
    },
    receipt: {
        titleTh: 'ใบเสร็จรับเงิน',
        titleEn: 'Receipt',
        validDays: 0,
        notes: [
            'เอกสารนี้ออกเป็นหลักฐานการรับเงินเรียบร้อยแล้ว',
        ],
        signatures: {
            left: { label: 'ผู้รับเงิน', sublabel: 'Cashier' },
            right: { label: 'ผู้ชำระเงิน', sublabel: 'Payer' },
        },
    },
}
