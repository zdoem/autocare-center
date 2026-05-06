/**
 * ไฟล์: components/navigation/config/types.ts
 * จุดประสงค์: Type definitions สำหรับ Navigation
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

export interface NavItem {
    label: string
    icon: string
    href?: string
    badge?: number | string
    badgeColor?: string
    children?: NavChildItem[]
}

export interface NavChildItem {
    label: string
    icon: string
    href: string
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'TECHNICIAN' | 'USER'
