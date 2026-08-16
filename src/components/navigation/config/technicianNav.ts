/**
 * ไฟล์: components/navigation/config/technicianNav.ts
 * จุดประสงค์: Navigation config สำหรับ Technician
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { NavItem } from './types'

export const technicianNavItems: NavItem[] = [
    { label: 'Dashboard', icon: 'ti-tools', href: '/dashboard/technician' },
    { label: 'งานของฉัน', icon: 'ti-clipboard-list', href: '/service/my-jobs', badge: 5, badgeColor: 'primary' },
    { label: 'รายละเอียดงาน', icon: 'ti-file-description', href: '/service/job-detail' },
    { label: 'ดู Stock', icon: 'ti-box', href: '/inventory/stock' },
    { label: 'ค้นหารถ', icon: 'ti-search', href: '/ops/search' },
]
