/**
 * ไฟล์: components/shared/TablerHead.tsx
 * จุดประสงค์: Tabler CSS/JS imports ตรงตาม mockup
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import Script from 'next/script'

interface TablerHeadProps {
    title?: string
}

export default function TablerHead({ title }: TablerHeadProps) {
    if (!title) return null
    return (
        <title>{title} - Autocar Service Center</title>
    )
}

// Tabler JS Script (ใส่ท้าย body) - ตรงตาม mockup
export function TablerScript() {
    return (
        <Script
            src="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta20/dist/js/tabler.min.js"
            strategy="lazyOnload"
        />
    )
}
