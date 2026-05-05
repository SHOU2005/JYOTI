import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from 'recharts';
import {
  Users,
  FileText,
  BarChart3,
  ShieldCheck,
  Trophy,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Medal,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Star,
  Activity,
} from 'lucide-react';
import api from '../api/client';

/* ─── Palette ────────────────────────────────────────────────────────── */
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
const BG = '#0a0a0c';
const CARD = 'rgba(255,255,255,0.03)';
const BORDER = '1px solid rgba(255,255,255,0.08)';

/* ─── Helpers ────────────────────────────────────────────────────────── */
function clx(...args) {
  return args.filter(Boolean).join(' ');
}

function StatCard({ icon, label, value, sub, color = '#3b82f6', loading }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: CARD, border: BORDER }}
    >
      <div className="flex items-center justify-between">
        <span className="text-zinc-500 text-sm font-medium">{label}</span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}28` }}
        >
          {icon}
        </div>
      </div>
      <div>
        <p
          className="font-extrabold tracking-tight text-white"
          style={{ fontSize: '1.9rem', lineHeight: 1 }}
        >
          {loading ? (
            <span className="inline-block w-20 h-8 rounded-lg bg-white/5 animate-pulse" />
          ) : (
            value ?? '—'
          )}
        </p>
        {sub && <p className="text-zinc-500 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-base font-bold text-white mb-4">{children}</h3>
  );
}

function Skeleton({ h = 'h-40' }) {
  return (
    <div className={`${h} rounded-xl bg-white/5 animate-pulse`} />
  );
}

function ReadinessBadge({ band }) {
  const map = {
    High: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#34d399' },
    Medium: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#fbbf24' },
    Low: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#f87171' },
  };
  const s = map[band] || map['Medium'];
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      {band || '—'}
    </span>
  );
}

function SeverityBadge({ severity }) {
  const map = {
    critical: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.35)', color: '#f87171' },
    high: { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.35)', color: '#fb923c' },
    medium: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#fbbf24' },
    low: { bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)', color: '#34d399' },
  };
  const key = (severity || '').toLowerCase();
  const s = map[key] || map['medium'];
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      {severity || '—'}
    </span>
  );
}

const tooltipStyle = {
  backgroundColor: '#1a1a2e',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: 12,
};

/* ─── Student Detail Modal ───────────────────────────────────────────── */
function StudentModal({ student, onClose }) {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    setLoading(true);
    api
      .get(`/api/v1/admin/students/${student.id}/interviews`)
      .then((r) => setInterviews(r.data || []))
      .catch(() => setInterviews([]))
      .finally(() => setLoading(false));
  }, [student]);

  if (!student) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-2xl rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
          style={{ background: '#131318', border: BORDER }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">{student.name}</h3>
              <p className="text-zinc-500 text-sm">{student.email}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <p className="text-2xl font-bold text-blue-400">{student.best_score?.toFixed(1) ?? '—'}</p>
              <p className="text-xs text-zinc-500 mt-1">Best Score</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <p className="text-2xl font-bold text-violet-400">{student.interview_count ?? '—'}</p>
              <p className="text-xs text-zinc-500 mt-1">Interviews</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <p className="text-2xl font-bold text-emerald-400">{student.integrity_score?.toFixed(1) ?? '—'}</p>
              <p className="text-xs text-zinc-500 mt-1">Integrity</p>
            </div>
          </div>
          <SectionTitle>Interview History</SectionTitle>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} h="h-14" />)}
            </div>
          ) : interviews.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">No interviews found.</p>
          ) : (
            <div className="space-y-2">
              {interviews.map((iv, i) => (
                <div
                  key={iv.id || i}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div>
                    <p className="text-white text-sm font-medium">{iv.role || iv.job_role || 'Interview'}</p>
                    <p className="text-zinc-500 text-xs">{iv.created_at ? new Date(iv.created_at).toLocaleDateString() : '—'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold">{iv.total_score?.toFixed(1) ?? '—'}</span>
                    <ReadinessBadge band={iv.readiness_band} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── TABS ───────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
  { id: 'students', label: 'Students', icon: <Users className="w-4 h-4" /> },
  { id: 'placement', label: 'Placement', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'violations', label: 'Violations', icon: <AlertTriangle className="w-4 h-4" /> },
  { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
];

/* ─── Overview Tab ───────────────────────────────────────────────────── */
function OverviewTab() {
  const [batch, setBatch] = useState(null);
  const [skills, setSkills] = useState([]);
  const [placement, setPlacement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api.get('/api/v1/admin/analytics/batch'),
      api.get('/api/v1/admin/analytics/skills'),
      api.get('/api/v1/admin/analytics/placement'),
    ]).then(([batchRes, skillsRes, placementRes]) => {
      if (batchRes.status === 'fulfilled') setBatch(batchRes.value.data);
      if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value.data?.skill_gaps || skillsRes.value.data || []);
      if (placementRes.status === 'fulfilled') setPlacement(placementRes.value.data);
      setLoading(false);
    });
  }, []);

  const readinessData = placement
    ? [
        { name: 'High', value: placement.high_readiness || 0, color: '#10b981' },
        { name: 'Medium', value: placement.medium_readiness || 0, color: '#f59e0b' },
        { name: 'Low', value: placement.low_readiness || 0, color: '#ef4444' },
      ]
    : [];

  const skillData = Array.isArray(skills)
    ? skills.slice(0, 8).map((s) => ({
        subject: s.skill || s.name || s,
        score: typeof s === 'object' ? (s.avg_score || s.score || 0) : 0,
        fullMark: 100,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Batch stats */}
      <div className="rounded-2xl p-6" style={{ background: CARD, border: BORDER }}>
        <SectionTitle>Batch Analytics</SectionTitle>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} h="h-20" />)}
          </div>
        ) : batch ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Students', value: batch.total_students ?? batch.students },
              { label: 'Completed Interviews', value: batch.total_interviews ?? batch.interviews },
              { label: 'Avg Score', value: batch.avg_score?.toFixed(1) },
              { label: 'Placement Rate', value: batch.placement_rate ? `${batch.placement_rate.toFixed(1)}%` : undefined },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-4 text-center"
                style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}
              >
                <p className="text-2xl font-bold text-white">{item.value ?? '—'}</p>
                <p className="text-zinc-500 text-xs mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">No batch data available.</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Skill gaps radar */}
        <div className="rounded-2xl p-6" style={{ background: CARD, border: BORDER }}>
          <SectionTitle>Top Skill Gaps (Radar)</SectionTitle>
          {loading ? <Skeleton /> : skillData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 11 }} />
                  <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm text-center py-16">No skill data available.</p>
          )}
        </div>

        {/* Readiness distribution donut */}
        <div className="rounded-2xl p-6" style={{ background: CARD, border: BORDER }}>
          <SectionTitle>Readiness Distribution</SectionTitle>
          {loading ? <Skeleton /> : readinessData.some((d) => d.value > 0) ? (
            <div className="h-64 flex items-center gap-6">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={readinessData}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="80%"
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {readinessData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {readinessData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <span className="text-zinc-400 text-sm">{d.name}</span>
                    <span className="text-white font-bold text-sm ml-auto pl-4">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm text-center py-16">No readiness data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Students Tab ───────────────────────────────────────────────────── */
function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bandFilter, setBandFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api
      .get('/api/v1/admin/students')
      .then((r) => setStudents(r.data || []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) => {
    const matchSearch =
      !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    const matchBand =
      bandFilter === 'All' || s.readiness_band === bandFilter;
    return matchSearch && matchBand;
  });

  return (
    <div className="space-y-4">
      <StudentModal student={selected} onClose={() => setSelected(null)} />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div
          className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl"
          style={{ background: CARD, border: BORDER }}
        >
          <Search className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="bg-transparent outline-none text-white text-sm flex-1 placeholder-zinc-600"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'High', 'Medium', 'Low'].map((b) => (
            <button
              key={b}
              onClick={() => setBandFilter(b)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background:
                  bandFilter === b
                    ? 'rgba(99,102,241,0.2)'
                    : CARD,
                border:
                  bandFilter === b
                    ? '1px solid rgba(99,102,241,0.4)'
                    : BORDER,
                color: bandFilter === b ? '#a5b4fc' : '#71717a',
              }}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: BORDER }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Name', 'Email', 'Best Score', 'Interviews', 'Readiness', 'Integrity'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {[1, 2, 3, 4, 5, 6].map((j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 rounded bg-white/5 animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => setSelected(s)}
                      className="cursor-pointer transition-colors hover:bg-white/3"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td className="px-4 py-3 font-medium text-white">{s.name || '—'}</td>
                      <td className="px-4 py-3 text-zinc-500">{s.email || '—'}</td>
                      <td className="px-4 py-3 font-bold text-blue-400">
                        {s.best_score?.toFixed(1) ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{s.interview_count ?? '—'}</td>
                      <td className="px-4 py-3">
                        <ReadinessBadge band={s.readiness_band} />
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {s.integrity_score?.toFixed(1) ?? '—'}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <p className="text-zinc-600 text-sm text-center py-10">No students match your filters.</p>
        )}
        <div className="px-4 py-3 text-xs text-zinc-600" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          Showing {filtered.length} of {students.length} students &middot; Click a row to view details
        </div>
      </div>
    </div>
  );
}

/* ─── Placement Tab ──────────────────────────────────────────────────── */
function PlacementTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/v1/admin/analytics/placement')
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const scoreDistData = data?.score_distribution
    ? Object.entries(data.score_distribution).map(([range, count]) => ({
        name: range,
        count,
      }))
    : [];

  const topPerformers = data?.top_performers || [];
  const needsSupport = data?.needs_support || [];
  const skillGaps = data?.skill_gaps || [];

  return (
    <div className="space-y-6">
      {/* Metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'High Readiness', value: loading ? null : data?.high_readiness, color: '#10b981' },
          { label: 'Medium Readiness', value: loading ? null : data?.medium_readiness, color: '#f59e0b' },
          { label: 'Low Readiness', value: loading ? null : data?.low_readiness, color: '#ef4444' },
          { label: 'Avg Score', value: loading ? null : data?.avg_score?.toFixed(1), color: '#3b82f6' },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-2xl p-5 flex flex-col gap-1"
            style={{ background: CARD, border: BORDER }}
          >
            <span className="text-zinc-500 text-xs font-medium">{m.label}</span>
            {loading ? (
              <div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse mt-1" />
            ) : (
              <span className="text-2xl font-extrabold" style={{ color: m.color }}>
                {m.value ?? '—'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Score distribution */}
      {scoreDistData.length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: CARD, border: BORDER }}>
          <SectionTitle>Score Distribution</SectionTitle>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistData} barSize={32}>
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {scoreDistData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top performers */}
        <div className="rounded-2xl p-6" style={{ background: CARD, border: BORDER }}>
          <SectionTitle>Top Performers</SectionTitle>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} h="h-12" />)}
            </div>
          ) : topPerformers.length === 0 ? (
            <p className="text-zinc-500 text-sm">No data available.</p>
          ) : (
            <div className="space-y-2">
              {topPerformers.slice(0, 10).map((s, i) => (
                <div
                  key={s.id || i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}
                >
                  <span className="text-emerald-400 font-bold text-sm w-5 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{s.name}</p>
                    <p className="text-zinc-500 text-xs truncate">{s.email}</p>
                  </div>
                  <span className="text-emerald-400 font-bold">{s.best_score?.toFixed(1) ?? '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Needs support */}
        <div className="rounded-2xl p-6" style={{ background: CARD, border: BORDER }}>
          <SectionTitle>Students Needing Support</SectionTitle>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} h="h-12" />)}
            </div>
          ) : needsSupport.length === 0 ? (
            <p className="text-zinc-500 text-sm">No at-risk students detected.</p>
          ) : (
            <div className="space-y-2">
              {needsSupport.slice(0, 10).map((s, i) => (
                <div
                  key={s.id || i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}
                >
                  <TrendingDown className="w-4 h-4 text-red-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{s.name}</p>
                    <p className="text-zinc-500 text-xs truncate">{s.email}</p>
                  </div>
                  <span className="text-red-400 font-bold">{s.best_score?.toFixed(1) ?? '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Skill gap heatmap */}
      {skillGaps.length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: CARD, border: BORDER }}>
          <SectionTitle>Skill Gap Heatmap</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {skillGaps.map((sg, i) => {
              const score = sg.avg_score || sg.score || 0;
              const heat =
                score < 40
                  ? { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', color: '#f87171' }
                  : score < 65
                  ? { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#fbbf24' }
                  : { bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)', color: '#34d399' };
              return (
                <div
                  key={i}
                  className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  style={{ background: heat.bg, border: `1px solid ${heat.border}`, color: heat.color }}
                >
                  <span>{sg.skill || sg.name || sg}</span>
                  {typeof score === 'number' && score > 0 && (
                    <span className="text-xs opacity-75">{score.toFixed(0)}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Violations Tab ─────────────────────────────────────────────────── */
function ViolationsTab() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('All');

  useEffect(() => {
    api
      .get('/api/v1/admin/proctoring/violations')
      .then((r) => setViolations(r.data?.violations || r.data || []))
      .catch(() => setViolations([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    severityFilter === 'All'
      ? violations
      : violations.filter(
          (v) => (v.severity || '').toLowerCase() === severityFilter.toLowerCase()
        );

  const severityCounts = ['critical', 'high', 'medium', 'low'].map((s) => ({
    label: s,
    count: violations.filter((v) => (v.severity || '').toLowerCase() === s).length,
  }));

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {severityCounts.map(({ label, count }) => (
          <div
            key={label}
            className="rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02]"
            style={{
              background:
                severityFilter === label.charAt(0).toUpperCase() + label.slice(1)
                  ? 'rgba(99,102,241,0.12)'
                  : CARD,
              border: BORDER,
            }}
            onClick={() =>
              setSeverityFilter(
                severityFilter === label.charAt(0).toUpperCase() + label.slice(1)
                  ? 'All'
                  : label.charAt(0).toUpperCase() + label.slice(1)
              )
            }
          >
            <SeverityBadge severity={label} />
            <p className="text-2xl font-bold text-white mt-2">{count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'Critical', 'High', 'Medium', 'Low'].map((f) => (
          <button
            key={f}
            onClick={() => setSeverityFilter(f)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: severityFilter === f ? 'rgba(99,102,241,0.2)' : CARD,
              border: severityFilter === f ? '1px solid rgba(99,102,241,0.4)' : BORDER,
              color: severityFilter === f ? '#a5b4fc' : '#71717a',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: BORDER }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Student', 'Session ID', 'Type', 'Severity', 'Timestamp'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {[1, 2, 3, 4, 5].map((j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 rounded bg-white/5 animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map((v, i) => (
                    <tr
                      key={v.id || i}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td className="px-4 py-3 font-medium text-white">{v.student_name || v.user_name || '—'}</td>
                      <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{v.session_id || v.interview_id || '—'}</td>
                      <td className="px-4 py-3 text-zinc-300">{v.violation_type || v.type || '—'}</td>
                      <td className="px-4 py-3">
                        <SeverityBadge severity={v.severity} />
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">
                        {v.created_at ? new Date(v.created_at).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <p className="text-zinc-600 text-sm text-center py-10">
            No violations found{severityFilter !== 'All' ? ` for severity: ${severityFilter}` : ''}.
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Leaderboard Tab ────────────────────────────────────────────────── */
function LeaderboardTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/v1/admin/leaderboard')
      .then((r) => setData(r.data?.leaderboard || r.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const medalIcon = (rank) => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return (
      <span className="text-sm font-bold text-zinc-500 w-6 text-center">
        {rank}
      </span>
    );
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: BORDER }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Rank', 'Name', 'Email', 'Best Score', 'Integrity', 'Interviews', 'Readiness'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-white/5 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.map((s, i) => {
                  const rank = s.rank || i + 1;
                  const rowBg =
                    rank === 1
                      ? 'rgba(245,158,11,0.06)'
                      : rank === 2
                      ? 'rgba(156,163,175,0.05)'
                      : rank === 3
                      ? 'rgba(180,83,9,0.06)'
                      : 'transparent';
                  return (
                    <tr
                      key={s.id || i}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: rowBg,
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center w-8">
                          {medalIcon(rank)}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">{s.name || '—'}</td>
                      <td className="px-4 py-3 text-zinc-500">{s.email || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className="font-extrabold text-transparent bg-clip-text"
                          style={{
                            backgroundImage:
                              'linear-gradient(135deg, #60a5fa, #a78bfa)',
                          }}
                        >
                          {s.best_score?.toFixed(1) ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-emerald-400 font-semibold">
                        {s.integrity_score?.toFixed(1) ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{s.interview_count ?? '—'}</td>
                      <td className="px-4 py-3">
                        <ReadinessBadge band={s.readiness_band} />
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
      {!loading && data.length === 0 && (
        <p className="text-zinc-600 text-sm text-center py-10">No leaderboard data available.</p>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  /* Top stats */
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  /* Charts */
  const [weekly, setWeekly] = useState([]);
  const [integrity, setIntegrity] = useState(null);
  const [scoreDist, setScoreDist] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  useEffect(() => {
    /* Top-level analytics */
    api
      .get('/api/v1/admin/analytics')
      .then((r) => setAnalytics(r.data))
      .catch(() => setAnalytics(null))
      .finally(() => setAnalyticsLoading(false));

    /* Charts */
    Promise.allSettled([
      api.get('/api/v1/admin/analytics/weekly'),
      api.get('/api/v1/admin/analytics/integrity'),
      api.get('/api/v1/admin/analytics/placement'),
    ]).then(([weeklyRes, integrityRes, placementRes]) => {
      if (weeklyRes.status === 'fulfilled') {
        const d = weeklyRes.value.data;
        setWeekly(d?.daily || d?.data || d || []);
      }
      if (integrityRes.status === 'fulfilled') {
        setIntegrity(integrityRes.value.data);
      }
      if (placementRes.status === 'fulfilled') {
        const d = placementRes.value.data;
        if (d?.score_distribution) {
          setScoreDist(
            Object.entries(d.score_distribution).map(([name, count]) => ({
              name,
              value: count,
            }))
          );
        }
      }
      setChartsLoading(false);
    });
  }, []);

  const integrityChartData = integrity
    ? [
        { name: '≥80', count: integrity.distribution?.above_80 || 0 },
        { name: '60–80', count: integrity.distribution?.['60_80'] || 0 },
        { name: '<60', count: integrity.distribution?.below_60 || 0 },
      ]
    : [];

  const TOP_STATS = [
    {
      icon: <Users className="w-5 h-5" style={{ color: '#3b82f6' }} />,
      label: 'Total Students',
      value: analytics?.students ?? analytics?.total_students,
      sub: 'Registered users',
      color: '#3b82f6',
    },
    {
      icon: <FileText className="w-5 h-5" style={{ color: '#8b5cf6' }} />,
      label: 'Total Interviews',
      value: analytics?.interviews ?? analytics?.total_interviews,
      sub: 'Across all cohorts',
      color: '#8b5cf6',
    },
    {
      icon: <BarChart3 className="w-5 h-5" style={{ color: '#10b981' }} />,
      label: 'Avg Interview Score',
      value: analytics?.avg_report_score?.toFixed(1) ?? analytics?.avg_score?.toFixed(1),
      sub: 'Out of 100',
      color: '#10b981',
    },
    {
      icon: <ShieldCheck className="w-5 h-5" style={{ color: '#f59e0b' }} />,
      label: 'Avg Integrity Score',
      value:
        analytics?.avg_integrity_score?.toFixed(1) ??
        integrity?.avg_score?.toFixed(1),
      sub: 'Proctoring health',
      color: '#f59e0b',
    },
  ];

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto" style={{ color: '#fff' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
          Admin Dashboard
        </h1>
        <p className="text-zinc-500 text-sm">
          Manage students, review analytics, and monitor interview integrity.
        </p>
      </motion.div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {TOP_STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
          >
            <StatCard {...s} loading={analyticsLoading} />
          </motion.div>
        ))}
      </div>

      {/* Quick analytics row */}
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        {/* Weekly activity */}
        <div className="rounded-2xl p-5" style={{ background: CARD, border: BORDER }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Weekly Interview Activity
          </h3>
          {chartsLoading ? (
            <Skeleton />
          ) : weekly.length === 0 ? (
            <p className="text-zinc-600 text-xs text-center py-12">No data</p>
          ) : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly} barSize={20}>
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#52525b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Score distribution pie */}
        <div className="rounded-2xl p-5" style={{ background: CARD, border: BORDER }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            Score Distribution
          </h3>
          {chartsLoading ? (
            <Skeleton />
          ) : scoreDist.length === 0 ? (
            <p className="text-zinc-600 text-xs text-center py-12">No data</p>
          ) : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreDist}
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    dataKey="value"
                    nameKey="name"
                  >
                    {scoreDist.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Integrity bar */}
        <div className="rounded-2xl p-5" style={{ background: CARD, border: BORDER }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Integrity Distribution
          </h3>
          {chartsLoading ? (
            <Skeleton />
          ) : integrityChartData.every((d) => d.count === 0) ? (
            <p className="text-zinc-600 text-xs text-center py-12">No data</p>
          ) : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={integrityChartData} barSize={28}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#52525b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {integrityChartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          entry.name === '≥80'
                            ? '#10b981'
                            : entry.name === '60–80'
                            ? '#f59e0b'
                            : '#ef4444'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto"
        style={{ background: 'rgba(255,255,255,0.03)', border: BORDER }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
            style={{
              background: activeTab === tab.id ? 'rgba(99,102,241,0.2)' : 'transparent',
              border:
                activeTab === tab.id
                  ? '1px solid rgba(99,102,241,0.35)'
                  : '1px solid transparent',
              color: activeTab === tab.id ? '#a5b4fc' : '#71717a',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'students' && <StudentsTab />}
          {activeTab === 'placement' && <PlacementTab />}
          {activeTab === 'violations' && <ViolationsTab />}
          {activeTab === 'leaderboard' && <LeaderboardTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
