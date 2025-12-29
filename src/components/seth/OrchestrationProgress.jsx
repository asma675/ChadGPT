import React from 'react';
import { motion } from "framer-motion";
import { Loader2, CheckCircle, Circle } from "lucide-react";

export default function OrchestrationProgress({ steps, currentStep }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/50"
        >
            <h3 className="text-sm font-semibold text-purple-300 mb-3">Multi-Step Orchestration</h3>
            <div className="space-y-2">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                        {index < currentStep ? (
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        ) : index === currentStep ? (
                            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
                        ) : (
                            <Circle className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${
                            index < currentStep ? 'text-green-300' :
                            index === currentStep ? 'text-cyan-300' :
                            'text-gray-500'
                        }`}>
                            {step}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}