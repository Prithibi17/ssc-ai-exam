'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Sparkles, CheckCircle2, PhoneCall, HelpCircle, FileText, ExternalLink } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Strictly hide Footer during active CBT exam session to replicate TCS iON lockdown
  if (pathname.startsWith('/test/')) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs">
      {/* Official Helpdesk & Candidate Notice Bar */}
      <div className="bg-slate-50 border-b border-slate-200/80 py-3 px-4">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-semibold text-slate-800">
              Examination Guidance Helpline:
            </span>
            <span className="font-mono font-semibold text-slate-700">
              1800-11-7788 (09:30 AM to 06:00 PM IST)
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400">
            <span>Server: AS-DEL-CBT-04</span>
            <span>•</span>
            <span>TCS iON Examination Engine v4.2.8 Compatible</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Institutional About */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs">
                PA
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 tracking-tight block">
                  PARIKSHA<span className="text-slate-500">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium block -mt-0.5">
                  Competitive Exam Preparation
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Computer-based test (CBT) preparation platform engineered for genuine exam hall familiarity, authentic TCS iON examination consoles, and verified PYQs.
            </p>
            <div className="pt-1 flex flex-col gap-1 text-[11px] text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1.5 text-emerald-600">
                <ShieldCheck className="h-3.5 w-3.5" />
                100% Genuine Answer Key Sourced
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Negative Marking Accurate Formulas
              </span>
            </div>
          </div>

          {/* Column 2: Examination Catalogue */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 border-b border-slate-100 pb-1.5">
              Active Examinations
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/catalogue/ssc_cgl" className="text-slate-500 hover:text-slate-900 transition-colors">
                  SSC Combined Graduate Level (CGL)
                </Link>
              </li>
              <li>
                <Link href="/catalogue/ssc_chsl" className="text-slate-500 hover:text-slate-900 transition-colors">
                  SSC Combined Higher Secondary (CHSL)
                </Link>
              </li>
              <li>
                <Link href="/catalogue/ssc_mts" className="text-slate-500 hover:text-slate-900 transition-colors">
                  SSC Multi-Tasking Staff (MTS & Havaldar)
                </Link>
              </li>
              <li>
                <Link href="/catalogue/ssc_cpo" className="text-slate-500 hover:text-slate-900 transition-colors">
                  SSC Central Police Org (CPO SI)
                </Link>
              </li>
              <li>
                <Link href="/catalogue/ssc_gd" className="text-slate-500 hover:text-slate-900 transition-colors">
                  SSC General Duty (GD Constable)
                </Link>
              </li>
              <li>
                <Link href="/catalogue/rrb_ntpc" className="text-slate-500 hover:text-slate-900 transition-colors">
                  Railway Non-Technical Popular (RRB NTPC)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Candidate Corner & Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 border-b border-slate-100 pb-1.5">
              Candidate Services
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/mock-setup" className="text-slate-500 hover:text-slate-900 transition-colors">
                  Launch CBT Simulation (TCS iON Layout)
                </Link>
              </li>
              <li>
                <Link href="/pyq" className="text-slate-500 hover:text-slate-900 transition-colors">
                  Previous Year Question Bank (2015-2025)
                </Link>
              </li>
              <li>
                <Link href="/ai-tutor" className="text-slate-500 hover:text-slate-900 transition-colors">
                  AI Doubt Resolution & Vedic Math Tricks
                </Link>
              </li>
              <li>
                <Link href="/bookmarks" className="text-slate-500 hover:text-slate-900 transition-colors">
                  Mistake Notebook (ভুলের খাতা / गलती पुस्तिका)
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors">
                  Candidate Mock Hall Ticket & Progress
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-slate-500 hover:text-slate-900 transition-colors">
                  Official PDF Answer Key Ingestion Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Guidelines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 border-b border-slate-100 pb-1.5">
              Examination Guidelines
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
              Familiarize yourself thoroughly with the 5-state question palette, keyboard shortcuts, sectional navigation, and submission protocols.
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-[10px] space-y-1">
              <span className="font-semibold text-slate-800 block">Keyboard Shortcuts in CBT:</span>
              <span className="block text-slate-500">1-4 / A-D: Select Option</span>
              <span className="block text-slate-500">S or Enter: Save & Next</span>
              <span className="block text-slate-500">M: Mark for Review & Next</span>
              <span className="block text-slate-500">C: Clear Response | P: Previous</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>
            © 2026 ParikshaAI Examination Assessment Platform.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">Terms of Assessment</Link>
            <Link href="/" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-slate-900 transition-colors">Hyperlinking Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
