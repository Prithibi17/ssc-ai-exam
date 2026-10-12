'use client';

import { useState } from 'react';
import {
  User,
  GraduationCap,
  Flame,
  Globe,
  Target,
  CheckCircle2,
  Calendar,
  Save,
} from 'lucide-react';
import { usePlatformStore } from '@/lib/store/usePlatformStore';
import { EXAMS_CATALOGUE } from '@/data/exams';
import { Language } from '@/types';

export default function ProfilePage() {
  const { profile, setProfile, language, changeLanguage, toggleTargetExam } = usePlatformStore();
  const [fullName, setFullName] = useState(profile.fullName);
  const [dailyGoal, setDailyGoal] = useState(30);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile((prev) => ({
      ...prev,
      fullName,
    }));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#155DFC] mb-2.5">
          <User className="h-3.5 w-3.5" />
          <span>Account Settings & Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111B32] tracking-tight">
          Aspirant Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Customize your target competitive exams, interface languages, and daily practice targets.
        </p>
      </div>

      {savedNotice && (
        <div className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-3.5 text-xs font-bold text-[#065F46] flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-[#059669]" />
          <span>Profile preferences saved successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-card space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#64748B] block mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs sm:text-sm text-[#111B32] focus:bg-white focus:border-[#155DFC] focus:outline-none focus:ring-2 focus:ring-[#93C5FD]/40 transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#64748B] block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F1F5F9] p-2.5 text-xs sm:text-sm text-[#94A3B8] cursor-not-allowed font-medium"
              />
            </div>
          </div>

          {/* Interface Language */}
          <div>
            <label className="text-xs font-semibold text-[#64748B] block mb-2">
              Default Interface & Question Language
            </label>
            <div className="flex flex-wrap gap-2.5">
              {[
                { code: 'en', label: 'English (EN)' },
                { code: 'hi', label: 'हिंदी (Hindi)' },
                { code: 'bn', label: 'বাংলা (Bengali)' },
              ].map((lang) => (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code as Language)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    language === lang.code
                      ? 'bg-[#155DFC] text-white shadow-xs'
                      : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#111B32] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Exams Multi-Selector */}
          <div>
            <label className="text-xs font-semibold text-[#64748B] block mb-2">
              Selected Target Examinations (Multiple Allowed)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXAMS_CATALOGUE.map((exam) => {
                const isSelected = profile.targetExams.includes(exam.id);
                return (
                  <div
                    key={exam.id}
                    onClick={() => toggleTargetExam(exam.id)}
                    className={`cursor-pointer rounded-xl border p-3.5 flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-[#155DFC] bg-[#EFF6FF] font-bold shadow-xs'
                        : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-[#111B32]">
                        {exam.name}
                      </p>
                      <span className="text-[11px] text-[#94A3B8]">{exam.conductingBody}</span>
                    </div>
                    <span
                      className={`h-5 w-5 rounded-lg flex items-center justify-center border text-xs ${
                        isSelected
                          ? 'border-[#155DFC] bg-[#155DFC] text-white font-bold'
                          : 'border-[#CBD5E1] bg-[#F8FAFC]'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Goal */}
          <div>
            <label className="text-xs font-semibold text-[#64748B] block mb-1">
              Daily Practice Question Target
            </label>
            <select
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full sm:w-72 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs sm:text-sm text-[#111B32] font-medium focus:bg-white focus:outline-none focus:border-[#155DFC]"
            >
              <option value={15}>15 Questions / Day (Beginner)</option>
              <option value={30}>30 Questions / Day (Recommended)</option>
              <option value={50}>50 Questions / Day (Intensive)</option>
              <option value={100}>100 Questions / Day (Full Simulation)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-[#F1F5F9] flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#155DFC] hover:bg-[#124BD4] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-all"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
