# ParikshaAI - AI-Powered Competitive Exam Preparation Platform

A production-oriented, responsive web application and TCS iON-grade Computer Based Test (CBT) examination simulator for Indian competitive examinations including **SSC CGL, SSC CHSL, SSC MTS, SSC GD, SSC CPO, SSC Stenographer, and RRB NTPC**.

---

## 🌟 Key Capabilities

### 1. Examination Catalogue & Syllabus Taxonomy
- **Multi-Exam Architecture**: Complete support for SSC CGL, CHSL, MTS, GD, CPO, and Stenographer with extensible data models for RRB NTPC, Railway Group D, and Banking.
- **Independent Tiers & Rules**: Each examination defines its specific tier, duration (e.g., 60m / 120m), total questions, positive marks (+2.00, +1.00), negative marking (-0.50, -0.25, -1.00), sectional distributions, and language permissions.
- **Cross-Exam Common Practice**: Select multiple target exams and practice shared subjects (Quantitative Aptitude, Reasoning, English, General Awareness) simultaneously.

### 2. Verified Previous-Year Question (PYQ) Engine
- **Rolling 10-Year Historical Window**: Genuine previous year questions extracted from officially published answer keys.
- **Zero Manufactured Papers**: We never generate pseudo-historical papers to fill unavailable years.
- **Source Provenance**: Every official question records its exam, year, shift number, date, and document hash.
- **Multilingual Support**: Questions and UI ready for English, Hindi (हिंदी), and Bengali (বাংলা).
- **3-Tier Explanations**: Every question includes:
  1. **Standard Academic Derivation**: Formulaic and rigorous mathematical/grammatical proof.
  2. **Beginner-Friendly Explanation**: Step-by-step intuition without technical jargon.
  3. **Speed Calculation Shortcut**: 20-second Vedic math tricks, unit digit hacks, or elimination strategies.

### 3. Realistic Computer-Based Test (CBT) Simulator
- **TCS iON Examination Interface**:
  - Full countdown timer with warning alerts (<5m amber, <1m red).
  - 5-State Question Palette: *Not Visited* (Grey), *Not Answered* (Red), *Answered* (Green), *Marked for Review* (Purple), and *Answered & Marked for Review* (Purple with green indicator).
  - Standard action controls: `Save & Next`, `Mark for Review & Next`, `Clear Response`, `Previous`, and `Submit Test`.
  - Automatic submission when time expires.
- **Fault-Tolerant Continuous Autosave**: Selected answers, visited states, and elapsed time continuously persist to `localStorage`. Page refreshes (F5) or accidental connection losses resume immediately without resetting the timer.
- **Anti-Cheat & Strict Security**: Correct answers and solution keys are strictly masked and never exposed to the client during an active test session. Pausing is forbidden in *Official Simulation* mode and allowed only in *Custom/Topic Practice*.
- **Keyboard Navigation**: Press `1-4` or `A-D` to choose an option, `S` or `Enter` for Save & Next, `M` for Mark for Review, `C` for Clear Response, and `P` for Previous.

### 4. AI Question Generation & Doubt Solver (OpenRouter)
- Powered by high-speed instruction & reasoning models from OpenRouter (configured for `google/gemma-4-31b-it:free`, `nvidia/nemotron-3-super-120b-a12b:free`, `nvidia/nemotron-3-ultra-550b-a55b:free`, `google/gemma-4-26b-a4b-it:free`).
- **Original MCQs**: Calibrated with 1 unique correct answer and 3 plausible distractors representing common student traps.
- **Instant AI Doubt Tutor**: Solves student questions, provides Vedic math hacks, and suggests similar shift trends.
- **Clear Distinctions**: AI-generated practice questions are distinctly tagged with `isAiGenerated: true` and never passed off as official papers.

### 5. Results, Diagnostics & Personalised Learning
- **Accurate Scoring**: Applies authentic exam positive and negative marking formulas.
- **Percentile & AIR Rank Projections**: Estimates national rank based on previous year cutoff distribution curves.
- **Time Management Quadrant**: Identifies *Fast & Correct*, *Slow & Correct*, *Careless Errors*, and *Time Traps* (>90s spent and wrong).
- **Mistake Notebook (ভুলের খাতা / गलती नोटबुक)**: Tag errors by category (`Calculation error`, `Concept gap`, `Silly mistake`, `Time pressure`), write personal reflection notes, and mark them resolved.
- **Adaptive Revision Generator**: 1-click generation of custom drill tests targeting identified weak topics.

### 6. Administration & PDF Ingestion Pipeline
- **Python Processing Worker** (`python_worker/extractor.py`): Parses standard SSC/RRB answer key layouts, chunks questions, extracts options, computes SHA-256 duplicate detection hashes, and classifies subjects/topics.
- **Admin Moderation Console** (`/admin`): Live PDF ingestion simulator, duplicate detection audit log, and an approval queue to review and approve questions into the live bank.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti
- **State & Storage**: Client-side resilient LocalStorage sync + Supabase PostgreSQL schema with RLS policies
- **AI Integration**: OpenRouter API with automated model fallback chain
- **PDF Extraction Worker**: Python 3 worker with regex tokenization and heuristic classification

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js v18+ (tested on Node v22)
- Python 3.10+ (for PDF ingestion worker)

