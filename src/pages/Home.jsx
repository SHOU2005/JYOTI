import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  Bot,
  ShieldCheck,
  BarChart3,
  BrainCircuit,
  FileText,
  Trophy,
  Mic,
  GraduationCap,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  LogIn,
  Star,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

/* ─── Animated counter ───────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 18 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionVal.set(target);
  }, [inView, target, motionVal]);

  useEffect(() => {
    return spring.on('change', (v) => setDisplay(Math.round(v)));
  }, [spring]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Data ───────────────────────────────────────────────────────────── */
const STATS = [
  { label: 'Interviews Conducted', value: 50000, suffix: '+' },
  { label: 'Universities', value: 200, suffix: '+' },
  { label: 'Placement Rate', value: 95, suffix: '%' },
  { label: 'Score Dimensions', value: 13, suffix: '' },
];

const FEATURES = [
  {
    icon: <Mic className="w-6 h-6 text-blue-400" />,
    gradient: 'from-blue-500/20 to-blue-500/0',
    border: 'border-blue-500/20',
    title: 'Live AI Interview',
    desc: 'Conversational AI conducts adaptive interviews in real-time — asking follow-ups, detecting hesitations, and scoring nuanced responses across 13 dimensions simultaneously.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-violet-400" />,
    gradient: 'from-violet-500/20 to-violet-500/0',
    border: 'border-violet-500/20',
    title: 'Enterprise Proctoring',
    desc: 'Military-grade integrity enforcement with multi-face detection, tab-switch alerts, audio anomaly flagging, and tamper-proof session recordings — all processed client-side.',
  },
  {
    icon: <FileText className="w-6 h-6 text-emerald-400" />,
    gradient: 'from-emerald-500/20 to-emerald-500/0',
    border: 'border-emerald-500/20',
    title: 'Resume Intelligence',
    desc: 'Deep-parse your resume against JD requirements. Our NLP engine extracts skill vectors, identifies gaps, and tailors every interview question to your actual experience.',
  },
  {
    icon: <Trophy className="w-6 h-6 text-amber-400" />,
    gradient: 'from-amber-500/20 to-amber-500/0',
    border: 'border-amber-500/20',
    title: 'MNC Mock Interviews',
    desc: 'Simulate real interview rounds for Google, Amazon, Microsoft, TCS, and 30+ top companies. Company-specific rubrics, behavioral frameworks, and technical question banks.',
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-pink-400" />,
    gradient: 'from-pink-500/20 to-pink-500/0',
    border: 'border-pink-500/20',
    title: 'Placement Analytics',
    desc: 'Institution-level dashboards exposing cohort readiness bands, skill gap heatmaps, at-risk student detection, and real-time placement probability forecasting.',
  },
  {
    icon: <BrainCircuit className="w-6 h-6 text-cyan-400" />,
    gradient: 'from-cyan-500/20 to-cyan-500/0',
    border: 'border-cyan-500/20',
    title: 'Career Coaching',
    desc: 'Personalised AI coaching plans generated from your interview history. Targeted exercises, curated resources, and weekly progress benchmarks against your peer cohort.',
  },
];

const STEPS = [
  {
    icon: <LogIn className="w-6 h-6 text-blue-400" />,
    step: '01',
    title: 'Login & Verify',
    desc: 'Sign in with your university or enterprise credentials. Enable camera, microphone, and screen-share permissions for proctored sessions.',
  },
  {
    icon: <FileText className="w-6 h-6 text-violet-400" />,
    step: '02',
    title: 'Upload Resume',
    desc: 'Drop your PDF resume. Our parser extracts your skills, experience, and target role — personalising every question to your profile.',
  },
  {
    icon: <Mic className="w-6 h-6 text-emerald-400" />,
    step: '03',
    title: 'AI Interview',
    desc: 'Face our adaptive AI interviewer. Answer questions naturally — the system probes deeper, adjusts difficulty, and tracks 13 dimensions in real-time.',
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-amber-400" />,
    step: '04',
    title: 'Get Report',
    desc: 'Receive an instant 13-dimension report with percentile rankings, specific feedback per answer, and a personalised improvement roadmap.',
  },
];

const COMPANIES = [
  { name: 'Google', emoji: '🔍' },
  { name: 'Amazon', emoji: '📦' },
  { name: 'Microsoft', emoji: '🪟' },
  { name: 'TCS', emoji: '💼' },
  { name: 'Infosys', emoji: '🌐' },
  { name: 'Deloitte', emoji: '📊' },
  { name: 'Accenture', emoji: '⚡' },
  { name: 'Wipro', emoji: '🔵' },
  { name: 'EY', emoji: '🏛️' },
  { name: 'KPMG', emoji: '📋' },
];

