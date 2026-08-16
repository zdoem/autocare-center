/**
 * ไฟล์: components/layout/Sidebar.tsx
 * จุดประสงค์: Sidebar navigation - Logo แบบ inline ตาม mockup
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavItem, UserRole, getNavByRole } from '@/components/navigation/config'

// รูปรถ - ใช้ URL เดียวกับที่ user ระบุ
const CAR_LOGO_URL = 'https://cdn-icons-png.flaticon.com/512/3774/3774278.png'

interface SidebarProps {
    userRole?: UserRole | string
}

export default function Sidebar({ userRole = 'ADMIN' }: SidebarProps) {
    const pathname = usePathname()
    const navItems = getNavByRole(userRole)

    const [expandedMenus, setExpandedMenus] = useState<string[]>(['Dashboard'])

    const toggleMenu = (label: string) => {
        setExpandedMenus(prev =>
            prev.includes(label)
                ? prev.filter(m => m !== label)
                : [...prev, label]
        )
    }

    // Auto-expand parent menu when pathname matches any child link
    useEffect(() => {
        navItems.forEach(item => {
            if (item.children?.some(child => pathname === child.href || (child.href !== '/' && pathname.startsWith(child.href)))) {
                setExpandedMenus(prev => (prev.includes(item.label) ? prev : [...prev, item.label]))
            }
        })
    }, [pathname, navItems])

    const isActiveLink = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href))

    const isActiveParent = (item: NavItem) => {
        if (item.children) {
            return item.children.some(child => pathname === child.href || (child.href !== '/' && pathname.startsWith(child.href)))
        }
        return false
    }

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' })
    }

    return (
        <aside className="navbar navbar-vertical navbar-expand-lg" data-bs-theme="dark">
            <div className="container-fluid">
                {/* Mobile Toggle */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#sidebar-menu"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Logo - แบบ inline ตาม mockup: รูปรถ + ศูนย์บริการซ่อมรถยนต์ (จัด center) */}
                <h1 className="navbar-brand navbar-brand-autodark w-100 text-center">
                    <Link href="/dashboard" className="d-inline-flex align-items-center justify-content-center">
                        <img
                            src={CAR_LOGO_URL}
                            width={32}
                            height={32}
                            alt="Autocar"
                            className="me-2"
                        />
                        <span className="text-white">ศูนย์บริการซ่อมรถยนต์</span>
                    </Link>
                </h1>

                {/* Navigation - ใช้ React state จัดการ dropdown */}
                <div className="navbar-collapse" id="sidebar-menu" style={{ display: 'block' }}>
                    <ul className="navbar-nav pt-lg-3">
                        {navItems.map((item, index) => (
                            <li key={index} className={`nav-item ${item.children ? 'dropdown' : ''}`}>
                                {item.children ? (
                                    // Dropdown Menu - ใช้ React state
                                    <>
                                        <a
                                            className={`nav-link dropdown-toggle ${isActiveParent(item) ? 'active' : ''} ${expandedMenus.includes(item.label) ? 'show' : ''}`}
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); toggleMenu(item.label) }}
                                            role="button"
                                            aria-expanded={expandedMenus.includes(item.label)}
                                        >
                                            <span className="nav-link-icon d-md-none d-lg-inline-block">
                                                <i className={`ti ${item.icon}`}></i>
                                            </span>
                                            <span className="nav-link-title">{item.label}</span>
                                        </a>
                                        {/* ใช้ style display แทน class show */}
                                        <div
                                            className="dropdown-menu"
                                            style={{
                                                display: expandedMenus.includes(item.label) ? 'block' : 'none',
                                                position: 'static',
                                                border: 'none',
                                                boxShadow: 'none',
                                                backgroundColor: 'transparent',
                                                padding: '0'
                                            }}
                                        >
                                            {item.children.map((child, childIndex) => (
                                                <Link
                                                    key={childIndex}
                                                    className={`dropdown-item ${isActiveLink(child.href) ? 'active' : ''}`}
                                                    href={child.href}
                                                >
                                                    <i className={`ti ${child.icon} me-2`}></i>
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    // Single Link
                                    <Link
                                        className={`nav-link ${isActiveLink(item.href || '') ? 'active' : ''}`}
                                        href={item.href || '#'}
                                    >
                                        <span className="nav-link-icon d-md-none d-lg-inline-block">
                                            <i className={`ti ${item.icon}`}></i>
                                        </span>
                                        <span className="nav-link-title">{item.label}</span>
                                        {item.badge && (
                                            <span className={`badge badge-sm bg-${item.badgeColor || 'primary'} ms-auto`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                )}
                            </li>
                        ))}

                        {/* Logout Button */}
                        <li className="nav-item mt-auto">
                            <a className="nav-link text-danger" href="#" onClick={handleLogout}>
                                <span className="nav-link-icon d-md-none d-lg-inline-block">
                                    <i className="ti ti-logout"></i>
                                </span>
                                <span className="nav-link-title">ออกจากระบบ</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </aside>
    )
}
