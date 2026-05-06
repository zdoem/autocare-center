/**
 * ไฟล์: types/next-auth.d.ts
 * จุดประสงค์: Extend NextAuth types เพื่อเพิ่ม custom fields
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { UserRole } from '@prisma/client'
import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            username: string
            role: UserRole
            employeeId: string | null
            departmentName?: string
            positionName?: string
        } & DefaultSession['user']
    }

    interface User {
        username: string
        role: UserRole
        employeeId: string | null
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        username: string
        role: UserRole
        employeeId: string | null
        departmentName?: string
        positionName?: string
    }
}
