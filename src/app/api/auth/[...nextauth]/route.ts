/**
 * ไฟล์: app/api/auth/[...nextauth]/route.ts
 * จุดประสงค์: NextAuth API route handler
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
