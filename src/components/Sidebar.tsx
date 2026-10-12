'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MonitorPlay,
  Database,
  Bot,
  Bookmark,
  GraduationCap,
  BookOpen,
  User,
  Settings,
  Sparkles,
  Crown,
  ShieldCheck,
  X,
} from 'lucide-react';
import { usePlatformStore } from '@/lib/store/usePlatformStore';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const { mobileMenuOpen, setMobileMenuOpen, profile, logout } = usePlatformStore();

  // Hide sidebar on TCS iON exam screen
  if (pathname.startsWith('/test/')) {
    return null;
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/mock-setup', label: 'CBT Mock Lab', icon: MonitorPlay },
    { href: '/pyq', label: 'PYQ Bank', icon: Database },
    { href: '/ai-tutor', label: 'AI Doubt Tutor', icon: Bot },
    { href: '/syllabus', label: 'Syllabus & Topics', icon: BookOpen },
    { href: '/bookmarks', label: 'Mistake Notebook', icon: Bookmark },
    { href: '/catalogue', label: 'Exams', icon: GraduationCap },
    { href: '/subscription', label: 'Subscription (₹10)', icon: Crown },
    ...(profile.role === 'admin'
      ? [{ href: '/admin', label: 'Admin Hub', icon: ShieldCheck }]
      : []),
  ];

  const bottomItems = [
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/login', label: 'Switch / Sign Out', icon: Settings },
  ];

  const renderContent = (isMobile = false) => (
    <>
      <div>
        {/* Brand Logo & Mobile Close Button */}
        <div className="flex items-center justify-between px-2 py-3 mb-5">
          <Link
            href="/"
            onClick={() => isMobile && setMobileMenuOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#0F172A] font-black text-xs shadow-md tracking-wider">
              SSC
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                PARIKSHA<span className="text-[#155DFC]">AI</span>
              </span>
            </div>
          </Link>
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#155DFC] text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        {/* Bottom Preferences Nav */}
        <div className="space-y-1 pt-4 border-t border-white/10 mb-4">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => isMobile && setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4 text-slate-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Upgrade to Pro Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#16233B] via-[#1e1b4b] to-[#16233B] p-4 border border-purple-500/20 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-6 w-6 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-300">
              <Crown className="h-3.5 w-3.5 fill-amber-300" />
            </div>
            <span className="text-xs font-bold text-white">Upgrade to Pro</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug mb-3">
            Get full access to all features, AI drills & mocks.
          </p>
          <Link
            href="/subscription"
            onClick={() => isMobile && setMobileMenuOpen(false)}
            className="w-full rounded-xl bg-gradient-to-r from-[#155DFC] to-[#7C3AED] py-2 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all block text-center"
          >
            Upgrade for ₹10 →
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`w-[240px] h-full shrink-0 bg-[#0F172A] text-white flex flex-col justify-between p-4 select-none overflow-y-auto overscroll-contain z-30 ${className}`}
      >
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 w-[280px] max-w-[85vw] h-full bg-[#0F172A] text-white flex flex-col justify-between p-5 select-none overflow-y-auto overscroll-contain z-50 transition-transform duration-300 ease-out md:hidden shadow-2xl pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-[calc(env(safe-area-inset-bottom)+1.25rem)] ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      >
        {renderContent(true)}
      </aside>
    </>
  );
}
