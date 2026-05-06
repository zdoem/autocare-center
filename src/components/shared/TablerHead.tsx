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
    return (
        <>
            {/* Page Title */}
            {title && <title>{title} - Autocar Service Center</title>}

            {/* Tabler CSS - ตรงตาม mockup */}
            <link
                href="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta20/dist/css/tabler.min.css"
                rel="stylesheet"
            />

            {/* Tabler Icons - ตรงตาม mockup */}
            <link
                href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css"
                rel="stylesheet"
            />

            {/* Google Fonts - Noto Sans Thai ตรงตาม mockup */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Noto Sans Thai', sans-serif; }
      `}</style>
        </>
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
