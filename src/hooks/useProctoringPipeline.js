import { useCallback, useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const TAB_SWITCH_THRESHOLD    = 1;
const GAZE_STREAK_THRESHOLD   = 2;    // 2 frames × 1.5 s = 3 s before gaze warning
const NO_FACE_STREAK_THRESHOLD = 2;   // 2 frames × 1.5 s = 3 s before no-face warning
const PHONE_STREAK_THRESHOLD   = 1;   // warn immediately on first phone frame
const MOTION_THRESHOLD         = 12;
const PASTE_WARNING_THRESHOLD  = 1;
const DETECT_INTERVAL_MS       = 1500; // detection cadence

export function useProctoringPipeline(enabled, streams, onWarning) {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const [ready, setReady] = useState(false);
  const streamRef   = useRef(null);
  const analyserRef = useRef(null);
  const seqRef      = useRef(0);

  // ─── Always-fresh callback ref ──────────────────────────────────────────────
  // The async detection loop cannot close over `onWarning` directly — by the time
  // the interview starts (hasStarted=true) the closure would hold the old value.
  const onWarningRef = useRef(onWarning);
  useEffect(() => { onWarningRef.current = onWarning; }, [onWarning]);

  const warn = useCallback((msg, critical = false) => {
    onWarningRef.current?.(msg, critical);
  }, []);

  const statsRef = useRef({
    faceCount: 0,
    lookingAway: false,
    gazeAwayStreak: 0,
    noFaceStreak: 0,
    tabSwitchCount: 0,
    pasteCount: 0,
    isFocused: true,
    motionFlag: false,
    motionStreak: 0,
    lastAccel: null,
    multiFaceCount: 0,
    lighting: 0.8,
    micRms: 0,
    phoneStreak: 0,
    phoneDetected: false,
    gazeLeft: false,
    gazeRight: false,
    gazeDown: false,
  });

  // ─── DeviceMotion ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;
    const handleMotion = (e) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const last = statsRef.current.lastAccel;
      if (last) {
        const delta = Math.sqrt(
          Math.pow((a.x || 0) - last.x, 2) +
          Math.pow((a.y || 0) - last.y, 2) +
          Math.pow((a.z || 0) - last.z, 2)
        );
        if (delta > MOTION_THRESHOLD) {
          statsRef.current.motionStreak += 1;
          statsRef.current.motionFlag = true;
          if (statsRef.current.motionStreak >= 2) {
            warn('Device movement detected. Please keep your device stable.');
            statsRef.current.motionStreak = 0;
          }
        } else {
          statsRef.current.motionFlag = false;
          statsRef.current.motionStreak = Math.max(0, statsRef.current.motionStreak - 1);
        }
      }
      statsRef.current.lastAccel = { x: a.x || 0, y: a.y || 0, z: a.z || 0 };
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [enabled, warn]);

  // ─── Tab / Focus / Paste ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !streams?.cam) return;

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        statsRef.current.tabSwitchCount += 1;
        statsRef.current.isFocused = false;
        if (statsRef.current.tabSwitchCount >= TAB_SWITCH_THRESHOLD) {
          warn(`Tab switching detected (${statsRef.current.tabSwitchCount}x). Stay on the interview tab.`);
        }
      } else {
        statsRef.current.isFocused = true;
      }
    };
    const handleBlur   = () => { statsRef.current.isFocused = false; };
    const handleFocus  = () => { statsRef.current.isFocused = true; };
    const handlePaste  = () => {
      statsRef.current.pasteCount += 1;
      if (statsRef.current.pasteCount >= PASTE_WARNING_THRESHOLD)
        warn('Copy-paste detected. Please answer in your own words.');
    };
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        statsRef.current.pasteCount += 1;
        if (statsRef.current.pasteCount >= PASTE_WARNING_THRESHOLD)
          warn('Copy-paste shortcut detected. Answers must be your own.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur',  handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('paste',   handlePaste);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur',  handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('paste',   handlePaste);
      document.removeEventListener('keydown', handleKey);
    };
  }, [enabled, streams, warn]);

  // ─── Camera + Face / Phone / Gaze ────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !streams?.cam) return undefined;
    let cancelled = false;

    (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        ]);

        if (cancelled) return;
        streamRef.current = streams.cam;

        if (videoRef.current) {
          videoRef.current.srcObject = streams.cam;
          await videoRef.current.play().catch(() => {});
        }

        // Mic analyser
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (AC) {
            const ctx = new AC();
            const src = ctx.createMediaStreamSource(streams.cam);
            const an  = ctx.createAnalyser();
            an.fftSize = 256;
            src.connect(an);
            analyserRef.current = an;
          }
        } catch (_) {}

        setReady(true);

        // ── Lighting ────────────────────────────────────────────────────────
        const monitorLighting = () => {
          if (cancelled) return;
          const video  = videoRef.current;
          const canvas = canvasRef.current;
          if (video && canvas && video.videoWidth > 0) {
            const ctx2d = canvas.getContext('2d', { willReadFrequently: true });
            canvas.width = 160; canvas.height = 120;
            ctx2d.drawImage(video, 0, 0, 160, 120);
            const img = ctx2d.getImageData(0, 0, 160, 120);
            let sum = 0;
            for (let i = 0; i < img.data.length; i += 4)
              sum += (img.data[i] + img.data[i+1] + img.data[i+2]) / 3;
            statsRef.current.lighting = sum / (img.data.length / 4) / 255;
          }
          setTimeout(monitorLighting, 3000);
        };
        monitorLighting();

        // ── Mic RMS ─────────────────────────────────────────────────────────
        const monitorMic = () => {
          if (cancelled) return;
          if (analyserRef.current) {
            const buf = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteTimeDomainData(buf);
            let s = 0;
            for (let i = 0; i < buf.length; i++) s += Math.abs(buf[i] - 128);
            statsRef.current.micRms = s / buf.length / 128;
          }
          setTimeout(monitorMic, 1000);
        };
        monitorMic();

        // ── Face / Gaze / Phone Detection Loop ───────────────────────────────
        const detectFace = async () => {
          if (cancelled) return;
          const video = videoRef.current;
          if (video && video.readyState === 4) {
            try {
              // inputSize 320 gives much more accurate landmarks than 160
              const detections = await faceapi
                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 }))
                .withFaceLandmarks();

              const count = detections.length;
              statsRef.current.faceCount = count;

              if (count === 0) {
                statsRef.current.noFaceStreak += 1;
                statsRef.current.lookingAway   = true;
                statsRef.current.phoneDetected = false;
                if (statsRef.current.noFaceStreak >= NO_FACE_STREAK_THRESHOLD) {
                  warn('⚠️ Face not visible. Please stay in front of the camera.');
                  statsRef.current.noFaceStreak = 0;
                }
              } else if (count > 1) {
                statsRef.current.noFaceStreak   = 0;
                statsRef.current.multiFaceCount += 1;
                warn(`⚠️ ${count} faces detected. Only the candidate should be visible.`, true);
              } else {
                statsRef.current.noFaceStreak   = Math.max(0, statsRef.current.noFaceStreak - 1);
                statsRef.current.multiFaceCount = 0;

                const pts = detections[0].landmarks.positions;

                // 68-point model indices:
                // Right eye: outer=36, inner=39 | Left eye: inner=42, outer=45
                const rOuter = pts[36], rInner = pts[39];
                const lInner = pts[42], lOuter = pts[45];

                const eyeSpan = Math.abs(lOuter.x - rOuter.x);
                const eyeMidX = ((rOuter.x + rInner.x) / 2 + (lInner.x + lOuter.x) / 2) / 2;
                const eyeMidY = (
                  (pts[37].y + pts[38].y + pts[40].y + pts[41].y) / 4 +
                  (pts[43].y + pts[44].y + pts[46].y + pts[47].y) / 4
                ) / 2;

                const noseBridge = pts[27]; // top nose bridge
                const noseTip    = pts[33]; // nose tip
                const chin       = pts[8];  // jaw centre
                const lBrow      = pts[24]; // left brow outer
                const rBrow      = pts[19]; // right brow outer
                const browMidY   = (lBrow.y + rBrow.y) / 2;
                const faceH      = Math.max(1, Math.abs(chin.y - browMidY));

                // ── Horizontal gaze (nose bridge offset from eye midpoint) ──
                const hDev      = (noseBridge.x - eyeMidX) / Math.max(1, eyeSpan / 2);
                const gazeLeft  = hDev < -0.18;
                const gazeRight = hDev >  0.18;
                statsRef.current.gazeLeft  = gazeLeft;
                statsRef.current.gazeRight = gazeRight;

                // ── Vertical head tilt ────────────────────────────────────
                // vertRatio: how far noseTip is below eye centres, as fraction of face height
                // Straight ahead ≈ 0.30–0.44  |  Head tilted down (phone) > 0.44
                const vertRatio = (noseTip.y - eyeMidY) / faceH;

                // chinRatio: how visible the chin is below the eyes
                // Straight ≈ 0.70–0.90  |  Tilted down (chin hides behind desk) < 0.60
                const chinRatio = (chin.y - eyeMidY) / faceH;

                // Two independent downward-tilt signals (either suffices)
                const tiltedByNose = vertRatio > 0.44;
                const tiltedByChin = chinRatio  < 0.60;
                const gazeDown     = tiltedByNose || tiltedByChin;
                statsRef.current.gazeDown = gazeDown;

                // ── Phone detection ───────────────────────────────────────
                const box     = detections[0].detection.box;
                const frameH  = video.videoHeight || 480;
                const frameW  = video.videoWidth  || 640;
                const faceArea = (box.width * box.height) / (frameW * frameH);

                // phone in lap: head tilted down (either metric), or
                // face suspiciously far from camera + any gaze deviation
                const phoneRisk =
                  tiltedByNose ||
                  tiltedByChin ||
                  (gazeDown && faceArea < 0.08);

                if (phoneRisk) {
                  statsRef.current.phoneStreak  += 1;
                  statsRef.current.phoneDetected = true;
                  if (statsRef.current.phoneStreak >= PHONE_STREAK_THRESHOLD) {
                    warn('📱 Phone or device usage detected! Put it away and look at the screen.', true);
                    // reset streak so we don't spam every frame
                    statsRef.current.phoneStreak = 0;
                  }
                } else {
                  statsRef.current.phoneDetected = false;
                  statsRef.current.phoneStreak   = Math.max(0, statsRef.current.phoneStreak - 1);
                }

                // ── Combined gaze warning (non-phone distraction) ─────────
                const lookingAway = gazeLeft || gazeRight || gazeDown;
                if (lookingAway) {
                  statsRef.current.lookingAway     = true;
                  statsRef.current.gazeAwayStreak += 1;
                  if (statsRef.current.gazeAwayStreak >= GAZE_STREAK_THRESHOLD && !phoneRisk) {
                    const dir = gazeLeft ? 'left' : gazeRight ? 'right' : 'down';
                    warn(`👁 Eyes looking ${dir}. Please focus on the screen.`);
                    statsRef.current.gazeAwayStreak = 0;
                  }
                } else {
                  statsRef.current.lookingAway     = false;
                  statsRef.current.gazeAwayStreak  = Math.max(0, statsRef.current.gazeAwayStreak - 1);
                }
              }
            } catch (_) {
              // Silently skip bad frames
            }
          }
          setTimeout(detectFace, DETECT_INTERVAL_MS);
        };
        detectFace();
      } catch (err) {
        console.error('Proctoring init failed', err);
        warn(`Camera initialisation failed: ${err.message}`);
        setReady(false);
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [enabled, streams, warn]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Frame Builder ───────────────────────────────────────────────────────────
  const buildFrames = useCallback(() => {
    seqRef.current += 1;
    const s = statsRef.current;
    const focused = document.visibilityState === 'visible' && document.hasFocus();
    const pasteDelta = s.pasteCount;
    s.pasteCount = 0;

    const attentionScore =
      s.faceCount === 1 && !s.lookingAway && focused ? 0.95
      : s.faceCount > 0 ? 0.45
      : 0.05;

    return [{
      seq:             seqRef.current,
      ts_ms:           Date.now(),
      face_count:      s.faceCount,
      face_present:    s.faceCount > 0,
      attention_score: attentionScore,
      gaze_variance:   s.lookingAway ? 0.85 : 0.1,
      gaze_left:       s.gazeLeft  ? 1 : 0,
      gaze_right:      s.gazeRight ? 1 : 0,
      gaze_down:       s.gazeDown  ? 1 : 0,
      phone_detected:  s.phoneDetected ? 1 : 0,
      lighting:        s.lighting,
      tab_switch_delta: focused ? 0 : 1,
      focused,
      fullscreen:      !!document.fullscreenElement,
      paste_delta:     pasteDelta,
      mic_rms:         s.micRms,
      motion_flag:     s.motionFlag ? 1 : 0,
      multi_face:      s.faceCount > 1 ? 1 : 0,
    }];
  }, []);

  return { videoRef, canvasRef, ready, buildFrames, stats: statsRef };
}
