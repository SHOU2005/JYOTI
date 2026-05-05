import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  Mic, FileText, Calendar, TrendingUp, Video, Trophy, Award,
  Zap, BarChart2, Clock, Star, ChevronRight, Brain, Target, Users,
  Lightbulb, ArrowUpRight,
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

// ─── Static Data ──────────────────────────────────────────────────────────────

const PLACEMENT_TIPS = [
  'Research the company thoroughly before your interview — know their products, mission, and recent news.',
  'Practice the STAR method (Situation, Task, Action, Result) for all behavioral questions.',
  'Aim to solve DSA problems within 15–20 minutes during live coding rounds.',
  'Always ask one insightful question at the end of your interview.',
  'System design: start with requirements, then architecture, then deep-dive — never jump to code.',
  'HR rounds matter. Prepare clear answers for "Tell me about yourself" and "Why this company?"',
  'Mock interviews improve real performance by 40%. Practice consistently.',
  'Optimize your resume for ATS with role-relevant keywords from the job description.',
  'Your tone and clarity matter as much as the correctness of your answer.',
  'Follow up with a thank-you email within 24 hours of your interview.',
];

// ─── Components ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, color, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className={`p-5 border-white/8 bg-gradient-to-br ${color} relative overflow-hidden group hover:border-white/18 transition-all duration-300`}>
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/3 -translate-y-6 translate-x-6 pointer-events-none" />
        <Icon className="w-5 h-5 text-white/60 mb-3" />
        <p className="text-3xl font-black text-white mb-0.5 leading-none">{value ?? '—'}</p>
        <p className="text-sm text-white/50 font-medium">{label}</p>
        {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
      </Card>
    </motion.div>
  );
}

function ReadinessGauge({ value }) {
  const color = value >= 70 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444';
  const data = [
    { name: 'Ready', value, fill: color },
    { name: 'Gap',   value: 100 - value, fill: 'transparent' },
  ];
  return (
    <div className="relative w-44 h-44 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="60%" outerRadius="90%" data={data} startAngle={90} endAngle={-270} barSize={10}>
          <RadialBar dataKey="value" cornerRadius={5} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black" style={{ color }}>{value}%</span>
        <span className="text-xs text-zinc-400 mt-1">Readiness</span>
      </div>
    </div>
  );
}

const QuickAction = ({ to, Icon, label, desc, gradient, delay }) => (
  <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}>
    <Link to={to}>
      <div className={`flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-gradient-to-r ${gradient} hover:border-white/20 transition-all duration-300 group cursor-pointer`}>
        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">{label}</p>
          <p className="text-xs text-zinc-400 truncate">{desc}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors flex-shrink-0" />
      </div>
    </Link>
  </motion.div>
);

