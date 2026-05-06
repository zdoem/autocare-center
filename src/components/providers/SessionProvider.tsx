/**
 * ไฟล์: components/providers/SessionProvider.tsx
 * จุดประสงค์: NextAuth SessionProvider wrapper
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface SessionProviderProps {
    children: ReactNode
}

export default function SessionProvider({ children }: SessionProviderProps) {
    return (
        <NextAuthSessionProvider>
            {children}
        </NextAuthSessionProvider>
    )
}
