import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrainCircuit, Settings } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="bg-indigo-600 rounded-lg p-1.5">
                            <BrainCircuit className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg text-white">InterviewIQ</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Features</a>
                        <a href="#how-it-works" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">How it Works</a>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="text-gray-400 hover:text-white p-2 rounded-md transition-colors">
                            <Settings className="h-5 w-5" />
                        </button>
                        {!user ? (
                            <>
                                <Link to="/login" className="text-gray-300 hover:text-white text-sm font-medium px-3 py-2 transition-colors">Log in</Link>
                                <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
                                    Get Started ✦
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 text-sm font-medium transition-colors">
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
