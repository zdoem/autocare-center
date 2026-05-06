/**
 * ไฟล์: components/layout/Header.tsx
 * จุดประสงค์: Header component ตรงตาม mockup
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { UserRole } from '@/components/navigation/config'

interface HeaderProps {
    userName?: string | null
    userRole?: UserRole | string
    userPosition?: string | null
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
    if (!name) return 'AD'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

export default function Header({ userName, userRole, userPosition }: HeaderProps) {
    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' })
    }

    return (
        <header className="navbar navbar-expand-md d-none d-lg-flex d-print-none">
            <div className="container-xl">
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="navbar-nav flex-row order-md-last">
                    {/* Notifications */}
                    <div className="nav-item dropdown d-none d-md-flex me-3">
                        <a href="#" className="nav-link px-0" data-bs-toggle="dropdown">
                            <i className="ti ti-bell"></i>
                            <span className="badge bg-red badge-notification badge-blink"></span>
                        </a>
                        <div className="dropdown-menu dropdown-menu-arrow dropdown-menu-end dropdown-menu-card">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">การแจ้งเตือน</h3>
                                </div>
                                <div className="list-group list-group-flush">
                                    <div className="list-group-item">
                                        <div className="row align-items-center">
                                            <div className="col-auto">
                                                <span className="status-dot status-dot-animated bg-red d-block"></span>
                                            </div>
                                            <div className="col text-truncate">
                                                <a href="#" className="text-body d-block">อะไหล่ "กรองน้ำมันเครื่อง" เหลือ 2 ชิ้น</a>
                                                <div className="d-block text-muted text-truncate mt-n1">
                                                    ต่ำกว่าจำนวนขั้นต่ำ (Min: 10)
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="list-group-item">
                                        <div className="row align-items-center">
                                            <div className="col-auto">
                                                <span className="status-dot bg-yellow d-block"></span>
                                            </div>
                                            <div className="col text-truncate">
                                                <a href="#" className="text-body d-block">รถ กข-1234 รอชำระเงิน</a>
                                                <div className="d-block text-muted text-truncate mt-n1">ค้างชำระ 3 วัน</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="nav-item dropdown">
                        <a href="#" className="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown">
                            <span className={`avatar avatar-sm ${getAvatarColor(userRole)}`}>
                                {getInitials(userName)}
                            </span>
                            <div className="d-none d-xl-block ps-2">
                                <div>{userName || 'Admin User'}</div>
                                <div className="mt-1 small text-muted">
                                    {userPosition || userRole || 'ผู้ดูแลระบบ'}
                                </div>
                            </div>
                        </a>
                        <div className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                            <Link href="/profile" className="dropdown-item">โปรไฟล์</Link>
                            <Link href="/change-password" className="dropdown-item">เปลี่ยนรหัสผ่าน</Link>
                            <div className="dropdown-divider"></div>
                            <a href="#" className="dropdown-item text-danger" onClick={handleLogout}>ออกจากระบบ</a>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
