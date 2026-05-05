import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Building2, Code2, Users, Lightbulb, Clock, Target, Shield,
  PlayCircle, BookOpen, Zap, CheckCircle, ChevronRight, Loader2, Star,
  Brain, Briefcase, TrendingUp, BarChart2, Globe, Scale, Award,
} from 'lucide-react';

// ─── Companies ───────────────────────────────────────────────────────────────

const COMPANIES = [
  {
    id: 'google',
    name: 'Google',
    logo: '🔵',
    color: '#4285f4',
    gradient: 'from-blue-600 to-cyan-500',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    tagline: 'Think Big. Build Better.',
    description: 'Face real Google-style interviews: DSA, System Design, and Googleyness rounds with calibrated difficulty. Google is known for its algorithm-heavy screening and structured behaviorals.',
    rounds: [
      { name: 'DSA Round',     icon: Code2,     desc: 'Graph algorithms, DP, advanced data structures' },
      { name: 'System Design', icon: Building2,  desc: 'URL shorteners, distributed systems, scalability' },
      { name: 'Googleyness',   icon: Star,       desc: 'Leadership, collaboration, ambiguity handling' },
    ],
    tags: ['Algorithms', 'System Design', 'Behavioral'],
    questions: 6,
    duration: '18 min',
    difficulty: 'Hard',
    diffColor: '#ef4444',
    tips: [
      'Master Big-O analysis and explain trade-offs clearly',
      'Think out loud — interviewers evaluate your thought process',
      'For system design: start with requirements, then scale',
      'Be ready to optimize your initial solution step-by-step',
    ],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: '🟠',
    color: '#ff9900',
    gradient: 'from-orange-500 to-yellow-400',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/5',
    tagline: 'Customer Obsessed. Day One.',
    description: "Amazon's 14 Leadership Principles drive every question. Practice STAR-format answers with Bar Raiser depth. Every answer must tie back to customer value and ownership.",
    rounds: [
      { name: 'Leadership Principles', icon: Target,   desc: 'All 14 LPs — Bias for Action, Ownership, Earn Trust' },
      { name: 'Bar Raiser',            icon: Zap,      desc: 'Cross-team deep-dive questioning, raising the hiring bar' },
      { name: 'Technical Review',      icon: Code2,    desc: 'Coding + system design for SDE roles' },
    ],
    tags: ['Leadership Principles', 'STAR Method', 'Bar Raiser'],
    questions: 6,
    duration: '18 min',
    difficulty: 'Hard',
    diffColor: '#ef4444',
    tips: [
      'Prepare 2–3 STAR stories per LP you can adapt across questions',
      'Always quantify the result — e.g., reduced latency by 40%, saved $X',
      'Start every answer with the customer impact',
      'Show depth — give specific numbers and real project details',
    ],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: '🟩',
    color: '#00a4ef',
    gradient: 'from-teal-500 to-blue-500',
    border: 'border-teal-500/30',
    bg: 'bg-teal-500/5',
    tagline: 'Growth Mindset. Every Day.',
    description: 'Microsoft values growth mindset, inclusive culture, and design thinking. Expect accessibility, empathy and execution questions. Collaboration and iterative improvement are core themes.',
    rounds: [
      { name: 'Growth Mindset',  icon: Lightbulb,  desc: 'Learning from failure, adapting, continuous improvement' },
      { name: 'Design Thinking', icon: Building2,  desc: 'Accessibility, inclusive design, product thinking' },
      { name: 'Core Technical',  icon: Code2,      desc: 'C#/.NET, Azure, distributed systems, debugging' },
    ],
    tags: ['Growth Mindset', 'Design', 'Collaboration'],
    questions: 6,
    duration: '18 min',
    difficulty: 'Medium',
    diffColor: '#f59e0b',
    tips: [
      'Show genuine curiosity and love of learning in every answer',
      'Discuss accessibility and inclusivity when talking about product decisions',
      'Emphasize team collaboration and cross-functional empathy',
      'Be honest about failures — focus on what you learned and changed',
    ],
  },
  {
    id: 'tcs',
    name: 'TCS',
    logo: '🔷',
    color: '#6366f1',
    gradient: 'from-indigo-600 to-purple-500',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/5',
    tagline: 'Experience Certainty.',
    description: 'TCS interviews focus on IT services delivery, client management, process adherence, and agile delivery. Expect questions on communication, teamwork, and domain knowledge relevant to service-based projects.',
    rounds: [
      { name: 'IT Services',      icon: Globe,       desc: 'Client delivery, project management, service models' },
      { name: 'Process & Agile',  icon: TrendingUp,  desc: 'Agile methodologies, sprint planning, SDLC processes' },
      { name: 'HR & Culture',     icon: Users,       desc: 'Teamwork, communication, TCS values, adaptability' },
    ],
    tags: ['IT Services', 'Agile', 'Client Management'],
    questions: 6,
    duration: '18 min',
    difficulty: 'Medium',
    diffColor: '#f59e0b',
    tips: [
      'Emphasize process adherence and documentation skills',
      'Prepare examples of successful client or stakeholder management',
      'Know the basics of Agile, Scrum, and SDLC thoroughly',
      'Show flexibility and willingness to work in service-oriented environments',
    ],
  },
  {
    id: 'infosys',
    name: 'Infosys',
    logo: '🟣',
    color: '#a855f7',
    gradient: 'from-purple-600 to-fuchsia-500',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/5',
    tagline: 'Navigate Your Next.',
    description: 'Infosys focuses on digital transformation, agile delivery, and leadership qualities. Interviews probe your ability to adapt to new technologies, lead teams in complex projects, and deliver business value.',
    rounds: [
      { name: 'Digital Transformation', icon: Zap,        desc: 'Cloud, AI/ML adoption, modernization strategies' },
      { name: 'Agile Delivery',         icon: TrendingUp, desc: 'Sprint execution, backlog management, delivery metrics' },
      { name: 'Leadership',             icon: Award,      desc: 'Team leadership, conflict resolution, mentoring' },
    ],
    tags: ['Digital Transformation', 'Agile Delivery', 'Leadership'],
    questions: 6,
    duration: '18 min',
    difficulty: 'Medium',
    diffColor: '#f59e0b',
    tips: [
      'Highlight experience with digital tools — cloud, automation, or AI',
      'Prepare examples of leading teams or driving process improvements',
      'Discuss how you handled ambiguity or rapid technology changes',
      "Show awareness of Infosys's digital strategy and recent innovations",
    ],
  },
  {
    id: 'deloitte',
    name: 'Deloitte',
    logo: '🟢',
    color: '#22c55e',
    gradient: 'from-green-600 to-emerald-500',
    border: 'border-green-500/30',
    bg: 'bg-green-500/5',
    tagline: 'Making an Impact That Matters.',
    description: 'Deloitte interviews lean heavily on consulting frameworks, case study analysis, and client solution thinking. You will be expected to demonstrate analytical reasoning, structured communication, and professional presence.',
    rounds: [
      { name: 'Case Study',          icon: BarChart2,  desc: 'Business case analysis, frameworks, recommendations' },
      { name: 'Analytical Thinking', icon: Brain,      desc: 'Data interpretation, problem decomposition, logic' },
      { name: 'Client Solutions',    icon: Briefcase,  desc: 'Client-centric answers, consulting value delivery' },
    ],
    tags: ['Case Study', 'Analytical Thinking', 'Consulting'],
    questions: 6,
    duration: '18 min',
    difficulty: 'Hard',
    diffColor: '#ef4444',
    tips: [
      'Use MECE frameworks (mutually exclusive, collectively exhaustive) in case answers',
      'Structure every answer clearly: issue → analysis → recommendation → impact',
      'Practice mental math and estimation questions (market sizing)',
      "Demonstrate awareness of Deloitte's service lines and industry focus areas",
    ],
  },
  {
    id: 'accenture',
    name: 'Accenture',
    logo: '🟤',
    color: '#d97706',
    gradient: 'from-amber-600 to-orange-500',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    tagline: 'Let There Be Change.',
    description: 'Accenture interviews emphasize digital innovation, teamwork, technology delivery, and leadership. Questions focus on how you drive change, collaborate across teams, and leverage emerging technologies to deliver client value.',
    rounds: [
      { name: 'Digital Innovation', icon: Zap,        desc: 'AI, cloud, automation, emerging tech adoption' },
      { name: 'Teamwork',           icon: Users,      desc: 'Cross-functional collaboration, stakeholder alignment' },
      { name: 'Leadership',         icon: Award,      desc: 'Driving change, mentoring, results delivery' },
    ],
    tags: ['Digital Innovation', 'Teamwork', 'Technology Leadership'],
    questions: 6,
    duration: '18 min',
    difficulty: 'Medium',
    diffColor: '#f59e0b',
    tips: [
      'Highlight experience with digital transformation or technology adoption',
      'Showcase examples of cross-functional collaboration and stakeholder management',
      'Demonstrate how you drive change — not just maintain the status quo',
      "Research Accenture's focus on responsible AI and sustainability",
    ],
  },
  {
    id: 'wipro',
    name: 'Wipro',
    logo: '⚡',
    color: '#f59e0b',
    gradient: 'from-yellow-500 to-amber-400',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/5',
    tagline: 'Realize the Full Value of Technology.',
    description: 'Wipro interviews cover IT delivery, problem solving, client focus, and a growth-oriented mindset. Expect technical aptitude questions alongside behavioral scenarios that demonstrate adaptability and ownership in delivery.',
    rounds: [
      { name: 'IT Delivery',   icon: Globe,       desc: 'Project delivery, SLA adherence, incident management' },
      { name: 'Problem Solving', icon: Brain,     desc: 'Root cause analysis, debugging, logical reasoning' },
      { name: 'Client Focus',  icon: Target,      desc: 'Client communication, escalation handling, satisfaction' },
    ],
    tags: ['IT Delivery', 'Problem Solving', 'Client Focus'],
    questions: 6,
    duration: '18 min',
    difficulty: 'Medium',
    diffColor: '#f59e0b',
    tips: [
      'Demonstrate strong IT fundamentals — networking, OS, databases',
      'Prepare examples of proactively solving client or project problems',
      'Highlight adaptability — Wipro values employees who handle change well',
      'Show ownership and accountability in every STAR-format answer',
    ],
  },
  {
    id: 'ey',
    name: 'EY',
    logo: '🟡',
    color: '#eab308',
    gradient: 'from-yellow-600 to-lime-500',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/5',
    tagline: 'Building a Better Working World.',
    description: 'EY interviews focus on advisory, analytical thinking, finance fundamentals, and risk awareness. You will face scenario-based questions that test your ability to navigate ambiguity, interpret data, and deliver sound recommendations.',
    rounds: [
      { name: 'Advisory',          icon: Briefcase,  desc: 'Client advisory scenarios, business judgment, solutions' },
      { name: 'Analytical Thinking', icon: BarChart2, desc: 'Financial analysis, data interpretation, insights' },
      { name: 'Risk Awareness',    icon: Shield,     desc: 'Risk identification, mitigation, compliance awareness' },
    ],
    tags: ['Advisory', 'Analytical Thinking', 'Risk Management'],
    questions: 6,
    duration: '18 min',
    difficulty: 'Hard',
    diffColor: '#ef4444',
    tips: [
      'Brush up on core finance and accounting principles',
      'Practice data interpretation and deriving business insights from numbers',
      'Demonstrate awareness of regulatory and compliance landscapes',
      'Structure advisory answers with a clear recommendation and rationale',
    ],
  },
  {
    id: 'kpmg',
    name: 'KPMG',
    logo: '🔴',
    color: '#ef4444',
    gradient: 'from-red-600 to-rose-500',
    border: 'border-red-500/30',
    bg: 'bg-red-500/5',
    tagline: 'Insights and Innovation in Professional Services.',
    description: 'KPMG interviews are centered on audit readiness, risk assessment, analytical reasoning, and professional ethics. Expect competency-based questions that test your integrity, attention to detail, and ability to deliver under pressure.',
    rounds: [
      { name: 'Audit & Risk',       icon: Scale,      desc: 'Audit fundamentals, risk identification, compliance' },
      { name: 'Analytical Reasoning', icon: Brain,    desc: 'Logical reasoning, pattern recognition, data insights' },
      { name: 'Professional Ethics', icon: Shield,    desc: 'Ethical dilemmas, professional conduct, integrity' },
    ],
    tags: ['Audit', 'Risk Assessment', 'Professional Ethics'],
    questions: 6,
    duration: '18 min',
    difficulty: 'Hard',
    diffColor: '#ef4444',
    tips: [
      'Show strong awareness of auditing standards and risk frameworks',
      'Prepare examples that demonstrate honesty and ethical decision-making',
      'Practice analytical reasoning and logical problem-solving questions',
      'Demonstrate attention to detail — KPMG values accuracy above all',
    ],
  },
];

