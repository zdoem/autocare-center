/**
 * ไฟล์: components/layout/Sidebar.tsx
 * จุดประสงค์: Sidebar navigation - Logo แบบ inline ตาม mockup
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import { useState, useEffect } from 'react'
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
            <style jsx global>{`
                /* Sidebar Dropdown Container */
                .navbar-vertical .dropdown-menu {
                    background-color: rgba(0, 0, 0, 0.25) !important;
                    border-radius: 8px !important;
                    margin: 4px 8px 8px 12px !important;
                    padding: 6px 8px !important;
                    border-left: 2px solid rgba(255, 255, 255, 0.12) !important;
                }

                /* Submenu item default */
                .navbar-vertical .dropdown-item {
                    color: rgba(255, 255, 255, 0.65) !important;
                    font-size: 0.86rem !important;
                    padding: 7px 12px !important;
                    border-radius: 6px !important;
                    transition: all 0.18s ease-in-out !important;
                    margin-bottom: 3px !important;
                    display: flex !important;
                    align-items: center !important;
                }

                .navbar-vertical .dropdown-item:hover {
                    background-color: rgba(255, 255, 255, 0.08) !important;
                    color: #ffffff !important;
                    transform: translateX(2px);
                }

                /* Active Submenu Item: Soft Tone Highlight */
                .navbar-vertical .dropdown-item.active {
                    background: rgba(32, 107, 196, 0.28) !important;
                    color: #79b7ff !important;
                    font-weight: 600 !important;
                    border-left: 3px solid #3b82f6 !important;
                    padding-left: 10px !important;
                    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2) !important;
                }

                .navbar-vertical .dropdown-item.active i {
                    color: #79b7ff !important;
                }

                /* Active Parent Nav Link */
                .navbar-vertical .nav-link.dropdown-toggle.active {
                    color: #ffffff !important;
                    font-weight: 600 !important;
                }

                .navbar-vertical .nav-link.active:not(.dropdown-toggle) {
                    background-color: rgba(32, 107, 196, 0.25) !important;
                    color: #79b7ff !important;
                    font-weight: 600 !important;
                    border-left: 3px solid #3b82f6 !important;
                    border-radius: 6px !important;
                }
            `}</style>
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
