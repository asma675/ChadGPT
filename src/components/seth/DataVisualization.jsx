import React from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card } from "@/components/ui/card";

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

export default function DataVisualization({ visualization }) {
    const { chart_type, data, config, name, description, insights } = visualization;

    const renderChart = () => {
        switch (chart_type) {
            case 'line':
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey={config?.xKey || 'name'} stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                        <Legend />
                        {config?.yKeys?.map((key, i) => (
                            <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} />
                        ))}
                    </LineChart>
                );
            
            case 'bar':
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey={config?.xKey || 'name'} stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                        <Legend />
                        {config?.yKeys?.map((key, i) => (
                            <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </BarChart>
                );
            
            case 'area':
                return (
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey={config?.xKey || 'name'} stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                        <Legend />
                        {config?.yKeys?.map((key, i) => (
                            <Area key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.6} />
                        ))}
                    </AreaChart>
                );
            
            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey={config?.valueKey || 'value'}
                            nameKey={config?.nameKey || 'name'}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                        <Legend />
                    </PieChart>
                );
            
            case 'scatter':
                return (
                    <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey={config?.xKey || 'x'} stroke="#9ca3af" name={config?.xLabel || 'X'} />
                        <YAxis dataKey={config?.yKey || 'y'} stroke="#9ca3af" name={config?.yLabel || 'Y'} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Scatter name={name} data={data} fill={COLORS[0]} />
                    </ScatterChart>
                );
            
            default:
                return <div className="text-gray-400">Unsupported chart type</div>;
        }
    };

    return (
        <Card className="p-4 bg-gray-900/50 border-cyan-500/30">
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">{name}</h3>
            {description && <p className="text-sm text-gray-400 mb-4">{description}</p>}
            
            <ResponsiveContainer width="100%" height={300}>
                {renderChart()}
            </ResponsiveContainer>

            {insights && (
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <h4 className="text-sm font-semibold text-purple-400 mb-2">Insights</h4>
                    <p className="text-sm text-gray-300">{insights}</p>
                </div>
            )}
        </Card>
    );
}