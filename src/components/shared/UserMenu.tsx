/**
 * ไฟล์: components/shared/UserMenu.tsx
 * จุดประสงค์: User dropdown menu สำหรับ Header
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { UserRole } from '@/components/navigation/config'

interface UserMenuProps {
    name?: string | null
    role?: UserRole | string
    position?: string | null
}

// Avatar background color ตาม role
function getAvatarColor(role?: string): string {
    switch (role) {
        case 'ADMIN': return 'bg-primary-lt'
        case 'MANAGER': return 'bg-indigo-lt'
        case 'CASHIER': return 'bg-teal-lt'
        case 'TECHNICIAN': return 'bg-green-lt'
        default: return 'bg-secondary-lt'
    }
}

// Avatar initials จากชื่อ
function getInitials(name?: string | null): string {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

export default function UserMenu({ name, role, position }: UserMenuProps) {
    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' })
    }

    return (
        <div className="nav-item dropdown">
            <a
                href="#"
                className="nav-link d-flex lh-1 text-reset p-0"
                data-bs-toggle="dropdown"
            >
                <span className={`avatar avatar-sm ${getAvatarColor(role)}`}>
                    {getInitials(name)}
                </span>
                <div className="d-none d-xl-block ps-2">
                    <div>{name || 'User'}</div>
                    <div className="mt-1 small text-muted">
                        {position || role || 'ผู้ใช้งาน'}
                    </div>
                </div>
            </a>
            <div className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                <Link href="/profile" className="dropdown-item">
                    <i className="ti ti-user me-2"></i>โปรไฟล์
                </Link>
                <Link href="/change-password" className="dropdown-item">
                    <i className="ti ti-lock me-2"></i>เปลี่ยนรหัสผ่าน
                </Link>
                <div className="dropdown-divider"></div>
                <a href="#" className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="ti ti-logout me-2"></i>ออกจากระบบ
                </a>
            </div>
        </div>
    )
}
