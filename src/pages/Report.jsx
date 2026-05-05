import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from 'recharts';
import {
  CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Shield, Star,
  TrendingUp, TrendingDown, Brain, MessageSquare, Zap, Award, BarChart2,
  Target, Lightbulb, BookOpen, Route, Map, Printer, ArrowLeft,
  Activity, Users, Cpu, HelpCircle, AlignLeft, FlaskConical, GraduationCap,
} from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

function scoreColor(v) {
  if (v >= 80) return '#10b981';
  if (v >= 65) return '#f59e0b';
  return '#ef4444';
}

function scoreLabel(v) {
  if (v >= 80) return 'Excellent';
  if (v >= 65) return 'Good';
  if (v >= 50) return 'Average';
  return 'Needs Work';
}

// ─── ScoreRing ───────────────────────────────────────────────────────────────

function ScoreRing({ score = 0, label, color, size = 80, fontSize = 'text-lg' }) {
  const r = size / 2 - 7;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const c = color || scoreColor(score);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" style={{ display: 'block' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1f2035" strokeWidth="7" />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c} strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${circ * pct / 100} ${circ}`}
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${fontSize} font-black leading-none`} style={{ color: c }}>
            {Math.round(score)}
          </span>
        </div>
      </div>
      {label && <span className="text-[11px] text-zinc-400 text-center leading-tight max-w-[72px]">{label}</span>}
    </div>
  );
}

// ─── Metric scorecard ────────────────────────────────────────────────────────

const METRIC_META = [
  { key: 'overall',           label: 'Overall',           icon: Award,       color: '#6366f1' },
  { key: 'content',           label: 'Content',           icon: Brain,       color: '#3b82f6' },
  { key: 'communication',     label: 'Communication',     icon: MessageSquare, color: '#8b5cf6' },
  { key: 'confidence',        label: 'Confidence',        icon: Zap,         color: '#06b6d4' },
  { key: 'grammar',           label: 'Grammar',           icon: AlignLeft,   color: '#10b981' },
  { key: 'fluency',           label: 'Fluency',           icon: Activity,    color: '#14b8a6' },
  { key: 'technical',         label: 'Technical',         icon: Cpu,         color: '#f97316' },
  { key: 'leadership',        label: 'Leadership',        icon: Users,       color: '#a855f7' },
  { key: 'problem_solving',   label: 'Problem Solving',   icon: FlaskConical, color: '#ec4899' },
  { key: 'star_score',        label: 'STAR Score',        icon: Star,        color: '#eab308' },
  { key: 'answer_relevance',  label: 'Relevance',         icon: Target,      color: '#22d3ee' },
  { key: 'concept_accuracy',  label: 'Accuracy',          icon: HelpCircle,  color: '#84cc16' },
  { key: 'placement_readiness', label: 'Placement Ready', icon: GraduationCap, color: '#f472b6' },
];

function MetricCard({ meta, value }) {
  const { label, icon: Icon, color } = meta;
  const v = Math.round(value || 0);
  const c = color;
  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-900/60 border border-white/6 hover:border-white/12 transition-colors">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c + '20' }}>
        <Icon className="w-4 h-4" style={{ color: c }} />
      </div>
      <ScoreRing score={v} color={c} size={64} fontSize="text-sm" />
      <span className="text-[10px] text-zinc-400 text-center leading-tight">{label}</span>
    </div>
  );
}

// ─── Question Accordion ──────────────────────────────────────────────────────

