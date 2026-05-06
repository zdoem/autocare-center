/**
 * ไฟล์: app/login/page.tsx
 * จุดประสงค์: หน้า Login UI (ตรงตาม Tabler mockup เป๊ะ)
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Script from 'next/script'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!username || !password) {
            toast.error('กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน')
            return
        }

        setIsLoading(true)

        try {
            const result = await signIn('credentials', {
                username,
                password,
                redirect: false,
            })

            if (result?.error) {
                toast.error('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง')
                setIsLoading(false)
            } else {
                toast.success('เข้าสู่ระบบสำเร็จ')
                router.push(callbackUrl)
                router.refresh()
            }
        } catch (error) {
            console.error('Login error:', error)
            toast.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
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
        .auth-side {
          background: linear-gradient(135deg, #206bc4 0%, #1a5a9e 100%);
        }
        .car-icon {
          font-size: 120px;
          opacity: 0.1;
          position: absolute;
          bottom: 20px;
          right: 20px;
        }
      `}</style>

            <Toaster position="top-right" />

            <div className="d-flex flex-column bg-white" style={{ minHeight: '100vh' }}>
                <div className="row g-0 flex-fill">
                    {/* Left Side - Login Form */}
                    <div className="col-12 col-lg-6 col-xl-4 border-top-wide border-primary d-flex flex-column justify-content-center">
                        <div className="container container-tight my-5 px-lg-5">
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
                                    <h2 className="h2 text-center mb-4">เข้าสู่ระบบ</h2>
                                    <form onSubmit={handleSubmit} autoComplete="off">
                                        <div className="mb-3">
                                            <label className="form-label">ชื่อผู้ใช้งาน</label>
                                            <div className="input-icon">
                                                <span className="input-icon-addon">
                                                    <i className="ti ti-user"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="กรอกชื่อผู้ใช้งาน"
                                                    autoComplete="off"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                รหัสผ่าน
                                                <span className="form-label-description">
                                                    <a href="/forgot-password">ลืมรหัสผ่าน?</a>
                                                </span>
                                            </label>
                                            <div className="input-icon">
                                                <span className="input-icon-addon">
                                                    <i className="ti ti-lock"></i>
                                                </span>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    placeholder="กรอกรหัสผ่าน"
                                                    autoComplete="off"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                    disabled={isLoading}
                                                />
                                                <span className="form-check-label">จดจำการเข้าสู่ระบบ</span>
                                            </label>
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
                                                        กำลังเข้าสู่ระบบ...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="ti ti-login me-2"></i>
                                                        เข้าสู่ระบบ
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div className="text-center text-muted mt-3">
                                <small>© 2024 Autocar Service Center v1.0.0</small>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Info */}
                    <div className="col-12 col-lg-6 col-xl-8 d-none d-lg-block">
                        <div className="auth-side h-100 d-flex flex-column justify-content-center text-white position-relative overflow-hidden">
                            <div className="container">
                                <div className="row justify-content-center">
                                    <div className="col-lg-8">
                                        <h1 className="display-5 mb-4">
                                            <i className="ti ti-car me-2"></i>
                                            ระบบบริหารจัดการอู่ซ่อมรถ
                                        </h1>
                                        <div className="row mt-5">
                                            <div className="col-md-4 mb-4">
                                                <div className="d-flex">
                                                    <div className="me-3">
                                                        <span className="avatar bg-white-lt">
                                                            <i className="ti ti-tools text-white"></i>
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="mb-1">บริการซ่อม</h4>
                                                        <p className="text-white-50 mb-0">จัดการงานซ่อมครบวงจร</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4 mb-4">
                                                <div className="d-flex">
                                                    <div className="me-3">
                                                        <span className="avatar bg-white-lt">
                                                            <i className="ti ti-box text-white"></i>
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="mb-1">คลังอะไหล่</h4>
                                                        <p className="text-white-50 mb-0">ระบบสต็อกอัจฉริยะ</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4 mb-4">
                                                <div className="d-flex">
                                                    <div className="me-3">
                                                        <span className="avatar bg-white-lt">
                                                            <i className="ti ti-report-analytics text-white"></i>
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="mb-1">รายงาน</h4>
                                                        <p className="text-white-50 mb-0">วิเคราะห์ธุรกิจแบบเรียลไทม์</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <i className="ti ti-car car-icon"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabler JS */}
            <Script
                src="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta20/dist/js/tabler.min.js"
                strategy="lazyOnload"
            />
        </>
    )
}
