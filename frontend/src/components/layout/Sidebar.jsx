import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, FileText, Upload, Briefcase, Award, LogOut, Users, BarChart, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import clsx from 'clsx';

const Sidebar = ({ role }) => {
    const location = useLocation();
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const studentLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Interview', path: '/interview', icon: MessageSquare },
        { name: 'Reports', path: '/report', icon: FileText },
        { name: 'Resume', path: '/resume', icon: Upload },
        { name: 'Jobs', path: '/jobs', icon: Briefcase },
        { name: 'Leaderboard', path: '/leaderboard', icon: Award },
    ];

    const adminLinks = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Students', path: '/admin/students', icon: Users },
        { name: 'Analytics', path: '/admin/analytics', icon: BarChart },
    ];

    const links = role === 'admin' ? adminLinks : studentLinks;

    return (
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col py-6 sticky top-0 h-screen overflow-y-auto">
            <div className="px-6 mb-8 flex items-center gap-2">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">IQ</div>
                <span className="font-bold text-xl text-gray-900">InterviewIQ</span>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon className={clsx("h-5 w-5", isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500")} />
                            {link.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="px-4 mt-auto border-t border-gray-200 pt-4 space-y-2">
                <button
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    Log out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
