import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function ProgressBar({ currentStep, steps }) {
    return (
        <div className="w-full max-w-4xl mx-auto mb-12">
            <div className="relative flex justify-between">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full -z-10" />
                <div
                    className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full -z-10 transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, idx) => {
                    const isCompleted = idx + 1 < currentStep;
                    const isCurrent = idx + 1 === currentStep;

                    return (
                        <div key={idx} className="flex flex-col items-center gap-2">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.2 : 1,
                                    backgroundColor: isCompleted || isCurrent ? '#4f46e5' : '#f3f4f6',
                                    borderColor: isCompleted || isCurrent ? '#4f46e5' : '#e5e7eb'
                                }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors duration-300 ${isCompleted || isCurrent ? 'text-white' : 'text-gray-400'
                                    }`}
                            >
                                {isCompleted ? <Check size={16} strokeWidth={3} /> : <span className="text-sm font-bold">{idx + 1}</span>}
                            </motion.div>
                            <span className={`text-xs font-semibold uppercase tracking-wider ${isCurrent ? 'text-primary' : 'text-gray-400'
                                }`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
