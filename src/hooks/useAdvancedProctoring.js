/**
 * useAdvancedProctoring — Ultra-advanced AI proctoring engine
 *
 * Detection modules (all feed into a shared 3-strike pool):
 *  1. Face presence    – no face for >3s → violation
 *  2. Multiple people  – 2+ faces → violation
 *  3. Eye gaze         – eyes sustained left/right/down → violation
 *  4. Head pose        – head tilted down (looking at phone/notes) → violation
 *  5. Phone heuristic  – bright rectangle in lower frame (phone screen) → violation
 *  6. Tab visibility   – tab hidden → violation (handled by parent)
 *
 * Each module has a cooldown so the same type only fires once per cooldown window.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const MODELS_URL = '/models';

// Cooldowns (ms) per violation type to avoid spam
const COOLDOWNS = {
  no_face:    5000,
  multi_face: 10000,
  gaze_away:  8000,
  head_down:  8000,
  phone:      12000,
};

// How many consecutive bad frames trigger a violation
const THRESHOLDS = {
  no_face:    2,   // frames (~2.2s at 1fps)
  multi_face: 2,
  gaze_away:  3,
  head_down:  3,
  phone:      2,
};

// Canvas used for phone heuristic (never mounted in DOM)
let _offCanvas = null;
function getOffCanvas() {
  if (!_offCanvas) { _offCanvas = document.createElement('canvas'); }
  return _offCanvas;
}

// ── Eye Aspect Ratio (EAR) ────────────────────────────────────────────────────
function ear(p1, p2, p3, p4, p5, p6) {
  const A = Math.hypot(p2.x - p6.x, p2.y - p6.y);
  const B = Math.hypot(p3.x - p5.x, p3.y - p5.y);
  const C = Math.hypot(p1.x - p4.x, p1.y - p4.y);
  return C > 0 ? (A + B) / (2 * C) : 0;
}

// ── Gaze analysis from 68-point landmarks ─────────────────────────────────────
function analyseGaze(pts) {
  // Horizontal gaze ratio per eye (0=far left, 0.5=center, 1=far right)
  const lw  = pts[39].x - pts[36].x;
  const rw  = pts[45].x - pts[42].x;
  const lRatio = lw > 4 ? ((pts[37].x + pts[38].x + pts[40].x + pts[41].x) / 4 - pts[36].x) / lw : 0.5;
  const rRatio = rw > 4 ? ((pts[43].x + pts[44].x + pts[46].x + pts[47].x) / 4 - pts[42].x) / rw : 0.5;
  const hRatio = (lRatio + rRatio) / 2;

  // Vertical: compare nose bridge (27) to nose tip (30) vs chin (8)
  const eyeMidY  = (pts[36].y + pts[45].y) / 2;
  const chinY    = pts[8].y;
  const noseTipY = pts[30].y;
  const faceH    = chinY - eyeMidY;
  const vRatio   = faceH > 10 ? (noseTipY - eyeMidY) / faceH : 0.45;

  let dir = 'center';
  if (hRatio < 0.36)      dir = 'left';
  else if (hRatio > 0.64) dir = 'right';
  else if (vRatio > 0.58) dir = 'down';
  else if (vRatio < 0.28) dir = 'up';

  // Head tilt — compare left jaw (1) to right jaw (15) vertical diff
  const headRoll = (pts[15].y - pts[1].y) / Math.max(1, pts[15].x - pts[1].x);
  const tilted   = Math.abs(headRoll) > 0.35;   // >~20° roll

  // EAR for both eyes
  const leftEAR  = ear(pts[36], pts[37], pts[38], pts[39], pts[40], pts[41]);
  const rightEAR = ear(pts[42], pts[43], pts[44], pts[45], pts[46], pts[47]);
  const avgEAR   = (leftEAR + rightEAR) / 2;

  return { dir, tilted, eyesClosed: avgEAR < 0.18, hRatio, vRatio };
}

// ── Phone / bright-rect heuristic ─────────────────────────────────────────────
function detectPhoneHeuristic(video) {
  try {
    const cvs = getOffCanvas();
    const w = 200; const h = 150;
    cvs.width = w; cvs.height = h;
    const ctx = cvs.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, w, h);

    // Scan in a grid of cells; phone = contiguous bright rectangle
    const cellW = 10; const cellH = 10;
    const cols = Math.floor(w / cellW); const rows = Math.floor(h / cellH);
    const brightCells = [];
    let totalBrightCells = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const imgData = ctx.getImageData(col * cellW, row * cellH, cellW, cellH);
        const d = imgData.data;
        let sum = 0; let satSum = 0;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          sum += (r + g + b) / 3;
          satSum += Math.max(r, g, b) - Math.min(r, g, b);
        }
        const px = d.length / 4;
        const avgBright = sum / px;
        const avgSat = satSum / px;
        // Phone screen: uniformly bright and at least slightly coloured
        if (avgBright > 155 && avgSat > 12) {
          brightCells.push({ row, col });
          totalBrightCells++;
        }
      }
    }

    // Need a meaningful cluster (at least 8 adjacent bright cells)
    if (totalBrightCells < 8) return false;

    // Check if bright cells form a roughly rectangular cluster (bounding box fill > 35%)
    const minRow = Math.min(...brightCells.map((c) => c.row));
    const maxRow = Math.max(...brightCells.map((c) => c.row));
    const minCol = Math.min(...brightCells.map((c) => c.col));
    const maxCol = Math.max(...brightCells.map((c) => c.col));
    const boxArea = (maxRow - minRow + 1) * (maxCol - minCol + 1);
    const fill = totalBrightCells / Math.max(1, boxArea);

    // Also check raw bright-pixel ratio for extreme cases (very bright screen)
    const fullData = ctx.getImageData(0, Math.floor(h * 0.30), w, Math.floor(h * 0.70));
    const fd = fullData.data;
    let rawBright = 0;
    for (let i = 0; i < fd.length; i += 4) {
      if ((fd[i] + fd[i + 1] + fd[i + 2]) / 3 > 200) rawBright++;
    }
    const rawRatio = rawBright / (fd.length / 4);

    return (fill > 0.40 && totalBrightCells >= 8) || rawRatio > 0.22;
  } catch { return false; }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAdvancedProctoring(videoRef, active, onViolationFn) {
  const [modelsLoaded, setModelsLoaded]   = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [faceCount, setFaceCount]         = useState(0);
  const [gazeDir, setGazeDir]             = useState('center');
  const [headDown, setHeadDown]           = useState(false);
  const [phoneAlert, setPhoneAlert]       = useState(false);
  const [earValue, setEarValue]           = useState(1);

  const cbRef       = useRef(onViolationFn);
  const intervalRef = useRef(null);
  const loadedRef   = useRef(false);
  const lastRef     = useRef({}); // last violation timestamps per type
  const counters    = useRef({}); // consecutive-bad-frame counters per type

  useEffect(() => { cbRef.current = onViolationFn; }, [onViolationFn]);

  // ── Model loading
  useEffect(() => {
    if (!active || loadedRef.current || modelsLoading) return;
    setModelsLoading(true);
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL),
    ])
      .then(() => { loadedRef.current = true; setModelsLoaded(true); })
      .catch(() => setModelsLoaded(false))
      .finally(() => setModelsLoading(false));
  }, [active, modelsLoading]);

  // ── Violation emitter with cooldown + threshold
  const emit = useCallback((type, title, msg, critical = false) => {
    const now    = Date.now();
    const last   = lastRef.current[type] || 0;
    const cd     = COOLDOWNS[type] || 8000;
    if (now - last < cd) return; // still in cooldown
    lastRef.current[type] = now;
    counters.current[type] = 0;
    cbRef.current?.(type, title, msg, critical);
  }, []);

  const tick = useCallback((type, badFrame, title, msg, critical) => {
    if (badFrame) {
      counters.current[type] = (counters.current[type] || 0) + 1;
      if (counters.current[type] >= (THRESHOLDS[type] || 2)) {
        emit(type, title, msg, critical);
      }
    } else {
      counters.current[type] = 0;
    }
  }, [emit]);

  // ── Detection loop
  useEffect(() => {
    if (!modelsLoaded || !active) return;

    intervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.paused) return;

      try {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.35, inputSize: 224 }))
          .withFaceLandmarks();

        const count = detections.length;
        setFaceCount(count);

        // ── No face
        tick('no_face', count === 0,
          'Face Not Detected',
          'Your face is not visible. Return to camera view immediately.',
          true);

        // ── Multiple people
        tick('multi_face', count > 1,
          'Multiple People Detected',
          `${count} faces are visible. Ensure you are alone during the interview.`,
          true);

        if (count === 1) {
          const pts = detections[0].landmarks.positions;
          const gaze = analyseGaze(pts);

          setGazeDir(gaze.dir);
          setHeadDown(gaze.dir === 'down');
          setEarValue(Math.round(((earValue) => earValue)(
            (ear(pts[36],pts[37],pts[38],pts[39],pts[40],pts[41]) +
             ear(pts[42],pts[43],pts[44],pts[45],pts[46],pts[47])) / 2 * 100
          )));

          // ── Gaze away — ANY non-center direction triggers warning
          tick('gaze_away', gaze.dir !== 'center',
            'Eye Contact Violation',
            `Eyes detected looking ${gaze.dir}. Keep your eyes on the screen at all times.`,
            false);

          // ── Head down (additional check for extreme tilt — notes/phone)
          tick('head_down', gaze.vRatio > 0.65,
            'Head Down Detected',
            'Your head is tilted down. Do not look at notes, phone, or paper during the interview.',
            false);
        }

        // ── Phone / bright-screen heuristic (run less frequently via counter)
        counters.current._phoneTick = (counters.current._phoneTick || 0) + 1;
        if (counters.current._phoneTick >= 3) {
          counters.current._phoneTick = 0;
          const phoneDetected = detectPhoneHeuristic(video);
          setPhoneAlert(phoneDetected);
          tick('phone', phoneDetected,
            'Device Detected',
            'A bright screen or phone appears visible in your camera. Remove any devices from view.',
            true);
        }

      } catch { /* ignore per-frame errors */ }
    }, 1100);

    return () => clearInterval(intervalRef.current);
  }, [modelsLoaded, active, tick, videoRef]); // eslint-disable-line react-hooks/exhaustive-deps

  return { modelsLoaded, modelsLoading, faceCount, gazeDir, headDown, phoneAlert, earValue };
}