function FactorSubScores({ factors }) {
  if (!factors || !Object.keys(factors).length) return null;
  return (
    <div className="space-y-2.5 mt-6 w-full">
      {Object.entries(factors).map(([k, v]) => {
        const pct = Math.min(100, Math.round(v));
        const color = pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
        return (
          <div key={k}>
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span className="capitalize">{k.replace(/_/g, ' ')}</span>
              <span style={{ color }}>{pct}</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PerformanceChart({ reports }) {
  if (!reports || reports.length < 2) return (
    <div className="flex items-center justify-center h-36 text-zinc-600 text-sm">
      Complete more interviews to see your trend.
    </div>
  );

  const chartData = reports
    .slice(-5)
    .map((r, i) => ({
      name: `#${i + 1}`,
      score: Math.round(r.overall_score ?? 0),
    }));

  return (
    <ResponsiveContainer width="100%" height={144}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, color: '#e4e4e7', fontSize: 12 }}
          cursor={{ stroke: '#3f3f46', strokeWidth: 1 }}
        />
        <Line
          type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function PlacementTip({ reports }) {
  const tipIndex = useMemo(() => {
    const day = new Date().getDate();
    return day % PLACEMENT_TIPS.length;
  }, []);

  return (
    <Card className="p-5 border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-orange-950/20">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500/70 mb-1">Placement Tip of the Day</p>
          <p className="text-zinc-200 text-sm leading-relaxed">{PLACEMENT_TIPS[tipIndex]}</p>
        </div>
      </div>
    </Card>
  );
}

function RecentReports({ reports }) {
  if (!reports?.length) return (
    <div className="flex flex-col items-center justify-center py-10 text-zinc-600">
      <BarChart2 className="w-10 h-10 mb-3 opacity-40" />
      <p className="text-sm">No interview reports yet.</p>
    </div>
  );
  return (
    <div className="space-y-2">
      {reports.map((x, i) => {
        const score = x.overall_score ?? 0;
        const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
        const cats  = x.categories || x.tags || [];
        return (
          <Link key={x.report_id ?? i} to={`/report/${x.report_id}`}>
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-zinc-800/80 border border-white/8 flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ color }}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-200 truncate">
                    {x.role || x.job_role || `Session #${x.report_id}`}
                  </p>
                  <span className="text-sm font-bold font-mono flex-shrink-0" style={{ color }}>
                    {score?.toFixed?.(1) ?? '—'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="h-1 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: color }}
                      initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.6, delay: i * 0.08 }} />
                  </div>
                  {cats.slice(0, 2).map((c) => (
                    <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-zinc-400">{c}</span>
                  ))}
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors flex-shrink-0" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function UpcomingSchedule({ schedule }) {
  if (!schedule?.length) return (
    <div className="flex flex-col items-center justify-center py-10 text-zinc-600">
      <Calendar className="w-10 h-10 mb-3 opacity-40" />
      <p className="text-sm">No upcoming sessions.</p>
      <Link to="/schedule" className="text-xs text-blue-400 mt-2 hover:text-blue-300 transition-colors">Book a session →</Link>
    </div>
  );

  const now = Date.now();

  return (
    <div className="space-y-3">
      {schedule.map((s, i) => {
        const ts    = s.scheduled_time ? new Date(s.scheduled_time).getTime() : null;
        const diff  = ts ? ts - now : null;
        const days  = diff ? Math.floor(diff / 86400000) : null;
        const hours = diff ? Math.floor((diff % 86400000) / 3600000) : null;
        const countdown = days != null && diff > 0
          ? days > 0 ? `in ${days}d ${hours}h` : `in ${hours}h`
          : null;

        return (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/8">
            <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">{s.role || s.title || 'Interview Session'}</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {s.scheduled_time ? new Date(s.scheduled_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
              </p>
            </div>
            {countdown && (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full whitespace-nowrap">
                {countdown}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user }  = useAuth();
  const [data, setData]   = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/v1/student/dashboard')
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.detail || 'Failed to load dashboard.'));
  }, []);

  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="p-8 text-center border-red-500/20 max-w-md">
        <p className="text-red-400 font-medium">{error}</p>
      </Card>
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Loading your dashboard…</p>
      </div>
    </div>
  );

  const r               = data.readiness?.readiness_percent ?? 0;
  const pct             = data.cohort_percentile ?? 0;
  const recentCount     = data.recent_reports?.length ?? 0;
  const upcomingCount   = data.upcoming_schedule?.length ?? 0;
  const bestScore       = data.best_score ?? data.recent_reports?.reduce((max, x) => Math.max(max, x.overall_score ?? 0), 0) ?? null;
  const avgIntegrity    = data.avg_integrity ?? data.integrity_score ?? null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-0.5">
          {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Dashboard'}
        </h1>
        <p className="text-zinc-400 mb-8">Your interview readiness command center</p>
      </motion.div>

      {/* ── 6-card stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Readiness"      value={`${Math.round(r)}%`}        sub="Placement readiness"   icon={TrendingUp} color="from-emerald-900/60 to-emerald-950/30" delay={0.04} />
        <StatCard label="Cohort %ile"    value={`${pct}%`}                  sub="Better than peers"     icon={Users}      color="from-blue-900/60 to-blue-950/30"    delay={0.08} />
        <StatCard label="Sessions"       value={recentCount}                 sub="Completed"             icon={BarChart2}  color="from-purple-900/60 to-purple-950/30" delay={0.12} />
        <StatCard label="Upcoming"       value={upcomingCount}               sub="Scheduled"             icon={Calendar}   color="from-pink-900/60 to-pink-950/30"    delay={0.16} />
        <StatCard label="Best Score"     value={bestScore != null ? bestScore.toFixed(1) : '—'} sub="All time high" icon={Star} color="from-amber-900/60 to-amber-950/30" delay={0.20} />
        <StatCard label="Avg Integrity"  value={avgIntegrity != null ? `${Math.round(avgIntegrity)}%` : '—'} sub="Proctoring score" icon={Award} color="from-teal-900/60 to-teal-950/30" delay={0.24} />
      </div>

      {/* ── Middle Section: Gauge + Chart ── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Readiness Gauge + Factor sub-scores */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.28 }}>
          <Card className="p-6 border-white/10 h-full">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" /> Interview Readiness
            </h2>
            <ReadinessGauge value={Math.round(r)} />
            <FactorSubScores factors={data.readiness?.factors} />
          </Card>
        </motion.div>

        {/* Performance line chart */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.32 }}>
          <Card className="p-6 border-white/10 h-full">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" /> Recent Performance
            </h2>
            <PerformanceChart reports={data.recent_reports} />
            <p className="text-xs text-zinc-600 mt-2 text-right">Last {Math.min(5, data.recent_reports?.length ?? 0)} sessions</p>
          </Card>
        </motion.div>
      </div>

      {/* ── Quick Actions 2×3 ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }} className="mb-6">
        <Card className="p-6 border-white/10">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" /> Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <QuickAction to="/mock-interviews" Icon={Award}     label="MNC Mock Interview"  desc="Google, Amazon, Microsoft packs"    gradient="from-amber-900/30 to-yellow-900/20"   delay={0.40} />
            <QuickAction to="/interview/setup" Icon={Mic}       label="Custom Interview"    desc="Configure your own session"         gradient="from-blue-900/30 to-indigo-900/20"    delay={0.42} />
            <QuickAction to="/resume"          Icon={FileText}  label="Resume Intelligence" desc="Upload & analyze your resume"        gradient="from-purple-900/30 to-violet-900/20"  delay={0.44} />
            <QuickAction to="/jobs"            Icon={Brain}     label="Job Matching"        desc="Resume-based role recommendations"   gradient="from-emerald-900/30 to-green-900/20"  delay={0.46} />
            <QuickAction to="/schedule"        Icon={Calendar}  label="Schedule Session"    desc="Book a time slot with a mentor"      gradient="from-teal-900/30 to-cyan-900/20"      delay={0.48} />
            <QuickAction to="/leaderboard"     Icon={Trophy}    label="Leaderboard"         desc="See where you rank in your cohort"   gradient="from-pink-900/30 to-rose-900/20"      delay={0.50} />
          </div>
        </Card>
      </motion.div>

      {/* ── Live Interview CTA banner ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54 }} className="mb-6">
        <Card className="p-6 border-blue-500/20 bg-gradient-to-r from-blue-950/40 to-violet-950/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2 mb-1">
                <Video className="w-5 h-5 text-blue-400" /> Live Proctored Interview
              </h2>
              <p className="text-zinc-400 text-sm">Camera + face-detection + AI evaluation. Simulates real placement conditions.</p>
            </div>
            <Link to="/interview/setup">
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/20 min-w-[160px] whitespace-nowrap">
                <Video className="w-4 h-4" /> Start Live Session
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* ── Placement Tip ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.57 }} className="mb-6">
        <PlacementTip />
      </motion.div>

      {/* ── Bottom Section: Reports + Upcoming ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.60 }}>
          <Card className="p-6 border-white/10 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" /> Recent Reports
              </h2>
              <Link to="/leaderboard" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <RecentReports reports={data.recent_reports} />
          </Card>
        </motion.div>

        {/* Upcoming Schedule */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.64 }}>
          <Card className="p-6 border-white/10 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-400" /> Upcoming Schedule
              </h2>
              <Link to="/schedule" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
                Book <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <UpcomingSchedule schedule={data.upcoming_schedule} />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
