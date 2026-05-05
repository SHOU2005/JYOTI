import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  ChevronLeft, Users, Code2, Brain, Lightbulb, Briefcase, FileText,
  Globe, Layers, CheckCircle, Camera, AlignLeft, GraduationCap, Building2,
  Shield, Loader2, ChevronRight, AlertCircle, Star, Target, Upload,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const INTERVIEW_TYPES = [
  {
    id: 'hr',
    label: 'HR Interview',
    icon: Users,
    color: '#a855f7',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    desc: 'Soft skills, culture fit, situational judgment',
    template: 'behavioral',
  },
  {
    id: 'technical',
    label: 'Technical Interview',
    icon: Code2,
    color: '#3b82f6',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    desc: 'DSA, system design, coding problems',
    template: 'technical',
  },
  {
    id: 'behavioral',
    label: 'Behavioral Interview',
    icon: Brain,
    color: '#8b5cf6',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    desc: 'STAR-format stories, past experiences',
    template: 'behavioral',
  },
  {
    id: 'situational',
    label: 'Situational Interview',
    icon: Lightbulb,
    color: '#f59e0b',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    desc: 'Hypothetical scenarios and decision-making',
    template: 'behavioral',
  },
  {
    id: 'case_study',
    label: 'Case Study Interview',
    icon: FileText,
    color: '#06b6d4',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    desc: 'Business cases, analytical problem-solving',
    template: 'mixed',
  },
  {
    id: 'resume_based',
    label: 'Resume-Based Interview',
    icon: AlignLeft,
    color: '#10b981',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    desc: 'Questions based on your resume and experience',
    template: 'role_specific',
  },
  {
    id: 'domain',
    label: 'Domain Interview',
    icon: Globe,
    color: '#f97316',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    desc: 'Deep-dive into your specific domain expertise',
    template: 'technical',
  },
  {
    id: 'mixed',
    label: 'Mixed Interview',
    icon: Layers,
    color: '#ec4899',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    desc: 'Combination of technical + behavioral rounds',
    template: 'mixed',
  },
];

const TARGET_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Product Manager',
  'DevOps Engineer',
  'ML Engineer',
  'Cloud Architect',
  'Business Analyst',
  'Cybersecurity Analyst',
  'Mobile Developer',
  'UX Designer',
  'HR Manager',
];

const EXPERIENCE_LEVELS = [
  { id: 'intern',    label: 'Intern',     desc: '0 months – 6 months',   color: '#10b981' },
  { id: 'fresher',   label: 'Fresher',    desc: '0 – 1 year',            color: '#3b82f6' },
  { id: 'junior',    label: 'Junior',     desc: '1 – 2 years',           color: '#6366f1' },
  { id: 'mid',       label: 'Mid-level',  desc: '2 – 5 years',           color: '#8b5cf6' },
  { id: 'senior',    label: 'Senior',     desc: '5 – 10 years',          color: '#f59e0b' },
  { id: 'lead',      label: 'Lead',       desc: '10+ years',             color: '#ef4444' },
];

const COMPANY_PACKS = [
  { id: null,         label: 'None',       emoji: '⚪', color: '#71717a' },
  { id: 'google',     label: 'Google',     emoji: '🔵', color: '#4285f4' },
  { id: 'amazon',     label: 'Amazon',     emoji: '🟠', color: '#ff9900' },
  { id: 'microsoft',  label: 'Microsoft',  emoji: '🟩', color: '#00a4ef' },
  { id: 'tcs',        label: 'TCS',        emoji: '🔷', color: '#6366f1' },
  { id: 'infosys',    label: 'Infosys',    emoji: '🟣', color: '#a855f7' },
  { id: 'deloitte',   label: 'Deloitte',   emoji: '🟢', color: '#22c55e' },
  { id: 'accenture',  label: 'Accenture',  emoji: '🟤', color: '#a16207' },
  { id: 'wipro',      label: 'Wipro',      emoji: '⚡', color: '#f59e0b' },
  { id: 'ey',         label: 'EY',         emoji: '🟡', color: '#eab308' },
  { id: 'kpmg',       label: 'KPMG',       emoji: '🔴', color: '#ef4444' },
];

