import React from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';

const ScoreRadarChart = ({ data }) => {
    return (
        <Card className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Competency Map</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#E5E7EB" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Candidate"
                            dataKey="A"
                            stroke="#4F46E5"
                            strokeWidth={2}
                            fill="#4F46E5"
                            fillOpacity={0.4}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default ScoreRadarChart;
