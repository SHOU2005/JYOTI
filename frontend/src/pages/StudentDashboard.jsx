import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle, Clock, Award, PlayCircle, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PerformanceChart from '../components/charts/PerformanceChart';
import SkillChart from '../components/charts/SkillChart';

const StudentDashboard = () => {
    const { user } = useAuth();

    // Mock Data
    const stats = [
        { name: 'Total Interviews', value: '12', icon: Clock, change: '+2 this week', changeType: 'positive' },
        { name: 'Average Score', value: '78%', icon: Award, change: '+5.4% higher', changeType: 'positive' },
        { name: 'Confidence Score', value: '85%', icon: CheckCircle, change: 'High Readiness', changeType: 'neutral' },
    ];

    const performanceData = [
        { date: 'Jan 1', score: 65 },
        { date: 'Jan 8', score: 70 },
        { date: 'Jan 15', score: 68 },
        { date: 'Jan 22', score: 75 },
        { date: 'Jan 29', score: 82 },
        { date: 'Feb 5', score: 78 },
        { date: 'Feb 12', score: 85 },
    ];

    const skillData = [
        { skill: 'Technical', score: 85 },
        { skill: 'Communication', score: 72 },
        { skill: 'Problem Solving', score: 90 },
        { skill: 'Culture Fit', score: 78 },
    ];

    const recentInterviews = [
        { id: 1, title: 'Frontend Developer Mock', date: '2 days ago', score: 85, status: 'Completed' },
        { id: 2, title: 'Behavioral Round', date: '5 days ago', score: 72, status: 'Completed' },
        { id: 3, title: 'System Design', date: '1 week ago', score: 65, status: 'Needs Improvement' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name.split(' ')[0]}!</h1>
                    <p className="text-sm text-gray-500 mt-1">Here's what's happening with your interview preparation.</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/resume">
                        <Button variant="secondary" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Resume
                        </Button>
                    </Link>
                    <Link to="/interview">
                        <Button className="gap-2">
                            <PlayCircle className="h-4 w-4" />
                            Start New Interview
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {stats.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Card key={item.name} className="px-4 py-5 sm:p-6">
                            <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                                <div className="flex items-baseline text-2xl font-semibold text-indigo-600">
                                    {item.value}
                                </div>
                                <div className="inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0">
                                    <span className="text-green-600 bg-green-100 rounded-full px-2 py-0.5 text-xs">
                                        {item.change}
                                    </span>
                                </div>
                            </dd>
                        </Card>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PerformanceChart data={performanceData} />
                <SkillChart data={skillData} />
            </div>

            {/* Recent Activity */}
            <Card className="overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Interviews</h3>
                </div>
                <ul role="list" className="divide-y divide-gray-200">
                    {recentInterviews.map((interview) => (
                        <li key={interview.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <p className="text-sm font-medium text-indigo-600 truncate">{interview.title}</p>
                                    <p className="flex items-center text-sm text-gray-500 mt-1">
                                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                        {interview.date}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <span className="text-sm font-medium text-gray-900">Score: {interview.score}%</span>
                                        <Badge
                                            variant={interview.score >= 80 ? 'success' : interview.score >= 70 ? 'warning' : 'danger'}
                                        >
                                            {interview.status}
                                        </Badge>
                                    </div>
                                    <ArrowUpRight className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                        <Link to="/report" className="font-medium text-indigo-600 hover:text-indigo-500">
                            View all reports <span aria-hidden="true">&rarr;</span>
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default StudentDashboard;
