import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, BrainCircuit, LineChart, FileText, Briefcase, CheckCircle2 } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="bg-gray-950 text-white min-h-screen">
            {/* Hero */}
            <div className="relative pt-32 pb-24 px-6 overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl" />
                    <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl" />
                </div>

                <div className="max-w-4xl mx-auto text-center">
                    {/* Trust badge */}
                    <div className="inline-flex items-center gap-2 bg-gray-800/60 border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-300 mb-10">
                        <ShieldCheck className="h-4 w-4 text-indigo-400" />
                        Trusted by 200+ Universities &amp; Placement Cells
                    </div>

                    {/* Heading */}
                    <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-tight">
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent block">
                            INTERVIEWIQ
                        </span>
                        <span className="text-white">AI-Powered Smart</span>
                        <br />
                        <span className="text-white">Interview Intelligence</span>
                    </h1>

                    {/* Description */}
                    <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
                        The enterprise platform universities and placement cells trust to conduct, proctor, and evaluate thousands of AI-driven interviews — scoring candidates across{' '}
                        <span className="text-white font-semibold">13 professional dimensions</span>{' '}
                        in real-time with zero manual effort.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/signup"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2 text-base"
                        >
                            Get Started Free <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            to="/login"
                            className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div id="features" className="py-24 px-6 border-t border-gray-800">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">Everything you need</p>
                        <h2 className="text-4xl font-bold text-white">Comprehensive Interview Intelligence</h2>
                        <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
                            A complete platform for universities and placement cells to automate and scale their hiring process.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: BrainCircuit, title: 'AI Mock Interviews', desc: 'Conduct realistic AI-driven interviews that adapt to responses and simulate real hiring scenarios.' },
                            { icon: FileText, title: 'Resume Analysis', desc: 'Instantly score resumes on ATS compatibility, keyword density, and content quality.' },
                            { icon: Briefcase, title: 'Smart Job Matching', desc: 'Match candidates to roles based on skills, performance scores, and profile fit.' },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-colors">
                                <div className="bg-indigo-600/10 rounded-xl p-3 w-fit mb-4">
                                    <Icon className="h-6 w-6 text-indigo-400" />
                                </div>
                                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How it works */}
            <div id="how-it-works" className="py-24 px-6 border-t border-gray-800">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">Simple Process</p>
                    <h2 className="text-4xl font-bold text-white mb-16">Up and running in minutes</h2>
                    <div className="space-y-6 text-left">
                        {[
                            'Sign up your institution and configure interview templates',
                            'Students register with their university email and take AI interviews',
                            'Get detailed reports scored across 13 professional dimensions',
                            'Export placement data and connect candidates with employers',
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
                                <span className="bg-indigo-600 text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                <p className="text-gray-300">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-8 px-6 text-center text-gray-500 text-sm">
                &copy; 2026 InterviewIQ. All rights reserved.
            </footer>
        </div>
    );
};

export default LandingPage;
