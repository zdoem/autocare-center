/**
 * ไฟล์: components/layout/Footer.tsx
 * จุดประสงค์: Footer component สำหรับ MainLayout
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

'use client'

interface FooterProps {
    version?: string
}

export default function Footer({ version = '1.0.0' }: FooterProps) {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer footer-transparent d-print-none">
            <div className="container-xl">
                <div className="row text-center align-items-center">
                    <div className="col-12">
                        <span className="text-muted">
                            © {currentYear} Autocar Service Center v{version}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
