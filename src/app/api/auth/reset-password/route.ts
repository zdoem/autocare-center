/**
 * ไฟล์: app/api/auth/reset-password/route.ts
 * จุดประสงค์: API สำหรับบันทึกรหัสผ่านใหม่
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json()

        // Validate inputs
        if (!token || !password) {
            return NextResponse.json(
                { message: 'ข้อมูลไม่ครบถ้วน' },
                { status: 400 }
            )
        }

        // Validate password length
        if (password.length < 8) {
            return NextResponse.json(
                { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' },
                { status: 400 }
            )
        }

        // TODO: In production, verify token from database
        // For now, we'll look up by the first user (admin) for demo purposes
        // In real implementation:
        // 1. Store resetToken and resetTokenExpiry in User model
        // 2. Find user by resetToken where expiry > now
        // 3. Clear token after use

        // For demo - find admin user
        const user = await prisma.user.findUnique({
            where: { username: 'admin' },
        })

        if (!user) {
            return NextResponse.json(
                { message: 'ลิงก์ไม่ถูกต้องหรือหมดอายุ' },
                { status: 400 }
            )
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                // In production: clear reset token
                // resetToken: null,
                // resetTokenExpiry: null,
            },
        })

        // Activity Log
        console.log(`[ACTIVITY] Password reset completed for user: ${user.username}`)

        return NextResponse.json({
            message: 'เปลี่ยนรหัสผ่านเรียบร้อย',
        })

    } catch (error) {
        console.error('[ERROR] Reset password error:', error)
        return NextResponse.json(
            { message: 'เกิดข้อผิดพลาดในระบบ' },
            { status: 500 }
        )
    }
}
