import React, { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { KnowledgeBase } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { X, Upload, Trash2, FileText, Loader2, Plus, Brain } from "lucide-react";

export default function KnowledgeBasePanel({ onClose }) {
    const [knowledgeBases, setKnowledgeBases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newKB, setNewKB] = useState({ name: '', description: '', content: '' });
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchKnowledgeBases();
    }, []);

    const fetchKnowledgeBases = async () => {
        setIsLoading(true);
        const kbs = await KnowledgeBase.list('-priority', 50);
        setKnowledgeBases(kbs);
        setIsLoading(false);
    };

    const handleFileUpload = async (file) => {
        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            
            // Extract content from file
            const response = await fetch(file_url);
            const text = await response.text();
            
            setNewKB({
                name: file.name.replace(/\.[^/.]+$/, ''),
                description: `Uploaded from ${file.name}`,
                content: text
            });
            setShowAddForm(true);
        } catch (error) {
            console.error('File upload failed:', error);
            alert('Failed to upload file. Please try again.');
        }
        setIsUploading(false);
    };

    const handleCreate = async () => {
        if (!newKB.name || !newKB.content) {
            alert('Please provide a name and content');
            return;
        }

        await KnowledgeBase.create({
            ...newKB,
            active: true,
            priority: 1
        });
        
        setNewKB({ name: '', description: '', content: '' });
        setShowAddForm(false);
        fetchKnowledgeBases();
    };

    const handleToggleActive = async (kb) => {
        await KnowledgeBase.update(kb.id, { active: !kb.active });
        fetchKnowledgeBases();
    };

    const handlePriorityChange = async (kb, priority) => {
        await KnowledgeBase.update(kb.id, { priority: priority[0] });
        fetchKnowledgeBases();
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this knowledge base?')) {
            await KnowledgeBase.delete(id);
            fetchKnowledgeBases();
        }
    };

    return (
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-black border-l border-cyan-500/50 shadow-2xl shadow-cyan-500/20 p-6 z-50 text-white overflow-y-auto"
        >
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Brain className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-2xl font-bold text-cyan-300">Knowledge Bases</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-6 w-6" />
                </Button>
            </div>

            <div className="mb-6 flex gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.doc,.docx,.md"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                />
                <Button
                    variant="outline"
                    className="flex-1 bg-transparent border-cyan-400/50 hover:bg-cyan-400/20"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Upload Document
                </Button>
                <Button
                    variant="outline"
                    className="flex-1 bg-transparent border-green-400/50 hover:bg-green-400/20"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Manually
                </Button>
            </div>

            {showAddForm && (
                <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-cyan-500/30 space-y-3">
                    <Input
                        placeholder="Knowledge Base Name"
                        value={newKB.name}
                        onChange={(e) => setNewKB({...newKB, name: e.target.value})}
                        className="bg-gray-800/50 border-cyan-500/50"
                    />
                    <Input
                        placeholder="Description (optional)"
                        value={newKB.description}
                        onChange={(e) => setNewKB({...newKB, description: e.target.value})}
                        className="bg-gray-800/50 border-cyan-500/50"
                    />
                    <Textarea
                        placeholder="Content/Knowledge"
                        value={newKB.content}
                        onChange={(e) => setNewKB({...newKB, content: e.target.value})}
                        className="bg-gray-800/50 border-cyan-500/50 min-h-[200px]"
                    />
                    <div className="flex gap-2">
                        <Button onClick={handleCreate} className="flex-1 bg-cyan-600 hover:bg-cyan-500">
                            Create
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setShowAddForm(false);
                                setNewKB({ name: '', description: '', content: '' });
                            }}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                    </div>
                ) : knowledgeBases.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No knowledge bases yet.</p>
                        <p className="text-sm mt-1">Upload documents or add content manually.</p>
                    </div>
                ) : (
                    knowledgeBases.map(kb => (
                        <div
                            key={kb.id}
                            className={`p-4 rounded-lg border transition-all ${
                                kb.active 
                                    ? 'bg-cyan-900/20 border-cyan-500/50' 
                                    : 'bg-gray-900/30 border-gray-700/50'
                            }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-white flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        {kb.name}
                                    </h3>
                                    {kb.description && (
                                        <p className="text-sm text-gray-400 mt-1">{kb.description}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        {kb.content?.length || 0} characters
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-400"
                                    onClick={() => handleDelete(kb.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">Active</span>
                                    <Switch
                                        checked={kb.active}
                                        onCheckedChange={() => handleToggleActive(kb)}
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-300">Priority</span>
                                        <span className="text-cyan-300 text-sm font-mono">{kb.priority}</span>
                                    </div>
                                    <Slider
                                        min={1}
                                        max={10}
                                        step={1}
                                        value={[kb.priority]}
                                        onValueChange={(val) => handlePriorityChange(kb, val)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
}