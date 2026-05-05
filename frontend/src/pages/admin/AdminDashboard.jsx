import React from 'react';
import { Users, BookOpen, Briefcase, TrendingUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import PerformanceChart from '../../components/charts/PerformanceChart';
import SkillChart from '../../components/charts/SkillChart'; // Reusing skill chart for aggregate data

const AdminDashboard = () => {
    // Mock Aggregate Data
    const stats = [
        { name: 'Total Students', value: '1,240', icon: Users, change: '+12% this month', changeType: 'positive' },
        { name: 'Interviews Conducted', value: '8,500+', icon: BookOpen, change: '+24% this month', changeType: 'positive' },
        { name: 'Placement Readiness', value: '68%', icon: Briefcase, change: '+5% this month', changeType: 'positive' },
        { name: 'Avg. Score', value: '76%', icon: TrendingUp, change: 'Steady', changeType: 'neutral' },
    ];

    const performanceData = [
        { date: 'Week 1', score: 65 },
        { date: 'Week 2', score: 68 },
        { date: 'Week 3', score: 72 },
        { date: 'Week 4', score: 76 },
        { date: 'Week 5', score: 75 },
    ];

    const skillGapData = [
        { skill: 'Data Structures', score: 60 },
        { skill: 'System Design', score: 55 },
        { skill: 'Communication', score: 85 },
        { skill: 'React/Frontend', score: 78 },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Card key={item.name} className="px-4 py-5 sm:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                                    <Icon className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900">{item.value}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center text-sm">
                                <span className="text-green-600 font-medium">{item.change}</span>
                                <span className="text-gray-500 ml-2">vs last month</span>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900">Cohort Performance Trend</h2>
                    <PerformanceChart data={performanceData} />
                </div>
                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900">Skill Gap Analysis (Average)</h2>
                    <SkillChart data={skillGapData} />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
