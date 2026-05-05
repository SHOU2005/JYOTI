import { Eye, Users, Wifi, Copy, Camera, CheckCircle, AlertTriangle, Shield, Smartphone } from 'lucide-react';

const SIGNALS = [
  { key: 'face',      label: 'Face Detected',  icon: Camera,     okTip: 'Face visible',           warnTip: 'No face detected'        },
  { key: 'gaze',      label: 'Eye Gaze',        icon: Eye,        okTip: 'Looking at screen',      warnTip: 'Eyes looking away'       },
  { key: 'phone',     label: 'No Phone',        icon: Smartphone, okTip: 'No phone detected',      warnTip: 'Phone usage suspected'   },
  { key: 'multiFace', label: 'Single Person',   icon: Users,      okTip: 'Only you visible',       warnTip: 'Multiple faces detected' },
  { key: 'tab',       label: 'Tab Focus',       icon: Wifi,       okTip: 'Tab in focus',           warnTip: 'Tab switch detected'     },
  { key: 'paste',     label: 'No Copy-Paste',   icon: Copy,       okTip: 'No paste activity',      warnTip: 'Paste detected'          },
];

function getRiskColor(score) {
  if (score >= 85) return { ring: '#10b981', text: 'text-emerald-400', label: 'LOW RISK',  bg: 'from-emerald-500/10 to-emerald-900/5' };
  if (score >= 65) return { ring: '#f59e0b', text: 'text-amber-400',   label: 'MEDIUM',   bg: 'from-amber-500/10 to-amber-900/5'     };
  if (score >= 45) return { ring: '#f97316', text: 'text-orange-400',  label: 'HIGH RISK',bg: 'from-orange-500/10 to-orange-900/5'   };
  return              { ring: '#ef4444', text: 'text-red-400',     label: 'CRITICAL', bg: 'from-red-500/10 to-red-900/5'         };
}

function IntegrityArc({ score }) {
  const r    = 42;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(100, Math.max(0, score)) / 100;
  const { ring, text, label } = getRiskColor(score);

  return (
    <div className="flex flex-col items-center gap-1 mb-4">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#1f1f2e" strokeWidth="8" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={ring} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${circ * pct} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-black ${text}`}>{Math.round(score)}</span>
          <span className="text-[8px] text-zinc-500 font-semibold">INT.</span>
        </div>
      </div>
      <span className={`text-[9px] font-bold tracking-widest uppercase ${text}`}>{label}</span>
    </div>
  );
}

export function ProctorHUD({ integrity = 100, ready = false, violations = {} }) {
  const score = typeof integrity === 'number' ? integrity : 100;

  const signals = {
    face:      !(violations.NO_FACE     > 0),
    gaze:      !(violations.GAZE_AWAY   > 0),
    phone:     !(violations.PHONE       > 0),
    multiFace: !(violations.MULTI_FACE  > 0),
    tab:       !(violations.TAB_SWITCH  > 0),
    paste:     !(violations.PASTE_BURST > 0),
  };

  return (
    <div className="space-y-3">
      {!ready ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <Shield className="w-8 h-8 text-zinc-600 animate-pulse" />
          <p className="text-xs text-zinc-500">Initializing proctoring…</p>
        </div>
      ) : (
        <>
          <IntegrityArc score={score} />
          <div className="space-y-1.5">
            {SIGNALS.map(({ key, label, icon: Icon, okTip, warnTip }) => {
              const ok = signals[key] !== false;
              return (
                <div key={key}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors duration-300
                    ${ok ? 'border-white/5 bg-white/2' : 'border-red-500/20 bg-red-500/5'}`}>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${ok ? 'bg-zinc-800' : 'bg-red-500/15'}`}>
                    <Icon className={`w-3.5 h-3.5 ${ok ? 'text-zinc-500' : 'text-red-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${ok ? 'text-zinc-400' : 'text-red-300'}`}>{label}</p>
                  </div>
                  {ok
                    ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    : <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 animate-pulse" />}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