### 2. Installation
```bash
# Clone or navigate to the project directory
cd pariksha-ai

# Install Node dependencies
npm install

# (Optional) Install Python worker dependencies
pip install -r scripts/python_worker/requirements.txt
```

### 3. Environment Setup
The project comes pre-configured with `.env.local`:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=google/gemma-4-31b-it:free
OPENROUTER_FALLBACK_MODELS=nvidia/nemotron-3-super-120b-a12b:free,nvidia/nemotron-3-ultra-550b-a55b:free,google/gemma-4-26b-a4b-it:free

NEXT_PUBLIC_APP_NAME=ParikshaAI
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running the Production Build
```bash
npm run build
npm run start
```

---

## 📂 Project Structure

```
pariksha-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing Page with CBT preview & exam catalogue
│   │   ├── layout.tsx                  # Root layout with Suspense & localized navbar
│   │   ├── dashboard/page.tsx          # Student dashboard (streaks, goals, resume banner)
│   │   ├── catalogue/                  # Exam catalogue directory
│   │   │   ├── page.tsx                # Filterable exams list
│   │   │   └── [id]/page.tsx           # Dynamic exam syllabus & tier pattern details
│   │   ├── subjects/page.tsx           # Subject syllabus & weightage breakdown
│   │   ├── mock-setup/page.tsx         # Test configurator (Official, Custom, Topic modes)
│   │   ├── test/[id]/page.tsx          # TCS iON CBT examination interface
│   │   ├── results/[id]/page.tsx       # Comprehensive scorecards, rankings & solution reviews
│   │   ├── ai-tutor/page.tsx           # AI Doubt Solver & Question Generator
│   │   ├── pyq/page.tsx                # 10-Yr Verified Question Bank with 3-tier solutions
│   │   ├── analytics/page.tsx          # Accuracy curves, speed indices & time traps
│   │   ├── bookmarks/page.tsx          # Mistake Notebook & Saved Questions
│   │   ├── admin/page.tsx              # PDF ingestion console & moderation queue
│   │   ├── login/page.tsx              # Sign-in & RBAC switcher
│   │   ├── profile/page.tsx            # Aspirant profile & target exams manager
│   │   └── api/
│   │       ├── ai/generate/route.ts    # AI original question generator endpoint
│   │       ├── ai/tutor/route.ts       # AI conceptual doubt solver endpoint
│   │       └── questions/route.ts      # Multi-criteria question filter API
│   ├── components/
│   │   ├── Navbar.tsx                  # Navigation bar with streak and language toggles
│   │   └── Footer.tsx                  # Educational disclaimer and footer links
│   ├── data/
│   │   ├── exams.ts                    # Examination catalogue, patterns, subjects & topics
│   │   └── questions.ts                # Verified genuine previous-year question bank
│   ├── lib/
│   │   ├── ai/openrouter.ts            # OpenRouter client with fallback model chain
│   │   ├── store/usePlatformStore.ts   # Persistent state store (LocalStorage & Supabase sync)
│   │   ├── testEngine.ts               # Test session generator & evaluation engine
│   │   └── i18n.ts                     # Multilingual dictionaries (EN, HI, BN)
│   └── types/index.ts                  # TypeScript domain models
├── scripts/python_worker/
│   ├── extractor.py                    # PDF OCR parser, regex chunker & duplicate detector
│   └── requirements.txt                # Python worker dependencies
├── supabase/
│   └── migrations/
│       └── 20261009_init.sql           # PostgreSQL schema with tables, indexes & RLS
└── package.json
```

---

## 🧪 Verification & Demonstration

1. **Test Session & Refresh Recovery**:
   - Go to `/mock-setup` and select *Custom Mock Test* or *Official Exam Simulation*.
   - Click **Launch Computer-Based Test (CBT)**.
   - Select answers, mark questions for review, or skip questions. Notice the 5-state palette updating.
   - Refresh the page (F5) or close the browser tab and return to the URL: all your answers and timer remain preserved!
2. **Anti-Cheat & Answer Security**:
   - During the test, correct answers are hidden and not revealed in the client DOM.
   - Click **Submit Test** to evaluate the exam.
3. **Results & 3-Tier Solutions**:
   - Inspect total marks (including negative marking deductions), accuracy, and time spent.
   - Open any question in the review section to inspect the **Standard Proof**, **Beginner Intuition**, and **20-Second Shortcut**.
   - Click **Add to Mistake Notebook** on any incorrect question and tag it with a reason.
4. **AI Tutor & Question Generation**:
   - Visit `/ai-tutor` to ask any conceptual doubt or generate original 4-option practice questions with calculations tricks.
5. **Python Worker**:
   - Run `python python_worker/extractor.py` in your terminal to see automatic PDF question extraction and duplicate hashing in action.
