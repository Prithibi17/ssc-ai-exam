'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MonitorPlay,
  Database,
  Bot,
  Crown,
  ShieldCheck,
} from 'lucide-react';
import { usePlatformStore } from '@/lib/store/usePlatformStore';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { profile, isSubscribed } = usePlatformStore();

  // Hide during active CBT exam sessions
  if (pathname.startsWith('/test/')) {
    return null;
  }

  const navItems = [
    {
      href: '/dashboard',
      label: 'Home',
      icon: LayoutDashboard,
      isActive: pathname === '/' || pathname === '/dashboard',
    },
    {
      href: '/mock-setup',
      label: 'CBT Mocks',
      icon: MonitorPlay,
      isActive: pathname.startsWith('/mock-setup'),
    },
    {
      href: '/pyq',
      label: 'PYQ Bank',
      icon: Database,
      isActive: pathname.startsWith('/pyq'),
    },
    {
      href: '/subscription',
      label: 'Plans',
      icon: Crown,
      isActive: pathname.startsWith('/subscription'),
      badge: isSubscribed ? 'Active' : '₹10',
      badgeColor: isSubscribed
        ? 'bg-emerald-500 text-white'
        : 'bg-gradient-to-r from-[#155DFC] to-[#7C3AED] text-white',
    },
    profile.role === 'admin'
      ? {
          href: '/admin',
          label: 'Admin',
          icon: ShieldCheck,
          isActive: pathname.startsWith('/admin'),
          badge: 'Owner',
          badgeColor: 'bg-purple-600 text-white',
        }
      : {
          href: '/ai-tutor',
          label: 'AI Tutor',
          icon: Bot,
          isActive: pathname.startsWith('/ai-tutor'),
        },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-1 py-1.5 shadow-[0_-4px_16px_rgba(15,23,42,0.06)] pb-[calc(env(safe-area-inset-bottom)+6px)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative select-none ${
                active
                  ? 'text-[#155DFC] font-bold'
                  : 'text-[#64748B] hover:text-[#111B32] font-medium'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-lg transition-transform ${
                    active ? 'bg-blue-50 text-[#155DFC] scale-105' : ''
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {item.badge && (
                  <span
                    className={`absolute -top-1.5 -right-2 text-[9px] font-black px-1.5 py-0.2 rounded-full leading-tight shadow-xs whitespace-nowrap ${
                      item.badgeColor || 'bg-[#155DFC] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
