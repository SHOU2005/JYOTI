import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, CheckCircle, AlertCircle, Loader2,
  Briefcase, GraduationCap, Award, Brain, Code, Layers,
  Star, ChevronRight, BarChart2, TrendingUp, Zap, BookOpen,
  Target, Users, X,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../api/client';

// ─── helpers ──────────────────────────────────────────────────────────────────

const SKILL_CATEGORY_COLORS = {
  language:      { bg: 'bg-blue-500/15',   border: 'border-blue-500/30',   text: 'text-blue-300'   },
  framework:     { bg: 'bg-purple-500/15', border: 'border-purple-500/30', text: 'text-purple-300' },
  database:      { bg: 'bg-emerald-500/15',border: 'border-emerald-500/30',text: 'text-emerald-300'},
  cloud:         { bg: 'bg-sky-500/15',    border: 'border-sky-500/30',    text: 'text-sky-300'    },
  tool:          { bg: 'bg-amber-500/15',  border: 'border-amber-500/30',  text: 'text-amber-300'  },
  other:         { bg: 'bg-zinc-500/15',   border: 'border-zinc-500/30',   text: 'text-zinc-300'   },
};

function skillCategory(skill) {
  const s = skill.toLowerCase();
  if (/python|java(?!script)|c\+\+|golang|rust|swift|kotlin|ruby|php|scala/.test(s)) return 'language';
  if (/react|vue|angular|django|flask|spring|node|express|next|nuxt|laravel/.test(s)) return 'framework';
  if (/sql|postgres|mysql|mongo|redis|cassandra|dynamo|firebase/.test(s)) return 'database';
  if (/aws|azure|gcp|kubernetes|docker|terraform|jenkins/.test(s)) return 'cloud';
  if (/git|jira|figma|postman|linux|bash|agile|scrum/.test(s)) return 'tool';
  return 'other';
}

