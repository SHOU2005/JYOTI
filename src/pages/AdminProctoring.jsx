import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';
import {
  Shield, AlertTriangle, CheckCircle, Eye, Clock, ChevronLeft,
  Activity, Camera, Monitor, Mic, Wifi, Clipboard
} from 'lucide-react';
import api from '../api/client';

const SIGNAL_META = {
  face_presence:  { label: 'Face Presence',   icon: Camera,    color: '#3b82f6' },
  face_count:     { label: 'Face Count',       icon: Eye,       color: '#f59e0b' },
  attention:      { label: 'Attention',        icon: Eye,       color: '#8b5cf6' },
  gaze:           { label: 'Gaze Track',       icon: Eye,       color: '#06b6d4' },
  tab_switch:     { label: 'Tab Switch',       icon: Monitor,   color: '#ef4444' },
  focus:          { label: 'Focus',            icon: Monitor,   color: '#f59e0b' },
  fullscreen:     { label: 'Fullscreen',       icon: Monitor,   color: '#10b981' },
  paste:          { label: 'Copy-Paste',       icon: Clipboard, color: '#ef4444' },
  mic:            { label: 'Background Audio', icon: Mic,       color: '#f59e0b' },
  connection:     { label: 'Connection',       icon: Wifi,      color: '#3b82f6' },
  composite:      { label: 'Composite',        icon: Activity,  color: '#6366f1' },
};

function severityColor(s) {
  if (s >= 0.8) return '#ef4444';
  if (s >= 0.5) return '#f59e0b';
  return '#10b981';
}

