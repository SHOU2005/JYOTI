import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ScoreRadarChart from '../components/charts/ScoreRadarChart';

const ReportPage = () => {
    // Mock data - in a real app, this would come from location state or an API call based on ID
    const reportData = {
        title: "Frontend Developer Mock Interview",
        date: "Feb 20, 2024",
        overallScore: 78,
        summary: "Strong technical knowledge in React core concepts. Good communication skills. Needs improvement in system design and optimization techniques.",
        strengths: [
            "Clear explanation of React Hooks",
            "Good understanding of State vs Props",
            "Confident delivery"
        ],
        weaknesses: [
            "Struggled with performance optimization question",
            "Could provide more concrete examples"
        ],
        suggestions: [
            "Review React.memo and useMemo for performance",
            "Practice STAR method for behavioral questions"
        ],
        radarData: [
            { subject: 'Technical', A: 85, fullMark: 100 },
            { subject: 'Communication', A: 80, fullMark: 100 },
            { subject: 'Problem Solving', A: 70, fullMark: 100 },
            { subject: 'Confidence', A: 90, fullMark: 100 },
            { subject: 'Cultural Fit', A: 65, fullMark: 100 },
        ]
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Link to="/dashboard" className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 mb-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{reportData.title}</h1>
                    <p className="text-sm text-gray-500">Completed on {reportData.date}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="gap-2">
                        <Share2 className="h-4 w-4" /> Share
                    </Button>
                    <Button className="gap-2">
                        <Download className="h-4 w-4" /> Download PDF
                    </Button>
                </div>
            </div>

            {/* Overall Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 md:col-span-1 flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Overall Score</h3>
                    <div className="relative flex items-center justify-center">
                        <svg className="transform -rotate-90 w-32 h-32">
                            <circle cx="64" cy="64" r="56" stroke="#E5E7EB" strokeWidth="8" fill="transparent" />
                            <circle cx="64" cy="64" r="56" stroke="#4F46E5" strokeWidth="8" fill="transparent" strokeDasharray={351.86} strokeDashoffset={351.86 - (351.86 * reportData.overallScore) / 100} />
                        </svg>
                        <span className="absolute text-3xl font-bold text-gray-900">{reportData.overallScore}%</span>
                    </div>
                    <Badge
                        variant={reportData.overallScore >= 70 ? 'success' : 'warning'}
                        className="mt-4 text-sm px-3 py-1"
                    >
                        {reportData.overallScore >= 70 ? 'Passed' : 'Needs Improvement'}
                    </Badge>
                </Card>

                <div className="md:col-span-2">
                    <ScoreRadarChart data={reportData.radarData} />
                </div>
            </div>

            {/* Detailed Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <h3 className="text-lg font-medium text-gray-900">Strengths</h3>
                    </div>
                    <ul className="space-y-3">
                        {reportData.strengths.map((item, index) => (
                            <li key={index} className="flex gap-3 text-sm text-gray-600">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <h3 className="text-lg font-medium text-gray-900">Areas for Improvement</h3>
                    </div>
                    <ul className="space-y-3">
                        {reportData.weaknesses.map((item, index) => (
                            <li key={index} className="flex gap-3 text-sm text-gray-600">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            <Card className="p-6 bg-indigo-50 border-indigo-100">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Lightbulb className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-indigo-900 mb-2">AI Suggestions</h3>
                        <ul className="space-y-2">
                            {reportData.suggestions.map((item, index) => (
                                <li key={index} className="text-sm text-indigo-800 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-indigo-500 rounded-full" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ReportPage;
