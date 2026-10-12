'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, Globe, Sparkles, Menu, Crown, LogOut } from 'lucide-react';
import { usePlatformStore } from '@/lib/store/usePlatformStore';
import { Language } from '@/types';

export default function TopHeader() {
  const pathname = usePathname();
  const { profile, language, changeLanguage, mobileMenuOpen, setMobileMenuOpen, isSubscribed, logout } = usePlatformStore();

  // Hide on TCS iON test screen
  if (pathname.startsWith('/test/')) {
    return null;
  }

  return (
    <header className="shrink-0 flex h-14 sm:h-16 w-full items-center justify-between border-b border-[#E2E8F0] bg-white px-3 sm:px-8 z-20">
      {/* Mobile Drawer Hamburger & Mobile Brand */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-[#64748B] hover:text-[#111B32] hover:bg-[#F8FAFC] border border-[#E2E8F0] transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Mobile Brand Link visible only on mobile when sidebar is closed */}
        <Link href="/dashboard" className="flex md:hidden items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F172A] text-white font-black text-[10px]">
            SSC
          </div>
          <span className="font-extrabold text-xs tracking-tight text-[#111B32]">
            PARIKSHA<span className="text-[#155DFC]">AI</span>
          </span>
        </Link>
      </div>

      {/* Search Input (Hidden on extra small mobile, visible on sm+) */}
      <div className="hidden sm:block relative flex-1 max-w-md mx-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search for tests, topics, or questions..."
          className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-12 py-2 text-xs text-[#111B32] placeholder-[#94A3B8] focus:border-[#155DFC] focus:bg-white focus:outline-none transition-all"
        />
        <span className="hidden lg:inline-block absolute right-3 top-1/2 -translate-y-1/2 rounded border border-[#E2E8F0] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#94A3B8] shadow-2xs">
          Ctrl K
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Subscription Plans Link - Always visible on mobile & desktop */}
        <Link
          href="/subscription"
          title="View Subscription Plans"
          className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 ${
            isSubscribed
              ? 'bg-[#ECFDF5] text-[#059669] border border-emerald-200 hover:bg-emerald-100'
              : 'bg-purple-50 text-[#7C3AED] hover:bg-purple-100 border border-purple-200'
          }`}
        >
          <Crown className={`h-3.5 w-3.5 ${isSubscribed ? 'text-[#059669]' : 'text-amber-500 fill-amber-500'}`} />
          <span className="text-xs">{isSubscribed ? 'Pro' : 'Plans'}</span>
          <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-[#155DFC] text-white hidden sm:inline-block">
            {isSubscribed ? 'Active' : '₹10'}
          </span>
        </Link>

        {/* Notifications */}
        <button
          title="Notifications"
          className="relative rounded-xl border border-[#E2E8F0] p-2 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#111B32] transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#E11D48] ring-2 ring-white" />
        </button>

        {/* Language Selector */}
        <div className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] px-2.5 py-1.5 text-xs font-semibold text-[#111B32] bg-white">
          <Globe className="h-3.5 w-3.5 text-[#94A3B8]" />
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value as Language)}
            className="bg-transparent text-xs font-semibold text-[#111B32] focus:outline-none cursor-pointer"
          >
            <option value="en">EN</option>
            <option value="hi">HI</option>
            <option value="bn">BN</option>
          </select>
        </div>

        {/* User Pill & Sign Out */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#E2E8F0]">
          <Link href="/profile" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 group-hover:ring-blue-400 transition-all">
              {profile.fullName.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-[#111B32] block leading-tight group-hover:text-[#155DFC] transition-colors">
                {profile.fullName}
              </span>
              <span className="text-[10px] text-[#059669] font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                {profile.role === 'admin' ? 'Owner Admin' : isSubscribed ? 'Pro Member' : 'Free Aspirant'}
              </span>
            </div>
          </Link>

          <Link
            href="/login"
            onClick={() => logout()}
            title="Sign Out / Switch Account"
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#E11D48] hover:bg-[#FFF1F2] transition-colors ml-1"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
