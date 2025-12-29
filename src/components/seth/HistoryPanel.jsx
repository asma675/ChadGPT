import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChatSession } from "@/api/entities";
import { X, Plus, MessageSquare, Loader2, Trash2, Archive, ArchiveRestore, Search, Filter } from "lucide-react";

export default function HistoryPanel({ onNewChat, onLoadSession, onClose }) {
    const [allSessions, setAllSessions] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showArchived, setShowArchived] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filterSender, setFilterSender] = useState('all');
    const [filterMode, setFilterMode] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [showArchived, searchKeyword, filterSender, filterMode, allSessions]);

    const fetchSessions = async () => {
        setIsLoading(true);
        const fetchedSessions = await ChatSession.list("-created_date", 100);
        setAllSessions(fetchedSessions);
        setIsLoading(false);
    };

    const applyFilters = () => {
        let filtered = allSessions.filter(s => showArchived ? s.archived : !s.archived);

        // Keyword search
        if (searchKeyword.trim()) {
            const keyword = searchKeyword.toLowerCase();
            filtered = filtered.filter(session => 
                session.title?.toLowerCase().includes(keyword) ||
                session.messages?.some(msg => 
                    msg.text?.toLowerCase().includes(keyword)
                )
            );
        }

        // Sender filter
        if (filterSender !== 'all') {
            filtered = filtered.filter(session => 
                session.messages?.some(msg => msg.sender === filterSender)
            );
        }

        // Mode filter
        if (filterMode !== 'all') {
            filtered = filtered.filter(session => 
                session.messages?.some(msg => 
                    msg.text?.toLowerCase().includes(`[${filterMode.toUpperCase()}]`)
                )
            );
        }

        setSessions(filtered);
    };

    const handleDelete = async (sessionId, e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this chat?')) {
            await ChatSession.delete(sessionId);
            fetchSessions();
        }
    };

    const handleArchive = async (session, e) => {
        e.stopPropagation();
        await ChatSession.update(session.id, { archived: !session.archived });
        fetchSessions();
    };

    return (
        <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-full max-w-sm bg-black border-r border-cyan-500/50 shadow-2xl shadow-cyan-500/20 p-6 z-50 flex flex-col"
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-cyan-300">Chat History</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-6 w-6" />
                </Button>
            </div>
            
            <Button
                variant="outline"
                className="w-full bg-transparent border-cyan-400/50 hover:bg-cyan-400/20 mb-4"
                onClick={onNewChat}
            >
                <Plus className="mr-2 h-4 w-4" />
                New Chat
            </Button>

            <Button
                variant="outline"
                className="w-full bg-transparent border-purple-400/50 hover:bg-purple-400/20 mb-4"
                onClick={() => setShowArchived(!showArchived)}
            >
                {showArchived ? <ArchiveRestore className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
                {showArchived ? 'Show Active' : 'Show Archived'}
            </Button>

            {/* Search Bar */}
            <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search messages..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-cyan-500/50 text-white"
                />
            </div>

            {/* Filters Toggle */}
            <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent border-gray-600/50 hover:bg-gray-700/50 mb-4"
                onClick={() => setShowFilters(!showFilters)}
            >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="space-y-3 mb-4 p-3 bg-gray-900/30 rounded-lg border border-gray-700/50">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Sender</label>
                        <Select value={filterSender} onValueChange={setFilterSender}>
                            <SelectTrigger className="bg-gray-900/50 border-cyan-500/30 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-cyan-500/50 text-white">
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="ai">AI</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Mode</label>
                        <Select value={filterMode} onValueChange={setFilterMode}>
                            <SelectTrigger className="bg-gray-900/50 border-cyan-500/30 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-cyan-500/50 text-white">
                                <SelectItem value="all">All Modes</SelectItem>
                                <SelectItem value="chat">Chat</SelectItem>
                                <SelectItem value="image">Image</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="storyboard">Storyboard</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(searchKeyword || filterSender !== 'all' || filterMode !== 'all') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-cyan-400"
                            onClick={() => {
                                setSearchKeyword('');
                                setFilterSender('all');
                                setFilterMode('all');
                            }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>
            )}

            {/* Results count */}
            <div className="text-xs text-gray-500 mb-2">
                {sessions.length} {sessions.length === 1 ? 'result' : 'results'}
            </div>

            <div className="flex-1 overflow-y-auto -mr-6 pr-6 space-y-2">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center text-gray-500 pt-10">
                        No saved chats.
                    </div>
                ) : (
                    sessions.map(session => (
                        <div
                            key={session.id}
                            className="w-full text-left p-3 rounded-lg hover:bg-gray-800/80 transition-colors flex items-start gap-3 group"
                        >
                            <MessageSquare className="h-4 w-4 mt-1 text-cyan-400 flex-shrink-0" />
                            <div className="flex-1 cursor-pointer" onClick={() => onLoadSession(session.id)}>
                                <p className="font-medium text-white truncate">{session.title}</p>
                                <p className="text-xs text-gray-400">
                                    {new Date(session.created_date).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => handleArchive(session, e)}
                                >
                                    {session.archived ? 
                                        <ArchiveRestore className="h-4 w-4 text-purple-400" /> : 
                                        <Archive className="h-4 w-4 text-purple-400" />
                                    }
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => handleDelete(session.id, e)}
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