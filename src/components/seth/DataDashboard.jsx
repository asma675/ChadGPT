import React, { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataVisualization } from "@/api/entities";
import { UploadFile, InvokeLLM } from "@/api/integrations";
import { X, Upload, Loader2, BarChart3, Trash2, MessageSquare } from "lucide-react";
import DataVisualization from "./DataVisualization";

export default function DataDashboard({ onClose, onAskQuestion }) {
    const [visualizations, setVisualizations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedViz, setSelectedViz] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchVisualizations();
    }, []);

    const fetchVisualizations = async () => {
        setIsLoading(true);
        const vizs = await DataVisualization.list('-created_date', 50);
        setVisualizations(vizs);
        setIsLoading(false);
    };

    const parseCSV = (text) => {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj = {};
            headers.forEach((header, i) => {
                const val = values[i];
                obj[header] = isNaN(val) ? val : parseFloat(val);
            });
            return obj;
        });
    };

    const handleFileUpload = async (file) => {
        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            const response = await fetch(file_url);
            const text = await response.text();

            let data;
            if (file.name.endsWith('.json')) {
                data = JSON.parse(text);
            } else if (file.name.endsWith('.csv')) {
                data = parseCSV(text);
            } else {
                throw new Error('Unsupported file format');
            }

            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Invalid data format');
            }

            // Analyze data with AI
            const analysis = await InvokeLLM({
                prompt: `Analyze this dataset and suggest the best visualization approach:
Data sample (first 3 rows): ${JSON.stringify(data.slice(0, 3))}
Total rows: ${data.length}
Columns: ${Object.keys(data[0]).join(', ')}

Return a JSON object with:
{
  "chart_type": "line|bar|area|pie|scatter",
  "xKey": "column_name_for_x_axis",
  "yKeys": ["column_names_for_y_axis"],
  "nameKey": "column_for_pie_chart_names",
  "valueKey": "column_for_pie_chart_values",
  "name": "Chart title",
  "description": "Brief description",
  "insights": "Key insights from the data"
}`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        chart_type: { type: "string" },
                        xKey: { type: "string" },
                        yKeys: { type: "array", items: { type: "string" } },
                        nameKey: { type: "string" },
                        valueKey: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                        insights: { type: "string" }
                    }
                }
            });

            const config = {
                xKey: analysis.xKey,
                yKeys: analysis.yKeys,
                nameKey: analysis.nameKey,
                valueKey: analysis.valueKey
            };

            await DataVisualization.create({
                name: analysis.name,
                description: analysis.description,
                chart_type: analysis.chart_type,
                data: data,
                config: config,
                insights: analysis.insights,
                source_file: file.name
            });

            fetchVisualizations();
        } catch (error) {
            console.error('Data processing failed:', error);
            alert('Failed to process data file. Please check format and try again.');
        }
        setIsUploading(false);
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this visualization?')) {
            await DataVisualization.delete(id);
            fetchVisualizations();
        }
    };

    const handleAskAboutData = (viz) => {
        const context = `Data: ${JSON.stringify(viz.data.slice(0, 5))}... (${viz.data.length} total rows)`;
        onAskQuestion(`Tell me more about this ${viz.chart_type} chart: ${viz.name}. ${context}`);
        onClose();
    };

    return (
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-4xl bg-black border-l border-cyan-500/50 shadow-2xl shadow-cyan-500/20 p-6 z-50 text-white overflow-y-auto"
        >
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-2xl font-bold text-cyan-300">Data Dashboard</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-6 w-6" />
                </Button>
            </div>

            <div className="mb-6">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                />
                <Button
                    variant="outline"
                    className="w-full bg-transparent border-cyan-400/50 hover:bg-cyan-400/20"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Upload Data File (CSV/JSON)
                </Button>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                    </div>
                ) : visualizations.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No visualizations yet.</p>
                        <p className="text-sm mt-1">Upload a CSV or JSON file to get started.</p>
                    </div>
                ) : (
                    visualizations.map(viz => (
                        <div key={viz.id} className="relative group">
                            <DataVisualization visualization={viz} />
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 bg-black/80 border-cyan-400/50"
                                    onClick={() => handleAskAboutData(viz)}
                                    title="Ask SETH about this data"
                                >
                                    <MessageSquare className="h-4 w-4 text-cyan-400" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 bg-black/80 border-red-400/50"
                                    onClick={() => handleDelete(viz.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-red-400" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
}