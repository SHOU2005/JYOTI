import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Camera, Mic, MicOff, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, Send, Volume2, VolumeX, Loader2, FileText,
  MessageSquare, Brain, Zap, Target, Shield, Star, Users, Home,
  RefreshCcw, MapPin, Briefcase, Clock, Award, BarChart2,
  Play, Sparkles, ChevronDown, Activity, TrendingUp, Heart,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { useClaudeInterview } from '../hooks/useClaudeInterview';
import { useTTS } from '../hooks/useTTS';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

// ── Constants ────────────────────────────────────────────────────────────────

const STEP = { RESUME: 0, PRECHECK: 1, INTERVIEW: 2, REPORT: 3 };

const JOB_ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Scientist', 'DevOps Engineer',
  'Product Manager', 'Business Analyst', 'Mobile Developer',
  'QA Engineer', 'Machine Learning Engineer', 'Cloud Architect',
];

const SCORE_METRICS = [
  { key: 'communication', label: 'Communication', icon: MessageSquare, color: '#3b82f6' },
  { key: 'confidence',    label: 'Confidence',    icon: Zap,            color: '#f59e0b' },
  { key: 'technical',     label: 'Technical',     icon: Brain,          color: '#8b5cf6' },
  { key: 'behavioral',    label: 'Behavioral',    icon: Heart,          color: '#ec4899' },
  { key: 'culture_fit',   label: 'Culture Fit',   icon: Users,          color: '#10b981' },
  { key: 'problem_solving',label:'Problem Solving',icon: Target,         color: '#06b6d4' },
  { key: 'enthusiasm',    label: 'Enthusiasm',    icon: Star,           color: '#f97316' },
  { key: 'honesty',       label: 'Honesty',       icon: Shield,         color: '#84cc16' },
  { key: 'resume_match',  label: 'Resume Match',  icon: FileText,       color: '#a855f7' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  const map = {
    'Strong Hire': 'text-emerald-300 border-emerald-500/50 bg-emerald-500/10',
    'Hire':        'text-blue-300    border-blue-500/50    bg-blue-500/10',
    'Hold':        'text-amber-300   border-amber-500/50   bg-amber-500/10',
    'No Hire':     'text-red-300     border-red-500/50     bg-red-500/10',
  };
  return map[r] || map['Hold'];
}

function avgScore(scores) {
  if (!scores) return 0;
  const vals = Object.values(scores).filter((v) => typeof v === 'number');
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}

// ── Priya Avatar SVG ─────────────────────────────────────────────────────────

function PriyaAvatar({ size = 56, speaking = false, className = '' }) {
  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      {speaking && (
        <>
          <div
            className="absolute inset-0 rounded-full bg-orange-500/25 animate-ping"
            style={{ animationDuration: '1.4s' }}
          />
          <div
            className="absolute inset-0 rounded-full bg-orange-400/15 animate-ping"
            style={{ animationDuration: '2.1s', animationDelay: '0.7s' }}
          />
        </>
      )}
      <div
        className="relative w-full h-full rounded-full overflow-hidden border-2 shadow-lg"
        style={{ borderColor: speaking ? '#f97316' : '#78350f', boxShadow: speaking ? '0 0 20px rgba(249,115,22,0.4)' : 'none' }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="pgBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#be185d" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="url(#pgBg)" />
          {/* Saree body */}
          <path d="M 20 82 Q 50 96 80 82 L 80 100 L 20 100 Z" fill="#6d28d9" />
          <path d="M 20 82 Q 50 92 80 82" stroke="#f59e0b" strokeWidth="2" fill="none" />
          {/* Blouse */}
          <rect x="33" y="68" width="34" height="18" rx="5" fill="#b91c1c" />
          {/* Neck */}
          <rect x="44" y="60" width="12" height="12" rx="4" fill="#f4b8a0" />
          {/* Head */}
          <ellipse cx="50" cy="44" rx="21" ry="23" fill="#f4b8a0" />
          {/* Hair */}
          <ellipse cx="50" cy="25" rx="21" ry="15" fill="#1c1917" />
          <path d="M 29 26 Q 29 18 50 20 Q 71 18 71 26 Q 70 40 68 44 Q 65 47 62 44" fill="#1c1917" />
          {/* Hair bun/clip */}
          <circle cx="50" cy="14" r="7" fill="#1c1917" />
          <circle cx="50" cy="14" r="3" fill="#f59e0b" />
          {/* Bindi */}
          <circle cx="50" cy="29" r="2.8" fill="#dc2626" />
          {/* Eyes */}
          <ellipse cx="42" cy="43" rx="4.5" ry="5" fill="white" />
          <ellipse cx="58" cy="43" rx="4.5" ry="5" fill="white" />
          <circle cx="42" cy="43" r="2.8" fill="#1c1917" />
          <circle cx="58" cy="43" r="2.8" fill="#1c1917" />
          <circle cx="43" cy="42" r="1.1" fill="white" />
          <circle cx="59" cy="42" r="1.1" fill="white" />
          {/* Eyebrows */}
          <path d="M 37 36 Q 42 34 47 36" stroke="#1c1917" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M 53 36 Q 58 34 63 36" stroke="#1c1917" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* Nose */}
          <ellipse cx="50" cy="50" rx="2.2" ry="1.8" fill="#e8a090" />
          {/* Smile */}
          <path d="M 44 57 Q 50 64 56 57" stroke="#b91c1c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* Earrings */}
          <circle cx="29" cy="44" r="3" fill="#f59e0b" />
          <circle cx="29" cy="49" r="2" fill="#dc2626" />
          <circle cx="71" cy="44" r="3" fill="#f59e0b" />
          <circle cx="71" cy="49" r="2" fill="#dc2626" />
          {/* Necklace */}
          <path d="M 36 65 Q 50 73 64 65" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
          <circle cx="50" cy="71" r="2.5" fill="#f59e0b" />
        </svg>
      </div>
    </div>
  );
}

// ── Score Ring ───────────────────────────────────────────────────────────────

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
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black" style={{ color: c }}>
            {Math.round(score)}
          </span>
        </div>
      </div>
      {label && <span className="text-[11px] text-zinc-400 text-center leading-tight max-w-[70px]">{label}</span>}
    </div>
  );
}

