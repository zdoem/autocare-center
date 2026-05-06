/**
 * ไฟล์: components/layout/MainLayout.tsx
 * จุดประสงค์: Layout หลัก - ใช้ class layout-fluid ตรงตาม mockup
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { TablerHead, TablerScript } from '@/components/shared'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import PageHeader from './PageHeader'

interface MainLayoutProps {
    children: React.ReactNode
    title: React.ReactNode
    pretitle?: string
    actions?: React.ReactNode
}

export default function MainLayout({
    children,
    title,
    pretitle,
    actions
}: MainLayoutProps) {
    const { data: session } = useSession()

    const userRole = session?.user?.role || 'ADMIN'
    const userName = session?.user?.name
    const userPosition = session?.user?.positionName

    return (
        <>
            <TablerHead />

            {/* ใช้ class layout-fluid ตรงตาม mockup */}
            <div className="page">
                {/* Sidebar */}
                <Sidebar userRole={userRole} />

                {/* Page Wrapper */}
                <div className="page-wrapper">
                    {/* Header พร้อม Notifications */}
                    <Header
                        userName={userName}
                        userRole={userRole}
                        userPosition={userPosition}
                    />

                    {/* Page Header */}
                    <PageHeader
                        title={title}
                        pretitle={pretitle}
                        actions={actions}
                    />

                    {/* Page Body */}
                    <div className="page-body">
                        <div className="container-xl">
                            {children}
                        </div>
                    </div>

                    {/* Footer */}
                    <Footer version="1.0.0" />
                </div>
            </div>

            <TablerScript />
        </>
    )
}
