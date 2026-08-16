'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function InventoryMovementRedirectPage() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/inventory/stock?tab=movement')
    }, [router])

    return (
        <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="text-muted mt-2">กำลังนำทางไปยังประวัติความเคลื่อนไหว...</div>
        </div>
    )
}