function SkillBadge({ skill }) {
  const cat = skillCategory(skill);
  const c = SKILL_CATEGORY_COLORS[cat];
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.border} ${c.text}`}>
      {skill}
    </span>
  );
}

function ProgressBar({ value, color = '#10b981', label }) {
  return (
    <div>
      {label && <div className="flex justify-between text-xs text-zinc-400 mb-1"><span>{label}</span><span>{value}%</span></div>}
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function ScoreRing({ score }) {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 75 ? 'Strong' : score >= 50 ? 'Good' : 'Needs Work';
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={r} fill="none" stroke="#27272a" strokeWidth="8" />
        <motion.circle
          cx="56" cy="56" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
          transform="rotate(-90 56 56)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black" style={{ color }}>{score}</span>
        <span className="text-[10px] text-zinc-500">{label}</span>
      </div>
    </div>
  );
}

const SENIORITY_COLORS = {
  intern:  'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  junior:  'bg-blue-500/20 text-blue-300 border-blue-500/30',
  mid:     'bg-purple-500/20 text-purple-300 border-purple-500/30',
  senior:  'bg-amber-500/20 text-amber-300 border-amber-500/30',
  lead:    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

const FIT_COLORS = {
  Strong:  '#10b981',
  Good:    '#3b82f6',
  Partial: '#f59e0b',
  Weak:    '#ef4444',
};

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({ file, setFile, onUpload, loading, progress }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.type === 'application/pdf' || f.name.endsWith('.docx'))) setFile(f);
  }, [setFile]);

  const handleDrag = useCallback((e) => { e.preventDefault(); setDragging(true); }, []);
  const handleDragLeave = useCallback(() => setDragging(false), []);

  const fmt = (bytes) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <Card className="p-6 border-white/10">
      <div
        onDrop={handleDrop}
        onDragOver={handleDrag}
        onDragLeave={handleDragLeave}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-10 transition-all duration-300 text-center
          ${dragging ? 'border-blue-400 bg-blue-500/10' : file ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/15 hover:border-white/30 hover:bg-white/3 cursor-pointer'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Upload className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
              <p className="text-zinc-200 font-semibold mb-1">Drop your resume here</p>
              <p className="text-zinc-500 text-sm">or click to browse — PDF or DOCX supported</p>
            </motion.div>
          ) : (
            <motion.div key="file" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-zinc-100">{file.name}</p>
                <p className="text-sm text-zinc-400">{fmt(file.size)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing Resume…</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <Button
          onClick={onUpload}
          disabled={!file || loading}
          className="gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/20"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {loading ? 'Analyzing…' : 'Analyze Resume'}
        </Button>
        {file && !loading && (
          <Button variant="outline" size="md" onClick={() => setFile(null)} className="gap-2">
            <X className="w-4 h-4" /> Clear
          </Button>
        )}
      </div>
    </Card>
  );
}

// ─── Tab component ────────────────────────────────────────────────────────────

const TABS = [
  { id: 'skills',      label: 'Skills Analysis',       icon: Code        },
  { id: 'experience',  label: 'Experience & Education', icon: Briefcase   },
  { id: 'projects',    label: 'Projects & Certs',       icon: Layers      },
  { id: 'ai',          label: 'AI Analysis',            icon: Brain       },
];

// ─── Results Tabs ─────────────────────────────────────────────────────────────

function SkillsTab({ data }) {
  const skills = data.skills || [];
  const grouped = skills.reduce((acc, s) => {
    const cat = skillCategory(s);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});
  const weakness = data.weakness_analysis || {};

  return (
    <div className="space-y-6">
      {/* Stat */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-white/8 text-center">
          <p className="text-3xl font-black text-blue-400">{skills.length}</p>
          <p className="text-xs text-zinc-400 mt-1">Skills Detected</p>
        </Card>
        <Card className="p-4 border-white/8 text-center">
          <p className="text-3xl font-black text-purple-400">{Object.keys(grouped).length}</p>
          <p className="text-xs text-zinc-400 mt-1">Categories</p>
        </Card>
        <Card className="p-4 border-white/8 text-center sm:col-span-1 col-span-2">
          <p className="text-3xl font-black text-emerald-400">{Object.keys(weakness).length}</p>
          <p className="text-xs text-zinc-400 mt-1">Roles Analysed</p>
        </Card>
      </div>

      {/* Grouped skills */}
      {Object.entries(grouped).map(([cat, catSkills]) => (
        <div key={cat}>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2 capitalize">{cat}</p>
          <div className="flex flex-wrap gap-2">
            {catSkills.map((s) => <SkillBadge key={s} skill={s} />)}
          </div>
        </div>
      ))}

      {/* Weakness analysis */}
      {Object.keys(weakness).length > 0 && (
        <div>
          <p className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" /> Missing Skills by Role
          </p>
          <div className="space-y-3">
            {Object.entries(weakness).map(([role, missing]) => (
              <div key={role} className="p-3 rounded-lg bg-white/3 border border-white/8">
                <p className="text-sm font-medium text-zinc-200 mb-2">{role}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(missing) ? missing : [missing]).map((m) => (
                    <span key={m} className="px-2 py-0.5 rounded-full text-xs bg-red-500/10 border border-red-500/25 text-red-300">{m}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExperienceTab({ data }) {
  const experience  = data.experience  || [];
  const education   = data.education   || [];
  const seniority   = data.seniority_level || 'mid';
  const totalYears  = data.total_experience_years;
  const seniorityClass = SENIORITY_COLORS[seniority.toLowerCase()] || SENIORITY_COLORS.mid;

  return (
    <div className="space-y-6">
      {/* Badges */}
      <div className="flex flex-wrap gap-3">
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border capitalize ${seniorityClass}`}>
          <Users className="inline w-3.5 h-3.5 mr-1.5" />{seniority} Level
        </span>
        {totalYears != null && (
          <span className="px-3 py-1.5 rounded-full text-sm font-semibold border bg-zinc-500/15 border-zinc-500/30 text-zinc-300">
            <Briefcase className="inline w-3.5 h-3.5 mr-1.5" />{totalYears} yrs experience
          </span>
        )}
      </div>

      {/* Experience */}
      {experience.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400" /> Work Experience
          </p>
          <div className="space-y-3">
            {experience.map((exp, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className="p-4 rounded-xl bg-white/3 border border-white/8 flex gap-4">
                <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-100">{exp.title || exp.role || exp}</p>
                  {exp.company && <p className="text-sm text-zinc-400">{exp.company}</p>}
                  {exp.duration && <p className="text-xs text-zinc-500 mt-1">{exp.duration}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-purple-400" /> Education
          </p>
          <div className="space-y-3">
            {education.map((edu, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className="p-4 rounded-xl bg-white/3 border border-white/8 flex gap-4">
                <div className="w-9 h-9 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-100">{edu.degree || edu.qualification || edu}</p>
                  {edu.university && <p className="text-sm text-zinc-400">{edu.university}</p>}
                  {edu.year && <p className="text-xs text-zinc-500 mt-1">{edu.year}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {experience.length === 0 && education.length === 0 && (
        <div className="text-center py-8 text-zinc-500">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No experience or education data extracted.</p>
        </div>
      )}
    </div>
  );
}

function ProjectsTab({ data }) {
  const projects = data.projects || [];
  const certs    = data.certifications || [];

  return (
    <div className="space-y-6">
      {projects.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" /> Projects ({projects.length})
          </p>
          <div className="space-y-3">
            {projects.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="p-4 rounded-xl bg-white/3 border border-white/8">
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <p className="text-zinc-200 text-sm">{typeof p === 'object' ? (p.title || p.name || JSON.stringify(p)) : p}</p>
                </div>
                {typeof p === 'object' && p.description && (
                  <p className="text-xs text-zinc-500 mt-2 ml-4.5">{p.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {certs.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" /> Certifications ({certs.length})
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {certs.map((cert, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <p className="text-zinc-200 text-sm font-medium">{typeof cert === 'object' ? (cert.name || cert.title) : cert}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {projects.length === 0 && certs.length === 0 && (
        <div className="text-center py-8 text-zinc-500">
          <Layers className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No projects or certifications extracted.</p>
        </div>
      )}
    </div>
  );
}

function AITab({ data }) {
  const suggested   = data.suggested_roles || [];
  const weakness    = data.weakness_analysis || {};
  const score       = data.resume_score ?? data.score ?? null;

  return (
    <div className="space-y-6">
      {/* Resume Score */}
      {score != null && (
        <Card className="p-6 border-white/8">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" /> Resume Quality Score
          </h3>
          <div className="flex items-center gap-6">
            <ScoreRing score={Math.round(score)} />
            <div className="flex-1">
              <p className="text-zinc-300 text-sm mb-2">
                {score >= 75 ? 'Your resume is well-structured and highly competitive.' :
                 score >= 50 ? 'Your resume is good but has room for improvement.' :
                 'Consider revising your resume to improve your placement chances.'}
              </p>
              <ProgressBar value={Math.round(score)} color={score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'} />
            </div>
          </div>
        </Card>
      )}

      {/* Suggested Roles */}
      {suggested.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" /> Suggested Roles (Top {Math.min(5, suggested.length)})
          </p>
          <div className="space-y-3">
            {suggested.slice(0, 5).map((role, i) => {
              const roleName = typeof role === 'object' ? (role.role || role.title || role.name) : role;
              const fit = typeof role === 'object' ? (role.fit_percent ?? role.match_percent ?? role.score ?? 70) : 70;
              const fitColor = fit >= 75 ? '#10b981' : fit >= 50 ? '#f59e0b' : '#ef4444';
              const fitLabel = fit >= 75 ? 'Strong Fit' : fit >= 50 ? 'Good Fit' : 'Partial Fit';
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="p-4 rounded-xl bg-white/3 border border-white/8 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm" style={{ color: fitColor }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-zinc-100">{roleName}</p>
                    <div className="mt-2">
                      <ProgressBar value={Math.round(fit)} color={fitColor} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full border"
                    style={{ color: fitColor, borderColor: `${fitColor}40`, backgroundColor: `${fitColor}15` }}>
                    {fitLabel}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weakness Analysis Table */}
      {Object.keys(weakness).length > 0 && (
        <div>
          <p className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" /> Skill Gap Analysis by Role
          </p>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 border-b border-white/8">
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Missing Skills</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {Object.entries(weakness).map(([role, missing]) => (
                  <tr key={role} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-200 whitespace-nowrap">{role}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(missing) ? missing : [missing]).map((m) => (
                          <span key={m} className="px-2 py-0.5 rounded-full text-xs bg-red-500/10 border border-red-500/25 text-red-300">{m}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CTA */}
      <Card className="p-5 border-blue-500/20 bg-gradient-to-r from-blue-950/40 to-violet-950/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-zinc-100 mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" /> Ready to Interview?
            </h3>
            <p className="text-zinc-400 text-sm">Start a tailored interview based on your resume analysis.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/interview/setup">
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/20 whitespace-nowrap">
                Start Interview <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="outline" className="gap-2 whitespace-nowrap">
                <TrendingUp className="w-4 h-4" /> View Jobs
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResumePage() {
  const [file, setFile]       = useState(null);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('skills');

  const handleUpload = async () => {
    if (!file) return;
    setError('');
    setLoading(true);
    setProgress(0);

    // Simulate progress ticks while waiting for the API
    const ticker = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.floor(Math.random() * 8) + 3 : p));
    }, 400);

    const fd = new FormData();
    fd.append('file', file);

    try {
      const { data } = await api.post('/api/v1/student/resume/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      clearInterval(ticker);
      setProgress(100);
      setTimeout(() => {
        setResult(data.extracted || data);
        setActiveTab('skills');
        setLoading(false);
      }, 300);
    } catch (e) {
      clearInterval(ticker);
      setError(e.response?.data?.detail || 'Upload failed. Please try again.');
      setLoading(false);
      setProgress(0);
    }
  };

  const tabContent = result ? {
    skills:     <SkillsTab data={result} />,
    experience: <ExperienceTab data={result} />,
    projects:   <ProjectsTab data={result} />,
    ai:         <AITab data={result} />,
  } : {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-500/30 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Resume Intelligence</h1>
            <p className="text-zinc-400 text-sm">AI-powered analysis of your resume for placement readiness</p>
          </div>
        </div>
      </motion.div>

      <div className="h-px bg-white/10 my-6" />

      {/* Upload */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <UploadZone
          file={file}
          setFile={(f) => { setFile(f); if (!f) { setResult(null); setError(''); } }}
          onUpload={handleUpload}
          loading={loading}
          progress={progress}
        />
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </motion.div>
        )}
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            {/* Success Banner */}
            <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 mb-6">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Resume analyzed successfully. Explore the results below.
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/8 mb-6 overflow-x-auto">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap flex-1 justify-center transition-all duration-200
                    ${activeTab === id ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom CTA (when no result yet) */}
      {!result && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-8 flex flex-wrap gap-4 justify-center text-sm text-zinc-500">
          <Link to="/interview/setup" className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors">
            <Zap className="w-4 h-4" /> Go to Interview Setup
          </Link>
          <span className="text-zinc-700">·</span>
          <Link to="/jobs" className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors">
            <TrendingUp className="w-4 h-4" /> Browse Job Matches
          </Link>
        </motion.div>
      )}
    </div>
  );
}
