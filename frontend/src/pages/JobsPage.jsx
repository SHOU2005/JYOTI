import React from 'react';
import { Briefcase, MapPin, DollarSign, ArrowUpRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const JobsPage = () => {
    // Mock Job Data
    const jobs = [
        {
            id: 1,
            title: "Frontend Developer",
            company: "TechFlow Solutions",
            location: "Remote",
            salary: "$80k - $120k",
            match: 95,
            skills: ["React", "TypeScript", "Tailwind"],
            missingSkills: [],
            posted: "2 days ago",
            logo: "TF"
        },
        {
            id: 2,
            title: "React Native Engineer",
            company: "AppWorks",
            location: "New York, NY",
            salary: "$100k - $140k",
            match: 82,
            skills: ["React Native", "Redux"],
            missingSkills: ["GraphQL"],
            posted: "5 days ago",
            logo: "AW"
        },
        {
            id: 3,
            title: "Full Stack Developer",
            company: "Innovate Inc",
            location: "San Francisco, CA",
            salary: "$130k - $160k",
            match: 65,
            skills: ["React", "Node.js"],
            missingSkills: ["AWS", "Docker"],
            posted: "1 week ago",
            logo: "IN"
        }
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Recommended Jobs</h1>
                    <p className="text-sm text-gray-500">Based on your skills and interview performance.</p>
                </div>
            </div>

            <div className="space-y-4">
                {jobs.map((job) => (
                    <Card key={job.id} className="p-6 transition-all hover:shadow-md border-l-4" style={{ borderLeftColor: job.match >= 90 ? '#10B981' : job.match >= 75 ? '#F59E0B' : '#E5E7EB' }}>
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-500 flex-shrink-0">
                                    {job.logo}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                                    <p className="text-sm font-medium text-gray-600">{job.company}</p>

                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-3.5 w-3.5" />
                                            {job.salary}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Briefcase className="h-3.5 w-3.5" />
                                            {job.posted}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {job.skills.map(skill => (
                                            <Badge key={skill} variant="gray" className="bg-gray-100 text-gray-600">{skill}</Badge>
                                        ))}
                                        {job.missingSkills.map(skill => (
                                            <Badge key={skill} variant="danger" className="bg-red-50 text-red-600 border border-red-100 opacity-70">Missing: {skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-start sm:items-end justify-between min-w-[140px]">
                                <div className="text-right">
                                    <div className="text-sm text-gray-500 mb-1">Match Score</div>
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${job.match >= 90 ? 'bg-green-500' : job.match >= 75 ? 'bg-yellow-500' : 'bg-gray-400'}`}
                                                style={{ width: `${job.match}%` }}
                                            />
                                        </div>
                                        <span className="font-bold text-gray-900">{job.match}%</span>
                                    </div>
                                </div>
                                <Button className="mt-4 w-full sm:w-auto gap-2">
                                    Apply Now <ArrowUpRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default JobsPage;
