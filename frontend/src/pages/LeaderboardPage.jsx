import React from 'react';
import { Medal, Trophy, TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const LeaderboardPage = () => {
    // Mock Leaderboard Data
    const students = [
        { rank: 1, name: "Jessica Smith", university: "Stanford University", score: 98, trend: 'up' },
        { rank: 2, name: "David Kim", university: "MIT", score: 96, trend: 'up' },
        { rank: 3, name: "Rahul Sharma", university: "IIT Bombay", score: 94, trend: 'same' },
        { rank: 4, name: "Sarah Connor", university: "UC Berkeley", score: 91, trend: 'down' },
        { rank: 5, name: "James Bond", university: "Oxford", score: 89, trend: 'up' },
        { rank: 6, name: "Emily Watson", university: "Harvard", score: 88, trend: 'same' },
        { rank: 7, name: "Michael Chang", university: "National University of Singapore", score: 86, trend: 'down' },
        { rank: 8, name: "Priya Patel", university: "Delhi University", score: 85, trend: 'up' },
        { rank: 9, name: "Tom Holland", university: "Cambridge", score: 84, trend: 'same' },
        { rank: 10, name: "Zendaya Coleman", university: "UCLA", score: 82, trend: 'up' },
    ];

    const getRankIcon = (rank) => {
        if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
        if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
        return <span className="text-gray-500 font-bold w-6 text-center">{rank}</span>;
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Global Leaderboard</h1>
                    <p className="text-sm text-gray-500">See where you stand among students worldwide.</p>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rank
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    University
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Score
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student.rank} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50">
                                            {getRankIcon(student.rank)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{student.university}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-sm font-bold text-gray-900 mr-2">{student.score}</span>
                                            {student.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default LeaderboardPage;
