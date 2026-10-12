'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Menu,
  X,
  Globe,
  MonitorPlay,
  User,
  BookOpen,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import { usePlatformStore } from '@/lib/store/usePlatformStore';
import { TRANSLATIONS } from '@/lib/i18n';
import { Language } from '@/types';

export default function Navbar() {
  const pathname = usePathname();
  const { language, changeLanguage, profile } = usePlatformStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Strictly hide Navbar during active CBT exam session to replicate TCS iON lockdown
  if (pathname.startsWith('/test/')) {
    return null;
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/mock-setup', label: 'CBT Mock Lab', highlight: true },
    { href: '/pyq', label: 'PYQ Bank' },
    { href: '/ai-tutor', label: 'AI Doubt Tutor' },
    { href: '/bookmarks', label: 'Mistake Notebook' },
    { href: '/catalogue', label: 'Exams' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
      {/* 1. Subtle Indian National Tricolor Accent Bar */}
      <div className="h-[2px] w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* 2. Unified, Clean Main Navigation Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Brand Logo & Commission Identifier */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs shadow-2xs dark:bg-white dark:text-slate-900">
              SSC
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                Pariksha<span className="text-slate-500 font-medium">AI</span>
              </span>
              <span className="hidden sm:inline-block rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                Portal
              </span>
            </div>
          </Link>

          {/* Clean Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Fast Launch, Language & Profile */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/mock-setup"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <MonitorPlay className="h-3.5 w-3.5" />
              <span>Launch Mock</span>
            </Link>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-slate-700 dark:text-slate-300 text-xs bg-slate-50/60 dark:bg-slate-800">
              <Globe className="h-3 w-3 text-slate-400" />
              <select
                aria-label="Interface Language"
                value={language}
                onChange={(e) => changeLanguage(e.target.value as Language)}
                className="bg-transparent text-[11px] font-semibold focus:outline-none cursor-pointer"
              >
                <option value="en">EN</option>
                <option value="hi">हिंदी</option>
                <option value="bn">বাংলা</option>
              </select>
            </div>

            {/* Candidate Badge */}
            <Link
              href="/profile"
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <User className="h-3.5 w-3.5 text-[#0b3a75] dark:text-blue-400" />
              <span className="hidden md:inline font-bold text-[11px]">{profile.fullName.split(' ')[0]}</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Clean Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 shadow-lg space-y-1">
          {navLinks.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded text-xs font-semibold ${
                  isActive
                    ? 'bg-[#0b3a75] text-white'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <Link
              href="/mock-setup"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center rounded bg-[#0b3a75] py-2 text-xs font-bold text-white uppercase"
            >
              Launch CBT Mock Test
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
