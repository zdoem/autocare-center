/**
 * ไฟล์: app/forgot-password/page.tsx
 * จุดประสงค์: หน้าลืมรหัสผ่าน - กรอก email เพื่อรับลิงก์ reset
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import Script from 'next/script'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email) {
            toast.error('กรุณากรอกอีเมล')
            return
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            toast.error('รูปแบบอีเมลไม่ถูกต้อง')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (response.ok) {
                setIsSuccess(true)
                toast.success('ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว')
            } else {
                toast.error(data.message || 'เกิดข้อผิดพลาด')
            }
        } catch (error) {
            console.error('Forgot password error:', error)
            toast.error('เกิดข้อผิดพลาดในการส่งอีเมล')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {/* Tabler CSS */}
            <link
                href="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta20/dist/css/tabler.min.css"
                rel="stylesheet"
            />
            <link
                href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css"
                rel="stylesheet"
            />

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Noto Sans Thai', sans-serif; }
      `}</style>

            <Toaster position="top-right" />

            <div className="d-flex flex-column bg-white" style={{ minHeight: '100vh' }}>
                <div className="page page-center">
                    <div className="container container-tight py-4">
                        <div className="text-center mb-4">
                            <a href="." className="navbar-brand navbar-brand-autodark">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/3774/3774278.png"
                                    width="80"
                                    height="80"
                                    alt="Autocar"
                                />
                            </a>
                            <h2 className="mt-3 text-primary">AUTOCAR</h2>
                            <p className="text-muted">ศูนย์บริการซ่อมรถยนต์</p>
                        </div>

                        <div className="card card-md">
                            <div className="card-body">
                                <h2 className="h2 text-center mb-4">ลืมรหัสผ่าน</h2>

                                {isSuccess ? (
                                    // Success State
                                    <div className="text-center">
                                        <div className="mb-4">
                                            <span className="avatar avatar-xl bg-green-lt">
                                                <i className="ti ti-mail-check" style={{ fontSize: '2rem' }}></i>
                                            </span>
                                        </div>
                                        <h3 className="mb-2">ส่งอีเมลเรียบร้อย!</h3>
                                        <p className="text-muted">
                                            เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยัง<br />
                                            <strong>{email}</strong>
                                        </p>
                                        <p className="text-muted small">
                                            กรุณาตรวจสอบอีเมลของคุณ หากไม่พบให้ตรวจสอบใน Spam folder
                                        </p>
                                        <div className="mt-4">
                                            <Link href="/login" className="btn btn-primary">
                                                <i className="ti ti-arrow-left me-2"></i>
                                                กลับไปหน้าเข้าสู่ระบบ
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    // Form State
                                    <>
                                        <p className="text-muted mb-4 text-center">
                                            กรอกอีเมลที่ลงทะเบียนไว้ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้
                                        </p>
                                        <form onSubmit={handleSubmit} autoComplete="off">
                                            <div className="mb-3">
                                                <label className="form-label">อีเมล</label>
                                                <div className="input-icon">
                                                    <span className="input-icon-addon">
                                                        <i className="ti ti-mail"></i>
                                                    </span>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        placeholder="กรอกอีเมลของคุณ"
                                                        autoComplete="off"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-footer">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary w-100"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                            กำลังส่ง...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="ti ti-mail-forward me-2"></i>
                                                            ส่งลิงก์รีเซ็ตรหัสผ่าน
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="text-center text-muted mt-3">
                            <Link href="/login" className="text-muted">
                                <i className="ti ti-arrow-left me-1"></i>
                                กลับไปหน้าเข้าสู่ระบบ
                            </Link>
                        </div>

                        <div className="text-center text-muted mt-3">
                            <small>© 2024 Autocar Service Center v1.0.0</small>
                        </div>
                    </div>
                </div>
            </div>

            <Script
                src="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta20/dist/js/tabler.min.js"
                strategy="lazyOnload"
            />
        </>
    )
}
