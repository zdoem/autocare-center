/**
 * ไฟล์: middleware.ts
 * จุดประสงค์: Middleware สำหรับ authentication และ authorization
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
    const { pathname } = req.nextUrl
    const isLoggedIn = !!req.auth

    // Public paths ที่ไม่ต้อง authentication
    const publicPaths = ['/login', '/api/auth', '/api/master', '/api/ops']
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

    // ถ้าเป็น public path ให้ผ่านได้เลย
    if (isPublicPath) {
        return NextResponse.next()
    }

    // ถ้าไม่ได้ login และไม่ใช่ public path -> redirect ไป login
    if (!isLoggedIn) {
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // ตรวจสอบ role-based access (เพิ่มเติมในอนาคต)
    // if (pathname.startsWith('/settings') && req.auth.user.role !== 'ADMIN') {
    //   return NextResponse.redirect(new URL('/dashboard', req.url))
    // }

    return NextResponse.next()
})

// Matcher configuration - routes ที่ต้องผ่าน middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
