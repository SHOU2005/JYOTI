import React, { useState } from 'react';
import { Upload, FileText, Check, X, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const ResumePage = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
            setFile(droppedFile);
            analyzeResume(droppedFile);
        } else {
            alert('Please upload a PDF or DOCX file.');
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            analyzeResume(selectedFile);
        }
    };

    const analyzeResume = (file) => {
        setIsAnalyzing(true);
        // Simulate API call
        setTimeout(() => {
            setAnalysisResult({
                skills: ['React', 'JavaScript', 'Tailwind CSS', 'Node.js', 'Git'],
                experience: [
                    { title: 'Frontend Intern', company: 'Tech Corp', duration: '3 months' }
                ],
                projects: ['E-commerce App', 'Portfolio Website'],
                atsScore: 85,
                missingKeywords: ['Redux', 'TypeScript']
            });
            setIsAnalyzing(false);
        }, 2000);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Resume Analysis</h1>
                    <p className="text-sm text-gray-500">Upload your resume to get AI-powered feedback and job matching.</p>
                </div>
            </div>

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center">
                    <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                        <Upload className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                        {file ? file.name : "Drop your resume here"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 mb-6">
                        Support PDF and DOCX files. Max file size 5MB.
                    </p>

                    <input
                        type="file"
                        id="resume-upload"
                        className="hidden"
                        accept=".pdf,.docx"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="resume-upload">
                        <Button as="span" variant="secondary" className="cursor-pointer">
                            Browse Files
                        </Button>
                    </label>
                </div>
            </div>

            {/* Analysis Result */}
            {isAnalyzing && (
                <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Analyzing your resume...</p>
                </div>
            )}

            {!isAnalyzing && analysisResult && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6 md:col-span-1 border-l-4 border-l-green-500">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">ATS Score</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900">{analysisResult.atsScore}</span>
                                <span className="text-sm text-gray-500">/ 100</span>
                            </div>
                            <p className="text-xs text-green-600 mt-2 font-medium">Good chance of passing screening</p>
                        </Card>
                        <Card className="p-6 md:col-span-2">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Skills Detected</h3>
                            <div className="flex flex-wrap gap-2">
                                {analysisResult.skills.map((skill, i) => (
                                    <Badge key={i} variant="primary">{skill}</Badge>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Experience & Projects</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Experience</h4>
                                    {analysisResult.experience.map((exp, i) => (
                                        <div key={i} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                                            <span className="text-gray-900">{exp.title} at {exp.company}</span>
                                            <span className="text-gray-500">{exp.duration}</span>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Projects</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-600">
                                        {analysisResult.projects.map((proj, i) => (
                                            <li key={i}>{proj}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Improvement Suggestions</h3>
                            <div className="space-y-4">
                                <div className="p-3 bg-yellow-50 rounded-lg">
                                    <h4 className="text-sm font-semibold text-yellow-800 mb-2">Missing Keywords</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysisResult.missingKeywords.map((kw, i) => (
                                            <Badge key={i} variant="warning" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                                {kw}
                                            </Badge>
                                        ))}
                                    </div>
                                    <p className="text-xs text-yellow-700 mt-2">
                                        Adding these skills can increase your match rate for top jobs.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumePage;
