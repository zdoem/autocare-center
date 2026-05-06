/**
 * ไฟล์: components/shared/Logo.tsx
 * จุดประสงค์: Logo component ใช้รูปรถเดียวกับหน้า Login
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import Link from 'next/link'

interface LogoProps {
    size?: 'sm' | 'md' | 'lg'
    showText?: boolean
    href?: string
}

const sizeMap = {
    sm: 24,
    md: 32,
    lg: 48,
}

// รูปรถ - ใช้ URL เดียวกับหน้า Login
const CAR_LOGO_URL = 'https://cdn-icons-png.flaticon.com/512/3774/3774278.png'

export default function Logo({ size = 'md', showText = true, href = '/dashboard' }: LogoProps) {
    const imgSize = sizeMap[size]

    return (
        <Link href={href} className="d-flex align-items-center text-decoration-none">
            <img
                src={CAR_LOGO_URL}
                width={imgSize}
                height={imgSize}
                alt="Autocar"
                className="navbar-brand-image me-2"
            />
            {showText && <span className="text-white fw-bold">AUTOCAR</span>}
        </Link>
    )
}

// Export URL สำหรับใช้ที่อื่น
export { CAR_LOGO_URL }
