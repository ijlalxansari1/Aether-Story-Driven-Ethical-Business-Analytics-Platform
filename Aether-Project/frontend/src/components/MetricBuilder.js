import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Check, Info } from 'lucide-react';

export default function MetricBuilder({ projectId, onComplete }) {
    const [metrics, setMetrics] = useState([]);
    const [selectedMetrics, setSelectedMetrics] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock fetching project objective to suggest metrics
    // In a real app, we'd fetch the project details first
    useEffect(() => {
        // Simulating API call to get suggested metrics based on "Churn Prediction" (default for now)
        const suggested = [
            { name: "Accuracy", description: "Overall correctness of predictions." },
            { name: "Recall", description: "Ability to find all positive instances (critical for Churn)." },
            { name: "F1-Score", description: "Balance between precision and recall." },
            { name: "Fairness Score", description: "Measure of bias in sensitive columns." },
            { name: "Data Quality Score", description: "Overall health of the dataset." }
        ];
        setMetrics(suggested);
        setLoading(false);
    }, [projectId]);

    const toggleMetric = (metric) => {
        if (selectedMetrics.includes(metric)) {
            setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
        } else {
            setSelectedMetrics([...selectedMetrics, metric]);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        >
            <div className="bg-slate-50 p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Target className="text-teal-600" />
                    Define Success Metrics
                </h2>
                <p className="text-slate-500 mt-1">Select the key performance indicators (KPIs) for this analysis.</p>
            </div>

            <div className="p-8">
                {loading ? (
                    <div className="text-center py-10 text-slate-500">Loading suggestions...</div>
                ) : (
                    <div className="space-y-4">
                        {metrics.map((metric) => (
                            <button
                                key={metric.name}
                                onClick={() => toggleMetric(metric.name)}
                                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${selectedMetrics.includes(metric.name)
                                        ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500'
                                        : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                                    }`}
                            >
                                <div>
                                    <div className={`font-semibold ${selectedMetrics.includes(metric.name) ? 'text-teal-900' : 'text-slate-800'}`}>
                                        {metric.name}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">{metric.description}</div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${selectedMetrics.includes(metric.name)
                                        ? 'bg-teal-500 border-teal-500 text-white'
                                        : 'border-slate-300 group-hover:border-teal-400'
                                    }`}>
                                    {selectedMetrics.includes(metric.name) && <Check size={14} />}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={() => onComplete(selectedMetrics)}
                        disabled={selectedMetrics.length === 0}
                        className="px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all font-semibold flex items-center gap-2"
                    >
                        Confirm Metrics <Check size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