// ── Score Bar ────────────────────────────────────────────────────────────────

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

// ── Pre-check item ───────────────────────────────────────────────────────────

function CheckItem({ label, status, sublabel }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
      <div className="flex-shrink-0">
        {status === 'ok'      && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        {status === 'fail'    && <XCircle      className="w-5 h-5 text-red-400" />}
        {status === 'loading' && <Loader2      className="w-5 h-5 text-zinc-400 animate-spin" />}
        {status === 'idle'    && <div          className="w-5 h-5 rounded-full border-2 border-zinc-600" />}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        {sublabel && <p className="text-xs text-zinc-500 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

// ── Typing Indicator ─────────────────────────────────────────────────────────

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

// ── Main Component ───────────────────────────────────────────────────────────

export default function IndianHRInterview() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEP.RESUME);

  // Resume state
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobRole, setJobRole] = useState('Software Engineer');
  const [isDragging, setIsDragging] = useState(false);

  // Pre-check state
  const [cameraStatus, setCameraStatus] = useState('idle');   // idle|loading|ok|fail
  const [micStatus, setMicStatus] = useState('idle');
  const [networkOk] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [checksDone, setChecksDone] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [accepted, setAccepted] = useState(false);

  // Interview state
  const [answer, setAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);

  const videoRef      = useRef(null);
  const streamRef     = useRef(null);
  const messagesEnd   = useRef(null);
  const recognitionRef= useRef(null);
  const audioCtxRef   = useRef(null);
  const rafRef        = useRef(null);
  const textareaRef   = useRef(null);

  const { speak, stop: stopTTS, speaking: isSpeaking, engine: ttsEngine } = useTTS(ttsEnabled);

  const {
    phase, messages, currentScores, scoreHistory, finalReport,
    questionNum, totalQuestions, error: interviewError,
    init: initInterview, answer: submitAnswer,
  } = useClaudeInterview();

  // ── Auto-scroll chat
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, phase]);

  // ── Auto-advance to report
  useEffect(() => {
    if (phase === 'complete' && finalReport) {
      const t = setTimeout(() => setStep(STEP.REPORT), 2200);
      return () => clearTimeout(t);
    }
  }, [phase, finalReport]);

  // Speak new Priya messages
  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    if (last.role === 'priya') speak(last.text);
  }, [messages, speak]);

  // ── Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      recognitionRef.current?.abort();
      stopTTS();
    };
  }, [stopTTS]);

  // ── Resume upload
  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setResumeFile(file);
      setResumeText('');
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text();
      setResumeFile(file);
      setResumeText(text);
    } else {
      // try reading as text anyway
      try {
        const text = await file.text();
        setResumeFile(file);
        setResumeText(text);
      } catch { /* ignore */ }
    }
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ── Pre-check: camera
  const startCamera = useCallback(async () => {
    setCameraStatus('loading');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setCameraStatus('ok');
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
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
      const src = ctx.createMediaStreamSource(stream);
      src.connect(analyser);
      analyser.fftSize = 256;
      audioCtxRef.current = ctx;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(Math.min(100, avg * 3));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch { setMicStatus('fail'); }
  }, []);

  // Mark checks done when both camera and mic tested
  useEffect(() => {
    if (cameraStatus !== 'idle' && micStatus !== 'idle') setChecksDone(true);
  }, [cameraStatus, micStatus]);

  // ── Start interview
  const startInterview = useCallback(async () => {
    // Stop camera to free resources
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close();
    setStep(STEP.INTERVIEW);
    await initInterview({
      resumeFile: resumeFile?.type === 'application/pdf' ? resumeFile : null,
      resumeText,
      role: jobRole,
    });
  }, [initInterview, resumeFile, resumeText, jobRole]);

  // ── Voice recognition
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    stopTTS();
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (e) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join('');
      setAnswer(t);
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // ── Submit answer
  const handleSubmit = useCallback(async () => {
    if (!answer.trim() || phase === 'loading') return;
    stopListening();
    stopTTS();
    const text = answer.trim();
    setAnswer('');
    await submitAnswer(text);
  }, [answer, phase, stopListening, submitAnswer]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
  }, [handleSubmit]);

  // ── Average live scores
  const liveAvg = avgScore(currentScores);

  // =========================================================================
  // RENDER: STEP 0 — Resume Upload
  // =========================================================================

  if (step === STEP.RESUME) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI-Powered Indian HR Interview
            </div>
            <h1 className="text-3xl font-black text-white mb-2">
              Meet{' '}
              <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                Priya Sharma
              </span>
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
              Senior HR Manager · TechCorp Solutions India · Bengaluru
              <br />
              Upload your resume to begin your AI mock interview
            </p>
          </div>

          {/* Priya intro card */}
          <Card className="mb-6 p-5 border-orange-500/20 bg-orange-500/5">
            <div className="flex items-center gap-4">
              <PriyaAvatar size={64} />
              <div>
                <p className="font-semibold text-white">Priya Sharma</p>
                <p className="text-xs text-zinc-400 mt-0.5">Senior HR Manager · 8+ years experience</p>
                <p className="text-xs text-orange-300 mt-1 italic">
                  "Welcome! I am looking forward to speaking with you today."
                </p>
              </div>
            </div>
          </Card>

          {/* Job role selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Interview Role
            </label>
            <div className="relative">
              <select
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
              >
                {JOB_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* File drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer
              ${isDragging
                ? 'border-orange-400 bg-orange-500/10'
                : resumeFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/50'
              }`}
            onClick={() => document.getElementById('resumeInput').click()}
          >
            <input
              id="resumeInput"
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              className="hidden"
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
            />

            {resumeFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-300">{resumeFile.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {(resumeFile.size / 1024).toFixed(0)} KB · Click to change
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-zinc-400" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-200">Drop your resume here</p>
                  <p className="text-xs text-zinc-500 mt-1">PDF or TXT · Required</p>
                </div>
              </div>
            )}
          </div>

          {!resumeFile && (
            <p className="text-center text-xs text-zinc-600 mt-2">
              * Resume upload is mandatory — Priya reviews it before the interview
            </p>
          )}

          <Button
            disabled={!resumeFile}
            onClick={() => setStep(STEP.PRECHECK)}
            className="w-full mt-5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold py-3 rounded-xl border-0 shadow-lg shadow-orange-500/20 disabled:opacity-40"
          >
            Continue to Pre-Interview Check
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: STEP 1 — Pre-Check Screen
  // =========================================================================

  if (step === STEP.PRECHECK) {
    const allOk = cameraStatus === 'ok' && micStatus === 'ok';

    return (
      <div className="min-h-[calc(100vh-80px)] px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-8 text-sm text-zinc-500">
            <span className="text-zinc-600">Resume</span>
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-orange-300 font-medium">Pre-Check</span>
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-zinc-600">Interview</span>
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-zinc-600">Report</span>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left: Priya intro */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <Card className="p-5 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-rose-500/5">
                <div className="flex flex-col items-center text-center gap-4">
                  <PriyaAvatar size={80} />
                  <div>
                    <h2 className="text-lg font-bold text-white">Priya Sharma</h2>
                    <p className="text-xs text-orange-300 font-medium mt-0.5">Senior HR Manager</p>
                    <p className="text-xs text-zinc-500">TechCorp Solutions India</p>
                  </div>
                  <div className="w-full space-y-2 text-left">
                    {[
                      { icon: MapPin,    text: 'Bengaluru, Karnataka' },
                      { icon: Briefcase, text: '8+ years IT recruitment' },
                      { icon: Users,     text: '500+ candidates placed' },
                      { icon: Award,     text: 'Top HR Performer 2023' },
                    ].map(({ icon: I, text }) => (
                      <div key={text} className="flex items-center gap-2 text-xs text-zinc-400">
                        <I className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-zinc-700/50">
                <p className="text-xs text-orange-300 font-semibold mb-2 uppercase tracking-wide">
                  Priya says
                </p>
                <p className="text-sm text-zinc-300 leading-relaxed italic">
                  "Hello! I have gone through your resume and I am looking forward to speaking
                  with you. So basically we will have a nice conversation — 8 questions only.
                  Please be yourself and answer naturally. All the best!"
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400">Ready to interview for {jobRole}</span>
                </div>
              </Card>
            </div>

            {/* Right: System checks + rules */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              {/* System checks */}
              <Card className="p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-400" />
                  System Check
                </h3>

                <div className="space-y-3 mb-4">
                  <CheckItem
                    label="Internet Connection"
                    status={networkOk ? 'ok' : 'fail'}
                    sublabel={networkOk ? 'You are connected' : 'Please check your connection'}
                  />
                  <CheckItem
                    label="Camera"
                    status={cameraStatus}
                    sublabel={
                      cameraStatus === 'idle' ? 'Click "Test Camera" below'
                        : cameraStatus === 'ok' ? 'Camera is working'
                        : 'Camera access denied — check permissions'
                    }
                  />
                  <CheckItem
                    label="Microphone"
                    status={micStatus}
                    sublabel={
                      micStatus === 'idle' ? 'Click "Test Mic" below'
                        : micStatus === 'ok' ? 'Microphone is working'
                        : 'Mic access denied — check permissions'
                    }
                  />
                  <CheckItem
                    label="Browser Compatibility"
                    status="ok"
                    sublabel="Browser supports all required features"
                  />
                </div>

                {/* Camera preview */}
                {cameraStatus === 'ok' && (
                  <div className="rounded-lg overflow-hidden bg-black mb-3" style={{ height: 120 }}>
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Mic level */}
                {micStatus === 'ok' && (
                  <div className="mb-3">
                    <p className="text-xs text-zinc-500 mb-1.5">Mic level — speak to test</p>
                    <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                        animate={{ width: `${audioLevel}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startCamera}
                    disabled={cameraStatus === 'loading'}
                    className="flex-1 text-xs"
                  >
                    <Camera className="w-3.5 h-3.5 mr-1" />
                    {cameraStatus === 'loading' ? 'Starting…' : 'Test Camera'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkMic}
                    disabled={micStatus === 'loading'}
                    className="flex-1 text-xs"
                  >
                    <Mic className="w-3.5 h-3.5 mr-1" />
                    {micStatus === 'loading' ? 'Checking…' : 'Test Mic'}
                  </Button>
                </div>
              </Card>

              {/* Interview rules */}
              <Card className="p-5">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-400" />
                  Interview Guidelines
                </h3>
                <ul className="space-y-2">
                  {[
                    '8 questions total — answer clearly and completely',
                    'You can type OR use voice input (mic button)',
                    'Priya will speak her questions (toggle mute if needed)',
                    'Press Ctrl+Enter or click Submit to send your answer',
                    'Be honest and specific — use examples from your experience',
                    'STAR format recommended for behavioral questions',
                    'Average duration: 15–25 minutes',
                  ].map((rule) => (
                    <li key={rule} className="flex items-start gap-2 text-xs text-zinc-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Consent + Start */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/80 border border-zinc-700">
                <input
                  type="checkbox"
                  id="accept"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 accent-orange-500 cursor-pointer"
                />
                <label htmlFor="accept" className="text-xs text-zinc-400 leading-relaxed cursor-pointer">
                  I agree to participate in this AI mock interview. I understand that my
                  responses will be analyzed by Claude AI to generate a performance report.
                </label>
              </div>

              <Button
                disabled={!checksDone || !accepted}
                onClick={startInterview}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold py-3 rounded-xl border-0 shadow-lg shadow-orange-500/20 disabled:opacity-40"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Interview with Priya
              </Button>

              {!checksDone && (
                <p className="text-center text-xs text-zinc-600">
                  Please test your camera and microphone first
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: STEP 2 — Interview
  // =========================================================================

  if (step === STEP.INTERVIEW) {
    const isLoading  = phase === 'loading';
    const isActive   = phase === 'active';
    const isComplete = phase === 'complete';
    const isError    = phase === 'error';
    const progress   = totalQuestions > 0 ? (questionNum / totalQuestions) * 100 : 0;

    return (
      <div className="h-[calc(100vh-80px)] flex flex-col overflow-hidden">
        {/* ── Top bar */}
        <div className="flex-shrink-0 px-4 py-3 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <PriyaAvatar size={36} speaking={isSpeaking || isLoading} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">
                  Priya Sharma
                  <span className="text-xs text-zinc-500 ml-2 font-normal">
                    {isLoading  ? '● Thinking…'
                      : isSpeaking ? '● Speaking'
                      : isComplete ? '● Interview complete'
                      : isError    ? '● Error'
                      : isActive   ? '● Live'
                      : '● Connecting…'}
                  </span>
                </span>
                <span className="text-xs text-zinc-500 tabular-nums">
                  {isLoading && phase !== 'idle' ? '…' : `Q ${Math.min(questionNum, totalQuestions)} / ${totalQuestions}`}
                </span>
              </div>
              <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-rose-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            {/* TTS toggle */}
            <button
              onClick={() => { setTtsEnabled((v) => !v); stopTTS(); }}
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title={ttsEnabled ? `Voice: ${ttsEngine} — click to mute` : 'Click to unmute Priya'}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            {ttsEnabled && ttsEngine !== 'detecting' && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                ttsEngine === 'elevenlabs' ? 'bg-violet-500/20 text-violet-300' :
                ttsEngine === 'google'     ? 'bg-blue-500/20 text-blue-300' :
                                            'bg-zinc-700 text-zinc-400'
              }`}>
                {ttsEngine === 'elevenlabs' ? 'ElevenLabs' : ttsEngine === 'google' ? 'Google TTS' : 'Browser TTS'}
              </span>
            )}
          </div>
        </div>

        {/* ── Main area */}
        <div className="flex-1 flex overflow-hidden max-w-5xl mx-auto w-full">
          {/* Chat area */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Initial loading */}
              {phase === 'idle' && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-zinc-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-orange-400" />
                    <p className="text-sm">Connecting to Priya…</p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {isError && (
                <Card className="p-5 border-red-500/30 bg-red-500/5 m-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-300">Interview Error</p>
                      <p className="text-sm text-zinc-400 mt-1">{interviewError}</p>
                      {interviewError?.includes('VITE_ANTHROPIC_API_KEY') && (
                        <p className="text-xs text-zinc-500 mt-2">
                          Add <code className="text-orange-300">VITE_ANTHROPIC_API_KEY=your_key</code> to your{' '}
                          <code className="text-orange-300">.env</code> file and restart the dev server.
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setStep(STEP.PRECHECK)}
                      >
                        <RefreshCcw className="w-3.5 h-3.5 mr-1" /> Try Again
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Messages */}
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'priya' && (
                      <PriyaAvatar size={36} speaking={i === messages.length - 1 && isSpeaking} />
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md
                        ${msg.role === 'priya'
                          ? 'bg-zinc-800/90 border border-zinc-700/50 text-zinc-100 rounded-tl-sm'
                          : 'bg-gradient-to-br from-orange-500/80 to-rose-500/80 text-white rounded-tr-sm border border-orange-500/30'
                        }`}
                    >
                      {msg.role === 'priya' && msg.qNum > 0 && (
                        <span className="text-[10px] text-orange-400 font-semibold uppercase tracking-wide block mb-1">
                          {msg.qNum === -1 ? 'Closing' : `Question ${msg.qNum} of ${totalQuestions}`}
                        </span>
                      )}
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-zinc-300">You</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isLoading && messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <PriyaAvatar size={36} speaking />
                  <div className="bg-zinc-800/90 border border-zinc-700/50 rounded-2xl rounded-tl-sm">
                    <TypingDots />
                  </div>
                </motion.div>
              )}

              {/* Complete message */}
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-center mt-4"
                >
                  <Card className="p-4 text-center border-orange-500/20 bg-orange-500/5">
                    <p className="text-orange-300 font-semibold text-sm">Interview Complete!</p>
                    <p className="text-xs text-zinc-400 mt-1">Generating your report…</p>
                    <Loader2 className="w-5 h-5 animate-spin text-orange-400 mx-auto mt-2" />
                  </Card>
                </motion.div>
              )}

              <div ref={messagesEnd} />
            </div>

            {/* Answer input */}
            {(isActive || isLoading) && !isComplete && (
              <div className="flex-shrink-0 px-4 pb-4">
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-xl focus-within:border-orange-500/50 transition-colors">
                  <textarea
                    ref={textareaRef}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? '🎙 Listening… speak your answer…' : 'Type your answer here… (Ctrl+Enter to submit)'}
                    disabled={isLoading}
                    rows={3}
                    className="w-full bg-transparent px-4 pt-3 pb-1 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none disabled:opacity-50"
                  />
                  <div className="flex items-center justify-between px-3 pb-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={isListening ? stopListening : startListening}
                        disabled={isLoading}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isListening
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
                        }`}
                      >
                        {isListening ? <><MicOff className="w-3.5 h-3.5" /> Stop</> : <><Mic className="w-3.5 h-3.5" /> Voice</>}
                      </button>
                      {answer.trim() && (
                        <span className="text-xs text-zinc-600">{answer.trim().split(/\s+/).length} words</span>
                      )}
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={!answer.trim() || isLoading}
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 text-white text-xs font-semibold shadow-md disabled:opacity-40"
                    >
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5 mr-1" />Submit</>}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Live Scores Panel */}
          <div className="w-64 flex-shrink-0 border-l border-zinc-800 p-4 overflow-y-auto hidden lg:block">
            <div className="space-y-4">
              {/* Overall live score */}
              <div className="text-center">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Live Score</p>
                <ScoreRing
                  score={liveAvg}
                  size={80}
                  color={scoreColor(liveAvg)}
                />
                {liveAvg > 0 && (
                  <p className="text-xs mt-2" style={{ color: scoreColor(liveAvg) }}>
                    {scoreLabel(liveAvg)}
                  </p>
                )}
              </div>

              <div className="h-px bg-zinc-800" />

              {/* Individual metrics */}
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">Live Assessment</p>
                <div className="space-y-3">
                  {SCORE_METRICS.map(({ key, label, icon, color }) => (
                    <ScoreBar
                      key={key}
                      label={label}
                      value={currentScores?.[key] ?? null}
                      icon={icon}
                      color={color}
                    />
                  ))}
                </div>
              </div>

              {scoreHistory.length > 1 && (
                <>
                  <div className="h-px bg-zinc-800" />
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Trend</p>
                    <div className="flex items-end gap-1 h-10">
                      {scoreHistory.map((s, i) => {
                        const avg = avgScore(s);
                        return (
                          <div key={i} className="flex-1 relative" style={{ height: `${avg}%`, minHeight: 4 }}>
                            <div
                              className="w-full h-full rounded-sm"
                              style={{ backgroundColor: scoreColor(avg), opacity: 0.7 + (i / scoreHistory.length) * 0.3 }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-1">
                      {scoreHistory.length} answers evaluated
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: STEP 3 — Report
  // =========================================================================

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
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium mb-4">
              <Award className="w-4 h-4" />
              Interview Complete
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Your Performance Report</h1>
            <p className="text-zinc-400 text-sm">Evaluated by Priya Sharma · {jobRole} Interview</p>
          </motion.div>

          {/* Priya's feedback card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="mb-6 p-6 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-rose-500/5">
              <div className="flex items-start gap-4">
                <PriyaAvatar size={56} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-white">Priya Sharma</span>
                    <span className="text-xs text-zinc-500">· Senior HR Manager</span>
                    <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full border ${recBadge(r.recommendation)}`}>
                      {r.recommendation}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed italic">
                    "{r.priya_feedback}"
                  </p>
                  {r.hiring_notes && (
                    <p className="text-xs text-zinc-500 mt-3 pt-3 border-t border-zinc-700/50">
                      <span className="text-zinc-400 font-medium">Hiring Notes: </span>
                      {r.hiring_notes}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Scores overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {/* Overall big ring */}
              <Card className="col-span-2 md:col-span-1 p-5 flex flex-col items-center justify-center gap-2 border-orange-500/20">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Overall</p>
                <ScoreRing score={r.overall_score} size={90} />
                <p className="text-xs font-semibold" style={{ color: scoreColor(r.overall_score) }}>
                  {scoreLabel(r.overall_score)}
                </p>
              </Card>

              {/* Radar chart */}
              <Card className="col-span-2 md:col-span-4 p-4">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Performance Radar</p>
                <ResponsiveContainer width="100%" height={160}>
                  <RadarChart data={radarData} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#71717a' }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      dataKey="score"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#f97316' }}
                    />
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
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-2xl font-black" style={{ color: scoreColor(val) }}>
                        {val}
                      </span>
                      <span className="text-xs text-zinc-500 mb-1">/ 100</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${val}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                      />
                    </div>
                    <p className="text-[10px] mt-1.5" style={{ color: scoreColor(val) }}>
                      {scoreLabel(val)}
                    </p>
                  </Card>
                );
              })}
              {/* Leadership if available */}
              {r.leadership !== undefined && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-zinc-400 font-medium">Leadership</span>
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-black" style={{ color: scoreColor(r.leadership) }}>
                      {r.leadership}
                    </span>
                    <span className="text-xs text-zinc-500 mb-1">/ 100</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-cyan-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${r.leadership}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                    />
                  </div>
                  <p className="text-[10px] mt-1.5" style={{ color: scoreColor(r.leadership) }}>
                    {scoreLabel(r.leadership)}
                  </p>
                </Card>
              )}
            </div>
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
                      <Star className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {s}
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
                      <Target className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/dashboard">
                <Button variant="outline" className="gap-2">
                  <Home className="w-4 h-4" /> Back to Dashboard
                </Button>
              </Link>
              <Button
                onClick={() => {
                  setStep(STEP.RESUME);
                  setResumeFile(null);
                  setResumeText('');
                  setAnswer('');
                  setChecksDone(false);
                  setCameraStatus('idle');
                  setMicStatus('idle');
                  setAccepted(false);
                }}
                className="gap-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 text-white"
              >
                <RefreshCcw className="w-4 h-4" /> Retake Interview
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading/transitioning state
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

