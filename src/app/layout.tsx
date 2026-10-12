import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import AppShellWithAuthGuard from '@/components/AppShellWithAuthGuard';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0F172A',
};

export const metadata: Metadata = {
  title: 'ParikshaAI - AI-Powered Competitive Exam Preparation Platform',
  description:
    'Practice verified previous-year questions (PYQ), take realistic TCS iON computer-based mock tests, and get AI-personalised revision for SSC CGL, CHSL, MTS, CPO, GD, and RRB NTPC.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full h-[100dvh] bg-[#F5F8FC] text-[#111B32] font-sans antialiased overflow-hidden">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center min-h-[100dvh] bg-[#0F172A] text-white p-12 text-sm font-semibold">
              Loading ParikshaAI...
            </div>
          }
        >
          <AppShellWithAuthGuard>{children}</AppShellWithAuthGuard>
        </Suspense>
      </body>
    </html>
  );
}
