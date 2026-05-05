/**
 * LiveInterview — Priya Sharma AI Interview with Full Proctoring
 * Identical feature set to IndianHRInterview + active proctoring layer:
 *   face monitoring · tab-switch detection · filler-word tracking · warning system
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Camera, Mic, MicOff, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, Send, Volume2, VolumeX, Loader2, FileText, Monitor,
  MessageSquare, Brain, Zap, Target, Shield, Star, Users, Home,
  RefreshCcw, MapPin, Briefcase, Award, Activity, TrendingUp, Heart,
  ChevronDown, Play, Sparkles, Eye, EyeOff, Clock, BarChart2,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { useClaudeInterview } from '../hooks/useClaudeInterview';
import { useTTS } from '../hooks/useTTS';
import { useAdvancedProctoring } from '../hooks/useAdvancedProctoring';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

// ── Constants ─────────────────────────────────────────────────────────────────

const STEP = { RESUME: 0, PRECHECK: 1, INTERVIEW: 2, REPORT: 3 };
const MAX_WARNINGS = 3;
const ANSWER_TIMER_SEC = 180;

const JOB_ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Scientist', 'DevOps Engineer',
  'Product Manager', 'Business Analyst', 'Mobile Developer',
  'QA Engineer', 'Machine Learning Engineer', 'Cloud Architect',
];

const SCORE_METRICS = [
  { key: 'communication',  label: 'Communication',   icon: MessageSquare, color: '#3b82f6' },
  { key: 'confidence',     label: 'Confidence',      icon: Zap,           color: '#f59e0b' },
  { key: 'technical',      label: 'Technical',       icon: Brain,         color: '#8b5cf6' },
  { key: 'behavioral',     label: 'Behavioral',      icon: Heart,         color: '#ec4899' },
  { key: 'culture_fit',    label: 'Culture Fit',     icon: Users,         color: '#10b981' },
  { key: 'problem_solving',label: 'Problem Solving', icon: Target,        color: '#06b6d4' },
  { key: 'enthusiasm',     label: 'Enthusiasm',      icon: Star,          color: '#f97316' },
  { key: 'honesty',        label: 'Honesty',         icon: Shield,        color: '#84cc16' },
  { key: 'resume_match',   label: 'Resume Match',    icon: FileText,      color: '#a855f7' },
];

const FILLER_WORDS = ['um', 'uh', 'er', 'ah', 'hmm', 'like', 'basically', 'literally', 'you know', 'sort of', 'kind of'];

let _warnSeq = 0;

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(v) {
  if (v >= 80) return '#10b981';
  if (v >= 60) return '#f59e0b';
  return '#ef4444';
}
function scoreLabel(v) {
  if (v >= 85) return 'Excellent';
  if (v >= 70) return 'Good';
  if (v >= 55) return 'Average';
  return 'Needs Work';
}
function recBadge(r) {
  const m = {
    'Strong Hire': 'text-emerald-300 border-emerald-500/50 bg-emerald-500/10',
    'Hire':        'text-blue-300 border-blue-500/50 bg-blue-500/10',
    'Hold':        'text-amber-300 border-amber-500/50 bg-amber-500/10',
    'No Hire':     'text-red-300 border-red-500/50 bg-red-500/10',
  };
  return m[r] || m['Hold'];
}
function avgScore(scores) {
  if (!scores) return 0;
  const vals = Object.values(scores).filter((v) => typeof v === 'number');
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}
function countFillers(text) {
  const lower = text.toLowerCase();
  return FILLER_WORDS.reduce((n, w) => {
    const re = new RegExp(`\\b${w}\\b`, 'g');
    return n + ((lower.match(re) || []).length);
  }, 0);
}
function calcWPM(text, seconds) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, seconds) / 60;
  return Math.round(words / mins);
}

// ── Priya Avatar ─────────────────────────────────────────────────────────────

function PriyaAvatar({ size = 56, speaking = false, className = '' }) {
  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      {speaking && (
        <>
          <div className="absolute inset-0 rounded-full bg-orange-500/30 animate-ping" style={{ animationDuration: '1.4s' }} />
          <div className="absolute inset-0 rounded-full bg-orange-400/15 animate-ping" style={{ animationDuration: '2.1s', animationDelay: '0.7s' }} />
        </>
      )}
      <div
        className="relative w-full h-full rounded-full overflow-hidden border-2 shadow-lg"
        style={{ borderColor: speaking ? '#f97316' : '#78350f', boxShadow: speaking ? '0 0 20px rgba(249,115,22,0.4)' : 'none' }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="liPgBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ea580c" /><stop offset="100%" stopColor="#be185d" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="url(#liPgBg)" />
          <path d="M 20 82 Q 50 96 80 82 L 80 100 L 20 100 Z" fill="#6d28d9" />
          <path d="M 20 82 Q 50 92 80 82" stroke="#f59e0b" strokeWidth="2" fill="none" />
          <rect x="33" y="68" width="34" height="18" rx="5" fill="#b91c1c" />
          <rect x="44" y="60" width="12" height="12" rx="4" fill="#f4b8a0" />
          <ellipse cx="50" cy="44" rx="21" ry="23" fill="#f4b8a0" />
          <ellipse cx="50" cy="25" rx="21" ry="15" fill="#1c1917" />
          <path d="M 29 26 Q 29 18 50 20 Q 71 18 71 26 Q 70 40 68 44 Q 65 47 62 44" fill="#1c1917" />
          <circle cx="50" cy="14" r="7" fill="#1c1917" />
          <circle cx="50" cy="14" r="3" fill="#f59e0b" />
          <circle cx="50" cy="29" r="2.8" fill="#dc2626" />
          <ellipse cx="42" cy="43" rx="4.5" ry="5" fill="white" />
          <ellipse cx="58" cy="43" rx="4.5" ry="5" fill="white" />
          <circle cx="42" cy="43" r="2.8" fill="#1c1917" />
          <circle cx="58" cy="43" r="2.8" fill="#1c1917" />
          <circle cx="43" cy="42" r="1.1" fill="white" />
          <circle cx="59" cy="42" r="1.1" fill="white" />
          <path d="M 37 36 Q 42 34 47 36" stroke="#1c1917" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M 53 36 Q 58 34 63 36" stroke="#1c1917" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <ellipse cx="50" cy="50" rx="2.2" ry="1.8" fill="#e8a090" />
          <path d="M 44 57 Q 50 64 56 57" stroke="#b91c1c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <circle cx="29" cy="44" r="3" fill="#f59e0b" />
          <circle cx="29" cy="49" r="2" fill="#dc2626" />
          <circle cx="71" cy="44" r="3" fill="#f59e0b" />
          <circle cx="71" cy="49" r="2" fill="#dc2626" />
          <path d="M 36 65 Q 50 73 64 65" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
          <circle cx="50" cy="71" r="2.5" fill="#f59e0b" />
        </svg>
      </div>
    </div>
  );
}

// ── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score = 0, size = 90, label, color }) {
  const r = size / 2 - 9;
  const circ = 2 * Math.PI * r;
  const c = color || scoreColor(score);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#27272a" strokeWidth="9" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c} strokeWidth="9"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${(circ * Math.min(100, score)) / 100} ${circ}` }}
            transition={{ duration: 1.6, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black" style={{ color: c }}>{Math.round(score)}</span>
        </div>
      </div>
      {label && <span className="text-[11px] text-zinc-400 text-center">{label}</span>}
    </div>
  );
}

// ── Score Bar ─────────────────────────────────────────────────────────────────

function ScoreBar({ label, value, icon: Icon, color }) {
  const c = color || scoreColor(value || 0);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c }} />}
          <span className="text-[11px] text-zinc-300 truncate">{label}</span>
        </div>
        <span className="text-[11px] font-bold tabular-nums flex-shrink-0" style={{ color: c }}>
          {value ?? '—'}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: c }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value || 0)}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ── CheckItem ─────────────────────────────────────────────────────────────────

function CheckItem({ label, status, sublabel }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
      <div className="flex-shrink-0">
        {status === 'ok'      && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        {status === 'fail'    && <XCircle      className="w-5 h-5 text-red-400" />}
        {status === 'loading' && <Loader2      className="w-5 h-5 text-zinc-400 animate-spin" />}
        {status === 'idle'    && <div          className="w-5 h-5 rounded-full border-2 border-zinc-600" />}
        {status === 'skip'    && <div          className="w-5 h-5 rounded-full border-2 border-zinc-600 bg-zinc-700" />}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        {sublabel && <p className="text-xs text-zinc-500 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

// ── Typing Dots ───────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-orange-400"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

// ── Warning Toast ─────────────────────────────────────────────────────────────

function WarningToast({ warnings, onDismiss }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence>
        {warnings.map((w) => (
          <motion.div
            key={w.uid}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className={`flex items-start gap-3 p-3 rounded-xl border shadow-2xl backdrop-blur-xl pointer-events-auto
              ${w.critical ? 'bg-red-950/90 border-red-500/40 text-red-200' : 'bg-amber-950/90 border-amber-500/40 text-amber-200'}`}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">{w.title}</p>
              <p className="text-[11px] opacity-80 mt-0.5">{w.msg}</p>
            </div>
            <button onClick={() => onDismiss(w.uid)} className="text-xs opacity-60 hover:opacity-100">✕</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Timer ─────────────────────────────────────────────────────────────────────

function AnswerTimer({ seconds, total }) {
  const pct = (seconds / total) * 100;
  const color = seconds > total * 0.5 ? '#10b981' : seconds > total * 0.2 ? '#f59e0b' : '#ef4444';
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full transition-colors duration-500"
          style={{ backgroundColor: color, width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums font-mono" style={{ color }}>{mm}:{ss}</span>
    </div>
  );
}

// ── Proctor Stats Widget ──────────────────────────────────────────────────────

const GAZE_LABEL = { center: 'Center', left: 'Left ◀', right: 'Right ▶', down: 'Down ▼', up: 'Up ▲' };
const GAZE_OK    = { center: true, up: true };

function ProctorStats({ fillerCount, wpm, warnings, tabSwitches,
                        faceCount, gazeDir, headDown, phoneAlert,
                        procModelsLoaded, procModelsLoading }) {
  return (
    <div className="space-y-2">
      {/* AI model status */}
      {procModelsLoading && (
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 bg-zinc-800/60 rounded-lg px-2.5 py-1.5">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading AI proctoring…
        </div>
      )}
      {procModelsLoaded && (
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 rounded-lg px-2.5 py-1.5 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" /> AI proctoring active
        </div>
      )}

      {/* Face / gaze row */}
      {procModelsLoaded && (
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-lg p-2 text-center ${faceCount === 1 ? 'bg-emerald-500/10 border border-emerald-500/20' : faceCount === 0 ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-500/15 border border-red-500/30'}`}>
            <p className={`text-sm font-bold ${faceCount === 1 ? 'text-emerald-400' : 'text-red-400'}`}>{faceCount}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{faceCount === 1 ? 'Face OK' : faceCount === 0 ? 'No Face' : 'Multi-face'}</p>
          </div>
          <div className={`rounded-lg p-2 text-center ${GAZE_OK[gazeDir] ? 'bg-zinc-800/60' : 'bg-amber-500/10 border border-amber-500/20'}`}>
            <p className={`text-sm font-bold ${GAZE_OK[gazeDir] ? 'text-zinc-200' : 'text-amber-400'}`}>{GAZE_LABEL[gazeDir] || '—'}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Gaze</p>
          </div>
          <div className={`rounded-lg p-2 text-center ${headDown ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-zinc-800/60'}`}>
            <p className={`text-sm font-bold ${headDown ? 'text-amber-400' : 'text-emerald-400'}`}>{headDown ? 'Down ▼' : 'OK'}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Head</p>
          </div>
          <div className={`rounded-lg p-2 text-center ${phoneAlert ? 'bg-red-500/15 border border-red-500/30' : 'bg-zinc-800/60'}`}>
            <p className={`text-sm font-bold ${phoneAlert ? 'text-red-400' : 'text-zinc-400'}`}>{phoneAlert ? 'Detected!' : 'Clear'}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Device</p>
          </div>
        </div>
      )}

      {/* Session stats */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Filler words', value: fillerCount, bad: fillerCount > 5 },
          { label: 'WPM', value: wpm || '—', bad: false },
          { label: 'Warnings', value: `${warnings}/${MAX_WARNINGS}`, bad: warnings > 0 },
          { label: 'Tab switches', value: tabSwitches, bad: tabSwitches > 0 },
        ].map(({ label, value, bad }) => (
          <div key={label} className="bg-zinc-800/60 rounded-lg p-2 text-center">
            <p className={`text-sm font-bold ${bad ? 'text-amber-400' : 'text-zinc-200'}`}>{value}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function LiveInterview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { interviewId } = useParams();

  // If navigated from setup page, these are pre-filled
  const setupState = location.state || {};
  const fromSetup = !!(setupState.interviewType && setupState.level);

  const [step, setStep] = useState(STEP.RESUME);

  // Resume / config
  const [resumeFile, setResumeFile]   = useState(null);
  const [resumeText, setResumeText]   = useState('');
  const [jobRole, setJobRole]         = useState(setupState.role || 'Software Engineer');
  const [isDragging, setIsDragging]   = useState(false);

  // Setup params (from InterviewSetup page or manual selection)
  const [interviewTypeId]   = useState(setupState.interviewType || 'hr');
  const [experienceLevel]   = useState(setupState.level || 'mid');
  const [companyPackId]     = useState(setupState.companyPack || null);
  const interviewTypeLabel  = setupState.interviewTypeLabel || 'HR Interview';
  const companyPackLabel    = setupState.companyPackLabel || null;
  const companyPackEmoji    = setupState.companyPackEmoji || null;

  // Pre-check
  const [cameraStatus, setCameraStatus] = useState('idle');
  const [micStatus, setMicStatus]       = useState('idle');
  const [screenStatus, setScreenStatus] = useState('idle');
  const [networkOk] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [audioLevel, setAudioLevel]     = useState(0);
  const [checksDone, setChecksDone]     = useState(false);
  const [ttsEnabled, setTtsEnabled]     = useState(true);
  const [accepted, setAccepted]         = useState(false);

  // Interview
  const [answer, setAnswer]           = useState('');
  const [isListening, setIsListening] = useState(false);
  const [timerSec, setTimerSec]       = useState(ANSWER_TIMER_SEC);
  const [timerActive, setTimerActive] = useState(false);
  const [camVisible, setCamVisible]   = useState(true);

  // Proctoring
  const [warnings, setWarnings]         = useState([]);
  const [warnCount, setWarnCount]       = useState(0);
  const [tabSwitches, setTabSwitches]   = useState(0);
  const [fillerCount, setFillerCount]   = useState(0);
  const [wpm, setWpm]                   = useState(0);
  const [answerStartTime, setAnswerStartTime] = useState(null);
  const [terminated, setTerminated]     = useState(false);

  const videoRef       = useRef(null);
  const procCamRef     = useRef(null);
  const streamRef      = useRef(null);
  const scrStreamRef   = useRef(null);
  const messagesEnd    = useRef(null);
  const recognitionRef = useRef(null);
  const audioCtxRef    = useRef(null);
  const rafRef         = useRef(null);
  const timerRef        = useRef(null);
  const prevSpeakRef    = useRef(false);

  const { speak, stop: stopTTS, speaking: isSpeaking, engine: ttsEngine } = useTTS(ttsEnabled);

  const {
    phase, messages, currentScores, scoreHistory, finalReport,
    questionNum, totalQuestions, error: interviewError,
    init: initInterview, answer: submitAnswer,
  } = useClaudeInterview();

  // ── Advanced proctoring
  const proctoringActive = step === STEP.INTERVIEW && !terminated;

  const onProctoringViolation = useCallback((type, title, msg, critical) => {
    addWarning(title, msg, critical);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    modelsLoaded: procModelsLoaded,
    modelsLoading: procModelsLoading,
    faceCount,
    gazeDir,
    headDown,
    phoneAlert,
  } = useAdvancedProctoring(procCamRef, proctoringActive, onProctoringViolation);

  // ── Auto-scroll
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, phase]);

  // ── Report transition
  useEffect(() => {
    if (phase === 'complete' && finalReport) {
      const t = setTimeout(() => setStep(STEP.REPORT), 2200);
      return () => clearTimeout(t);
    }
  }, [phase, finalReport]);

  // ── Speak Priya messages
  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    if (last.role === 'priya') speak(last.text);
  }, [messages, speak]);

  // ── Auto-start mic when TTS finishes (voice-only mode)
  useEffect(() => {
    if (prevSpeakRef.current && !isSpeaking && phase === 'active') {
      const t = setTimeout(() => startListening(), 500);
      return () => clearTimeout(t);
    }
    prevSpeakRef.current = isSpeaking;
  }, [isSpeaking]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Start answer timer when Priya finishes speaking
  useEffect(() => {
    if (phase === 'active' && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === 'priya') {
        setTimerSec(ANSWER_TIMER_SEC);
        setTimerActive(true);
        setAnswerStartTime(Date.now());
        setFillerCount(0);
        setWpm(0);
      }
    }
    if (phase === 'loading') setTimerActive(false);
  }, [phase, messages]);

  // ── Countdown timer
  useEffect(() => {
    if (!timerActive) return;
    timerRef.current = setInterval(() => {
      setTimerSec((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          setTimerActive(false);
          // Auto-submit if answer has content
          if (answer.trim().length > 3) handleSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerActive]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tab-switch detection
  useEffect(() => {
    if (step !== STEP.INTERVIEW) return;
    const onHide = () => {
      if (document.hidden) {
        setTabSwitches((n) => n + 1);
        addWarning('Tab Switch Detected', 'You switched away from the interview window.', false);
      }
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Live filler counter (from current answer text)
  useEffect(() => {
    setFillerCount(countFillers(answer));
    if (answerStartTime && answer.trim().split(/\s+/).length > 5) {
      const elapsed = (Date.now() - answerStartTime) / 1000;
      setWpm(calcWPM(answer, elapsed));
    }
  }, [answer, answerStartTime]);

  // ── Cleanup
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      scrStreamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      recognitionRef.current?.abort();
      stopTTS();
    };
  }, [stopTTS]);

  // ── Warning helpers
  const addWarning = useCallback((title, msg, critical = false) => {
    const uid = ++_warnSeq;
    setWarnings((prev) => [...prev, { uid, title, msg, critical }]);
    setWarnCount((n) => {
      const next = n + 1;
      if (next >= MAX_WARNINGS) setTerminated(true);
      return next;
    });
    setTimeout(() => setWarnings((prev) => prev.filter((w) => w.uid !== uid)), 6000);
  }, []);

  const dismissWarning = useCallback((uid) => {
    setWarnings((prev) => prev.filter((w) => w.uid !== uid));
  }, []);

  // ── File handling
  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setResumeFile(file); setResumeText('');
    } else {
      try { const t = await file.text(); setResumeFile(file); setResumeText(t); }
      catch { /* ignore */ }
    }
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  // ── Pre-check: camera
  const startCamera = useCallback(async () => {
    setCameraStatus('loading');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setCameraStatus('ok');
      if (videoRef.current)    { videoRef.current.srcObject    = stream; videoRef.current.play().catch(() => {}); }
      if (procCamRef.current)  { procCamRef.current.srcObject  = stream; procCamRef.current.play().catch(() => {}); }
    } catch { setCameraStatus('fail'); }
  }, []);

  // ── Pre-check: mic
  const checkMic = useCallback(async () => {
    setMicStatus('loading');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setMicStatus('ok');
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      ctx.createMediaStreamSource(stream).connect(analyser);
      analyser.fftSize = 256;
      audioCtxRef.current = ctx;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        setAudioLevel(Math.min(100, data.reduce((a, b) => a + b, 0) / data.length * 3));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch { setMicStatus('fail'); }
  }, []);

  // ── Pre-check: screen share
  const checkScreen = useCallback(async () => {
    setScreenStatus('loading');
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      scrStreamRef.current = stream;
      setScreenStatus('ok');
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        setScreenStatus('fail');
        addWarning('Screen Share Ended', 'Please do not stop screen sharing during the interview.', true);
      });
    } catch (err) {
      setScreenStatus('fail');
    }
  }, [addWarning]);

  // Unlock proceed only when BOTH camera and mic are confirmed working (mic is mandatory)
  useEffect(() => {
    if (cameraStatus === 'ok' && micStatus === 'ok') setChecksDone(true);
    else setChecksDone(false);
  }, [cameraStatus, micStatus]);

  // ── Start interview
  const startInterview = useCallback(async () => {
    // Stop pre-check cam; will restart for proctoring
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close();
    setStep(STEP.INTERVIEW);
    // Restart camera for proctoring feed in interview
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (procCamRef.current) { procCamRef.current.srcObject = stream; procCamRef.current.play().catch(() => {}); }
    } catch { /* camera proctoring unavailable */ }
    await initInterview({
      resumeFile: resumeFile?.type === 'application/pdf' ? resumeFile : null,
      resumeText,
      role: jobRole,
      interviewType: interviewTypeId,
      level: experienceLevel,
      companyPack: companyPackId,
    });
  }, [initInterview, resumeFile, resumeText, jobRole, interviewTypeId, experienceLevel, companyPackId]);

  // ── Voice recognition
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || recognitionRef.current) return; // already listening or unsupported
    stopTTS();
    const rec = new SR();
    rec.lang = 'en-IN'; rec.interimResults = true; rec.continuous = true;
    rec.onresult = (e) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join('');
      setAnswer(t);
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  }, [stopTTS]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  // ── Submit answer
  const handleSubmit = useCallback(async () => {
    if (!answer.trim() || phase === 'loading') return;
    stopListening(); stopTTS(); setTimerActive(false);
    const text = answer.trim();
    setAnswer('');
    await submitAnswer(text);
  }, [answer, phase, stopListening, stopTTS, submitAnswer]);

  // Derived
  const liveAvg = avgScore(currentScores);
  const isLoading  = phase === 'loading';
  const isActive   = phase === 'active';
  const isComplete = phase === 'complete';
  const isError    = phase === 'error';
  const progress   = totalQuestions > 0 ? (questionNum / totalQuestions) * 100 : 0;

  // ═══════════════════════════════════════════════════════════
  // STEP 0 — Interview Preview + Requirements
  // ═══════════════════════════════════════════════════════════

  if (step === STEP.RESUME) {
    const canProceed = resumeFile && screenStatus === 'ok';
    return (
      <div className="min-h-[calc(100vh-80px)] px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-8 text-sm text-zinc-500">
            <span className="text-orange-300 font-medium">Interview Details</span>
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-zinc-600">Camera & Mic</span>
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-zinc-600">Live Interview</span>
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-zinc-600">Report</span>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">

            {/* Left — Priya + session config */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <Card className="p-5 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-rose-500/5">
                <div className="flex flex-col items-center text-center gap-3">
                  <PriyaAvatar size={76} />
                  <div>
                    <h2 className="text-lg font-bold text-white">Priya Sharma</h2>
                    <p className="text-xs text-orange-300 font-medium">Senior HR Manager</p>
                    <p className="text-xs text-zinc-500 mt-0.5">TechCorp Solutions India · Bengaluru</p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-medium">PROCTORED</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-medium">LIVE</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">{interviewTypeLabel}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-indigo-500/20 bg-indigo-500/5">
                <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest mb-3">Your Session</p>

                {/* Role dropdown — only shown without setup params */}
                {!fromSetup && (
                  <div className="mb-3">
                    <label className="block text-[10px] text-zinc-500 uppercase mb-1.5">Target Role</label>
                    <div className="relative">
                      <select value={jobRole} onChange={(e) => setJobRole(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs appearance-none focus:outline-none cursor-pointer">
                        {JOB_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Type', value: interviewTypeLabel },
                    { label: 'Role', value: jobRole },
                    { label: 'Level', value: experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1) },
                    { label: 'Company', value: companyPackId ? `${companyPackEmoji} ${companyPackLabel}` : '⚪ Standard' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white/3 rounded-lg px-2.5 py-2">
                      <p className="text-[9px] text-zinc-500 uppercase tracking-wide">{label}</p>
                      <p className="text-xs text-white font-medium mt-0.5 leading-tight">{value}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 border-red-500/20 bg-red-500/5">
                <p className="text-xs text-red-300 font-semibold mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Proctoring Rules
                </p>
                <ul className="space-y-1.5">
                  {[
                    'Eyes must stay on screen at all times',
                    'Phone or device in view = warning',
                    'Tab switching = instant warning',
                    `${MAX_WARNINGS} warnings = session terminated`,
                    'Voice-only answers (mic required)',
                  ].map((r) => (
                    <li key={r} className="flex items-start gap-2 text-xs text-zinc-400">
                      <span className="text-red-400 flex-shrink-0 mt-0.5">•</span>{r}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Right — Requirements */}
            <div className="lg:col-span-3 flex flex-col gap-4">

              {/* Resume */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-400" /> Resume Upload
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-semibold">REQUIRED</span>
                </div>
                <p className="text-xs text-zinc-500 mb-4">Your resume personalises every question to your actual background.</p>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => document.getElementById('liResumeInput').click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                    ${isDragging ? 'border-orange-400 bg-orange-500/10'
                      : resumeFile ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/50'}`}
                >
                  <input id="liResumeInput" type="file" accept=".pdf,.txt" className="hidden"
                    onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
                  {resumeFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                      <p className="font-semibold text-emerald-300">{resumeFile.name}</p>
                      <p className="text-xs text-zinc-500">{(resumeFile.size / 1024).toFixed(0)} KB · Click to change</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-10 h-10 text-zinc-400" />
                      <p className="font-semibold text-zinc-200">Drop your resume here</p>
                      <p className="text-xs text-zinc-500">PDF or TXT · Drag & drop or click to browse</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Screen Share */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-blue-400" /> Screen Share
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-semibold">REQUIRED</span>
                </div>
                <p className="text-xs text-zinc-500 mb-4">Screen sharing is mandatory for integrity monitoring. Do not stop sharing during the session.</p>

                {screenStatus === 'ok' ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-300">Screen sharing active</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Keep sharing during the entire interview</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button onClick={checkScreen} disabled={screenStatus === 'loading'}
                      className="w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/40 text-blue-300 font-semibold py-3 rounded-xl text-sm">
                      <Monitor className="w-4 h-4 mr-2" />
                      {screenStatus === 'loading' ? 'Requesting screen share…' : screenStatus === 'fail' ? 'Retry Screen Share' : 'Share My Screen'}
                    </Button>
                    {screenStatus === 'fail' && (
                      <p className="text-xs text-red-400 mt-2 text-center">Screen share was declined — it is required to continue.</p>
                    )}
                  </>
                )}
              </Card>

              {/* Proceed button */}
              <Button
                disabled={!canProceed}
                onClick={() => setStep(STEP.PRECHECK)}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold py-3.5 rounded-xl border-0 shadow-lg shadow-orange-500/20 disabled:opacity-40 text-base"
              >
                <Play className="w-4 h-4 mr-2" /> Continue to Camera & Mic Setup
              </Button>
              {!canProceed && (
                <p className="text-center text-xs text-zinc-600">
                  {!resumeFile && screenStatus !== 'ok' ? 'Upload resume and share screen to continue'
                    : !resumeFile ? 'Upload your resume to continue'
                    : 'Share your screen to continue'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 1 — Pre-Check + Proctoring Consent
  // ═══════════════════════════════════════════════════════════

  if (step === STEP.PRECHECK) {
    return (
      <div className="min-h-[calc(100vh-80px)] px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8 text-sm text-zinc-500">
            <span className="text-emerald-500 font-medium">✓ Interview Details</span>
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-orange-300 font-medium">Camera & Mic</span>
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-zinc-600">Live Interview</span>
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-zinc-600">Report</span>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left: Priya intro */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <Card className="p-5 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-rose-500/5">
                <div className="flex flex-col items-center text-center gap-4">
                  <PriyaAvatar size={76} />
                  <div>
                    <h2 className="text-lg font-bold text-white">Priya Sharma</h2>
                    <p className="text-xs text-orange-300 font-medium mt-0.5">Senior HR Manager</p>
                    <p className="text-xs text-zinc-500">TechCorp Solutions India · Bengaluru</p>
                  </div>
                  <div className="w-full space-y-2 text-left">
                    {[
                      { icon: MapPin,    text: 'Bengaluru, Karnataka' },
                      { icon: Briefcase, text: '8+ years IT recruitment' },
                      { icon: Users,     text: '500+ candidates placed' },
                      { icon: Shield,    text: 'Proctored session' },
                    ].map(({ icon: I, text }) => (
                      <div key={text} className="flex items-center gap-2 text-xs text-zinc-400">
                        <I className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />{text}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Session config pill */}
              {fromSetup && (
                <Card className="p-4 border-indigo-500/20 bg-indigo-500/5">
                  <p className="text-xs text-indigo-400 font-semibold mb-2 uppercase tracking-wide">Session</p>
                  <div className="space-y-1.5">
                    {[
                      `${interviewTypeLabel}`,
                      `${jobRole} · ${experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}`,
                      companyPackId ? `${companyPackEmoji} ${companyPackLabel} style` : 'Standard style',
                    ].map((t) => (
                      <div key={t} className="flex items-center gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="w-3 h-3 text-indigo-400 flex-shrink-0" />{t}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card className="p-4 border-red-500/20 bg-red-500/5">
                <p className="text-xs text-red-300 font-semibold mb-2 uppercase tracking-wide flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Proctoring Active
                </p>
                <ul className="space-y-1.5">
                  {[
                    'Camera monitors you throughout',
                    'Any eye movement from screen = warning',
                    `${MAX_WARNINGS} violations = session terminated`,
                    'Tab switching is flagged immediately',
                    'Voice-only answers — mic required',
                  ].map((r) => (
                    <li key={r} className="flex items-start gap-2 text-xs text-zinc-400">
                      <span className="text-red-400 flex-shrink-0">•</span>{r}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Right: System checks */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <Card className="p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-400" /> System Check
                </h3>
                <div className="space-y-3 mb-4">
                  <CheckItem label="Internet Connection" status={networkOk ? 'ok' : 'fail'}
                    sublabel={networkOk ? 'Connected' : 'No connection'} />
                  <CheckItem label="Camera (Required)" status={cameraStatus}
                    sublabel={cameraStatus === 'idle' ? 'Click Test Camera' : cameraStatus === 'ok' ? 'Working' : 'Denied — check permissions'} />
                  <CheckItem label="Microphone (Required — voice-only answers)" status={micStatus}
                    sublabel={micStatus === 'idle' ? 'Click Test Mic — mandatory for answering' : micStatus === 'ok' ? 'Working' : 'Denied — mic is required to proceed'} />
                  <CheckItem label="Screen Share" status="ok" sublabel="Active — granted on previous screen" />
                  <CheckItem label="Resume" status={resumeFile ? 'ok' : 'ok'} sublabel={resumeFile ? resumeFile.name : 'Uploaded'} />
                  <CheckItem label="Browser Compatibility" status="ok" sublabel="All features supported" />
                </div>

                {cameraStatus === 'ok' && (
                  <div className="rounded-lg overflow-hidden bg-black mb-3" style={{ height: 110 }}>
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  </div>
                )}
                {micStatus === 'ok' && (
                  <div className="mb-3">
                    <p className="text-xs text-zinc-500 mb-1.5">Mic level — speak to test</p>
                    <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                        animate={{ width: `${audioLevel}%` }} transition={{ duration: 0.1 }} />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={startCamera} disabled={cameraStatus === 'loading'} className="flex-1 text-xs">
                    <Camera className="w-3.5 h-3.5 mr-1" />{cameraStatus === 'loading' ? 'Starting…' : 'Test Camera'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={checkMic} disabled={micStatus === 'loading'} className="flex-1 text-xs">
                    <Mic className="w-3.5 h-3.5 mr-1" />{micStatus === 'loading' ? 'Checking…' : 'Test Mic'}
                  </Button>
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-400" /> Interview Guidelines
                </h3>
                <ul className="space-y-2">
                  {[
                    '8 questions — each has a 3-minute timer',
                    'Camera and microphone stay on throughout',
                    'Voice-only answers — microphone is mandatory',
                    'Mic auto-starts after each question; click Stop then Submit',
                    'Priya will speak each question aloud',
                    'Any eye movement from screen triggers a warning',
                    'Phone or device detected = immediate warning',
                    'Stay on this tab — switching triggers a warning',
                    `${MAX_WARNINGS} warnings terminates the session early`,
                  ].map((r) => (
                    <li key={r} className="flex items-start gap-2 text-xs text-zinc-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />{r}
                    </li>
                  ))}
                </ul>
              </Card>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/80 border border-zinc-700">
                <input type="checkbox" id="liAccept" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 accent-orange-500 cursor-pointer" />
                <label htmlFor="liAccept" className="text-xs text-zinc-400 leading-relaxed cursor-pointer">
                  I consent to camera monitoring and AI proctoring during this session. I understand my responses
                  will be analysed by Claude AI to generate a performance report. Violations may result in session termination.
                </label>
              </div>

              <Button disabled={!checksDone || !accepted} onClick={startInterview}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold py-3 rounded-xl border-0 shadow-lg shadow-orange-500/20 disabled:opacity-40">
                <Play className="w-4 h-4 mr-2" /> Start Proctored Interview
              </Button>
              {!checksDone && (
                <p className="text-center text-xs text-zinc-600">
                  Camera and microphone must both pass — mic is required for voice-only answers
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // TERMINATED STATE
  // ═══════════════════════════════════════════════════════════

  if (terminated) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center border-red-500/30 bg-red-500/5">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Session Terminated</h2>
          <p className="text-zinc-400 text-sm mb-6">
            You exceeded {MAX_WARNINGS} integrity violations. The session has been ended automatically.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
            <Button onClick={() => { setTerminated(false); setStep(STEP.RESUME); setWarnCount(0); setWarnings([]); setTabSwitches(0); }}
              className="bg-gradient-to-r from-orange-500 to-rose-500 border-0 text-white">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 2 — Live Interview
  // ═══════════════════════════════════════════════════════════

  if (step === STEP.INTERVIEW) {
    return (
      <div className="h-[calc(100vh-80px)] flex flex-col overflow-hidden">
        {/* Warnings */}
        <WarningToast warnings={warnings} onDismiss={dismissWarning} />

        {/* Top bar */}
        <div className="flex-shrink-0 px-4 py-2.5 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <PriyaAvatar size={34} speaking={isSpeaking || isLoading} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">Priya Sharma</span>
                  <span className="text-[10px] text-zinc-500">
                    {isLoading ? '● Thinking…' : isSpeaking ? '● Speaking' : isComplete ? '● Complete' : isError ? '● Error' : isActive ? '● Live' : '● Connecting…'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                    PROCTORED
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden sm:inline">
                    {interviewTypeLabel}
                  </span>
                  {companyPackId && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300 hidden sm:inline">
                      {companyPackEmoji} {companyPackLabel}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {timerActive && (
                    <AnswerTimer seconds={timerSec} total={ANSWER_TIMER_SEC} />
                  )}
                  <span className="text-xs text-zinc-500 tabular-nums">
                    Q {Math.min(questionNum, totalQuestions)}/{totalQuestions}
                  </span>
                </div>
              </div>
              <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-rose-500"
                  animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
              </div>
            </div>
            {/* TTS toggle */}
            <button
              onClick={() => { setTtsEnabled((v) => !v); stopTTS(); }}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title={ttsEnabled ? `Voice: ${ttsEngine}` : 'Click to unmute'}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            {ttsEnabled && ttsEngine !== 'detecting' && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                ttsEngine === 'elevenlabs' ? 'bg-violet-500/20 text-violet-300' :
                ttsEngine === 'google'     ? 'bg-blue-500/20 text-blue-300' :
                                            'bg-zinc-700 text-zinc-400'}`}>
                {ttsEngine === 'elevenlabs' ? 'ElevenLabs' : ttsEngine === 'google' ? 'Google TTS' : 'Browser'}
              </span>
            )}
            {/* Cam toggle */}
            <button onClick={() => setCamVisible((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Toggle camera overlay">
              {camVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex overflow-hidden max-w-5xl mx-auto w-full relative">
          {/* Chat */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Idle */}
              {phase === 'idle' && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <PriyaAvatar size={64} speaking className="mx-auto mb-4" />
                    <Loader2 className="w-7 h-7 animate-spin text-orange-400 mx-auto mb-3" />
                    <p className="text-zinc-400 text-sm">Connecting to Priya…</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {isError && (
                <Card className="p-5 border-red-500/30 bg-red-500/5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-300">Interview Error</p>
                      <p className="text-sm text-zinc-400 mt-1">{interviewError}</p>
                      {interviewError?.includes('VITE_ANTHROPIC_API_KEY') && (
                        <p className="text-xs text-zinc-500 mt-2">
                          Add <code className="text-orange-300">VITE_ANTHROPIC_API_KEY=your_key</code> to your <code className="text-orange-300">.env</code> file.
                        </p>
                      )}
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => setStep(STEP.PRECHECK)}>
                        <RefreshCcw className="w-3.5 h-3.5 mr-1" /> Try Again
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Messages */}
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'priya' && (
                      <PriyaAvatar size={34} speaking={i === messages.length - 1 && isSpeaking} />
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md
                      ${msg.role === 'priya'
                        ? 'bg-zinc-800/90 border border-zinc-700/50 text-zinc-100 rounded-tl-sm'
                        : 'bg-gradient-to-br from-orange-500/80 to-rose-500/80 text-white rounded-tr-sm border border-orange-500/30'}`}>
                      {msg.role === 'priya' && msg.qNum > 0 && (
                        <span className="text-[10px] text-orange-400 font-semibold uppercase tracking-wide block mb-1">
                          {msg.qNum === -1 ? 'Closing' : `Question ${msg.qNum} of ${totalQuestions}`}
                        </span>
                      )}
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0 text-xs font-bold text-zinc-300">
                        You
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && messages.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                  <PriyaAvatar size={34} speaking />
                  <div className="bg-zinc-800/90 border border-zinc-700/50 rounded-2xl rounded-tl-sm">
                    <TypingDots />
                  </div>
                </motion.div>
              )}

              {isComplete && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center mt-4">
                  <Card className="p-4 text-center border-orange-500/20 bg-orange-500/5">
                    <p className="text-orange-300 font-semibold text-sm">Interview Complete!</p>
                    <p className="text-xs text-zinc-400 mt-1">Generating your report…</p>
                    <Loader2 className="w-5 h-5 animate-spin text-orange-400 mx-auto mt-2" />
                  </Card>
                </motion.div>
              )}

              <div ref={messagesEnd} />
            </div>

            {/* Voice-only answer panel */}
            {(isActive || isLoading) && !isComplete && (
              <div className="flex-shrink-0 px-4 pb-4">
                {fillerCount > 3 && (
                  <div className="mb-2 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2 border border-amber-500/20">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {fillerCount} filler words — try to speak more concisely
                  </div>
                )}

                <div className={`rounded-xl overflow-hidden shadow-xl border transition-all duration-200 ${
                  isListening ? 'border-orange-500/70 bg-zinc-900 shadow-orange-900/20' : 'border-zinc-700 bg-zinc-900'}`}>

                  {/* Live transcript */}
                  <div className="min-h-[80px] px-4 pt-4 pb-2 flex items-start">
                    {answer.trim() ? (
                      <p className="text-sm text-white leading-relaxed">{answer}</p>
                    ) : (
                      <div className="flex items-center gap-2.5 text-sm text-zinc-500 italic">
                        {isListening ? (
                          <>
                            <span className="flex gap-0.5 flex-shrink-0">
                              {[0, 1, 2].map((i) => (
                                <motion.span key={i} className="block w-1 rounded-full bg-orange-400"
                                  animate={{ height: ['8px', '20px', '8px'] }}
                                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18 }} />
                              ))}
                            </span>
                            Listening… speak your answer now
                          </>
                        ) : (
                          <><Mic className="w-4 h-4 opacity-40 flex-shrink-0" />Press the mic button to start speaking</>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between px-3 pb-3 pt-1 border-t border-zinc-800">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={isListening ? stopListening : startListening}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                          isListening
                            ? 'bg-red-500 text-white shadow-lg shadow-red-900/40'
                            : 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 shadow-md shadow-orange-900/30'
                        }`}
                      >
                        {isListening
                          ? <><MicOff className="w-4 h-4" /> Stop Recording</>
                          : <><Mic className="w-4 h-4" /> Speak Answer</>
                        }
                      </button>
                      {answer.trim() && (
                        <span className="text-xs text-zinc-500">
                          {answer.trim().split(/\s+/).length}w
                          {fillerCount > 0 && <span className="text-amber-500 ml-1">· {fillerCount} fillers</span>}
                        </span>
                      )}
                    </div>
                    <Button onClick={handleSubmit} disabled={!answer.trim() || isLoading} size="sm"
                      className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 text-white text-xs font-semibold disabled:opacity-40">
                      {isLoading
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <><Send className="w-3.5 h-3.5 mr-1.5" />Submit Answer</>
                      }
                    </Button>
                  </div>
                </div>

                {!answer.trim() && !isListening && !isLoading && (
                  <p className="text-center text-[11px] text-zinc-600 mt-1.5">
                    Microphone is required — voice answers only
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right: Score Panel + Proctor Stats */}
          <div className="w-64 flex-shrink-0 border-l border-zinc-800 p-4 overflow-y-auto hidden lg:flex flex-col gap-4">
            {/* Overall */}
            <div className="text-center">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Live Score</p>
              <ScoreRing score={liveAvg} size={76} color={scoreColor(liveAvg)} />
              {liveAvg > 0 && <p className="text-xs mt-1.5" style={{ color: scoreColor(liveAvg) }}>{scoreLabel(liveAvg)}</p>}
            </div>
            <div className="h-px bg-zinc-800" />

            {/* Metrics */}
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">Assessment</p>
              <div className="space-y-3">
                {SCORE_METRICS.map(({ key, label, icon, color }) => (
                  <ScoreBar key={key} label={label} value={currentScores?.[key] ?? null} icon={icon} color={color} />
                ))}
              </div>
            </div>

            <div className="h-px bg-zinc-800" />

            {/* Proctoring stats */}
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-red-400" /> Proctoring
              </p>
              <ProctorStats
                fillerCount={fillerCount} wpm={wpm} warnings={warnCount} tabSwitches={tabSwitches}
                faceCount={faceCount} gazeDir={gazeDir} headDown={headDown} phoneAlert={phoneAlert}
                procModelsLoaded={procModelsLoaded} procModelsLoading={procModelsLoading}
              />
              {/* Warnings progress */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                  <span>Warnings</span><span>{warnCount}/{MAX_WARNINGS}</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(warnCount / MAX_WARNINGS) * 100}%`,
                      backgroundColor: warnCount >= MAX_WARNINGS ? '#ef4444' : warnCount > 0 ? '#f59e0b' : '#10b981',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Trend */}
            {scoreHistory.length > 1 && (
              <>
                <div className="h-px bg-zinc-800" />
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Trend</p>
                  <div className="flex items-end gap-1 h-10">
                    {scoreHistory.map((s, i) => {
                      const a = avgScore(s);
                      return (
                        <div key={i} className="flex-1 rounded-sm" style={{
                          height: `${a}%`, minHeight: 4, backgroundColor: scoreColor(a),
                          opacity: 0.6 + (i / scoreHistory.length) * 0.4,
                        }} />
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Proctoring camera overlay */}
          <AnimatePresence>
            {camVisible && step === STEP.INTERVIEW && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-3 right-[272px] w-36 rounded-xl overflow-hidden shadow-lg z-10"
                style={{ border: `2px solid ${faceCount === 1 && !headDown && !phoneAlert ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}` }}
              >
                <video ref={procCamRef} autoPlay muted playsInline className="w-full object-cover" style={{ height: 96 }} />
                {/* Bottom bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[9px] text-white/80 font-medium">REC</span>
                  </div>
                  {procModelsLoaded && (
                    <span className={`text-[9px] font-semibold ${GAZE_OK[gazeDir] ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {GAZE_LABEL[gazeDir] || ''}
                    </span>
                  )}
                </div>
                {/* Face count badge */}
                {procModelsLoaded && (
                  <div className={`absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold
                    ${faceCount === 1 ? 'bg-emerald-500/80 text-white' : faceCount === 0 ? 'bg-red-500/80 text-white' : 'bg-red-600/90 text-white'}`}>
                    {faceCount === 0 ? 'NO FACE' : faceCount === 1 ? '1 FACE' : `${faceCount} FACES`}
                  </div>
                )}
                {/* No face overlay */}
                {procModelsLoaded && faceCount === 0 && (
                  <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center">
                    <span className="text-[11px] font-black text-red-200 animate-pulse tracking-widest">NO FACE</span>
                  </div>
                )}
                {/* Phone alert */}
                {phoneAlert && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-600/90 text-white animate-pulse">
                    DEVICE
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 3 — Report
  // ═══════════════════════════════════════════════════════════

  if (step === STEP.REPORT && finalReport) {
    const r = finalReport;
    const radarData = SCORE_METRICS.slice(0, 8).map(({ key, label }) => ({
      metric: label.split(' ')[0],
      score: r[key] ?? 0,
      fullMark: 100,
    }));

    return (
      <div className="min-h-[calc(100vh-80px)] px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium mb-4">
              <Award className="w-4 h-4" /> Proctored Interview Complete
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Your Performance Report</h1>
            <p className="text-zinc-400 text-sm">
              Evaluated by Priya Sharma · {interviewTypeLabel} · {jobRole}
              {companyPackId && ` · ${companyPackEmoji} ${companyPackLabel}`}
              {' '}· {experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)} level
            </p>
            {(warnCount > 0 || tabSwitches > 0) && (
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                {warnCount} warning(s) · {tabSwitches} tab switch(es) recorded
              </div>
            )}
          </motion.div>

          {/* Priya feedback */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="mb-6 p-6 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-rose-500/5">
              <div className="flex items-start gap-4">
                <PriyaAvatar size={56} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold text-white">Priya Sharma</span>
                    <span className="text-xs text-zinc-500">· Senior HR Manager</span>
                    <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full border ${recBadge(r.recommendation)}`}>
                      {r.recommendation}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed italic">"{r.priya_feedback}"</p>
                  {r.hiring_notes && (
                    <p className="text-xs text-zinc-500 mt-3 pt-3 border-t border-zinc-700/50">
                      <span className="text-zinc-400 font-medium">Hiring Notes: </span>{r.hiring_notes}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card className="col-span-2 md:col-span-1 p-5 flex flex-col items-center gap-2 border-orange-500/20">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Overall</p>
                <ScoreRing score={r.overall_score} size={88} />
                <p className="text-xs font-semibold" style={{ color: scoreColor(r.overall_score) }}>{scoreLabel(r.overall_score)}</p>
              </Card>
              <Card className="col-span-2 md:col-span-4 p-4">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Performance Radar</p>
                <ResponsiveContainer width="100%" height={160}>
                  <RadarChart data={radarData} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#71717a' }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="score" stroke="#f97316" fill="#f97316" fillOpacity={0.15} strokeWidth={2} />
                    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#f97316' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </motion.div>

          {/* Score grid */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {SCORE_METRICS.map(({ key, label, icon: Icon, color }) => {
                const val = r[key] ?? 0;
                return (
                  <Card key={key} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4" style={{ color }} />
                      <span className="text-xs text-zinc-400 font-medium">{label}</span>
                    </div>
                    <div className="flex items-end gap-1 mb-2">
                      <span className="text-2xl font-black" style={{ color: scoreColor(val) }}>{val}</span>
                      <span className="text-xs text-zinc-500 mb-0.5">/100</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
                        initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }} />
                    </div>
                    <p className="text-[10px] mt-1.5" style={{ color: scoreColor(val) }}>{scoreLabel(val)}</p>
                  </Card>
                );
              })}
            </div>
          </motion.div>

          {/* Proctoring summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="mb-6 p-5 border-zinc-700/50">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" /> Proctoring Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Integrity Warnings', value: warnCount, max: MAX_WARNINGS, bad: warnCount > 0 },
                  { label: 'Tab Switches', value: tabSwitches, bad: tabSwitches > 0 },
                  { label: 'Filler Words (last Q)', value: fillerCount, bad: fillerCount > 5 },
                  { label: 'Session', value: 'Completed', bad: false },
                ].map(({ label, value, bad }) => (
                  <div key={label} className="bg-zinc-800/40 rounded-lg p-3 text-center">
                    <p className={`text-lg font-black ${bad ? 'text-amber-400' : 'text-emerald-400'}`}>{value}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Strengths & Improvements */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Card className="p-5 border-emerald-500/20 bg-emerald-500/5">
                <h3 className="font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Key Strengths
                </h3>
                <ul className="space-y-2">
                  {(r.strengths || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <Star className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />{s}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-5 border-amber-500/20 bg-amber-500/5">
                <h3 className="font-semibold text-amber-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {(r.improvements || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <Target className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />{s}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/dashboard"><Button variant="outline" className="gap-2"><Home className="w-4 h-4" /> Dashboard</Button></Link>
              <Button onClick={() => { setStep(STEP.RESUME); setResumeFile(null); setResumeText(''); setAnswer(''); setChecksDone(false); setCameraStatus('idle'); setMicStatus('idle'); setScreenStatus('idle'); setAccepted(false); setWarnCount(0); setWarnings([]); setTabSwitches(0); setTerminated(false); }}
                className="gap-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 text-white">
                <RefreshCcw className="w-4 h-4" /> Retake Interview
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading / transitioning
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="text-center">
        <PriyaAvatar size={72} speaking className="mx-auto mb-4" />
        <Loader2 className="w-6 h-6 animate-spin text-orange-400 mx-auto mb-3" />
        <p className="text-zinc-400 text-sm">Generating your report…</p>
      </div>
    </div>
  );
}
