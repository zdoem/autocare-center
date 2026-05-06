/**
 * ไฟล์: components/navigation/config/index.ts
 * จุดประสงค์: Export รวม Navigation configs + helper function
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

export * from './types'
export { adminNavItems } from './adminNav'
export { cashierNavItems } from './cashierNav'
export { technicianNavItems } from './technicianNav'

import { NavItem, UserRole } from './types'
import { adminNavItems } from './adminNav'
import { cashierNavItems } from './cashierNav'
import { technicianNavItems } from './technicianNav'

/**
 * ดึง Navigation items ตาม role
 */
export function getNavByRole(role: UserRole | string): NavItem[] {
    switch (role) {
        case 'CASHIER':
            return cashierNavItems
        case 'TECHNICIAN':
            return technicianNavItems
        case 'ADMIN':
        case 'MANAGER':
        default:
            return adminNavItems
    }
}
