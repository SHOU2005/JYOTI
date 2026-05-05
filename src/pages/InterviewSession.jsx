import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Mic, MicOff, Send, Power } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';

export default function InterviewSession() {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const loc = useLocation();
    const [question, setQuestion] = useState(loc.state?.question || null);
    const [answer, setAnswer] = useState('');
    const [idx, setIdx] = useState(0);
    const [total] = useState(6);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const [isRecording, setIsRecording] = useState(false);

    useEffect(() => {
        if (!question && interviewId) {
            api.post(`/api/v1/student/interviews/${interviewId}/next-question`)
                .then((r) => {
                    if (r.data.question) setQuestion(r.data.question);
                })
                .catch(() => setErr('Could not load question'));
        }
    }, [interviewId, question]);

    const submit = async () => {
        if (!question) return;
        setLoading(true);
        setErr('');
        try {
            const { data } = await api.post(`/api/v1/student/interviews/${interviewId}/submit-answer`, {
                question_id: question.id,
                answer,
                speech_meta: { words_per_minute: Math.min(200, Math.max(80, answer.split(/\s+/).length * 2)) },
            });
            if (data.completed && data.report_id) {
                navigate(`/report/${data.report_id}`);
                return;
            }
            setQuestion(data.next_question);
            setAnswer('');
            setIdx((i) => i + 1);
        } catch (e) {
            setErr(e.response?.data?.detail || 'Submit failed');
        } finally {
            setLoading(false);
        }
    };

    if (!question) {
        return <div className="max-w-6xl mx-auto px-4 py-20 text-center text-zinc-400">{err || 'Loading…'}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 min-h-[calc(100vh-80px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-sm font-medium text-zinc-400">Question {idx + 1} of {total}</h2>
                    <div className="flex gap-1 mt-1">
                        {Array.from({ length: total }).map((_, i) => (
                            <div key={i} className={`h-1 w-8 rounded-full ${i <= idx ? 'bg-blue-500' : 'bg-zinc-700'}`} />
                        ))}
                    </div>
                </div>
                <Link to="/dashboard" className="text-zinc-500 hover:text-white text-sm flex items-center gap-1"><Power className="w-4 h-4" /> Exit</Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 flex-1">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 flex flex-col gap-4">
                    <Card className="p-6 flex-1">
                        <p className="text-xs uppercase text-blue-400 mb-2">{question.category} · {question.difficulty}</p>
                        <h3 className="text-xl font-medium leading-relaxed">{question.text}</h3>
                    </Card>
                    <Card className="p-4">
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Type your answer…"
                            className="w-full bg-transparent border border-zinc-700 rounded-lg p-4 min-h-[160px] text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex justify-between mt-4">
                            <Button type="button" variant={isRecording ? 'primary' : 'outline'} size="sm" onClick={() => setIsRecording(!isRecording)}>
                                {isRecording ? <><Mic className="w-4 h-4" /> Listening</> : <><MicOff className="w-4 h-4" /> Voice (demo)</>}
                            </Button>
                            <Button onClick={submit} disabled={loading || answer.length < 5}>
                                <Send className="w-4 h-4 mr-2" /> {loading ? 'Scoring…' : 'Submit'}
                            </Button>
                        </div>
                        {err && <p className="text-red-400 text-sm mt-2">{err}</p>}
                    </Card>
                </motion.div>
                <Card className="p-4 h-fit">
                    <h4 className="font-medium mb-2">AI coach</h4>
                    <p className="text-sm text-zinc-400">Aim for structured answers. Behavioral prompts reward STAR format.</p>
                </Card>
            </div>
        </div>
    );
}
