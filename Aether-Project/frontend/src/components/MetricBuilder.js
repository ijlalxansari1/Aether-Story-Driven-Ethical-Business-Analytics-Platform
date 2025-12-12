import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Check, Info, Sparkles } from 'lucide-react';
import { API_URL } from '../services/api';
import { useToast } from '../context/ToastContext';
import Tooltip from './Tooltip';

export default function MetricBuilder({ projectId, onComplete }) {
    const { addToast } = useToast();
    const [metrics, setMetrics] = useState([]);
    const [selectedMetrics, setSelectedMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    // Context-Aware Metric Knowledge Base
    const metricKnowledgeBase = [
        { name: "Accuracy", keywords: ["classify", "prediction", "model", "categorize"], type: "Technical" },
        { name: "Recall", keywords: ["fraud", "cancer", "detection", "miss", "critical"], type: "Technical" },
        { name: "Precision", keywords: ["spam", "false positive", "marketing"], type: "Technical" },
        { name: "Revenue Growth", keywords: ["sales", "money", "profit", "revenue", "financial"], type: "Business" },
        { name: "Churn Rate", keywords: ["retention", "customer", "loyalty", "leave", "stay"], type: "Business" },
        { name: "Customer LTV", keywords: ["lifetime", "value", "long-term", "customer"], type: "Business" },
        { name: "Fairness Score", keywords: ["bias", "ethics", "equality", "demographic"], type: "Ethical" },
        { name: "Data Quality Index", keywords: ["clean", "missing", "quality", "health"], type: "Quality" },
        { name: "Conversion Rate", keywords: ["buy", "signup", "action", "funnel"], type: "Business" }
    ];

    useEffect(() => {
        const fetchProjectAndSuggest = async () => {
            try {
                // Fetch the project objective to understand context
                const response = await fetch(`${API_URL}/projects/${projectId}`);
                if (response.ok) {
                    const project = await response.json();
                    analyzeAndSuggest(project.objective);
                } else {
                    // Fallback to defaults
                    setMetrics(metricKnowledgeBase.slice(0, 5));
                    addToast("Could not fetch project context", "warning");
                }
            } catch (error) {
                console.error("Failed to fetch project", error);
                setMetrics(metricKnowledgeBase.slice(0, 5));
            } finally {
                setLoading(false);
            }
        };

        fetchProjectAndSuggest();
    }, [projectId]);

    const analyzeAndSuggest = (objective) => {
        setAnalyzing(true);
        const text = objective.toLowerCase();

        // Smart Scoring: +1 score for each keyword match
        const scoredMetrics = metricKnowledgeBase.map(m => {
            let score = 0;
            if (m.type === 'Ethical' || m.type === 'Quality') score += 0.5; // Always suggest foundation metrics
            m.keywords.forEach(k => {
                if (text.includes(k)) score += 2;
            });
            return { ...m, score };
        });

        // Sort by relevance
        const sorted = scoredMetrics.sort((a, b) => b.score - a.score);
        setMetrics(sorted);

        // Auto-select top 2 recommendations
        const topPicks = sorted.filter(m => m.score > 1).map(m => m.name);
        if (topPicks.length > 0) {
            setSelectedMetrics(topPicks);
            setTimeout(() => addToast(`AI suggested ${topPicks.length} metrics based on your goal`, "success"), 500);
        }

        setAnalyzing(false);
    };

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
                <p className="text-slate-500 mt-1">
                    AI analyzes your business objective to suggest the best KPIs.
                </p>
            </div>

            <div className="p-8">
                {loading ? (
                    <div className="flex flex-col items-center py-10 text-slate-500 animate-pulse">
                        <Sparkles className="mb-2 text-teal-400" />
                        Analyzing project scope...
                    </div>
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
                                    <div className="flex items-center gap-2">
                                        <div className={`font-semibold ${selectedMetrics.includes(metric.name) ? 'text-teal-900' : 'text-slate-800'}`}>
                                            {metric.name}
                                        </div>
                                        {metric.score > 1 && (
                                            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Sparkles size={10} /> Recommended
                                            </span>
                                        )}
                                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                            {metric.type}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">
                                        Relevant for targets involving: {metric.keywords.slice(0, 3).join(", ")}
                                    </div>
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

                {/* Real-time Ethical Impact Analysis */}
                {selectedMetrics.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 bg-slate-50 rounded-xl p-5 border border-slate-200"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Info size={16} className="text-teal-600" />
                            <h4 className="font-semibold text-slate-700">Ethical Impact Assessment</h4>
                        </div>
                        <div className="text-sm text-slate-600 space-y-2">
                            {selectedMetrics.includes("Revenue Growth") && !selectedMetrics.includes("Customer LTV") && (
                                <p className="flex gap-2">⚠️ <span className="text-amber-700"><strong>Risk:</strong> Focusing solely on Revenue may encourage short-term exploitation. Consider adding <strong>Customer LTV</strong> or <strong>Satisfaction</strong>.</span></p>
                            )}
                            {selectedMetrics.includes("Accuracy") && !selectedMetrics.includes("Fairness Score") && (
                                <p className="flex gap-2">⚠️ <span className="text-red-700"><strong>Critical:</strong> High accuracy models can hide bias. It is highly recommended to track <strong>Fairness Score</strong> alongside Accuracy.</span></p>
                            )}
                            {selectedMetrics.includes("Churn Rate") && (
                                <p className="flex gap-2">ℹ️ <span className="text-blue-700"><strong>Insight:</strong> When tracking Churn, ensure you audit <strong>why</strong> users leave to avoid "dark pattern" retention strategies.</span></p>
                            )}
                            {!selectedMetrics.some(m => ["Revenue Growth", "Accuracy", "Churn Rate"].includes(m)) && (
                                <p className="text-green-600 flex gap-2"><Check size={14} className="mt-1" /> Balanced metric selection detected.</p>
                            )}
                        </div>
                    </motion.div>
                )}

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={() => {
                            addToast("Metrics confirmed", "success");
                            onComplete(selectedMetrics);
                        }}
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