const PROCTORING_OPTIONS = [
  {
    id: 'practice',
    label: 'Practice',
    icon: Star,
    color: '#10b981',
    desc: 'No proctoring. Relaxed environment for preparation.',
  },
  {
    id: 'standard',
    label: 'Standard',
    icon: Shield,
    color: '#3b82f6',
    desc: 'Basic monitoring. Background tab detection.',
  },
  {
    id: 'strict',
    label: 'Strict',
    icon: Camera,
    color: '#ef4444',
    desc: 'Full proctoring: camera, tab lock, face detection.',
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ number, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex-shrink-0">
        {number}
      </div>
      <div>
        <h2 className="font-bold text-white text-base">{title}</h2>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function InterviewTypeCard({ type, selected, onSelect }) {
  const Icon = type.icon;
  const isSelected = selected?.id === type.id;
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(type)}
      className={`relative p-4 rounded-xl border text-left transition-all duration-200 w-full
        ${isSelected
          ? `${type.border} ${type.bg}`
          : 'border-white/8 bg-zinc-900/40 hover:border-white/14 hover:bg-zinc-900/60'}`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: type.color }}>
          <CheckCircle className="w-3 h-3 text-white" />
        </div>
      )}
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
        style={{ background: type.color + '20' }}>
        <Icon className="w-5 h-5" style={{ color: type.color }} />
      </div>
      <p className="font-semibold text-sm text-white mb-1">{type.label}</p>
      <p className="text-[11px] text-zinc-500 leading-relaxed">{type.desc}</p>
    </motion.button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InterviewSetup() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [interviewType, setInterviewType] = useState(null);
  const [role, setRole]                   = useState('');
  const [level, setLevel]                 = useState('');
  const [companyPack, setCompanyPack]     = useState(COMPANY_PACKS[0]);
  const [proctoring, setProctoring]       = useState('practice');
  const [liveMode, setLiveMode]           = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [resumeStatus, setResumeStatus]   = useState(null); // { has_resume, skills }

  // Fetch resume status once so we can gate/warn for resume-based interview
  useEffect(() => {
    api.get('/api/v1/student/resume', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setResumeStatus(r.data))
      .catch(() => setResumeStatus({ has_resume: false, skills: [] }));
  }, [token]);

  const canStart = interviewType && role && level;

  const handleStart = async () => {
    if (!canStart) return;
    setError('');

    // Live AI: navigate immediately with full config — no backend needed
    if (liveMode) {
      navigate('/interview/live', {
        state: {
          role,
          interviewType: interviewType.id,
          interviewTypeLabel: interviewType.label,
          level,
          companyPack: companyPack.id,
          companyPackLabel: companyPack.label,
          companyPackEmoji: companyPack.emoji,
          proctoring,
        },
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        template: interviewType.template,
        proctoring_mode: proctoring,
        type: 'practice',
        job_role: role,
        experience_level: level,
        ...(companyPack.id ? { company_pack: companyPack.id } : {}),
      };

      const { data } = await api.post('/api/v1/student/interviews/start', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate(`/interview/session/${data.interview_id}`, {
        state: { question: data.question, role },
      });
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080f] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Top nav */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <span className="text-indigo-400 font-semibold text-xs uppercase tracking-widest">New Interview</span>
          </div>
          <h1 className="text-3xl font-black">Setup Your Interview</h1>
          <p className="text-zinc-400 text-sm mt-1">Customize your AI-powered practice session in 5 steps.</p>
        </div>

        <div className="space-y-6">

          {/* ── Section 1: Interview Type ── */}
          <div className="bg-zinc-900/50 border border-white/7 rounded-2xl p-6">
            <SectionHeader
              number="1"
              title="Interview Type"
              subtitle="Select the format that matches your target interview"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {INTERVIEW_TYPES.map(t => (
                <InterviewTypeCard
                  key={t.id}
                  type={t}
                  selected={interviewType}
                  onSelect={setInterviewType}
                />
              ))}
            </div>
          </div>

          {/* ── Section 2: Target Role ── */}
          <div className="bg-zinc-900/50 border border-white/7 rounded-2xl p-6">
            <SectionHeader
              number="2"
              title="Target Role"
              subtitle="Choose the job role you are preparing for"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {TARGET_ROLES.map(r => (
                <motion.button
                  key={r}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setRole(r)}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all duration-150
                    ${role === r
                      ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-200'
                      : 'bg-white/4 border-white/8 text-zinc-400 hover:border-white/15 hover:text-zinc-200'}`}
                >
                  {r}
                </motion.button>
              ))}
            </div>
          </div>

          {/* ── Section 3: Experience Level ── */}
          <div className="bg-zinc-900/50 border border-white/7 rounded-2xl p-6">
            <SectionHeader
              number="3"
              title="Experience Level"
              subtitle="Match the difficulty to your experience"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {EXPERIENCE_LEVELS.map(l => {
                const isSelected = level === l.id;
                return (
                  <motion.button
                    key={l.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setLevel(l.id)}
                    className={`p-3 rounded-xl border text-left transition-all duration-150
                      ${isSelected
                        ? 'border-opacity-50 text-white'
                        : 'bg-zinc-900/60 border-white/8 text-zinc-400 hover:border-white/15'}`}
                    style={isSelected ? {
                      background: l.color + '18',
                      borderColor: l.color + '60',
                    } : {}}
                  >
                    <p className="font-semibold text-sm" style={isSelected ? { color: l.color } : {}}>
                      {l.label}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{l.desc}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ── Section 4: Company Pack ── */}
          <div className="bg-zinc-900/50 border border-white/7 rounded-2xl p-6">
            <SectionHeader
              number="4"
              title="Company Pack"
              subtitle="Optional — use company-specific question banks"
            />
            <div className="flex flex-wrap gap-2">
              {COMPANY_PACKS.map(c => {
                const isSelected = companyPack?.id === c.id;
                return (
                  <motion.button
                    key={c.id ?? 'none'}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCompanyPack(c)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150
                      ${isSelected
                        ? 'text-white'
                        : 'bg-white/4 border-white/8 text-zinc-400 hover:border-white/15 hover:text-zinc-200'}`}
                    style={isSelected ? {
                      background: c.color + '18',
                      borderColor: c.color + '55',
                      color: c.color,
                    } : {}}
                  >
                    <span className="text-base leading-none">{c.emoji}</span>
                    <span>{c.label}</span>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ── Section 5: Proctoring + Session Mode ── */}
          <div className="bg-zinc-900/50 border border-white/7 rounded-2xl p-6">
            <SectionHeader
              number="5"
              title="Proctoring Mode & Session Type"
              subtitle="Choose how your session will be monitored"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {PROCTORING_OPTIONS.map(p => {
                const Icon = p.icon;
                const isSelected = proctoring === p.id;
                return (
                  <motion.button
                    key={p.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setProctoring(p.id)}
                    className={`p-4 rounded-xl border text-left transition-all duration-150
                      ${isSelected
                        ? ''
                        : 'bg-zinc-900/60 border-white/8 hover:border-white/15'}`}
                    style={isSelected ? {
                      background: p.color + '12',
                      borderColor: p.color + '55',
                    } : {}}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: p.color + '20' }}>
                        <Icon className="w-4 h-4" style={{ color: p.color }} />
                      </div>
                      <span className="font-semibold text-sm" style={isSelected ? { color: p.color } : { color: '#e4e4e7' }}>
                        {p.label}
                      </span>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 ml-auto" style={{ color: p.color }} />}
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">{p.desc}</p>
                  </motion.button>
                );
              })}
            </div>

            {/* Session type */}
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Session Type</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setLiveMode(false)}
                className={`p-4 rounded-xl border text-left transition-all duration-150
                  ${!liveMode
                    ? 'bg-indigo-500/10 border-indigo-500/40'
                    : 'bg-zinc-900/60 border-white/8 hover:border-white/15'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlignLeft className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold text-sm text-white">Text-Only</span>
                  {!liveMode && <CheckCircle className="w-3.5 h-3.5 text-indigo-400 ml-auto" />}
                </div>
                <p className="text-[11px] text-zinc-500">Type your answers. No camera or microphone required.</p>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setLiveMode(true)}
                className={`p-4 rounded-xl border text-left transition-all duration-150
                  ${liveMode
                    ? 'bg-red-500/10 border-red-500/40'
                    : 'bg-zinc-900/60 border-white/8 hover:border-white/15'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Camera className="w-4 h-4 text-red-400" />
                  <span className="font-semibold text-sm text-white">Live AI</span>
                  {liveMode && <CheckCircle className="w-3.5 h-3.5 text-red-400 ml-auto" />}
                </div>
                <p className="text-[11px] text-zinc-500">Camera + voice + real-time proctoring. Full simulation.</p>
              </motion.button>
            </div>
          </div>

          {/* ── Resume status banner (shown when resume-based type is selected) ── */}
          <AnimatePresence>
            {interviewType?.id === 'resume_based' && (
              <motion.div
                key="resume-banner"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {resumeStatus === null ? (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-800/50 border border-white/8">
                    <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
                    <span className="text-xs text-zinc-400">Checking resume…</span>
                  </div>
                ) : resumeStatus.has_resume && resumeStatus.skills?.length > 0 ? (
                  <div className="px-4 py-3 rounded-xl bg-emerald-500/8 border border-emerald-500/25">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-xs font-semibold text-emerald-300">Resume found — questions will be tailored to your skills</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeStatus.skills.slice(0, 10).map(sk => (
                        <span key={sk} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
                          {sk}
                        </span>
                      ))}
                      {resumeStatus.skills.length > 10 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] text-zinc-500">+{resumeStatus.skills.length - 10} more</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/25">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="text-xs font-semibold text-amber-300">No resume uploaded yet</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mb-2">Upload your resume to get questions tailored to your actual skills and experience.</p>
                    <Link to="/resume"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition-colors">
                      <Upload className="w-3 h-3" /> Upload Resume
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Generic resume note for non-resume types ── */}
          {interviewType?.id !== 'resume_based' && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <GraduationCap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-400">
                <span className="text-amber-300 font-semibold">Resume-based questions</span> will be automatically
                added if you have uploaded a resume to your profile.
              </p>
            </div>
          )}

          {/* ── Validation summary ── */}
          {!canStart && (interviewType || role || level) && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 px-4 py-3 rounded-xl bg-white/3 border border-white/8"
            >
              <AlertCircle className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-500 space-y-0.5">
                {!interviewType && <p>• Select an interview type</p>}
                {!role && <p>• Select a target role</p>}
                {!level && <p>• Select your experience level</p>}
              </div>
            </motion.div>
          )}

          {/* ── Error ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── CTA ── */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <Link to="/dashboard">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 text-sm font-medium transition-colors"
              >
                Cancel
              </motion.button>
            </Link>

            <motion.button
              onClick={handleStart}
              disabled={!canStart || loading}
              whileHover={canStart && !loading ? { scale: 1.01 } : {}}
              whileTap={canStart && !loading ? { scale: 0.99 } : {}}
              className={`flex items-center gap-2.5 px-8 py-3 rounded-xl font-bold text-base transition-all duration-200
                ${canStart && !loading
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-500/20'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</>
              ) : (
                <>
                  {liveMode ? <Camera className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  Start Interview
                  {interviewType && <span className="text-sm opacity-70">· {interviewType.label}</span>}
                </>
              )}
            </motion.button>
          </div>

        </div>
      </div>
    </div>
  );
}
