import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Users, Pencil } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function CollaborationBar({ activeUsers, typingUsers }) {
    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getAvatarColor = (email) => {
        const colors = [
            'bg-cyan-600',
            'bg-purple-600',
            'bg-green-600',
            'bg-pink-600',
            'bg-yellow-600',
            'bg-blue-600',
            'bg-red-600',
            'bg-indigo-600'
        ];
        const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-900/50 border-b border-cyan-500/30">
            <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-400">{activeUsers.length} active</span>
            </div>
            
            <div className="flex items-center gap-2">
                {activeUsers.map(user => (
                    <div key={user.user_email} className="relative group">
                        <Avatar className={`w-8 h-8 ${getAvatarColor(user.user_email)} border-2 border-cyan-400/50`}>
                            <AvatarFallback className="text-white text-xs font-semibold">
                                {getInitials(user.user_name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {user.user_name || user.user_email}
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {typingUsers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-2 text-sm text-gray-400 ml-auto"
                    >
                        <Pencil className="w-3 h-3 text-cyan-400" />
                        <span>
                            {typingUsers.length === 1 
                                ? `${typingUsers[0].user_name || 'Someone'} is typing...`
                                : `${typingUsers.length} people are typing...`
                            }
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}