// ─── Modes ────────────────────────────────────────────────────────────────────

const MODES = [
  {
    id: 'practice',
    label: 'Practice Mode',
    icon: BookOpen,
    desc: 'Relaxed environment. No proctoring. Great for preparation.',
    color: 'emerald',
    proctoring: 'practice',
    type: 'practice',
  },
  {
    id: 'real',
    label: 'Real Mode',
    icon: Shield,
    desc: 'Strict proctoring. Full-screen lock. Production conditions.',
    color: 'red',
    proctoring: 'strict',
    type: 'live',
  },
];

const MODE_COLORS = {
  emerald: {
    border:  'border-emerald-500/30',
    bg:      'bg-emerald-500/5',
    text:    'text-emerald-400',
    icon:    'bg-emerald-500/20',
    check:   'text-emerald-400',
  },
  red: {
    border:  'border-red-500/30',
    bg:      'bg-red-500/5',
    text:    'text-red-400',
    icon:    'bg-red-500/20',
    check:   'text-red-400',
  },
};

// ─── CompanyCard ──────────────────────────────────────────────────────────────

function CompanyCard({ company, selected, onSelect }) {
  const isSelected = selected?.id === company.id;
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(company)}
      className={`cursor-pointer rounded-2xl border p-5 transition-all duration-250 flex flex-col
        ${isSelected
          ? `${company.border} ${company.bg} shadow-lg`
          : 'border-white/8 bg-zinc-900/40 hover:border-white/14 hover:bg-zinc-900/60'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-2xl mb-1.5">{company.logo}</div>
          <h3 className="text-lg font-bold text-white">{company.name}</h3>
          <p className="text-[11px] font-semibold mt-0.5" style={{ color: company.color }}>
            {company.tagline}
          </p>
        </div>
        {isSelected && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: company.color }}>
            <CheckCircle className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-400 mb-3 leading-relaxed flex-1">{company.description}</p>

      {/* Rounds */}
      <div className="space-y-1.5 mb-3">
        {company.rounds.map(round => {
          const Icon = round.icon;
          return (
            <div key={round.name} className="flex items-start gap-2">
              <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: company.color + '20' }}>
                <Icon className="w-3 h-3" style={{ color: company.color }} />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-zinc-300">{round.name}</span>
                <span className="text-[10px] text-zinc-600 ml-1">— {round.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {company.tags.map(t => (
          <span key={t}
            className="text-[9px] font-bold px-2 py-0.5 rounded-full border text-zinc-500 border-white/10 uppercase tracking-wide">
            {t}
          </span>
        ))}
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-3 text-xs text-zinc-500 border-t border-white/5 pt-3 mt-auto">
        <span className="flex items-center gap-1">
          <Target className="w-3 h-3" /> {company.questions} questions
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> ~{company.duration}
        </span>
        <span className="font-bold ml-auto" style={{ color: company.diffColor }}>
          {company.difficulty}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MockInterviews() {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedMode, setSelectedMode]       = useState(null);
  const [starting, setStarting]               = useState(false);
  const [error, setError]                     = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const canStart = selectedCompany && selectedMode;

  const handleStart = async () => {
    if (!canStart) return;
    setStarting(true);
    setError('');
    try {
      const template = selectedCompany.id === 'amazon' ? 'behavioral'
        : ['deloitte', 'ey', 'kpmg'].includes(selectedCompany.id) ? 'mixed'
        : 'mixed';

      const { data } = await api.post('/api/v1/student/interviews/start', {
        template,
        proctoring_mode: selectedMode.proctoring,
        type: selectedMode.type,
        job_role: `${selectedCompany.name} Interview`,
        company_pack: selectedCompany.id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (selectedMode.id === 'real') {
        await api.post('/api/v1/student/proctoring/sessions', {
          interview_id: data.interview_id,
          consent_version: '1.0',
        }, { headers: { Authorization: `Bearer ${token}` } });
        navigate(`/live/${data.interview_id}`, {
          state: { role: `${selectedCompany.name} Interview`, question: data.question },
        });
      } else {
        navigate(`/interview/session/${data.interview_id}`, {
          state: { role: `${selectedCompany.name} Interview`, question: data.question },
        });
      }
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to start interview. Ensure backend is running.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080f] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-violet-400" />
            <span className="text-violet-400 font-semibold text-xs uppercase tracking-widest">MNC Mock Interviews</span>
          </div>
          <h1 className="text-3xl font-black">Choose Your Interview Pack</h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-xl">
            Practice with real-world questions from top companies. Each pack uses company-specific question banks and evaluation criteria calibrated to their hiring bar.
          </p>
        </div>

        {/* ── Featured: Indian HR Interview ── */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-rose-500/5 to-transparent p-6">
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Mini Priya avatar */}
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-500/60 shadow-lg shadow-orange-500/20 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs><linearGradient id="mBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ea580c"/><stop offset="100%" stopColor="#be185d"/></linearGradient></defs>
                    <rect width="100" height="100" fill="url(#mBg)"/>
                    <path d="M 20 82 Q 50 96 80 82 L 80 100 L 20 100 Z" fill="#6d28d9"/>
                    <rect x="33" y="68" width="34" height="18" rx="5" fill="#b91c1c"/>
                    <rect x="44" y="60" width="12" height="12" rx="4" fill="#f4b8a0"/>
                    <ellipse cx="50" cy="44" rx="21" ry="23" fill="#f4b8a0"/>
                    <ellipse cx="50" cy="25" rx="21" ry="15" fill="#1c1917"/>
                    <circle cx="50" cy="14" r="7" fill="#1c1917"/>
                    <circle cx="50" cy="29" r="2.8" fill="#dc2626"/>
                    <ellipse cx="42" cy="43" rx="4.5" ry="5" fill="white"/><ellipse cx="58" cy="43" rx="4.5" ry="5" fill="white"/>
                    <circle cx="42" cy="43" r="2.8" fill="#1c1917"/><circle cx="58" cy="43" r="2.8" fill="#1c1917"/>
                    <path d="M 37 36 Q 42 34 47 36" stroke="#1c1917" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                    <path d="M 53 36 Q 58 34 63 36" stroke="#1c1917" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                    <path d="M 44 57 Q 50 64 56 57" stroke="#b91c1c" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">New · AI Powered</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">Claude AI</span>
                  </div>
                  <h3 className="text-lg font-black text-white">Indian HR Interview with Priya Sharma</h3>
                  <p className="text-sm text-zinc-400 mt-0.5">
                    Real-time AI interview with an authentic Indian HR manager · 8 structured questions ·
                    9-parameter live scoring · Voice + text input
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {['Resume-based Q&A', 'Live confidence meter', 'TTS voice', 'Detailed report'].map(f => (
                      <span key={f} className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-orange-400" />{f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Link to="/interview/indian-hr" className="flex-shrink-0">
                <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/20 transition-all whitespace-nowrap">
                  Start Interview →
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Step 1: Company ── */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-400 text-[10px] flex items-center justify-center font-black">
              1
            </span>
            Select Company
          </h2>

          {/* Scrollable grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMPANIES.map(c => (
              <CompanyCard
                key={c.id}
                company={c}
                selected={selectedCompany}
                onSelect={setSelectedCompany}
              />
            ))}
          </div>
        </div>

        {/* ── Step 2: Mode ── */}
        <AnimatePresence>
          {selectedCompany && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-8"
            >
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-400 text-[10px] flex items-center justify-center font-black">
                  2
                </span>
                Select Mode
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODES.map(mode => {
                  const isSelected = selectedMode?.id === mode.id;
                  const c = MODE_COLORS[mode.color];
                  const Icon = mode.icon;
                  return (
                    <motion.button
                      key={mode.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedMode(mode)}
                      className={`text-left p-5 rounded-2xl border transition-all duration-200 w-full
                        ${isSelected ? `${c.border} ${c.bg}` : 'border-white/8 bg-zinc-900/40 hover:border-white/14'}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.icon}`}>
                          <Icon className={`w-5 h-5 ${c.text}`} />
                        </div>
                        <p className="font-bold text-base">{mode.label}</p>
                        {isSelected && <CheckCircle className={`w-4 h-4 ml-auto ${c.check}`} />}
                      </div>
                      <p className="text-sm text-zinc-400">{mode.desc}</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tips panel ── */}
        <AnimatePresence>
          {selectedCompany && (
            <motion.div
              key={selectedCompany.id + '-tips'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-6 p-5 rounded-2xl border ${selectedCompany.border} ${selectedCompany.bg}`}
            >
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2"
                style={{ color: selectedCompany.color }}>
                <Lightbulb className="w-4 h-4" />
                {selectedCompany.name} Interview Tips
              </h3>
              <ul className="space-y-2">
                {selectedCompany.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-300">
                    <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: selectedCompany.color }} />
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Start button ── */}
        <motion.button
          onClick={handleStart}
          disabled={!canStart || starting}
          whileHover={canStart ? { scale: 1.01 } : {}}
          whileTap={canStart ? { scale: 0.99 } : {}}
          className={`w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-250
            ${canStart
              ? 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-xl shadow-violet-500/20'
              : 'bg-zinc-800/80 text-zinc-500 cursor-not-allowed'}`}
        >
          {starting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Starting…</>
          ) : canStart ? (
            <><PlayCircle className="w-5 h-5" /> Start {selectedCompany?.name} · {selectedMode?.label}</>
          ) : (
            'Select a company and mode to begin'
          )}
        </motion.button>

      </div>
    </div>
  );
}
