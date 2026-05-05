import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const StudentsList = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const students = [
        { id: 1, name: "Alice Johnson", email: "alice@stanford.edu", score: 88, status: "Ready", interviews: 12 },
        { id: 2, name: "Bob Smith", email: "bob@mit.edu", score: 72, status: "In Progress", interviews: 5 },
        { id: 3, name: "Charlie Brown", email: "charlie@ucb.edu", score: 95, status: "Placed", interviews: 15 },
        { id: 4, name: "Diana Prince", email: "diana@harvard.edu", score: 65, status: "Needs Support", interviews: 3 },
        { id: 5, name: "Evan Wright", email: "evan@nyu.edu", score: 78, status: "Ready", interviews: 8 },
    ];

    const filteredStudents = students.filter(
        student => student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
                <div className="flex gap-2">
                    <Button variant="secondary" className="gap-2">
                        <Filter className="h-4 w-4" /> Filter
                    </Button>
                    <Button>Export CSV</Button>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Readiness Score
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Interviews
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
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
                                        <div className="text-sm text-gray-500">{student.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${student.score}%` }}></div>
                                            </div>
                                            <span className="text-sm text-gray-900">{student.score}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {student.interviews}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge
                                            variant={student.status === 'Ready' || student.status === 'Placed' ? 'success' : student.status === 'Needs Support' ? 'danger' : 'warning'}
                                        >
                                            {student.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-gray-400 hover:text-gray-500">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    {/* Pagination could go here */}
                    <div className="flex justify-between items-center sm:justify-end">
                        <div className="text-sm text-gray-700 mr-4">
                            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredStudents.length}</span> of <span className="font-medium">{students.length}</span> results
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default StudentsList;
