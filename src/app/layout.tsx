/**
 * ไฟล์: app/layout.tsx
 * จุดประสงค์: Root Layout สำหรับ App
 * 
 * @author AutoCare Team
 * @created 2024-01-21
 */

import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Autocar Service Center",
  description: "ระบบบริหารจัดการอู่ซ่อมรถ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
