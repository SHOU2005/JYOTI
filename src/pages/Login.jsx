import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Mail, Lock, ShieldCheck, User, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handle = async (e) => {
        e.preventDefault();
        setErr('');
        setLoading(true);
        try {
            const u = await login(email, password);
            navigate(u.role === 'admin' ? '/admin' : '/dashboard');
        } catch (e) {
            setErr(e.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const fillCredentials = (type) => {
        if (type === 'admin') {
            setEmail('admin@iilm.edu');
            setPassword('admin123');
        } else {
            setEmail('student@iilm.edu');
            setPassword('student123');
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8 overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[420px] relative z-10 flex flex-col gap-6">
                <Card className="p-8 backdrop-blur-xl bg-[#121216]/80 border-white/5 shadow-2xl overflow-hidden relative">
                    {/* Inner subtle glow */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-blue-500/40 opacity-50" />
                    
                    <div className="text-center mb-8 relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/25 ring-1 ring-white/10">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60 mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-sm text-zinc-400">Sign in to the Live AI Interview platform</p>
                    </div>

                    <form className="space-y-5" onSubmit={handle}>
                        {err && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center animate-in fade-in slide-in-from-top-2">
                                {err}
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300 ml-1">Email address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                                    placeholder="you@iilm.edu"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12 text-[15px] font-semibold mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 border-0 transition-all duration-300 transform active:scale-[0.98]" disabled={loading}>
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-zinc-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Sign up here</Link>
                    </div>
                </Card>

                {/* Demo Credentials Helper */}
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
                    <button
                        type="button"
                        onClick={() => fillCredentials('student')}
                        className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#121216]/60 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 group cursor-pointer"
                    >
                        <User className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300" />
                        <span className="text-sm font-semibold text-zinc-200">Test Student</span>
                        <span className="text-[11px] text-zinc-500 mt-1">student@iilm.edu</span>
                        <span className="text-[11px] text-zinc-600 font-mono mt-0.5">student123</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => fillCredentials('admin')}
                        className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#121216]/60 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 group cursor-pointer"
                    >
                        <Users className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300" />
                        <span className="text-sm font-semibold text-zinc-200">Test Admin</span>
                        <span className="text-[11px] text-zinc-500 mt-1">admin@iilm.edu</span>
                        <span className="text-[11px] text-zinc-600 font-mono mt-0.5">admin123</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
