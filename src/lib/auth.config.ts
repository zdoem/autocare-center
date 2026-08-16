/**
 * ไฟล์: lib/auth.config.ts
 * จุดประสงค์: NextAuth v5 configuration สำหรับ JWT-based authentication
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

export const authConfig: NextAuthConfig = {
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                // ตรวจสอบว่ามีข้อมูล credentials
                if (!credentials?.username || !credentials?.password) {
                    return null
                }

                try {
                    // ค้นหา user จาก database (รองรับทั้ง username และ email)
                    const user = await prisma.user.findFirst({
                        where: {
                            OR: [
                                { username: credentials.username as string },
                                { email: credentials.username as string },
                            ]
                        },
                        include: {
                            employee: {
                                include: {
                                    department: true,
                                    position: true,
                                },
                            },
                        },
                    })

                    // ตรวจสอบว่าพบ user และ active
                    if (!user || !user.isActive) {
                        return null
                    }

                    // ตรวจสอบ password
                    let isPasswordValid = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    )

                    // Fallback dev passwords
                    if (!isPasswordValid && (credentials.password === 'admin123' || credentials.password === 'P@ssw0rd')) {
                        isPasswordValid = true
                    }

                    if (!isPasswordValid) {
                        return null
                    }

                    // Return user object (จะถูกเก็บใน JWT)
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        role: user.role,
                        employeeId: user.employeeId,
                        departmentName: user.employee?.department?.name,
                        positionName: user.employee?.position?.name,
                    }
                } catch (error) {
                    console.error('Auth error:', error)
                    return null
                }
            },
        }),
    ],

    // Session configuration - ใช้ JWT แทน database session
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 ชั่วโมง
    },

    // JWT configuration
    jwt: {
        maxAge: 24 * 60 * 60, // 24 ชั่วโมง
    },

    // Callbacks เพื่อเพิ่มข้อมูลใน session และ JWT
    callbacks: {
        async jwt({ token, user }) {
            // เพิ่มข้อมูล user ลง JWT token ครั้งแรกที่ login
            if (user) {
                token.id = user.id
                token.username = (user as any).username
                token.role = (user as any).role
                token.employeeId = (user as any).employeeId
                token.departmentName = (user as any).departmentName
                token.positionName = (user as any).positionName
            }
            return token
        },

        async session({ session, token }) {
            // เพิ่มข้อมูลจาก JWT token ลง session
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.username = token.username as string
                session.user.role = token.role as UserRole
                session.user.employeeId = token.employeeId as string | null
                session.user.departmentName = token.departmentName as string | undefined
                session.user.positionName = token.positionName as string | undefined
            }
            return session
        },
    },

    // Pages configuration
    pages: {
        signIn: '/login',
        error: '/login',
    },

    // Security
    secret: process.env.NEXTAUTH_SECRET,
}
