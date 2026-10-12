-- ==============================================================================
-- PARIKSHA AI: COMPLETE POSTGRESQL SCHEMA FOR COMPETITIVE EXAMS PLATFORM
-- Covers SSC CGL, CHSL, MTS, GD, CPO, Steno, RRB, Banking, and State Exams
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles & RBAC
CREATE TYPE user_role AS ENUM ('student', 'content_creator', 'moderator', 'admin');
CREATE TYPE preferred_lang AS ENUM ('en', 'hi', 'bn');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'student',
    preferred_language preferred_lang DEFAULT 'en',
    target_exams TEXT[] DEFAULT ARRAY['ssc_cgl'],
    daily_goal_questions INT DEFAULT 30,
    current_streak INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Examination Catalogue & Taxonomy
CREATE TYPE exam_category AS ENUM ('ssc', 'railways', 'banking', 'defence', 'state_psc', 'other');

CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- e.g. 'ssc_cgl', 'ssc_chsl', 'ssc_mts', 'rrb_ntpc'
    name TEXT NOT NULL,
    category exam_category NOT NULL,
    conducting_body TEXT NOT NULL, -- e.g. 'Staff Selection Commission'
    description TEXT,
    eligibility_criteria TEXT,
    official_website TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    tier_name TEXT NOT NULL, -- e.g. 'Tier-1', 'Tier-2', 'CBT-1'
    total_questions INT NOT NULL,
    total_marks NUMERIC(6, 2) NOT NULL,
    duration_minutes INT NOT NULL,
    marks_per_correct NUMERIC(4, 2) NOT NULL,
    negative_marking NUMERIC(4, 2) NOT NULL, -- e.g. 0.50 or 0.25
    has_sectional_timing BOOLEAN DEFAULT FALSE,
    sectional_timing_minutes INT,
    rules_json JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Subjects & Syllabus Hierarchies
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- e.g. 'quant', 'reasoning', 'english', 'ga'
    name TEXT NOT NULL,
    name_hi TEXT,
    name_bn TEXT,
    icon_name TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_hi TEXT,
    name_bn TEXT,
    slug TEXT NOT NULL,
    description TEXT,
    weightage_rating INT DEFAULT 3, -- 1 to 5 scale
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(subject_id, slug)
);

-- 5. Historical Papers & Source Provenance
CREATE TYPE paper_source_type AS ENUM ('official_pdf', 'licensed_dataset', 'rbi_press', 'ssc_digi');

CREATE TABLE IF NOT EXISTS papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    exam_pattern_id UUID REFERENCES exam_patterns(id) ON DELETE SET NULL,
    year INT NOT NULL,
    shift_number INT NOT NULL,
    exam_date DATE,
    tier TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    source_type paper_source_type DEFAULT 'official_pdf',
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(exam_id, year, tier, shift_number)
);

CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    file_size_bytes BIGINT,
    license_type TEXT DEFAULT 'fair_use_educational',
    verified_by UUID REFERENCES users(id),
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Question Bank & Multilingual Content
CREATE TYPE question_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE question_status AS ENUM ('draft', 'pending_approval', 'approved', 'flagged', 'rejected');
CREATE TYPE question_type AS ENUM ('mcq_single', 'mcq_multiple', 'numerical');

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    topic_id UUID REFERENCES topics(id),
    paper_id UUID REFERENCES papers(id) ON DELETE SET NULL, -- Null if standalone or AI generated
    question_text TEXT NOT NULL,
    question_text_hi TEXT,
    question_text_bn TEXT,
    diagram_url TEXT,
    explanation TEXT,
    explanation_beginner TEXT,
    explanation_shortcut TEXT,
    difficulty question_difficulty DEFAULT 'medium',
    question_type question_type DEFAULT 'mcq_single',
    is_verified BOOLEAN DEFAULT FALSE,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    marks NUMERIC(4, 2) DEFAULT 2.00,
    negative_marks NUMERIC(4, 2) DEFAULT 0.50,
    status question_status DEFAULT 'approved',
    duplicate_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_label CHAR(1) NOT NULL, -- 'A', 'B', 'C', 'D'
    option_text TEXT NOT NULL,
    option_text_hi TEXT,
    option_text_bn TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(question_id, option_label)
);

CREATE TABLE IF NOT EXISTS question_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id),
    verdict TEXT NOT NULL, -- 'approved', 'rejected', 'correction_needed'
    review_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tests, CBT Simulator & Attempts
CREATE TYPE test_mode AS ENUM ('official_simulation', 'custom_mock', 'topic_practice');
CREATE TYPE attempt_status AS ENUM ('in_progress', 'completed', 'abandoned', 'expired');

CREATE TABLE IF NOT EXISTS generated_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    mode test_mode NOT NULL,
    exam_id UUID REFERENCES exams(id),
    exam_pattern_id UUID REFERENCES exam_patterns(id),
    duration_minutes INT NOT NULL,
    total_questions INT NOT NULL,
    total_marks NUMERIC(6, 2) NOT NULL,
    negative_marking NUMERIC(4, 2) NOT NULL,
    config_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS test_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES generated_tests(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    section_name TEXT NOT NULL,
    order_index INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(test_id, order_index)
);

CREATE TABLE IF NOT EXISTS test_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES generated_tests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status attempt_status DEFAULT 'in_progress',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INT DEFAULT 0,
    total_score NUMERIC(6, 2) DEFAULT 0.00,
    correct_count INT DEFAULT 0,
    incorrect_count INT DEFAULT 0,
    unattempted_count INT DEFAULT 0,
    accuracy_percentage NUMERIC(5, 2) DEFAULT 0.00,
    rank_estimate INT,
    percentile NUMERIC(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TYPE answer_palette_state AS ENUM ('not_visited', 'not_answered', 'answered', 'marked_for_review', 'answered_and_marked');

CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_label CHAR(1),
    is_correct BOOLEAN,
    marks_awarded NUMERIC(4, 2) DEFAULT 0.00,
    time_spent_seconds INT DEFAULT 0,
    palette_state answer_palette_state DEFAULT 'not_visited',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(attempt_id, question_id)
);

-- 8. Personalised Analytics, Bookmarks & Mistake Notebook
CREATE TABLE IF NOT EXISTS performance_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    topic_id UUID REFERENCES topics(id),
    total_attempted INT DEFAULT 0,
    total_correct INT DEFAULT 0,
    total_incorrect INT DEFAULT 0,
    accuracy_rate NUMERIC(5, 2) DEFAULT 0.00,
    avg_speed_seconds NUMERIC(6, 2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, subject_id, topic_id)
);

CREATE TYPE mistake_tag AS ENUM ('calculation_error', 'concept_gap', 'silly_mistake', 'time_pressure', 'misread_question', 'guesswork');

CREATE TABLE IF NOT EXISTS mistake_notebook (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    attempt_id UUID REFERENCES test_attempts(id) ON DELETE SET NULL,
    user_note TEXT,
    tag mistake_tag DEFAULT 'calculation_error',
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, question_id)
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, question_id)
);

-- 9. Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_questions_subject_topic ON questions(subject_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_paper ON questions(paper_id);
CREATE INDEX IF NOT EXISTS idx_questions_status_verified ON questions(status, is_verified);
CREATE INDEX IF NOT EXISTS idx_papers_exam_year ON papers(exam_id, year);
CREATE INDEX IF NOT EXISTS idx_answers_attempt ON answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_perf_summary_user ON performance_summaries(user_id, accuracy_rate);
