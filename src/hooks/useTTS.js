/**
 * useTTS — Realistic Indian female TTS for Priya Sharma
 *
 * Priority chain:
 *  1. ElevenLabs API  (if VITE_ELEVENLABS_API_KEY set)
 *  2. Google Translate TTS via Vite proxy  (free, real Indian en-IN voice)
 *  3. Browser SpeechSynthesis fallback  (finds best available Indian voice)
 */
import { useCallback, useRef, useState } from 'react';

// ── Text utilities ────────────────────────────────────────────────────────────

function chunkText(text, maxLen = 200) {
  // Split on sentence boundaries, keeping each chunk under maxLen
  const raw = text.replace(/\s+/g, ' ').trim();
  const sentences = raw.match(/[^.!?…]+[.!?…]*\s*/g) || [raw];
  const chunks = [];
  let buf = '';
  for (const s of sentences) {
    if ((buf + s).length > maxLen) {
      if (buf.trim()) chunks.push(buf.trim());
      // If a single sentence is too long, split by comma
      if (s.trim().length > maxLen) {
        const parts = s.split(/,\s*/);
        let sub = '';
        for (const p of parts) {
          if ((sub + p).length > maxLen) { if (sub.trim()) chunks.push(sub.trim()); sub = p + ', '; }
          else sub += p + ', ';
        }
        if (sub.trim()) buf = sub.trim();
        else buf = '';
      } else {
        buf = s;
      }
    } else {
      buf += s;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks.length ? chunks : [raw.slice(0, maxLen)];
}

// ── Engine 1: ElevenLabs ─────────────────────────────────────────────────────

async function elevenLabsSpeak(text, apiKey, voiceId, signal) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      language_code: 'en-IN',
      voice_settings: {
        stability: 0.45,
        similarity_boost: 0.80,
        style: 0.15,
        use_speaker_boost: true,
      },
    }),
    signal,
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}`);
  const blob = await res.blob();
  const objUrl = URL.createObjectURL(blob);
  await playAudioUrl(objUrl, signal, true);
}

// ── Engine 2: Google Translate TTS (via Vite proxy) ──────────────────────────

async function googleTTSSpeak(text, signal) {
  const chunks = chunkText(text, 180);
  for (const chunk of chunks) {
    if (signal?.aborted) return;
    const url = `/tts-proxy?ie=UTF-8&tl=en-IN&client=gtx&q=${encodeURIComponent(chunk)}`;
    // Fetch first so we can check status — Audio element silently ignores 404
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Google TTS ${res.status}`);
    const blob = await res.blob();
    if (blob.size < 64) throw new Error('Empty audio from Google TTS');
    const objUrl = URL.createObjectURL(blob);
    // playbackRate 1.15 keeps pace natural without silence between audio clips
    await playAudioUrl(objUrl, signal, true, 1.15);
  }
}

// ── Engine 3: Browser SpeechSynthesis ────────────────────────────────────────

async function loadVoices() {
  const synth = window.speechSynthesis;
  if (!synth) return [];
  const voices = synth.getVoices();
  if (voices.length) return voices;
  return new Promise((resolve) => {
    const onChanged = () => resolve(synth.getVoices());
    synth.addEventListener('voiceschanged', onChanged, { once: true });
    setTimeout(() => { synth.removeEventListener('voiceschanged', onChanged); resolve(synth.getVoices()); }, 3000);
  });
}

function pickBestVoice(voices) {
  const tests = [
    (v) => v.name === 'Veena',                                              // macOS Indian English female
    (v) => v.name === 'Rishi',                                              // macOS Indian English male
    (v) => v.name === 'Google हिन्दी',                                        // Chrome Hindi — strong Indian accent
    (v) => v.name.toLowerCase().includes('india') && /female|woman/i.test(v.name),
    (v) => v.lang === 'en-IN' && /female|woman/i.test(v.name),
    (v) => v.lang === 'hi-IN',
    (v) => v.lang === 'en-IN',
    (v) => v.name.toLowerCase().includes('india'),
    (v) => v.name === 'Google UK English Female',
    (v) => v.name === 'Karen',
    (v) => /female|woman/i.test(v.name) && v.lang.startsWith('en'),
    (v) => v.lang.startsWith('en'),
  ];
  for (const t of tests) { const v = voices.find(t); if (v) return v; }
  return null;
}

async function browserTTSSpeak(text, signal) {
  return new Promise(async (resolve) => {
    const synth = window.speechSynthesis;
    if (!synth) return resolve();
    synth.cancel();
    const voices = await loadVoices();
    // Speak the entire text as ONE utterance — no chunking, no gaps
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN';
    u.rate = 1.0;
    u.pitch = 1.05;
    u.volume = 1.0;
    const voice = pickBestVoice(voices);
    if (voice) u.voice = voice;
    u.onend = resolve;
    u.onerror = resolve;
    const abort = () => { synth.cancel(); resolve(); };
    signal?.addEventListener('abort', abort, { once: true });
    // Small delay ensures cancel() has cleared before new utterance
    setTimeout(() => synth.speak(u), 30);
  });
}

// ── Shared audio player ──────────────────────────────────────────────────────

function playAudioUrl(url, signal, revokeAfter, playbackRate = 1.0) {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    audio.playbackRate = playbackRate;
    audio.onended = () => { if (revokeAfter) URL.revokeObjectURL(url); resolve(); };
    audio.onerror = () => { if (revokeAfter) URL.revokeObjectURL(url); resolve(); };
    const abort = () => { audio.pause(); audio.src = ''; if (revokeAfter) URL.revokeObjectURL(url); resolve(); };
    signal?.addEventListener('abort', abort, { once: true });
    audio.play().catch(() => { if (revokeAfter) URL.revokeObjectURL(url); resolve(); });
  });
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useTTS(enabled = true) {
  const [speaking, setSpeaking] = useState(false);
  const [engine, setEngine] = useState('detecting'); // elevenlabs | google | browser
  const abortRef = useRef(null);

  const speak = useCallback(async (rawText) => {
    if (!enabled || !rawText?.trim()) return;
    // Collapse newlines and extra spaces so there's no silent gap between paragraphs
    const text = rawText.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();

    // Cancel previous speech
    abortRef.current?.abort();
    window.speechSynthesis?.cancel();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setSpeaking(true);

    const el11Key = import.meta.env.VITE_ELEVENLABS_API_KEY;
    const el11VoiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';

    try {
      if (el11Key) {
        setEngine('elevenlabs');
        await elevenLabsSpeak(text, el11Key, el11VoiceId, ctrl.signal);
      } else {
        // Try Google TTS proxy first
        try {
          setEngine('google');
          await googleTTSSpeak(text, ctrl.signal);
        } catch {
          // Fallback to browser SpeechSynthesis
          setEngine('browser');
          await browserTTSSpeak(text, ctrl.signal);
        }
      }
    } catch {
      // If everything fails, try browser TTS
      try { await browserTTSSpeak(text, ctrl.signal); } catch { /* silent */ }
    } finally {
      if (!ctrl.signal.aborted) setSpeaking(false);
    }
  }, [enabled]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking, engine };
}
