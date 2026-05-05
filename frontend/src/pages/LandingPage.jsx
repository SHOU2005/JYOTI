import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, BrainCircuit, LineChart, FileText, Briefcase } from 'lucide-react';
import Button from '../components/ui/Button';

const LandingPage = () => {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative isolate pt-14">
                <div
                    className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                    aria-hidden="true"
                >
                    <div
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>
                <div className="py-24 sm:py-32 lg:pb-40">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                                Master Your Next Interview with <span className="text-indigo-600">AI Intelligence</span>
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                Practice with our AI interviewer, get real-time feedback, analyze your resume, and find the perfect job match. Elevate your career preparation today.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <Link to="/signup">
                                    <Button size="lg" className="gap-2">
                                        Start Interviewing <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900">
                                    Log in <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </div>
                        <div className="mt-16 flow-root sm:mt-24">
                            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                                <img
                                    src="https://tailwindui.com/img/component-images/project-app-screenshot.png"
                                    alt="App screenshot"
                                    width={2432}
                                    height={1442}
                                    className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600">Everything you need</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Comprehensive Interview Preparation
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Our platform provides a holistic approach to interview readiness, combining AI technology with proven strategies.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                <BrainCircuit className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                                AI Mock Interviews
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                <p className="flex-auto">
                                    Experience realistic interview scenarios with our advanced AI. It adapts to your responses and simulates various interview styles.
                                </p>
                            </dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                <FileText className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                                Resume Analysis
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                <p className="flex-auto">
                                    Upload your resume and get instant feedback on formatting, keywords, and content improvements to beat the ATS.
                                </p>
                            </dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                <Briefcase className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                                Smart Job Matching
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                <p className="flex-auto">
                                    Get personalized job recommendations based on your skills, experience, and interview performance.
                                </p>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Testimonials */}
            <div className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-xl text-center">
                        <h2 className="text-lg font-semibold leading-8 tracking-tight text-indigo-600">Testimonials</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Trusted by students nationwide
                        </p>
                    </div>
                    <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-2xl bg-gray-50 p-6 leading-6">
                                <blockquote className="text-gray-900">
                                    <p>“InterviewIQ helped me identify my weak spots in technical interviews. The feedback was incredibly detailed and actionable.”</p>
                                </blockquote>
                                <figcaption className="mt-6 flex items-center gap-x-4">
                                    <div className="h-10 w-10 rounded-full bg-gray-200"></div> {/* Avatar Placeholder */}
                                    <div>
                                        <div className="font-semibold">Sarah Johnson</div>
                                        <div className="text-gray-600">Computer Science Student</div>
                                    </div>
                                </figcaption>
                            </div>
                            <div className="rounded-2xl bg-gray-50 p-6 leading-6">
                                <blockquote className="text-gray-900">
                                    <p>“The resume analysis tool is a game changer. I got twice as many callbacks after optimizing my resume with their suggestions.”</p>
                                </blockquote>
                                <figcaption className="mt-6 flex items-center gap-x-4">
                                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                                    <div>
                                        <div className="font-semibold">Michael Chen</div>
                                        <div className="text-gray-600">Business Major</div>
                                    </div>
                                </figcaption>
                            </div>
                            <div className="rounded-2xl bg-gray-50 p-6 leading-6">
                                <blockquote className="text-gray-900">
                                    <p>“I was nervous about my first behavioral interview. Monitoring my confidence score helped me improve my tone and pacing significantly.”</p>
                                </blockquote>
                                <figcaption className="mt-6 flex items-center gap-x-4">
                                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                                    <div>
                                        <div className="font-semibold">Emily Davis</div>
                                        <div className="text-gray-600">Engineering Graduate</div>
                                    </div>
                                </figcaption>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default LandingPage;
