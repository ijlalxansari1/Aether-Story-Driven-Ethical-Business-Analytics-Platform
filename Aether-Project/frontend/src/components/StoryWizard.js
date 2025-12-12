import { useState } from 'react';
import { API_URL } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Brain, ChevronLeft, BookOpen, Lightbulb } from 'lucide-react';

export default function StoryWizard({ datasetId, onComplete }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        business_objective: '',
        level: 2,
        context: '',
        hypotheses: [],
        story_type: 'exploratory',
        target_audience: 'executive'
    });
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [hypotheses, setHypotheses] = useState([]);
    const [showHypotheses, setShowHypotheses] = useState(false);
    const [loadingHypotheses, setLoadingHypotheses] = useState(false);

    const levels = [
        {
            id: 1,
            name: 'Quick Scan',
            desc: 'Light cleaning, basic EDA, fast report.',
            icon: Zap,
            color: 'bg-blue-50 text-blue-600 border-blue-200'
        },
        {
            id: 2,
            name: 'Deep Analysis',
            desc: 'Full cleaning, FE, pit-stop report.',
            icon: Sparkles,
            color: 'bg-purple-50 text-purple-600 border-purple-200'
        },
        {
            id: 3,
            name: 'Advanced ML/DL',
            desc: 'PyTorch models, explainability, ethical checks.',
            icon: Brain,
            color: 'bg-pink-50 text-pink-600 border-pink-200'
        }
    ];

    const handleSuggest = async () => {
        setLoadingSuggestions(true);
        try {
            const response = await fetch(`${API_URL}/stories/suggest/${datasetId}`, {
                method: 'POST'
            });
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error("Failed to get suggestions", error);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleGenerateHypotheses = async () => {
        setLoadingHypotheses(true);
        try {
            const response = await fetch(`${API_URL}/ai/hypotheses/${datasetId}?story_type=${formData.story_type}&target_audience=${formData.target_audience}`);
            if (response.ok) {
                const data = await response.json();
                setHypotheses(data.hypotheses);
                setShowHypotheses(true);
            }
        } catch (error) {
            console.error("Failed to generate hypotheses", error);
        } finally {
            setLoadingHypotheses(false);
        }
    };

    const applySuggestion = (suggestion) => {
        setFormData({ ...formData, title: suggestion.title, context: suggestion.context, business_objective: suggestion.context });
        setShowSuggestions(false);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/stories/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, dataset_id: datasetId })
            });

            if (response.ok) {
                const data = await response.json();
                onComplete(data.id);
            } else {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                alert(`Failed to create story: ${JSON.stringify(errorData)}`);
                console.error('Story creation failed:', errorData);
            }
        } catch (error) {
            console.error(error);
            alert(`Error creating story: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
            >
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                        <span className={step >= 1 ? "text-primary" : ""}>Step 1: Define</span>
                        <span className="text-gray-300">/</span>
                        <span className={step >= 2 ? "text-primary" : ""}>Step 2: Depth</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {step === 1 ? "Define Your Data Story" : "Select Analysis Depth"}
                    </h2>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={handleSuggest}
                                    disabled={loadingSuggestions}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                                >
                                    {loadingSuggestions ? (
                                        <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full" />
                                    ) : (
                                        <Sparkles size={16} />
                                    )}
                                    Inspire Me
                                </button>

                                <button
                                    onClick={handleGenerateHypotheses}
                                    disabled={loadingHypotheses}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                >
                                    {loadingHypotheses ? (
                                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                                    ) : (
                                        <Brain size={16} />
                                    )}
                                    Generate Hypotheses
                                </button>
                            </div>

                            {showSuggestions && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="grid gap-3 bg-purple-50/50 p-4 rounded-xl border border-purple-100"
                                >
                                    <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                                        <Lightbulb size={14} />
                                        AI Story Suggestions
                                    </h4>
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => applySuggestion(s)}
                                            className="text-left p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-300 hover:shadow-sm transition-all text-sm w-full"
                                        >
                                            <div className="font-medium text-gray-900">{s.title}</div>
                                            <div className="text-gray-500 text-xs">{s.context}</div>
                                        </button>
                                    ))}
                                </motion.div>
                            )}

                            {showHypotheses && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="grid gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100"
                                >
                                    <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                                        <Brain size={14} />
                                        AI-Generated Research Questions
                                    </h4>
                                    {hypotheses.map((h, i) => (
                                        <div
                                            key={i}
                                            className="p-4 bg-white rounded-lg border border-blue-100 text-sm"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="font-semibold text-gray-900">{h.question}</div>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${h.confidence === 'high' ? 'bg-green-100 text-green-700' :
                                                    h.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {h.confidence}
                                                </span>
                                            </div>
                                            <div className="text-gray-600 text-xs mb-2">{h.rationale}</div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="px-2 py-0.5 bg-gray-100 rounded">{h.type}</span>
                                                <span>•</span>
                                                <span>{h.test}</span>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Story Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="e.g., Customer Churn Analysis Q3"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Story Type
                                    </label>
                                    <select
                                        value={formData.story_type}
                                        onChange={(e) => setFormData({ ...formData, story_type: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                                    >
                                        <option value="exploratory">Exploratory Analysis</option>
                                        <option value="trend">Trend Analysis</option>
                                        <option value="comparative">Comparative Analysis</option>
                                        <option value="root_cause">Root Cause Analysis</option>
                                        <option value="predictive">Predictive Modeling</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Target Audience
                                    </label>
                                    <select
                                        value={formData.target_audience}
                                        onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                                    >
                                        <option value="executive">Executive (High-Level KPIs)</option>
                                        <option value="technical">Technical (Detailed Tables)</option>
                                        <option value="general">General (Balanced Mix)</option>
                                    </select>
                                </div>
                            </div>

                            {/* BI Analyst Hat: Layout Preview Hint */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 flex gap-3">
                                <div className="p-2 bg-white rounded-lg border border-slate-200 h-fit">
                                    {formData.target_audience === 'executive' ? (
                                        <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                                            <div className="bg-slate-400 col-span-2 rounded-[1px]"></div>
                                            <div className="bg-slate-300 rounded-[1px]"></div>
                                            <div className="bg-slate-300 rounded-[1px]"></div>
                                        </div>
                                    ) : (
                                        <div className="w-4 h-4 flex flex-col gap-0.5">
                                            <div className="bg-slate-400 h-1 w-full rounded-[1px]"></div>
                                            <div className="bg-slate-300 h-0.5 w-full rounded-[1px]"></div>
                                            <div className="bg-slate-300 h-0.5 w-full rounded-[1px]"></div>
                                            <div className="bg-slate-300 h-0.5 w-full rounded-[1px]"></div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <span className="font-semibold text-slate-900">Dashboard Layout Preview:</span>
                                    <p className="mt-1">
                                        {formData.target_audience === 'executive'
                                            ? "Focus on big number cards and summary charts for quick decision making."
                                            : "Detailed views with granular data tables and deep-dive capabilities."}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Objective
                                </label>
                                <textarea
                                    value={formData.business_objective}
                                    onChange={(e) => setFormData({ ...formData, business_objective: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all h-32 resize-none"
                                    placeholder="What question are you trying to answer?"
                                />
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.title || !formData.business_objective}
                                className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                Next Step <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="grid gap-4">
                                {levels.map(lvl => {
                                    const Icon = lvl.icon;
                                    const isSelected = formData.level === lvl.id;
                                    return (
                                        <div
                                            key={lvl.id}
                                            onClick={() => setFormData({ ...formData, level: lvl.id })}
                                            className={`
                      relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4
                      ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}
                    `}
                                        >
                                            <div className={`p-3 rounded-lg ${lvl.color}`}>
                                                <Icon size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{lvl.name}</h4>
                                                <p className="text-sm text-gray-500">{lvl.desc}</p>
                                            </div>
                                            {isSelected && (
                                                <div className="absolute right-4 text-primary">
                                                    <ArrowRight size={20} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-6 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors flex items-center gap-2"
                                >
                                    <ChevronLeft size={20} /> Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? 'Creating Story...' : 'Start Analysis'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
