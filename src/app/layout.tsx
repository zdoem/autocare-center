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
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta20/dist/css/tabler.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