function severityBand(s) {
  if (s >= 0.8) return { label: 'Critical', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' };
  if (s >= 0.5) return { label: 'Medium',   bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' };
  return { label: 'Low',     bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' };
}

function formatMs(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export default function AdminProctoring() {
  const { sessionId } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get(`/api/v1/admin/proctoring/sessions/${sessionId}`)
      .then(r => setData(r.data))
      .catch(e => setErr(e.response?.data?.detail || 'Failed to load proctoring session'));
  }, [sessionId]);

  if (err) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p className="text-red-400 font-semibold">{err}</p>
      <Link to="/admin" className="text-blue-400 text-sm mt-4 inline-block">← Back to Admin</Link>
    </div>
  );

  if (!data) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-zinc-400">Loading proctoring session…</p>
    </div>
  );

  const sess = data.session || {};
  const timeline = data.timeline || [];

  const integrityColor = (sess.integrity_score || 0) >= 80 ? '#10b981' : (sess.integrity_score || 0) >= 60 ? '#f59e0b' : '#ef4444';
  const riskBand = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-red-400', critical: 'text-red-600' }[sess.risk_level] || 'text-zinc-400';

  // Signal frequency analysis
  const signalCounts = timeline.reduce((acc, e) => {
    acc[e.signal] = (acc[e.signal] || 0) + 1;
    return acc;
  }, {});

  const highSeverityEvents = timeline.filter(e => e.severity >= 0.5);
  const filteredTimeline = filter === 'all' ? timeline : timeline.filter(e => {
    if (filter === 'high') return e.severity >= 0.8;
    if (filter === 'medium') return e.severity >= 0.5 && e.severity < 0.8;
    if (filter === 'low') return e.severity < 0.5;
    return e.signal === filter;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link to="/admin" className="inline-flex items-center gap-1 text-zinc-400 hover:text-white text-sm mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Admin Dashboard
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-violet-400" />
              <span className="text-violet-400 font-semibold text-sm uppercase tracking-widest">Proctoring Report</span>
            </div>
            <h1 className="text-2xl font-bold">Session #{sess.id} — Interview #{sess.interview_id}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold
              ${(sess.integrity_score || 0) >= 80 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : (sess.integrity_score || 0) >= 60 ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
              : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
              <Shield className="w-4 h-4" />
              Integrity: {Math.round(sess.integrity_score || 0)}/100
            </div>
            <span className={`text-sm font-semibold uppercase ${riskBand}`}>
              Risk: {(sess.risk_level || 'unknown').toUpperCase()}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'Total Events', value: timeline.length, icon: Activity, color: 'text-blue-400' },
          { label: 'High Severity', value: highSeverityEvents.length, icon: AlertTriangle, color: 'text-red-400' },
          { label: 'Signal Types', value: Object.keys(signalCounts).length, icon: Eye, color: 'text-violet-400' },
          { label: 'Started At', value: sess.started_at ? new Date(sess.started_at).toLocaleTimeString() : '—', icon: Clock, color: 'text-zinc-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4 border-white/8 text-center">
            <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-zinc-500">{label}</p>
          </Card>
        ))}
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Signal breakdown */}
        <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-6 border-white/8">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-zinc-400" /> Signal Breakdown
            </h2>
            <div className="space-y-2">
              {Object.entries(signalCounts).sort((a, b) => b[1] - a[1]).map(([sig, count]) => {
                const meta = SIGNAL_META[sig] || { label: sig, icon: Activity, color: '#6366f1' };
                const Icon = meta.icon;
                return (
                  <div key={sig} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: meta.color }} />
                    <span className="text-sm text-zinc-300 flex-1">{meta.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(100, (count / Math.max(...Object.values(signalCounts))) * 100)}%`, background: meta.color }}
                        />
                      </div>
                      <span className="text-xs font-mono text-zinc-400 w-6 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
              {Object.keys(signalCounts).length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-4">No signal data available</p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Integrity ring */}
        <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-6 border-white/8 flex flex-col items-center justify-center text-center">
            <div className="relative w-36 h-36 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1f1f2e" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={integrityColor} strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40 * (sess.integrity_score || 0) / 100} ${2 * Math.PI * 40}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black" style={{ color: integrityColor }}>{Math.round(sess.integrity_score || 0)}</span>
                <span className="text-xs text-zinc-500">/ 100</span>
              </div>
            </div>
            <p className="text-lg font-semibold">Integrity Score</p>
            <p className={`text-sm font-bold uppercase mt-1 ${riskBand}`}>Risk Level: {sess.risk_level || 'Unknown'}</p>
            <p className="text-xs text-zinc-500 mt-3 max-w-[200px]">
              Based on {timeline.length} proctoring events recorded during this session.
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Timeline */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="p-6 border-white/8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" /> Event Timeline ({filteredTimeline.length} events)
            </h2>
            <div className="flex gap-2 flex-wrap">
              {['all', 'high', 'medium', 'low'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors
                    ${filter === f ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-1 pr-1">
            {filteredTimeline.length === 0 ? (
              <p className="text-center text-zinc-500 py-8">No events match this filter.</p>
            ) : (
              filteredTimeline.slice(0, 200).map((e, i) => {
                const meta = SIGNAL_META[e.signal] || { label: e.signal, icon: Activity, color: '#6366f1' };
                const Icon = meta.icon;
                const band = severityBand(e.severity || 0);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.01, 0.3) }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${band.border} ${band.bg} hover:border-white/15 transition-colors`}
                  >
                    <span className="text-xs font-mono text-zinc-500 w-12 flex-shrink-0">{formatMs(e.ts_ms)}</span>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: meta.color }} />
                    <span className="text-xs text-zinc-300 flex-1">{meta.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1 rounded-full bg-zinc-800">
                        <div className="h-full rounded-full" style={{ width: `${(e.severity || 0) * 100}%`, background: severityColor(e.severity || 0) }} />
                      </div>
                      <span className={`text-[10px] font-bold uppercase ${band.text}`}>{band.label}</span>
                    </div>
                  </motion.div>
                );
              })
            )}
            {filteredTimeline.length > 200 && (
              <p className="text-center text-zinc-500 text-xs py-3">Showing first 200 of {filteredTimeline.length} events</p>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
