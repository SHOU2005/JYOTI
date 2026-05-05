import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Rocket, ShieldCheck, LogOut, Moon, Sun, LayoutDashboard } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const { theme, toggle } = useTheme();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', path: '/#features' },
        { name: 'How it Works', path: '/#how-it-works' },
    ];

    const studentLinks = user?.role === 'student' ? [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Mock Interviews', path: '/mock-interviews' },
        { name: 'Jobs', path: '/jobs' },
        { name: 'Resume', path: '/resume' },
        { name: 'Schedule', path: '/schedule' },
        { name: 'Leaderboard', path: '/leaderboard' },
    ] : [];

    const adminLinks = user?.role === 'admin' ? [
        { name: 'Admin', path: '/admin' },
    ] : [];

    const bar = theme === 'dark'
        ? (scrolled ? 'bg-[#0f0f13]/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent')
        : (scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-zinc-200' : 'bg-transparent');

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bar}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            InterviewIQ
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link key={link.name} to={link.path} className="text-sm font-medium text-zinc-400 hover:text-white dark:hover:text-white hover:text-zinc-900 transition-colors">
                                {link.name}
                            </Link>
                        ))}
                        {[...studentLinks, ...adminLinks].map((link) => (
                            <Link key={link.path} to={link.path} className="text-sm font-medium text-blue-400 hover:text-blue-300">
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <button type="button" onClick={toggle} className="p-2 rounded-lg text-zinc-400 hover:bg-white/5" aria-label="Toggle theme">
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        {isAuthenticated ? (
                            <>
                                <span className="text-sm text-zinc-500 max-w-[140px] truncate">{user?.name}</span>
                                <button type="button" onClick={() => logout()} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
                                    <LogOut className="w-4 h-4" /> Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">Log in</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button variant="primary" size="sm" className="gap-2">
                                        Get Started <Rocket className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="md:hidden flex items-center gap-2">
                        <button type="button" onClick={toggle} className="p-2 text-zinc-400">
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-400 hover:text-white p-2">
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-[#0f0f13] border-b border-white/10 overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-4">
                            {[...navLinks, ...studentLinks, ...adminLinks].map((link) => (
                                <Link key={link.path + link.name} to={link.path} className="block text-zinc-400 hover:text-white" onClick={() => setIsOpen(false)}>
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 flex flex-col gap-3">
                                {isAuthenticated ? (
                                    <button type="button" onClick={() => { logout(); setIsOpen(false); }} className="text-left text-red-400">Log out</button>
                                ) : (
                                    <>
                                        <Link to="/login" onClick={() => setIsOpen(false)}><Button variant="outline" className="w-full justify-center">Log in</Button></Link>
                                        <Link to="/signup" onClick={() => setIsOpen(false)}><Button variant="primary" className="w-full justify-center">Get Started</Button></Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
