import { useCallback, useEffect, useRef, useState } from 'react';

export function useLiveInterview(interviewId, token, enabled, onProctorFrames) {
  const wsRef = useRef(null);
  const proctorCbRef = useRef(onProctorFrames);
  const [connected, setConnected] = useState(false);
  const [question, setQuestion] = useState(null);
  const [scores, setScores] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [error, setError] = useState('');
  const [integrity, setIntegrity] = useState(null);

  useEffect(() => {
    proctorCbRef.current = onProctorFrames;
  }, [onProctorFrames]);

  useEffect(() => {
    if (!interviewId || !token || !enabled) return undefined;
    const base = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const wsBase = base.replace(/^http/, 'ws');
    const url = `${wsBase}/api/v1/ws/interviews/${interviewId}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setError('WebSocket error');
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'question') setQuestion(msg.question);
        if (msg.type === 'scores') setScores(msg.scores);
        if (msg.type === 'complete') {
          setCompleted(true);
          setReportId(msg.report_id);
        }
        if (msg.type === 'integrity_update') {
          setIntegrity({ score: msg.integrity_score, risk: msg.risk_level });
        }
        if (msg.type === 'error') setError(msg.detail || 'Error');
      } catch {
        /* ignore */
      }
    };

    return () => {
      ws.close();
    };
  }, [interviewId, token, enabled]);

  useEffect(() => {
    const id = setInterval(() => {
      const fn = proctorCbRef.current;
      if (!fn || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      const frames = fn();
      if (frames?.length) {
        wsRef.current.send(JSON.stringify({ type: 'proctor_batch', frames }));
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const sendAnswer = useCallback((questionId, text, speechMeta) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(
      JSON.stringify({
        type: 'answer',
        question_id: questionId,
        text,
        speech_meta: speechMeta,
      })
    );
  }, []);

  return {
    connected,
    question,
    scores,
    completed,
    reportId,
    error,
    integrity,
    sendAnswer,
  };
}
