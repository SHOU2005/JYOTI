import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import {
  Trophy, Medal, Award, Crown, TrendingUp, TrendingDown,
  Minus, Zap, Star, Users, BarChart2, Calendar,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

// ─── Static filter options ────────────────────────────────────────────────────

const FILTER_TABS = [
  { id: 'all_time',    label: 'All Time',   icon: Trophy   },
  { id: 'this_month',  label: 'This Month', icon: Calendar },
  { id: 'this_week',   label: 'This Week',  icon: Zap      },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name = '') {
  return name.split(' ').map((w) => w[0]?.toUpperCase()).filter(Boolean).slice(0, 2).join('');
}

function readinessBadge(score) {
  if (score >= 80) return { label: 'Placement Ready', bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' };
  if (score >= 60) return { label: 'Near Ready',      bg: 'bg-blue-500/15 border-blue-500/30 text-blue-300'         };
  if (score >= 40) return { label: 'Developing',      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300'      };
  return                  { label: 'Getting Started', bg: 'bg-zinc-500/15 border-zinc-500/30 text-zinc-300'          };
}

function scoreColor(score) {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

function avatarGradient(rank) {
  const gradients = [
    'from-amber-500 to-yellow-600',
    'from-zinc-400 to-slate-500',
    'from-orange-600 to-amber-700',
    'from-blue-600 to-violet-600',
    'from-emerald-600 to-teal-600',
    'from-pink-600 to-rose-600',
  ];
  return gradients[(rank - 1) % gradients.length];
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score, max }) {
  const pct   = Math.min(100, ((score ?? 0) / (max || 100)) * 100);
  const color = scoreColor(score ?? 0);
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-mono font-bold w-10 text-right" style={{ color }}>
        {score != null ? score.toFixed(1) : '—'}
      </span>
    </div>
  );
}

// ─── Podium card for top 3 ────────────────────────────────────────────────────

const PODIUM_CONFIG = {
  1: {
    size:       'w-20 h-20',
    textSize:   'text-2xl',
    scoreSize:  'text-3xl',
    pedestal:   'h-20',
    border:     'border-amber-500/50',
    bg:         'bg-gradient-to-br from-amber-500/20 to-yellow-600/10',
    shadow:     'shadow-amber-500/20',
    ring:       'ring-amber-500/40',
    gradient:   'from-amber-400 to-yellow-500',
    iconColor:  'text-amber-300',
    pedestalBg: 'bg-gradient-to-t from-amber-900/40 to-amber-900/20',
    RankIcon:   Crown,
  },
  2: {
    size:       'w-16 h-16',
    textSize:   'text-xl',
    scoreSize:  'text-2xl',
    pedestal:   'h-14',
    border:     'border-zinc-400/40',
    bg:         'bg-gradient-to-br from-zinc-400/15 to-slate-500/10',
    shadow:     'shadow-zinc-400/10',
    ring:       'ring-zinc-400/30',
    gradient:   'from-zinc-300 to-slate-400',
    iconColor:  'text-zinc-300',
    pedestalBg: 'bg-gradient-to-t from-zinc-800/60 to-zinc-800/30',
    RankIcon:   Medal,
  },
  3: {
    size:       'w-14 h-14',
    textSize:   'text-lg',
    scoreSize:  'text-2xl',
    pedestal:   'h-10',
    border:     'border-amber-700/40',
    bg:         'bg-gradient-to-br from-amber-700/15 to-orange-800/10',
    shadow:     'shadow-amber-700/10',
    ring:       'ring-amber-700/30',
    gradient:   'from-amber-600 to-orange-700',
    iconColor:  'text-amber-600',
    pedestalBg: 'bg-gradient-to-t from-amber-950/50 to-amber-950/20',
    RankIcon:   Award,
  },
};

function PodiumCard({ entry, rank }) {
  const cfg = PODIUM_CONFIG[rank];
  if (!cfg || !entry) return null;
  const { RankIcon } = cfg;
  const rdBadge = readinessBadge(entry.score ?? 0);

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 40, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: rank * 0.12, type: 'spring', stiffness: 130, damping: 14 }}
    >
      {/* Avatar */}
      <div className={`relative ${cfg.size} rounded-full bg-gradient-to-br ${cfg.gradient} flex items-center justify-center font-black text-white ${cfg.textSize} mb-2 ring-2 ${cfg.ring} shadow-xl ${cfg.shadow}`}>
        {initials(entry.name)}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
          <RankIcon className={`w-3 h-3 ${cfg.iconColor}`} />
        </div>
      </div>

      {/* Name */}
      <p className="font-bold text-zinc-100 text-sm text-center max-w-[100px] truncate">{entry.name}</p>

      {/* Score */}
      <p className={`font-black mt-0.5 ${cfg.scoreSize}`} style={{ color: scoreColor(entry.score ?? 0) }}>
        {entry.score?.toFixed(1) ?? '—'}
      </p>

      {/* Interviews */}
      <p className="text-xs text-zinc-500 mt-0.5">{entry.interview_count ?? 0} interviews</p>

      {/* Readiness badge */}
      <span className={`text-[10px] px-2 py-0.5 rounded-full border mt-1.5 ${rdBadge.bg}`}>{rdBadge.label}</span>

      {/* Pedestal */}
      <div className={`w-full mt-3 ${cfg.pedestal} rounded-t-lg ${cfg.pedestalBg} border-t border-l border-r ${cfg.border} flex items-center justify-center`}>
        <span className="font-black text-zinc-400 text-xl">#{rank}</span>
      </div>
    </motion.div>
  );
}

