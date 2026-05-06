/**
 * ไฟล์: app/api/auth/forgot-password/route.ts
 * จุดประสงค์: API สำหรับส่งอีเมลรีเซ็ตรหัสผ่าน
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        // Validate email
        if (!email) {
            return NextResponse.json(
                { message: 'กรุณากรอกอีเมล' },
                { status: 400 }
            )
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        })

        // Always return success to prevent email enumeration
        if (!user) {
            // Don't reveal that email doesn't exist
            return NextResponse.json({
                message: 'หากอีเมลนี้ลงทะเบียนในระบบ คุณจะได้รับลิงก์รีเซ็ตรหัสผ่านทางอีเมล',
            })
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

        // Store token in database (you'll need to add these fields to User model)
        // For now, we'll just log it
        console.log('='.repeat(50))
        console.log('Password Reset Request')
        console.log('='.repeat(50))
        console.log('User:', user.name)
        console.log('Email:', email)
        console.log('Reset Token:', resetToken)
        console.log('Expires:', resetTokenExpiry)
        console.log('Reset URL:', `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`)
        console.log('='.repeat(50))

        // TODO: In production, send email using nodemailer or other service
        // await sendResetEmail(email, resetToken)

        // Activity Log
        console.log(`[ACTIVITY] Password reset requested for user: ${user.username}`)

        return NextResponse.json({
            message: 'หากอีเมลนี้ลงทะเบียนในระบบ คุณจะได้รับลิงก์รีเซ็ตรหัสผ่านทางอีเมล',
            // For development only - remove in production
            _dev: {
                token: resetToken,
                resetUrl: `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`,
            },
        })

    } catch (error) {
        console.error('[ERROR] Forgot password error:', error)
        return NextResponse.json(
            { message: 'เกิดข้อผิดพลาดในระบบ' },
            { status: 500 }
        )
    }
}
