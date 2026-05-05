import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = () => {
    const { user } = useAuth();
    // Default to student role for sidebar if not available, though it should be protected
    const role = user?.role || 'student';

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors">
            <div className="flex-shrink-0">
                <Sidebar role={role} />
            </div>
            <main className="flex-1 overflow-y-auto p-8 relative">
                {/* Top header could go here if needed */}
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