// ─── Your Rank card ───────────────────────────────────────────────────────────

function YourRankCard({ row, maxScore }) {
  if (!row) return null;
  const rdBadge = readinessBadge(row.score ?? 0);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <Card className="p-4 border-blue-500/30 bg-gradient-to-br from-blue-950/40 to-violet-950/30">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient(row.rank ?? 99)} flex items-center justify-center font-bold text-white text-sm`}>
              {initials(row.name)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-zinc-100">{row.name}</p>
              <span className="text-xs text-zinc-500">{row.email}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${rdBadge.bg}`}>{rdBadge.label}</span>
              <span className="text-xs text-zinc-500">{row.interview_count ?? 0} interviews</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-black text-blue-300">#{row.rank}</p>
            <p className="text-xs text-zinc-400 mt-0.5">Your Rank</p>
          </div>
          <div className="flex-shrink-0 pl-2">
            <ScoreBar score={row.score} max={maxScore} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Main Leaderboard ─────────────────────────────────────────────────────────

export default function Leaderboard() {
  const { user }  = useAuth();
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all_time');

  useEffect(() => {
    setLoading(true);
    api.get('/api/v1/student/leaderboard', { params: { period: activeTab } })
      .then((r) => setRows(Array.isArray(r.data) ? r.data : r.data.leaderboard || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const maxScore  = rows[0]?.score || 100;
  const myRow     = user ? rows.find((r) => r.email === user.email || r.name === user.name) : null;

  // Podium: 2nd, 1st, 3rd for visual height effect
  const top3  = rows.slice(0, 3);
  const rest  = rows.slice(3);
  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumRanks = top3.length === 3 ? [2, 1, 3] : top3.map((_, i) => i + 1);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Trophy className="w-8 h-8 text-amber-400" />
              <h1 className="text-3xl font-black">Global Leaderboard</h1>
            </div>
            <p className="text-zinc-400">Top performers ranked by best interview score.</p>
          </div>
          {rows.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Users className="w-4 h-4" />
              <span>{rows.length} participants</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Your rank card (highlighted) */}
      {myRow && <div className="mb-6"><YourRankCard row={myRow} maxScore={maxScore} /></div>}

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/8 mb-8 w-fit">
        {FILTER_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === id ? 'bg-white/12 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {!loading && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {rows.length === 0 ? (
              <Card className="p-16 text-center border-white/10">
                <Star className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-xl font-semibold text-zinc-400">No scores yet</p>
                <p className="text-zinc-600 mt-2">Complete an interview to appear on the leaderboard!</p>
              </Card>
            ) : (
              <>
                {/* ── Podium ── */}
                {top3.length > 0 && (
                  <div className="mb-10">
                    <div className={`grid gap-6 items-end justify-center ${top3.length === 3 ? 'grid-cols-3' : top3.length === 2 ? 'grid-cols-2 max-w-sm mx-auto' : 'grid-cols-1 max-w-xs mx-auto'}`}>
                      {podiumOrder.map((entry, idx) => (
                        <PodiumCard key={entry?.user_id ?? idx} entry={entry} rank={podiumRanks[idx]} />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Full Table ── */}
                {rest.length > 0 && (
                  <Card className="border-white/10 overflow-hidden p-0">
                    {/* Table header */}
                    <div className="px-5 py-3 border-b border-white/8 bg-white/3 grid grid-cols-[40px_48px_1fr_140px_80px_120px_60px] gap-3 items-center">
                      <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Rank</span>
                      <span />
                      <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Name</span>
                      <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide text-center">Best Score</span>
                      <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide text-center">Sessions</span>
                      <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide text-center">Readiness</span>
                      <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide text-center">Trend</span>
                    </div>

                    <div className="divide-y divide-white/5">
                      {rest.map((r, idx) => {
                        const isMe     = myRow?.user_id === r.user_id || myRow?.email === r.email;
                        const rdBadge  = readinessBadge(r.score ?? 0);
                        // Simulated trend: top 30% = up, bottom 30% = down, else neutral
                        const trend    = idx < rest.length * 0.3 ? 'up' : idx > rest.length * 0.7 ? 'down' : 'neutral';
                        const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
                        const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-zinc-500';

                        return (
                          <motion.div
                            key={r.user_id ?? idx}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`grid grid-cols-[40px_48px_1fr_140px_80px_120px_60px] gap-3 items-center px-5 py-3.5 hover:bg-white/4 transition-colors
                              ${isMe ? 'bg-blue-500/8 border-l-2 border-blue-500/60' : ''}`}
                          >
                            {/* Rank */}
                            <div className="flex items-center">
                              {r.rank <= 3 ? (
                                r.rank === 1 ? <Crown  className="w-4 h-4 text-amber-400" /> :
                                r.rank === 2 ? <Medal  className="w-4 h-4 text-zinc-300" /> :
                                              <Award  className="w-4 h-4 text-amber-700" />
                              ) : (
                                <span className="text-zinc-500 font-mono text-sm">#{r.rank}</span>
                              )}
                            </div>

                            {/* Avatar */}
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradient(r.rank)} flex items-center justify-center font-bold text-white text-xs`}>
                              {initials(r.name)}
                            </div>

                            {/* Name + email */}
                            <div className="min-w-0">
                              <p className={`font-medium text-sm truncate ${isMe ? 'text-blue-300' : 'text-zinc-100'}`}>
                                {r.name} {isMe && <span className="text-[10px] text-blue-400 ml-1">You</span>}
                              </p>
                              {r.email && <p className="text-xs text-zinc-600 truncate">{r.email}</p>}
                            </div>

                            {/* Score bar */}
                            <div className="flex justify-center">
                              <ScoreBar score={r.score} max={maxScore} />
                            </div>

                            {/* Interview count */}
                            <div className="text-center">
                              <span className="text-sm text-zinc-300 font-medium">{r.interview_count ?? '—'}</span>
                            </div>

                            {/* Readiness badge */}
                            <div className="flex justify-center">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap ${rdBadge.bg}`}>
                                {rdBadge.label}
                              </span>
                            </div>

                            {/* Trend */}
                            <div className="flex justify-center">
                              <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </Card>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