function QuestionAccordion({ item, index }) {
  const [open, setOpen] = useState(false);
  const score = item.total_score || 0;
  const color = scoreColor(score);
  const label = scoreLabel(score);
  const Icon = score >= 65 ? CheckCircle : AlertTriangle;

  const subScores = [
    { label: 'Content',       value: item.content_score       || 0, color: '#3b82f6' },
    { label: 'Communication', value: item.communication_score || 0, color: '#8b5cf6' },
    { label: 'Confidence',    value: item.confidence_score    || 0, color: '#06b6d4' },
    { label: 'Grammar',       value: item.grammar             || 0, color: '#10b981' },
    { label: 'Fluency',       value: item.fluency             || 0, color: '#14b8a6' },
    { label: 'Relevance',     value: item.answer_relevance    || 0, color: '#22d3ee' },
  ].filter(s => s.value > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: color + '30' }}
    >
      <button
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: color + '18' }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-200 line-clamp-1">{item.question}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-zinc-500 capitalize">
              {item.category || 'general'}{item.difficulty ? ` · ${item.difficulty}` : ''}
            </span>
            <span className="text-xs font-semibold" style={{ color }}>{label}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <span className="text-xl font-black" style={{ color }}>{Math.round(score)}</span>
            <span className="text-xs text-zinc-600">/100</span>
          </div>
          {open
            ? <ChevronUp className="w-4 h-4 text-zinc-500" />
            : <ChevronDown className="w-4 h-4 text-zinc-500" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/5">
              {subScores.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 my-3">
                  {subScores.map(({ label: sl, value, color: sc }) => (
                    <div key={sl} className="bg-zinc-900/70 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold" style={{ color: sc }}>{Math.round(value)}</div>
                      <div className="w-full bg-zinc-800 rounded-full h-1 mt-1">
                        <div className="h-1 rounded-full transition-all" style={{ width: `${value}%`, background: sc }} />
                      </div>
                      <div className="text-[9px] text-zinc-500 mt-1">{sl}</div>
                    </div>
                  ))}
                </div>
              )}

              {item.answer_preview && (
                <div className="bg-zinc-900/50 rounded-lg p-3 mb-3">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Your Answer</p>
                  <p className="text-sm text-zinc-300 italic">"{item.answer_preview}"</p>
                </div>
              )}

              {item.feedback && (
                <div className="space-y-2">
                  {item.feedback.strengths?.length > 0 && item.feedback.strengths.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-zinc-300">{s}</p>
                    </div>
                  ))}
                  {item.feedback.suggestions?.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-zinc-400">{s}</p>
                    </div>
                  ))}
                  {item.feedback.model_answer && (
                    <div className="mt-2 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/15">
                      <p className="text-[10px] text-indigo-400 uppercase tracking-widest mb-1">Model Answer Hint</p>
                      <p className="text-xs text-zinc-300">{item.feedback.model_answer}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── ReadinessBanner ─────────────────────────────────────────────────────────

function ReadinessBanner({ band, score }) {
  const isReady    = score >= 80 || band?.toLowerCase().includes('placement ready') || band?.includes('✅');
  const isNearReady = score >= 65 || band?.toLowerCase().includes('near ready') || band?.includes('⚡');

  if (isReady) {
    return (
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-emerald-900/5 border border-emerald-500/30">
        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <div>
          <p className="text-emerald-300 font-bold text-sm">Placement Ready</p>
          <p className="text-emerald-500/70 text-xs">You are performing at a hire-ready level. Keep sharpening your edge.</p>
        </div>
      </motion.div>
    );
  }
  if (isNearReady) {
    return (
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500/15 to-amber-900/5 border border-amber-500/30">
        <Zap className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <div>
          <p className="text-amber-300 font-bold text-sm">Near Ready</p>
          <p className="text-amber-500/70 text-xs">A few targeted improvements will get you to hire-ready. Follow your coaching roadmap.</p>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-500/15 to-red-900/5 border border-red-500/30">
      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
      <div>
        <p className="text-red-300 font-bold text-sm">Needs Work</p>
        <p className="text-red-500/70 text-xs">Focus on the coaching roadmap below. Consistent practice will move the needle.</p>
      </div>
    </motion.div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, icon: Icon, iconColor = '#6366f1', children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className={`bg-zinc-900/50 border border-white/7 rounded-2xl p-6 ${className}`}
    >
      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-2">
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
        {title}
      </p>
      {children}
    </motion.div>
  );
}

// ─── Main Report ─────────────────────────────────────────────────────────────

export default function Report() {
  const { id } = useParams();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/v1/student/reports/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return (
    <div className="min-h-screen bg-[#08080f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-zinc-400 text-sm">Loading your report…</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-[#08080f] flex items-center justify-center">
      <div className="text-center">
        <p className="text-zinc-400 mb-4">Report not found or access denied.</p>
        <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300 text-sm">← Back to Dashboard</Link>
      </div>
    </div>
  );

  const fb              = data.feedback || {};
  const breakdown       = fb.score_breakdown || {};
  const perQ            = fb.per_question || [];
  const strengths       = fb.strengths || [];
  const weaknesses      = fb.weaknesses || [];
  const suggestions     = fb.suggestions || [];
  const skillGaps       = fb.skill_gaps || [];
  const readinessBand   = fb.readiness_band || '';
  const proctor         = fb.proctoring_summary || {};
  const coachingRoadmap = fb.coaching_roadmap || [];
  const learningPath    = fb.learning_path || [];

  const overallScore = data.overall_score || breakdown.overall || 0;
  const ringColor    = scoreColor(overallScore);

  const radarData = [
    { skill: 'Content',         score: breakdown.content        || 0 },
    { skill: 'Communication',   score: breakdown.communication  || 0 },
    { skill: 'Confidence',      score: breakdown.confidence     || 0 },
    { skill: 'Leadership',      score: breakdown.leadership     || 0 },
    { skill: 'Technical',       score: breakdown.technical      || 0 },
    { skill: 'Problem Solving', score: breakdown.problem_solving || 0 },
  ];

  return (
    <div className="min-h-screen bg-[#08080f] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* ── Top bar ── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-indigo-400" />
              <span className="text-indigo-400 font-semibold text-xs uppercase tracking-widest">Interview Report</span>
            </div>
            <h1 className="text-3xl font-black">Performance Analysis</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {data.job_role && <span className="capitalize">{data.job_role} · </span>}
              {data.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white border border-white/10 px-3 py-1.5 rounded-full hover:border-white/20 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white border border-white/10 px-3 py-1.5 rounded-full hover:border-white/20 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
          </div>
        </div>

        {/* ── Readiness Banner ── */}
        <ReadinessBanner band={readinessBand} score={overallScore} />

        {/* ── Hero row: overall ring + radar ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Overall ring */}
          <Section title="Overall Score" icon={Award} iconColor="#6366f1">
            <div className="flex flex-col items-center py-4">
              <div className="relative w-44 h-44 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="58" fill="none" stroke="#1a1a2e" strokeWidth="10" />
                  <circle
                    cx="70" cy="70" r="58" fill="none" stroke={ringColor} strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 58 * overallScore / 100} ${2 * Math.PI * 58}`}
                    style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 8px ${ringColor}80)` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black" style={{ color: ringColor }}>{Math.round(overallScore)}</span>
                  <span className="text-xs text-zinc-500 mt-1">out of 100</span>
                </div>
              </div>
              <p className="font-bold text-lg" style={{ color: ringColor }}>{scoreLabel(overallScore)}</p>
              {fb.summary && <p className="text-zinc-400 text-sm text-center mt-2 max-w-xs">{fb.summary}</p>}
            </div>
          </Section>

          {/* Skill Radar */}
          <Section title="Skill Radar" icon={Activity} iconColor="#8b5cf6">
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                <PolarGrid stroke="#2a2a3e" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#71717a', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
              </RadarChart>
            </ResponsiveContainer>
          </Section>
        </div>

        {/* ── 13-Metric Scorecard ── */}
        <Section title="13-Dimension Scorecard" icon={BarChart2} iconColor="#3b82f6">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3">
            {METRIC_META.map(meta => (
              <MetricCard key={meta.key} meta={meta} value={breakdown[meta.key] || 0} />
            ))}
          </div>
        </Section>

        {/* ── Strengths / Weaknesses / Skill Gaps ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <Section title="Strengths" icon={CheckCircle} iconColor="#10b981">
            {strengths.length > 0 ? (
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-300">{s}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500 italic">No strengths data available.</p>
            )}
          </Section>

          <Section title="Areas to Improve" icon={AlertTriangle} iconColor="#ef4444">
            {weaknesses.length > 0 ? (
              <ul className="space-y-2">
                {weaknesses.map((w, i) => (
                  <li key={i} className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-300">{w}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500 italic">No weakness data available.</p>
            )}
          </Section>

          <Section title="Skill Gaps" icon={Target} iconColor="#f59e0b">
            {skillGaps.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skillGaps.map(g => (
                  <span key={g}
                    className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold capitalize">
                    {g}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 italic">No skill gaps identified.</p>
            )}
          </Section>
        </div>

        {/* ── Coaching Roadmap ── */}
        {coachingRoadmap.length > 0 && (
          <Section title="Coaching Roadmap" icon={Route} iconColor="#8b5cf6">
            <ol className="space-y-3">
              {coachingRoadmap.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
                    style={{ background: '#8b5cf620', color: '#8b5cf6', border: '1px solid #8b5cf640' }}>
                    {i + 1}
                  </span>
                  <p className="text-sm text-zinc-300 leading-relaxed">{typeof step === 'object' ? step.step || step.description || JSON.stringify(step) : step}</p>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* ── Learning Path ── */}
        {learningPath.length > 0 && (
          <Section title="Learning Path" icon={Map} iconColor="#06b6d4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {learningPath.map((item, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/15">
                  <BookOpen className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {typeof item === 'object' ? item.topic || item.resource || item.title || JSON.stringify(item) : item}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Proctoring / Integrity ── */}
        {(proctor.integrity_score != null || proctor.risk_level) && (
          <Section title="Proctoring & Integrity" icon={Shield} iconColor={proctor.risk_level === 'low' ? '#10b981' : proctor.risk_level === 'medium' ? '#f59e0b' : '#ef4444'}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`flex items-center gap-3 p-4 rounded-xl border
                ${proctor.risk_level === 'low'    ? 'border-emerald-500/25 bg-emerald-500/5'
                : proctor.risk_level === 'medium' ? 'border-amber-500/25 bg-amber-500/5'
                : 'border-red-500/25 bg-red-500/5'}`}>
                <Shield className={`w-8 h-8 flex-shrink-0
                  ${proctor.risk_level === 'low'    ? 'text-emerald-400'
                  : proctor.risk_level === 'medium' ? 'text-amber-400'
                  : 'text-red-400'}`} />
                <div>
                  <p className="font-bold text-sm">
                    Integrity Score: {Math.round(proctor.integrity_score ?? 0)}/100
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Risk Level: <span className="uppercase font-semibold">{proctor.risk_level || 'unknown'}</span>
                  </p>
                </div>
              </div>
              {proctor.flags?.length > 0 && (
                <div className="p-4 rounded-xl border border-red-500/15 bg-red-500/5">
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-2">Flags</p>
                  <ul className="space-y-1">
                    {proctor.flags.map((f, i) => (
                      <li key={i} className="text-xs text-zinc-400 flex gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {proctor.summary && (
                <div className="sm:col-span-2 p-3 rounded-lg bg-white/3 border border-white/8">
                  <p className="text-xs text-zinc-400">{proctor.summary}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ── Action Plan ── */}
        {suggestions.length > 0 && (
          <Section title="Action Plan" icon={TrendingUp} iconColor="#3b82f6">
            <ul className="space-y-3">
              {suggestions.map((s, i) => (
                <li key={i} className="flex gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5"
                    style={{ background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f640' }}>
                    {i + 1}
                  </span>
                  <p className="text-sm text-zinc-300 leading-relaxed">{s}</p>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ── Per-question Accordion ── */}
        {perQ.length > 0 && (
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              Question-by-Question Breakdown
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold">{perQ.length}</span>
            </p>
            <div className="space-y-2">
              {perQ.map((item, i) => (
                <QuestionAccordion key={i} item={item} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="text-center py-6 border-t border-white/5">
          <p className="text-xs text-zinc-600">
            Generated by InterviewIQ · Use <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono text-[10px]">Ctrl+P</kbd> or the Print button above to save as PDF.
          </p>
        </div>

      </div>
    </div>
  );
}