const SCORE_DIMENSIONS = [
  'Communication Clarity',
  'Technical Depth',
  'Problem Solving',
  'Confidence & Tone',
  'Keyword Relevance',
  'Answer Structure',
  'Behavioral Competency',
  'Cultural Fit',
  'Integrity Score',
  'Response Speed',
  'Grammar & Fluency',
  'Leadership Signals',
  'Role Readiness',
];

const TESTIMONIALS = [
  {
    name: 'Dr. Priya Sharma',
    role: 'Head of Placement Cell',
    institution: 'VIT University, Vellore',
    avatar: 'PS',
    stars: 5,
    quote:
      'InterviewIQ transformed our placement season entirely. We onboarded 4,200 students within a week. The analytics dashboard gave our team unprecedented visibility into student readiness — we identified at-risk batches 6 weeks before interviews began and intervened proactively. Placement rates jumped from 78% to 94% in a single cycle.',
  },
  {
    name: 'Prof. Arjun Menon',
    role: 'Director, Career Development',
    institution: 'BITS Pilani',
    avatar: 'AM',
    stars: 5,
    quote:
      "The proctoring integrity system is genuinely world-class. When we piloted with 800 students for our on-campus drives, we detected 23 integrity violations that would have gone unnoticed in traditional settings. The AI's ability to tailor questions to each student's resume is a game-changer — students felt genuinely prepared for their actual company interviews.",
  },
  {
    name: 'Ms. Kavitha Reddy',
    role: 'Training & Placement Officer',
    institution: 'SRM Institute of Science & Technology',
    avatar: 'KR',
    stars: 5,
    quote:
      'Before InterviewIQ, we ran mock interviews manually — 3 faculty per session, weeks of scheduling. Now our 6,000+ students get AI-powered mock interviews on demand, each scored across 13 professional dimensions. The MNC-specific question banks are incredibly accurate — our students walked into TCS and Infosys drives with real confidence and real preparation.',
  },
];

