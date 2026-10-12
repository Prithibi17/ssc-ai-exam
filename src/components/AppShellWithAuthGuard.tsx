'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usePlatformStore } from '@/lib/store/usePlatformStore';
import { Loader2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function AppShellWithAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, isLoaded } = usePlatformStore();
  const [isReady, setIsReady] = useState(false);

  const isLoginPage = pathname === '/login';
  const isAuthenticated = Boolean(profile && profile.phone && profile.phone.trim() !== '');

  useEffect(() => {
    if (!isLoaded) return;

    if (!isAuthenticated) {
      if (!isLoginPage) {
        // Strict Protection: Unauthenticated candidates cannot visit any internal pages
        router.replace('/login');
      } else {
        setIsReady(true);
      }
    } else {
      // Authenticated candidate
      if (isLoginPage) {
        // If already logged in, redirect away from /login
        if (profile.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/dashboard');
        }
      } else if (pathname === '/') {
        router.replace('/dashboard');
      } else {
        setIsReady(true);
      }
    }
  }, [isAuthenticated, isLoaded, isLoginPage, router, profile.role]);

  // Loading state while verifying candidate authentication session from database/localStorage
  if (!isLoaded || (!isReady && !isLoginPage && !isAuthenticated)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] w-full bg-[#0F172A] text-white p-6 space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-[#155DFC] flex items-center justify-center font-black text-white text-base shadow-lg animate-pulse">
          SSC
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin text-[#155DFC]" />
          <span>Verifying Candidate Authentication...</span>
        </div>
      </div>
    );
  }

  // If on Login/Sign-up page, render standalone clean portal without app shell navigation bars
  if (isLoginPage) {
    return (
      <div className="flex-1 flex flex-col min-h-[100dvh] w-full bg-[#F5F8FC]">
        {children}
      </div>
    );
  }

  // If unauthenticated on a protected page, prevent rendering until redirect executes
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated Candidate: Render full interactive application shell
  return (
    <div className="h-full h-[100dvh] flex bg-[#F5F8FC] text-[#111B32] font-sans antialiased overflow-hidden w-full">
      {/* Left App-Shell Sidebar: fixed desktop sidebar + mobile drawer */}
      <Sidebar className="hidden md:flex" />

      {/* Right Main Body: fixed top header and interior scrolling content */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full h-full overflow-hidden bg-[#F5F8FC]">
        <TopHeader />
        <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden overscroll-none min-w-0 w-full max-w-full bg-[#F5F8FC] pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Sticky Bottom App Bar */}
      <MobileBottomNav />
    </div>
  );
}
