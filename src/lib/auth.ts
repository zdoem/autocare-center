/**
 * ไฟล์: lib/auth.ts
 * จุดประสงค์: NextAuth instance และ helper functions
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
