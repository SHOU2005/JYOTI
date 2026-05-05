import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, TrendingUp, AlertCircle, CheckCircle, ChevronDown,
  ChevronRight, FileText, Zap, Target, BarChart2, Brain,
  Loader2, Search, SlidersHorizontal, Star,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../api/client';

// ─── helpers ──────────────────────────────────────────────────────────────────

function matchColor(pct) {
  if (pct >= 75) return { ring: '#10b981', bg: 'from-emerald-500/20 to-emerald-900/10', border: 'border-emerald-500/30', text: 'text-emerald-400' };
  if (pct >= 50) return { ring: '#f59e0b', bg: 'from-amber-500/20 to-amber-900/10',   border: 'border-amber-500/30',   text: 'text-amber-400'   };
  return           { ring: '#ef4444', bg: 'from-red-500/20 to-red-900/10',             border: 'border-red-500/30',     text: 'text-red-400'     };
}

function fitLabel(pct) {
  if (pct >= 75) return { label: 'Strong Fit',  bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' };
  if (pct >= 50) return { label: 'Good Fit',    bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300'       };
  if (pct >= 30) return { label: 'Partial Fit', bg: 'bg-orange-500/15 border-orange-500/30 text-orange-300'    };
  return               { label: 'Skill Gap',    bg: 'bg-red-500/15 border-red-500/30 text-red-300'             };
}

// Radial ring SVG
function MatchRing({ pct }) {
  const colors = matchColor(pct);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#27272a" strokeWidth="6" />
        <motion.circle
          cx="40" cy="40" r={r} fill="none"
          stroke={colors.ring} strokeWidth="6"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1, ease: 'easeOut' }}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-black" style={{ color: colors.ring }}>{pct}%</span>
        <span className="text-[9px] text-zinc-500">match</span>
      </div>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

function JobCard({ job, index }) {
  const [open, setOpen] = useState(false);
  const pct     = job.match_percent ?? 0;
  const colors  = matchColor(pct);
  const fit     = fitLabel(pct);
  const matched = job.matched || job.matched_skills || [];
  const missing = job.missing_skills || [];
  const tips    = job.improvement_tips || job.tips || [];
  const readiness = job.placement_readiness;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
    >
      <Card className={`p-0 overflow-hidden border-white/8 bg-gradient-to-br ${colors.bg} hover:border-white/18 transition-all duration-300`}>
        <div className="p-5">
          {/* Header row */}
          <div className="flex items-start gap-4">
            {/* Role icon */}
            <div className={`w-12 h-12 rounded-xl bg-white/8 border ${colors.border} flex items-center justify-center flex-shrink-0`}>
              <Briefcase className="w-5 h-5 text-zinc-300" />
            </div>

            {/* Title & meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-zinc-100 leading-tight">{job.title || job.role}</h2>
                  {job.company && <p className="text-sm text-zinc-400 mt-0.5">{job.company}</p>}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${fit.bg} flex-shrink-0`}>
                  {fit.label}
                </span>
              </div>

              {/* Readiness badge */}
              {readiness && (
                <div className="mt-2 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs text-zinc-400">Placement Readiness: <span className="text-amber-300 font-medium">{readiness}</span></span>
                </div>
              )}
            </div>

            {/* Match ring */}
            <MatchRing pct={pct} />
          </div>

          {/* Matched skills */}
          {matched.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wide">Matched Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {matched.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/12 border border-emerald-500/25 text-emerald-300">
                    <CheckCircle className="w-2.5 h-2.5" />{s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing skills */}
          {missing.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wide">Skill Gaps</p>
              <div className="flex flex-wrap gap-1.5">
                {missing.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-500/12 border border-red-500/25 text-red-300">
                    <AlertCircle className="w-2.5 h-2.5" />{s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-2">
              {tips.length > 0 && (
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {open ? 'Hide' : 'Show'} improvement tips
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
            <Link to={`/interview/setup?role=${encodeURIComponent(job.title || job.role || '')}`}>
              <Button size="sm" className="gap-1.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-md shadow-blue-500/20">
                <Zap className="w-3.5 h-3.5" /> Interview for this Role
              </Button>
            </Link>
          </div>
        </div>

        {/* Collapsible tips */}
        <AnimatePresence>
          {open && tips.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 pt-0">
                <div className="h-px bg-white/8 mb-4" />
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                  Improvement Tips
                </p>
                <ul className="space-y-2">
                  {tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-zinc-300">
                      <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// ─── Placement Readiness Overview ─────────────────────────────────────────────

function ReadinessOverview({ jobs }) {
  if (!jobs.length) return null;

  const avgMatch = Math.round(jobs.reduce((a, j) => a + (j.match_percent ?? 0), 0) / jobs.length);
  const strong   = jobs.filter((j) => (j.match_percent ?? 0) >= 75).length;
  const good     = jobs.filter((j) => (j.match_percent ?? 0) >= 50 && (j.match_percent ?? 0) < 75).length;
  const gaps     = jobs.filter((j) => (j.match_percent ?? 0) < 50).length;

  const avgColor = avgMatch >= 75 ? '#10b981' : avgMatch >= 50 ? '#f59e0b' : '#ef4444';
  const avgLabel = avgMatch >= 75 ? 'Placement Ready' : avgMatch >= 50 ? 'Near Ready' : 'Needs Improvement';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Card className="p-6 border-white/10 mb-8 bg-gradient-to-br from-blue-950/40 to-violet-950/20">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold">Placement Readiness Overview</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-black" style={{ color: avgColor }}>{avgMatch}%</p>
            <p className="text-xs text-zinc-400 mt-1">Avg Match</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: avgColor }}>{avgLabel}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-emerald-400">{strong}</p>
            <p className="text-xs text-zinc-400 mt-1">Strong Fit</p>
            <p className="text-xs text-emerald-500 font-medium mt-0.5">≥ 75% match</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-amber-400">{good}</p>
            <p className="text-xs text-zinc-400 mt-1">Good Fit</p>
            <p className="text-xs text-amber-500 font-medium mt-0.5">50–74% match</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-red-400">{gaps}</p>
            <p className="text-xs text-zinc-400 mt-1">Skill Gap</p>
            <p className="text-xs text-red-500 font-medium mt-0.5">&lt; 50% match</p>
          </div>
        </div>
        {/* Summary bar */}
        <div className="mt-4">
          <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden flex">
            <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${(strong / jobs.length) * 100}%` }} />
            <div className="h-full bg-amber-500 transition-all duration-700"  style={{ width: `${(good / jobs.length) * 100}%`   }} />
            <div className="h-full bg-red-500 transition-all duration-700"    style={{ width: `${(gaps / jobs.length) * 100}%`   }} />
          </div>
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>Skill Gap</span>
            <span>{jobs.length} roles matched</span>
            <span>Strong Fit</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Sort / Filter bar ────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'match_desc', label: 'Best Match' },
  { value: 'match_asc',  label: 'Lowest Match' },
  { value: 'title_asc',  label: 'Title A→Z'   },
];

const FILTER_OPTIONS = ['All', 'Strong Fit', 'Good Fit', 'Partial Fit', 'Skill Gap'];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const [jobs, setJobs]       = useState([]);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);
  const [noResume, setNoResume] = useState(false);
  const [sortBy, setSortBy]   = useState('match_desc');
  const [filter, setFilter]   = useState('All');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    api.get('/api/v1/student/jobs')
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : r.data.jobs || [];
        if (r.data?.no_resume || r.data?.error === 'no_resume') setNoResume(true);
        else setJobs(data);
      })
      .catch((e) => {
        const msg = e.response?.data?.detail || '';
        if (msg.toLowerCase().includes('resume') || e.response?.status === 404) setNoResume(true);
        else setError(msg || 'Failed to load job matches.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter + sort + search
  const filtered = jobs
    .filter((j) => {
      const pct = j.match_percent ?? 0;
      if (filter === 'Strong Fit'  && pct < 75)  return false;
      if (filter === 'Good Fit'    && (pct < 50 || pct >= 75)) return false;
      if (filter === 'Partial Fit' && (pct < 30 || pct >= 50)) return false;
      if (filter === 'Skill Gap'   && pct >= 30)  return false;
      if (search) {
        const q = search.toLowerCase();
        return (j.title || j.role || '').toLowerCase().includes(q) ||
               (j.company || '').toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'match_desc') return (b.match_percent ?? 0) - (a.match_percent ?? 0);
      if (sortBy === 'match_asc')  return (a.match_percent ?? 0) - (b.match_percent ?? 0);
      return (a.title || '').localeCompare(b.title || '');
    });

  // ── Loading ──
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Loading job matches…</p>
      </div>
    </div>
  );

  // ── No Resume ──
  if (noResume) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <Card className="p-10 border-white/10">
        <FileText className="w-16 h-16 text-zinc-600 mx-auto mb-5" />
        <h2 className="text-2xl font-bold mb-2">Upload Your Resume First</h2>
        <p className="text-zinc-400 mb-6">Job matching requires resume analysis. Upload your resume to see personalized role recommendations and skill-match scores.</p>
        <Link to="/resume">
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/20">
            <FileText className="w-4 h-4" /> Go to Resume Intelligence
          </Button>
        </Link>
      </Card>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="p-8 text-center border-red-500/20 max-w-md">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-300 font-medium">{error}</p>
        <p className="text-zinc-500 text-sm mt-2">Check your network connection and try again.</p>
      </Card>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-violet-500/30 border border-blue-500/30 flex items-center justify-center">
            <Brain className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Job Matching Engine</h1>
            <p className="text-zinc-400 text-sm">Resume-based AI matching — ranked by skill compatibility</p>
          </div>
        </div>
      </motion.div>

      <div className="h-px bg-white/10 my-6" />

      {/* Readiness Overview */}
      <ReadinessOverview jobs={jobs} />

      {/* Controls */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles or companies…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
          />
        </div>
        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                filter === f ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50 cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </motion.div>

      {/* Results count */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        className="text-xs text-zinc-500 mb-4 font-medium">
        {filtered.length} role{filtered.length !== 1 ? 's' : ''} found
      </motion.p>

      {/* Job cards */}
      <div className="space-y-4">
        {filtered.map((job, i) => (
          <JobCard key={job.id ?? i} job={job} index={i} />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <Target className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 font-medium">No roles match your current filters.</p>
          <button onClick={() => { setFilter('All'); setSearch(''); }} className="text-blue-400 text-sm mt-2 hover:text-blue-300 transition-colors">
            Reset filters
          </button>
        </motion.div>
      )}

      {/* CTA footer */}
      {jobs.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link to="/resume">
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" /> Update Resume
            </Button>
          </Link>
          <Link to="/interview/setup">
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/20">
              <Zap className="w-4 h-4" /> Start Interview
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
