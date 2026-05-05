import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Mail, Lock, User, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);
    const { signupRequest, signupVerify } = useAuth();
    const navigate = useNavigate();

    const requestOtp = async (e) => {
        e.preventDefault();
        setErr('');
        setLoading(true);
        try {
            const { data } = await signupRequest(email);
            setMsg(data.dev_otp ? `Development OTP: ${data.dev_otp}` : 'Check your university email for the OTP.');
            setStep(2);
        } catch (e) {
            setErr(e.response?.data?.detail || 'Request failed. Please check your email and try again.');
        } finally {
            setLoading(false);
        }
    };

    const verify = async (e) => {
        e.preventDefault();
        setErr('');
        setLoading(true);
        try {
            await signupVerify({ email, otp, name, password });
            navigate('/dashboard');
        } catch (e) {
            setErr(e.response?.data?.detail || 'Verification failed. Incorrect OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8 overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[440px] relative z-10">
                <Card className="p-8 backdrop-blur-xl bg-[#121216]/80 border-white/5 shadow-2xl overflow-hidden relative">
                    {/* Inner subtle glow */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40 opacity-50" />
                    
                    <div className="text-center mb-8 relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/25 ring-1 ring-white/10">
                            {step === 1 ? <ShieldCheck className="w-8 h-8 text-white" /> : <CheckCircle2 className="w-8 h-8 text-white" />}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60 mb-2">
                            {step === 1 ? 'Create Account' : 'Verify Email'}
                        </h1>
                        <p className="text-sm text-zinc-400">
                            {step === 1 ? 'Start your interview journey today.' : `We've sent a code to ${email}`}
                        </p>
                    </div>

                    {step === 1 && (
                        <form className="space-y-5 animate-in fade-in" onSubmit={requestOtp}>
                            {err && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center">
                                    {err}
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-300 ml-1">University Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                                        placeholder="you@iilm.edu"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-12 text-[15px] font-semibold mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 border-0 transition-all duration-300 transform active:scale-[0.98]" disabled={loading}>
                                {loading ? 'Sending Code...' : 'Continue'}
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300" onSubmit={verify}>
                            {msg && (
                                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-400 text-center font-mono">
                                    {msg}
                                </div>
                            )}
                            {err && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center">
                                    {err}
                                </div>
                            )}
                            
                            <div className="space-y-1.5 pt-2">
                                <label className="text-sm font-medium text-zinc-300 ml-1">Verification Code (OTP)</label>
                                <input
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 px-4 text-white text-center tracking-[1em] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                                    placeholder="000000"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-300 ml-1 flex items-center gap-2">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                                        placeholder="Jane Doe"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-300 ml-1 flex items-center gap-2">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-pink-400 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-12 text-[15px] font-semibold mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 border-0 transition-all duration-300 transform active:scale-[0.98]" disabled={loading}>
                                {loading ? 'Creating Account...' : 'Verify & Sign up'}
                            </Button>
                            
                            <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-zinc-500 hover:text-white mt-2 transition-colors">
                                Go Back
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center text-sm text-zinc-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Sign in</Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
