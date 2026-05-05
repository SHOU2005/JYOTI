import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, CheckCircle, XCircle, Loader2, Plus, Trash2,
  Video, Bell, ChevronRight, CalendarDays, AlertCircle
} from 'lucide-react';
import api from '../api/client';

const UPCOMING_TIPS = [
  'Ensure your camera and microphone are working before the session.',
  'Find a quiet, well-lit place for your interview.',
  'Have your resume ready to reference during the session.',
  'Dress professionally even for virtual interviews.',
  'Join 5 minutes early to test your connection.',
];

function formatSlotTime(iso) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    countdown: getCountdown(d),
    isPast: d < new Date(),
  };
}

function getCountdown(date) {
  const diff = date - new Date();
  if (diff < 0) return 'Past';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hrs}h`;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

const STATUS_STYLES = {
  booked: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', label: 'Booked' },
  completed: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Completed' },
  cancelled: { bg: 'bg-zinc-700/20', border: 'border-zinc-600/30', text: 'text-zinc-400', label: 'Cancelled' },
};

export default function SchedulePage() {
  const [dt, setDt] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [fetchingSlots, setFetchingSlots] = useState(true);
  const [tipIndex] = useState(() => Math.floor(Math.random() * UPCOMING_TIPS.length));
  const [showForm, setShowForm] = useState(false);

  const fetchSchedules = async () => {
    setFetchingSlots(true);
    try {
      const { data } = await api.get('/api/v1/student/dashboard');
      setSchedules(data.upcoming_schedule || []);
    } catch {
      /* silently ignore */
    } finally {
      setFetchingSlots(false);
    }
  };

  useEffect(() => { fetchSchedules(); }, []);

  const book = async (e) => {
    e.preventDefault();
    if (!dt) return;
    setLoading(true);
    setMsg('');
    try {
      await api.post('/api/v1/student/schedule', { slot_time: new Date(dt).toISOString() });
      setMsg('Interview slot booked successfully!');
      setMsgType('success');
      setDt('');
      setShowForm(false);
      await fetchSchedules();
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Failed to book slot. Please try again.');
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  const minDateTime = new Date(Date.now() + 30 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const upcomingCount = schedules.filter(s => {
    const f = formatSlotTime(s.slot_time);
    return !f.isPast && s.status === 'booked';
  }).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Interview Scheduler</h1>
            <p className="text-zinc-400 text-sm">Book your AI-proctored interview slots in advance</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4 mb-8"
      >
        {[
          { label: 'Upcoming', value: upcomingCount, icon: Calendar, color: 'text-blue-400' },
          { label: 'Total Booked', value: schedules.length, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Session Length', value: '~18 min', icon: Clock, color: 'text-violet-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4 border-white/8 text-center">
            <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-zinc-500">{label}</p>
          </Card>
        ))}
      </motion.div>

      {/* Tip of the day */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="mb-6 p-4 rounded-xl bg-teal-500/5 border border-teal-500/20 flex items-start gap-3"
      >
        <Bell className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-zinc-300">
          <span className="font-semibold text-teal-400">Interview Tip: </span>
          {UPCOMING_TIPS[tipIndex]}
        </p>
      </motion.div>

      {/* Book New Slot */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="mb-8"
      >
        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full h-12 gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-lg shadow-teal-500/20"
          >
            <Plus className="w-4 h-4" /> Book New Interview Slot
          </Button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="p-6 border-teal-500/20 bg-teal-500/5">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-400" /> Select Date & Time
                </h2>
                <form onSubmit={book} className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Interview slot (minimum 30 minutes from now)</label>
                    <input
                      type="datetime-local"
                      value={dt}
                      min={minDateTime}
                      onChange={(e) => setDt(e.target.value)}
                      className="w-full bg-[#0f0f13] border border-zinc-700 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5">
                    <p className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">What to expect</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                      {[
                        ['AI Interviewer', 'Live voice + video'],
                        ['Proctoring', 'Camera monitored'],
                        ['Duration', '~18 minutes'],
                        ['Questions', '6 adaptive questions'],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-center gap-1.5">
                          <Video className="w-3 h-3 text-teal-400" />
                          <span><b className="text-zinc-300">{k}:</b> {v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={!dt || loading} className="flex-1 gap-2 bg-teal-600 hover:bg-teal-500">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      {loading ? 'Booking…' : 'Confirm Booking'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setShowForm(false); setMsg(''); }}
                      className="px-5"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>

                <AnimatePresence>
                  {msg && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`mt-4 flex items-center gap-2 p-3 rounded-lg border text-sm
                        ${msgType === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                    >
                      {msgType === 'success'
                        ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                      {msg}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* Scheduled Sessions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-zinc-400" /> Your Scheduled Sessions
        </h2>

        {fetchingSlots ? (
          <Card className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-500 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">Loading sessions…</p>
          </Card>
        ) : schedules.length === 0 ? (
          <Card className="p-10 text-center border-white/8">
            <CalendarDays className="w-14 h-14 text-zinc-700 mx-auto mb-4" />
            <p className="text-lg font-semibold text-zinc-400">No sessions scheduled yet</p>
            <p className="text-zinc-600 text-sm mt-2">Book your first interview slot above to get started</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {schedules.map((s, idx) => {
              const f = formatSlotTime(s.slot_time);
              const style = STATUS_STYLES[s.status] || STATUS_STYLES.booked;
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                >
                  <Card className={`p-5 border ${style.border} ${style.bg} hover:border-white/15 transition-colors`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.bg} border ${style.border}`}>
                          <Calendar className={`w-5 h-5 ${style.text}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{f.date}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span className="text-sm text-zinc-400">{f.time}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {!f.isPast && s.status === 'booked' && (
                          <div className="text-right">
                            <p className="text-xs text-zinc-500">Starts in</p>
                            <p className="text-sm font-bold text-teal-400">{f.countdown}</p>
                          </div>
                        )}
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${style.border} ${style.bg} ${style.text}`}>
                          {style.label}
                        </span>
                      </div>
                    </div>

                    {!f.isPast && s.status === 'booked' && (
                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
                        <a
                          href="/interview/setup"
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-teal-600/20 border border-teal-500/30 text-teal-400 text-sm font-medium hover:bg-teal-600/30 transition-colors"
                        >
                          <Video className="w-4 h-4" /> Join Interview
                          <ChevronRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
