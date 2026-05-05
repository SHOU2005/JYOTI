import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-[#0f0f13] border-t border-white/10 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            InterviewIQ
                        </Link>
                        <p className="text-zinc-400 text-sm">
                            © {new Date().getFullYear()} InterviewIQ. All rights reserved.
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link to="#" className="text-zinc-400 hover:text-white transition-colors">
                            <Twitter className="w-5 h-5" />
                        </Link>
                        <Link to="#" className="text-zinc-400 hover:text-white transition-colors">
                            <Linkedin className="w-5 h-5" />
                        </Link>
                        <Link to="#" className="text-zinc-400 hover:text-white transition-colors">
                            <Github className="w-5 h-5" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-8">
                        <Link to="/privacy" className="text-sm text-zinc-400 hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="text-sm text-zinc-400 hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
