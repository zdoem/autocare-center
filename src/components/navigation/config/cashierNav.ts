/**
 * ไฟล์: components/navigation/config/cashierNav.ts
 * จุดประสงค์: Navigation config สำหรับ Cashier
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { NavItem } from './types'

export const cashierNavItems: NavItem[] = [
    { label: 'Dashboard', icon: 'ti-layout-dashboard', href: '/dashboard/cashier' },
    { label: 'รอชำระเงิน', icon: 'ti-clock', href: '/cash/pending', badge: 3, badgeColor: 'danger' },
    { label: 'รับชำระเงิน', icon: 'ti-cash', href: '/cash/payment' },
    { label: 'ใบเสร็จ', icon: 'ti-receipt', href: '/cash/receipt' },
    { label: 'รายงานยอดขาย', icon: 'ti-report-analytics', href: '/cash/report' },
]
