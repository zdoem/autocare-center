/**
 * ไฟล์: app/reset-password/page.tsx
 * จุดประสงค์: หน้าตั้งรหัสผ่านใหม่ (จาก link ใน email)
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import Script from 'next/script'

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        if (!token) {
            toast.error('ลิงก์ไม่ถูกต้องหรือหมดอายุ')
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!password || !confirmPassword) {
            toast.error('กรุณากรอกรหัสผ่านให้ครบ')
            return
        }

        if (password.length < 8) {
            toast.error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
            return
        }

        if (password !== confirmPassword) {
            toast.error('รหัสผ่านไม่ตรงกัน')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })

            const data = await response.json()

            if (response.ok) {
                setIsSuccess(true)
                toast.success('เปลี่ยนรหัสผ่านเรียบร้อย')
            } else {
                toast.error(data.message || 'เกิดข้อผิดพลาด')
            }
        } catch (error) {
            console.error('Reset password error:', error)
            toast.error('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน')
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
                                <h2 className="h2 text-center mb-4">ตั้งรหัสผ่านใหม่</h2>

                                {!token ? (
                                    // Invalid Token State
                                    <div className="text-center">
                                        <div className="mb-4">
                                            <span className="avatar avatar-xl bg-red-lt">
                                                <i className="ti ti-alert-circle" style={{ fontSize: '2rem' }}></i>
                                            </span>
                                        </div>
                                        <h3 className="mb-2">ลิงก์ไม่ถูกต้อง</h3>
                                        <p className="text-muted">
                                            ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว<br />
                                            กรุณาขอลิงก์ใหม่อีกครั้ง
                                        </p>
                                        <div className="mt-4">
                                            <Link href="/forgot-password" className="btn btn-primary">
                                                <i className="ti ti-mail me-2"></i>
                                                ขอลิงก์ใหม่
                                            </Link>
                                        </div>
                                    </div>
                                ) : isSuccess ? (
                                    // Success State
                                    <div className="text-center">
                                        <div className="mb-4">
                                            <span className="avatar avatar-xl bg-green-lt">
                                                <i className="ti ti-check" style={{ fontSize: '2rem' }}></i>
                                            </span>
                                        </div>
                                        <h3 className="mb-2">เปลี่ยนรหัสผ่านสำเร็จ!</h3>
                                        <p className="text-muted">
                                            คุณสามารถใช้รหัสผ่านใหม่เข้าสู่ระบบได้แล้ว
                                        </p>
                                        <div className="mt-4">
                                            <Link href="/login" className="btn btn-primary">
                                                <i className="ti ti-login me-2"></i>
                                                เข้าสู่ระบบ
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    // Form State
                                    <form onSubmit={handleSubmit} autoComplete="off">
                                        <div className="mb-3">
                                            <label className="form-label">รหัสผ่านใหม่</label>
                                            <div className="input-icon">
                                                <span className="input-icon-addon">
                                                    <i className="ti ti-lock"></i>
                                                </span>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="form-control"
                                                    placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
                                                    autoComplete="new-password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    disabled={isLoading}
                                                />
                                                <span
                                                    className="input-icon-addon cursor-pointer"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    <i className={`ti ti-eye${showPassword ? '-off' : ''}`}></i>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">ยืนยันรหัสผ่านใหม่</label>
                                            <div className="input-icon">
                                                <span className="input-icon-addon">
                                                    <i className="ti ti-lock-check"></i>
                                                </span>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="form-control"
                                                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                                                    autoComplete="new-password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                                        กำลังบันทึก...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="ti ti-device-floppy me-2"></i>
                                                        บันทึกรหัสผ่านใหม่
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
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