/* ─── Component ──────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: '#0a0a0c', color: '#ffffff' }}
    >
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen px-4 pt-24 pb-16">
        {/* Ambient glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-gradient-to-r from-blue-600/15 via-violet-600/15 to-purple-600/15 blur-[160px] rounded-[50%] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/8 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/8 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-5xl mx-auto flex flex-col items-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-10"
            style={{
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-zinc-300 text-sm font-medium">
              Trusted by 200+ Universities &amp; Placement Cells
            </span>
          </motion.div>

          {/* Headline */}
          <h1
            className="font-extrabold tracking-tight mb-8 leading-[1.04]"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 5.2rem)' }}
          >
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #818cf8 100%)',
              }}
            >
              INTERVIEWIQ
            </span>
            <br />
            <span className="text-white">
              AI-Powered Smart Interview Intelligence
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
          >
            The enterprise platform universities and placement cells trust to
            conduct, proctor, and evaluate thousands of AI-driven interviews —
            scoring candidates across{' '}
            <span className="text-white font-medium">13 professional dimensions</span>{' '}
            in real-time with zero manual effort.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <Link to="/signup" className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto h-14 px-9 text-base font-bold rounded-xl transition-all hover:scale-105 focus:outline-none"
                style={{
                  background:
                    'linear-gradient(135deg, #3b82f6 0%, #6d28d9 100%)',
                  boxShadow: '0 0 40px rgba(99,102,241,0.4)',
                  color: '#fff',
                }}
              >
                Get Started Free
              </button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto h-14 px-9 text-base font-semibold rounded-xl transition-all hover:scale-105 focus:outline-none"
                style={{
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#fff',
                  backdropFilter: 'blur(8px)',
                }}
              >
                Sign In
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <div className="w-px h-12 bg-gradient-to-b from-white/0 to-white/30" />
        </motion.div>
      </section>

      {/* ── ANIMATED STATS BAR ───────────────────────────────────────── */}
      <section
        className="relative py-8"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-white/8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="flex flex-col items-center py-4"
              >
                <span
                  className="font-extrabold tracking-tight text-transparent bg-clip-text"
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                    backgroundImage:
                      'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                  }}
                >
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-zinc-500 text-sm font-medium mt-1">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span
              className="inline-block text-xs font-bold tracking-widest uppercase mb-4 text-blue-400"
            >
              Platform Capabilities
            </span>
            <h2
              className="font-extrabold tracking-tight text-white mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
            >
              Everything your placement cell needs,
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                }}
              >
                built into one platform.
              </span>
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-lg">
              From live AI interviews to enterprise proctoring — every tool you
              need to run world-class campus recruitment.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="group relative rounded-2xl p-6 cursor-default transition-transform hover:-translate-y-1"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${feat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div
                  className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid rgba(255,255,255,0.08)`,
                  }}
                >
                  {feat.icon}
                </div>
                <h3 className="relative text-lg font-bold text-white mb-2">
                  {feat.title}
                </h3>
                <p className="relative text-zinc-400 text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-24 px-4"
        style={{ background: 'rgba(255,255,255,0.015)' }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 text-violet-400">
              How It Works
            </span>
            <h2
              className="font-extrabold tracking-tight text-white"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
            >
              From sign-up to offer letter in{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)',
                }}
              >
                four steps.
              </span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connector line */}
            <div
              className="absolute top-10 left-10 right-10 h-px hidden lg:block"
              style={{
                background:
                  'linear-gradient(90deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.3) 100%)',
              }}
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="flex flex-col items-center text-center"
                >
                  <div
                    className="relative w-20 h-20 rounded-2xl flex items-center justify-center mb-5 z-10"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.15) 100%)',
                      border: '1px solid rgba(99,102,241,0.3)',
                    }}
                  >
                    {step.icon}
                    <span
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
                      style={{
                        background:
                          'linear-gradient(135deg, #3b82f6, #7c3aed)',
                        color: '#fff',
                      }}
                    >
                      {i + 1}
                    </span>
                  </div>
                  <h4 className="text-white font-bold text-lg mb-2">
                    {step.title}
                  </h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MNC COMPANIES SHOWCASE ───────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 text-emerald-400">
              Interview Preparation
            </span>
            <h2
              className="font-extrabold tracking-tight text-white mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}
            >
              Prepared for the world's top employers.
            </h2>
            <p className="text-zinc-400 mb-12 max-w-xl mx-auto">
              Company-specific mock interviews with real rubrics, technical
              question banks, and behavioral frameworks used by actual hiring
              managers.
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-4 justify-center">
            {COMPANIES.map((co, i) => (
              <motion.div
                key={co.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all hover:scale-105 cursor-default"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                }}
              >
                <span className="text-2xl">{co.emoji}</span>
                <span className="text-white font-semibold text-sm">
                  {co.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCORE DIMENSIONS ─────────────────────────────────────────── */}
      <section
        className="py-20 px-4"
        style={{ background: 'rgba(255,255,255,0.015)' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 text-pink-400">
              13-Dimension Scoring Engine
            </span>
            <h2
              className="font-extrabold tracking-tight text-white mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}
            >
              Every answer scored on{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #f472b6 0%, #a78bfa 100%)',
                }}
              >
                13 professional dimensions.
              </span>
            </h2>
            <p className="text-zinc-400 mb-12 max-w-xl mx-auto">
              Our evaluation engine goes far beyond keyword matching —
              it understands context, structure, tone, and professional
              competency in real-time.
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-3 justify-center">
            {SCORE_DIMENSIONS.map((dim, i) => (
              <motion.span
                key={dim}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 cursor-default"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.12) 100%)',
                  border: '1px solid rgba(139,92,246,0.25)',
                  color: '#c4b5fd',
                }}
              >
                {dim}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ── UNIVERSITY TESTIMONIALS ───────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 text-amber-400">
              Trusted by Educators
            </span>
            <h2
              className="font-extrabold tracking-tight text-white"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
            >
              What placement officers are saying.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className="relative rounded-2xl p-6 flex flex-col gap-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex gap-1">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed flex-1">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{
                      background:
                        'linear-gradient(135deg, #3b82f6, #7c3aed)',
                    }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {t.name}
                    </p>
                    <p className="text-zinc-500 text-xs">{t.role}</p>
                    <p className="text-blue-400 text-xs">{t.institution}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl p-12 text-center overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.12) 100%)',
              border: '1px solid rgba(99,102,241,0.25)',
            }}
          >
            {/* Glow blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/15 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/15 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))',
                  border: '1px solid rgba(99,102,241,0.3)',
                }}
              >
                <GraduationCap className="w-8 h-8 text-blue-400" />
              </div>
              <h2
                className="font-extrabold tracking-tight text-white mb-4"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
              >
                Join 200+ Universities
              </h2>
              <p className="text-zinc-400 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
                Deploy InterviewIQ to your entire placement cell in under 24
                hours. No hardware. No setup fees. Just better outcomes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <button
                    className="h-14 px-10 text-base font-bold rounded-xl transition-all hover:scale-105 flex items-center gap-2"
                    style={{
                      background:
                        'linear-gradient(135deg, #3b82f6 0%, #6d28d9 100%)',
                      boxShadow: '0 0 40px rgba(99,102,241,0.4)',
                      color: '#fff',
                    }}
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
              <p className="text-zinc-600 text-sm mt-6 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                No credit card required &nbsp;·&nbsp;
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Free for first 500 interviews
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
