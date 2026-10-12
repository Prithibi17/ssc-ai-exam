'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Copy,
  Clock,
  Sparkles,
  Search,
  User,
  Crown,
  AlertCircle,
  Layers,
  Database,
  ExternalLink,
  Send,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { usePlatformStore } from '@/lib/store/usePlatformStore';
import { ActivationCode } from '@/types';

export default function AdminPortalPage() {
  const {
    profile,
    login,
    activationCodes,
    generateActivationCode,
    paymentSubmissions,
    verifyPaymentAndGenerateCode,
    directGrantSubscription,
  } = usePlatformStore();

  const [activeTab, setActiveTab] = useState<'generator' | 'payments' | 'students' | 'ingestion'>('generator');

  // Code Generator States
  const [selectedPlanTier, setSelectedPlanTier] = useState<
    'sprint_5' | 'monthly_10' | 'quarterly_25' | 'half_yearly_45' | 'yearly_79' | 'lifetime_149'
  >('monthly_10');
  const [generateQuantity, setGenerateQuantity] = useState<number>(1);
  const [newlyGenerated, setNewlyGenerated] = useState<ActivationCode[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Direct Student Grant States
  const [studentPhoneToGrant, setStudentPhoneToGrant] = useState<string>('9800615892');
  const [grantSuccessMsg, setGrantSuccessMsg] = useState<string>('');

  // OCR Ingestion (Preserved)
  const [examCode, setExamCode] = useState('ssc_cgl');
  const [ingestionLogs, setIngestionLogs] = useState<string[]>([
    '[INIT] Admin Ingestion Worker ready.',
    '[STATUS] Single-use token cryptographer active.',
  ]);

  // Login state if not owner (no autofill)
  const [ownerPhoneInput, setOwnerPhoneInput] = useState('');
  const [ownerPassInput, setOwnerPassInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const isOwner =
    profile.role === 'admin' ||
    profile.phone === 'owner123' ||
    profile.phone === 'owner.123';

  const handleAdminQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    setAdminLoading(true);
    const res = await login(ownerPhoneInput, ownerPassInput);
    setAdminLoading(false);
    if (!res.success) {
      setAdminLoginError(res.message || 'Invalid owner credentials.');
    }
  };

  const handleGenerateCodes = () => {
    const plansMeta = {
      sprint_5: { duration: 7, price: 5, name: '7-Day Exam Sprint Pass (₹5)' },
      monthly_10: { duration: 30, price: 10, name: '1 Month Unlimited Pro (₹10)' },
      quarterly_25: { duration: 90, price: 25, name: '3 Months Target Tier-1 (₹25)' },
      half_yearly_45: { duration: 180, price: 45, name: '6 Months Comprehensive (₹45)' },
      yearly_79: { duration: 365, price: 79, name: '1 Year Full Season Pass (₹79)' },
      lifetime_149: { duration: 3650, price: 149, name: 'Lifetime Selection Pass (₹149)' },
    };

    const target = plansMeta[selectedPlanTier];
    const generated: ActivationCode[] = [];
    for (let i = 0; i < generateQuantity; i++) {
      const code = generateActivationCode(selectedPlanTier, target.duration, target.price, target.name);
      generated.push(code);
    }
    setNewlyGenerated(generated);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleDirectGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentPhoneToGrant.trim()) return;
    directGrantSubscription(studentPhoneToGrant.trim(), 30, '1 Month Unlimited Pro (Owner Grant)');
    setGrantSuccessMsg(`✅ Granted 30 Days Unlimited Pro to ${studentPhoneToGrant.trim()}!`);
    setTimeout(() => setGrantSuccessMsg(''), 4000);
  };

  if (!isOwner) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F5F8FC]">
        <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-card text-center space-y-5">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#111B32]">Owner Authentication Required</h2>
            <p className="text-xs text-[#64748B] mt-1">
              Please log in with your owner credentials to access the Code Generator and verification dashboard.
            </p>
          </div>

          {adminLoginError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
              {adminLoginError}
            </div>
          )}

          <form onSubmit={handleAdminQuickLogin} className="space-y-3 text-left text-xs">
            <div>
              <label className="font-bold text-[#111B32] block mb-1">Owner User ID / Phone</label>
              <input
                type="text"
                required
                autoComplete="off"
                placeholder="Enter owner user ID"
                value={ownerPhoneInput}
                onChange={(e) => setOwnerPhoneInput(e.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-xs font-mono font-bold text-[#111B32] focus:bg-white focus:border-purple-600 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="font-bold text-[#111B32] block mb-1">Owner Password</label>
              <input
                type="password"
                required
                autoComplete="off"
                placeholder="Enter password"
                value={ownerPassInput}
                onChange={(e) => setOwnerPassInput(e.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-xs font-mono font-bold text-[#111B32] focus:bg-white focus:border-purple-600 focus:outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={adminLoading}
              className="w-full rounded-xl bg-[#7C3AED] hover:bg-purple-700 py-3 font-bold text-white text-xs transition-colors flex items-center justify-center gap-2"
            >
              {adminLoading ? 'Verifying...' : 'Unlock Owner Admin Panel →'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const unusedCount = activationCodes.filter((c) => !c.isUsed).length;
  const usedCount = activationCodes.filter((c) => c.isUsed).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0F172A] text-white shadow-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold text-[10px] uppercase tracking-wider border border-purple-500/30">
              Owner Control Suite
            </span>
            <span className="text-xs text-slate-400">Telegram Admin: +91 9800615892</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Subscription Code Generator & Administration
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Issue single-use activation codes for ₹10 PhonePe UPI payments and manage candidate access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">Active Unused Codes</span>
            <span className="text-lg font-black text-emerald-400">{unusedCount}</span>
          </div>
          <div className="h-8 w-[1px] bg-white/20" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">Redeemed Codes</span>
            <span className="text-lg font-black text-amber-400">{usedCount}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E2E8F0] gap-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('generator')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'generator'
              ? 'border-[#155DFC] text-[#155DFC]'
              : 'border-transparent text-[#64748B] hover:text-[#111B32]'
          }`}
        >
          <KeyRound className="h-4 w-4" />
          <span>1-Time Code Generator & Ledger ({activationCodes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'payments'
              ? 'border-[#155DFC] text-[#155DFC]'
              : 'border-transparent text-[#64748B] hover:text-[#111B32]'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Payment Submissions ({paymentSubmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'students'
              ? 'border-[#155DFC] text-[#155DFC]'
              : 'border-transparent text-[#64748B] hover:text-[#111B32]'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Direct Access Grants</span>
        </button>

        <button
          onClick={() => setActiveTab('ingestion')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ingestion'
              ? 'border-[#155DFC] text-[#155DFC]'
              : 'border-transparent text-[#64748B] hover:text-[#111B32]'
          }`}
        >
          <Database className="h-4 w-4" />
          <span>Answer Key Ingestion</span>
        </button>
      </div>

      {/* TAB 1: CODE GENERATOR & LEDGER */}
      {activeTab === 'generator' && (
        <div className="space-y-6">
          {/* Generator Controls Card */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#111B32]">Generate Single-Use Activation Codes</h2>
                <p className="text-xs text-[#64748B]">
                  Each code can be used by exactly 1 student 1 time to activate unlimited mock tests & PYQ access.
                </p>
              </div>
              <span className="text-xs bg-[#EFF6FF] text-[#155DFC] font-bold px-2.5 py-1 rounded-lg border border-blue-200">
                1-Time Use Guaranteed
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
              {[
                { id: 'sprint_5', title: '7 Days (₹5)', days: 7, desc: 'Exam Week Sprint', badge: 'Sprint' },
                { id: 'monthly_10', title: '1 Month (₹10)', days: 30, desc: 'Launch Special', badge: 'Popular' },
                { id: 'quarterly_25', title: '3 Months (₹25)', days: 90, desc: 'Target Tier-1', badge: 'Quarterly' },
                { id: 'half_yearly_45', title: '6 Months (₹45)', days: 180, desc: 'Tier-1 + Tier-2', badge: 'Combo' },
                { id: 'yearly_79', title: '1 Year (₹79)', days: 365, desc: 'Full Season Pass', badge: 'Annual' },
                { id: 'lifetime_149', title: 'Lifetime (₹149)', days: 3650, desc: 'Till Selection Club', badge: 'Ultimate' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setSelectedPlanTier(tier.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedPlanTier === tier.id
                      ? 'border-[#155DFC] bg-[#EFF6FF] text-[#155DFC] ring-2 ring-[#155DFC] shadow-sm'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:bg-white hover:text-[#111B32]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-blue-100/60 text-[#155DFC]">
                      {tier.badge}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-[#111B32]">{tier.title}</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">{tier.days >= 3650 ? 'Lifetime' : `${tier.days} Days`}</div>
                  <div className="text-[10px] text-[#155DFC] font-semibold mt-1 truncate">{tier.desc}</div>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-[#64748B]">Quantity:</span>
                <select
                  value={generateQuantity}
                  onChange={(e) => setGenerateQuantity(Number(e.target.value))}
                  className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-bold text-[#111B32] focus:outline-none"
                >
                  <option value={1}>1 Single Code</option>
                  <option value={3}>3 Codes</option>
                  <option value={5}>5 Codes</option>
                  <option value={10}>10 Codes</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleGenerateCodes}
                className="w-full sm:w-auto rounded-xl bg-[#155DFC] hover:bg-[#124BD4] text-white px-6 py-2.5 font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all ml-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Generate {generateQuantity} Activation Code{generateQuantity > 1 ? 's' : ''}</span>
              </button>
            </div>

            {/* Newly Generated Output Display */}
            {newlyGenerated.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-[#F5F3FF] border border-purple-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED]">
                    <Sparkles className="h-4 w-4" />
                    <span>Generated Codes Ready to Send:</span>
                  </div>
                  <span className="text-[11px] text-[#64748B]">
                    Send these to candidates on Telegram (+91 9800615892)
                  </span>
                </div>

                <div className="space-y-2">
                  {newlyGenerated.map((code) => (
                    <div
                      key={code.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg bg-white border border-purple-100 text-xs font-mono"
                    >
                      <div>
                        <span className="font-bold text-[#111B32] text-sm tracking-wider">{code.code}</span>
                        <span className="text-[11px] text-[#64748B] block font-sans">
                          {code.planName} • {code.durationDays} Days • ₹{code.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(code.code)}
                          className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold font-sans flex items-center gap-1.5 transition-colors ${
                            copiedCode === code.code
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#155DFC] text-white hover:bg-[#124BD4]'
                          }`}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>{copiedCode === code.code ? 'Copied!' : 'Copy Code'}</span>
                        </button>
                        <a
                          href={`https://t.me/+919800615892?text=Hello!%20Here%20is%20your%201-time%20activation%20code:%20${code.code}%20for%20${encodeURIComponent(code.planName)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#229ED9] text-white font-sans text-xs font-bold hover:bg-[#1E88E5] flex items-center gap-1"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Share on Telegram</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Master Codes Ledger Table */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-card overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#111B32]">All Single-Use Activation Codes ({activationCodes.length})</h3>
                <p className="text-xs text-[#64748B]">Permanent audit trail of all generated & redeemed tokens.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0]">
                  <tr>
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">Tier / Plan</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Redeemed By</th>
                    <th className="p-3.5">Redeemed Date</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {activationCodes.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#111B32]">{c.code}</td>
                      <td className="p-3.5 text-[#64748B]">{c.planName}</td>
                      <td className="p-3.5 font-bold text-[#111B32]">₹{c.price}</td>
                      <td className="p-3.5">
                        {c.isUsed ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            Redeemed (Used)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-bold text-[#059669] border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                            Active / Unused
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-[#64748B]">{c.usedByPhone || '—'}</td>
                      <td className="p-3.5 text-[#64748B]">
                        {c.usedAt ? new Date(c.usedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(c.code)}
                          className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] hover:bg-white text-[#111B32] text-[11px] font-semibold"
                        >
                          {copiedCode === c.code ? 'Copied' : 'Copy'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT VERIFICATIONS */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card space-y-3">
            <h2 className="text-sm font-bold text-[#111B32]">Candidate Payment Proofs & UTR Submissions</h2>
            <p className="text-xs text-[#64748B]">
              When students pay ₹10 on the PhonePe QR code and submit their UTR/Transaction ID, click &quot;Verify &amp; Generate Code&quot; to issue their 1-time activation code immediately.
            </p>

            {paymentSubmissions.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#94A3B8] border border-dashed border-[#E2E8F0] rounded-xl">
                No transaction submissions yet. When students submit on the subscription page, they will appear here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0]">
                    <tr>
                      <th className="p-3.5">Candidate Phone</th>
                      <th className="p-3.5">Transaction ID / UTR</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Submitted At</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {paymentSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#F8FAFC]">
                        <td className="p-3.5 font-bold font-mono text-[#111B32]">{sub.userPhone}</td>
                        <td className="p-3.5 font-mono text-purple-700 font-bold">{sub.transactionId}</td>
                        <td className="p-3.5 font-bold text-[#059669]">₹{sub.amount}</td>
                        <td className="p-3.5 text-[#64748B]">{new Date(sub.submittedAt).toLocaleString()}</td>
                        <td className="p-3.5">
                          {sub.status === 'verified' ? (
                            <span className="text-[#059669] font-bold text-[11px]">Verified ({sub.generatedCode})</span>
                          ) : (
                            <span className="text-amber-600 font-bold text-[11px]">Pending Verification</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          {sub.status !== 'verified' ? (
                            <button
                              type="button"
                              onClick={() => {
                                const res = verifyPaymentAndGenerateCode(sub.id);
                                if (res.code) {
                                  handleCopyCode(res.code.code);
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs"
                            >
                              Verify &amp; Generate Code
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleCopyCode(sub.generatedCode || '')}
                              className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold"
                            >
                              Copy Code
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DIRECT STUDENT GRANTS */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card space-y-4 max-w-xl">
            <h2 className="text-sm font-bold text-[#111B32]">Grant Unlimited Access to Student Directly</h2>
            <p className="text-xs text-[#64748B]">
              If a student contacted you on Telegram (+91 9800615892) or paid cash, you can directly activate their account here without issuing a code.
            </p>

            {grantSuccessMsg && (
              <div className="p-3 rounded-xl bg-[#ECFDF5] border border-emerald-200 text-xs text-[#059669] font-bold">
                {grantSuccessMsg}
              </div>
            )}

            <form onSubmit={handleDirectGrant} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#111B32] block mb-1">Student Phone Number</label>
                <input
                  type="text"
                  required
                  value={studentPhoneToGrant}
                  onChange={(e) => setStudentPhoneToGrant(e.target.value)}
                  placeholder="e.g. 9800615892"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 font-mono text-xs text-[#111B32]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#155DFC] hover:bg-[#124BD4] text-white py-2.5 font-bold text-xs shadow-xs"
              >
                Grant 30 Days Unlimited Pro Access →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: ANSWER KEY INGESTION */}
      {activeTab === 'ingestion' && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-[#111B32]">TCS iON OCR Layout & Question Extractor</h2>
          <p className="text-xs text-[#64748B]">
            Automated parser for official SSC CGL, CHSL, MTS answer key PDFs and HTML layouts.
          </p>

          <div className="space-y-2 font-mono text-[11px] bg-[#0F172A] text-emerald-400 p-4 rounded-xl max-h-48 overflow-y-auto">
            {ingestionLogs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
