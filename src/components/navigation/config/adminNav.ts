/**
 * ไฟล์: components/navigation/config/adminNav.ts
 * จุดประสงค์: Navigation config สำหรับ Admin
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { NavItem } from './types'

export const adminNavItems: NavItem[] = [
    {
        label: 'Dashboard',
        icon: 'ti-layout-dashboard',
        children: [
            { label: 'Admin Dashboard', icon: 'ti-chart-pie', href: '/dashboard' },
            { label: 'Technician Dashboard', icon: 'ti-wrench', href: '/dashboard/technician' },
            { label: 'Cashier Dashboard', icon: 'ti-cash', href: '/dashboard/cashier' },
        ],
    },
    {
        label: 'ข้อมูลหลัก',
        icon: 'ti-database',
        children: [
            { label: 'ยี่ห้อรถ', icon: 'ti-brand-toyota', href: '/master/car-brand' },
            { label: 'รุ่นรถ', icon: 'ti-car', href: '/master/car-model' },
            { label: 'ลูกค้า', icon: 'ti-user', href: '/master/customer' },
            { label: 'ประเภทลูกค้า', icon: 'ti-users', href: '/master/customer-type' },
            { label: 'พนักงาน', icon: 'ti-id', href: '/master/employee' },
            { label: 'แผนก', icon: 'ti-building', href: '/master/department' },
            { label: 'ตำแหน่งงาน', icon: 'ti-briefcase', href: '/master/position' },
            { label: 'ประเภทพนักงาน', icon: 'ti-id-badge', href: '/master/employee-type' },
            { label: 'อะไหล่', icon: 'ti-box', href: '/master/spare' },
            { label: 'หมวดอะไหล่', icon: 'ti-category', href: '/master/spares-category' },
            { label: 'Vendor', icon: 'ti-truck', href: '/master/vendor' },
            { label: 'บริการ', icon: 'ti-tool', href: '/master/service' },
            { label: 'ประเภทชำระเงิน', icon: 'ti-wallet', href: '/master/payment-type' },
        ],
    },
    {
        label: 'รับรถ',
        icon: 'ti-car',
        children: [
            { label: 'รับรถเข้าซ่อม', icon: 'ti-login', href: '/ops/receive' },
            { label: 'ลงทะเบียนรถใหม่', icon: 'ti-plus', href: '/ops/register' },
            { label: 'ค้นหารถ/ประวัติการซ่อม', icon: 'ti-search', href: '/ops/search' },
        ],
    },
    {
        label: 'บริการ',
        icon: 'ti-tool',
        children: [
            { label: 'รายการงานซ่อม', icon: 'ti-clipboard-list', href: '/service/jobs' },
            { label: 'ชำระเงิน', icon: 'ti-cash', href: '/cash/payment' },
        ],
    },
    {
        label: 'คลังอะไหล่',
        icon: 'ti-box',
        children: [
            { label: 'Stock คงเหลือ', icon: 'ti-packages', href: '/inventory/stock' },
            { label: 'สั่งซื้ออะไหล่', icon: 'ti-shopping-cart', href: '/inventory/purchase' },
            { label: 'ความเคลื่อนไหว', icon: 'ti-arrows-exchange', href: '/inventory/movement' },
        ],
    },
    {
        label: 'รายงาน',
        icon: 'ti-report-analytics',
        children: [
            { label: 'สรุปรายวัน', icon: 'ti-calendar-event', href: '/reports/daily' },
            { label: 'สรุปรายเดือน', icon: 'ti-calendar', href: '/reports/monthly' },
            { label: 'งานวันนี้', icon: 'ti-clock', href: '/reports/jobs-today' },
            { label: 'รับชำระ', icon: 'ti-receipt', href: '/reports/payment' },
            { label: 'สรุปบริการ', icon: 'ti-chart-bar', href: '/reports/service' },
            { label: 'ผลงานช่าง', icon: 'ti-hammer', href: '/reports/technician' },
            { label: 'Stock คงเหลือ', icon: 'ti-box', href: '/reports/stock' },
            { label: 'ลูกค้า', icon: 'ti-users', href: '/reports/customer' },
            { label: 'การสั่งซื้อ (PO)', icon: 'ti-truck', href: '/reports/purchase' },
            { label: 'ค่าใช้จ่าย/ต้นทุน', icon: 'ti-receipt-off', href: '/reports/expense' },
            { label: 'ลูกค้า Top', icon: 'ti-trophy', href: '/reports/top-customer' },
        ],
    },
    { label: 'ตั้งค่าระบบ', icon: 'ti-settings', href: '/settings' },
]
