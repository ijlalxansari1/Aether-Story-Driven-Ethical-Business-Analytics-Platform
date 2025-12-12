import { useState, useEffect } from 'react';
import { API_URL } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Target, Users, Shield, Check, Plus, Sparkles, Zap, Smartphone, BarChart3, Lock, Briefcase } from 'lucide-react';

export default function ProjectSetup({ onComplete }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        objective: '',
        stakeholders: [],
        ethical_constraints: []
    });
    const [customObjective, setCustomObjective] = useState('');
    const [customConstraint, setCustomConstraint] = useState('');
    const [riskAnalysis, setRiskAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    // Dynamic Context Engine
    useEffect(() => {
        if (formData.objective === 'Custom') {
            autoSuggestContext(customObjective);
        } else if (formData.objective) {
            autoSuggestContext(formData.objective);
        }
    }, [formData.objective, customObjective]);

    const autoSuggestContext = (objective) => {
        // Dynamic Logic: Suggest Stickholders & Constraints based on Goal
        let suggestions = { stakeholders: [], constraints: [] };

        // Reset analysis if empty
        if (!objective || objective === 'Custom' || objective.trim().length === 0) {
            setRiskAnalysis(null);
            return;
        }

        const text = objective.toLowerCase();

        if (text.includes("churn") || text.includes("retention")) {
            suggestions.stakeholders = ["Product Owner / Manager", "Data Scientist / Analyst"];
            suggestions.constraints = ["Bias detection in ML models", "Fairness in prediction outputs"];
            setRiskAnalysis({
                risk: "Exclusionary Bias",
                mitigation: "Churn models may unfairly target specific demographics. Ensure training data is balanced.",
                severity: "high"
            });
        } else if (text.includes("ethical") || text.includes("audit")) {
            suggestions.stakeholders = ["Legal / Compliance Officer", "Users / Community Representative"];
            suggestions.constraints = ["GDPR/CCPA compliance check", "Transparency & consent management"];
            setRiskAnalysis({
                risk: "Compliance Fatigue",
                mitigation: "Strict auditing can slow innovation. Focus on automated compliance checks.",
                severity: "medium"
            });
        } else if (text.includes("behavior") || text.includes("tracking")) {
            suggestions.stakeholders = ["Product Owner / Manager", "UX Researcher"];
            suggestions.constraints = ["Data minimization principles"];
            setRiskAnalysis({
                risk: "Surveillance Perception",
                mitigation: "Granular tracking may erode trust. Anonymize user data where possible.",
                severity: "medium"
            });
        } else {
            // GENERIC FALLBACK FOR CUSTOM GOALS
            suggestions.stakeholders = ["Project Lead", "Data Privacy Officer"];
            suggestions.constraints = ["General Data Protection checks"];
            setRiskAnalysis({
                risk: "Unforeseen Ethical Impact",
                mitigation: "Custom goals require a broad ethical review. Conduct a stakeholder impact assessment.",
                severity: "low"
            });
        }

        // Merge without duplicates
        setFormData(prev => ({
            ...prev,
            stakeholders: Array.from(new Set([...prev.stakeholders, ...suggestions.stakeholders])),
            ethical_constraints: Array.from(new Set([...prev.ethical_constraints, ...suggestions.constraints]))
        }));
    };

    const objectives = [
        { name: "Churn Prediction", icon: Users, desc: "Identify at-risk customers" },
        { name: "Behavioral Analysis", icon: Smartphone, desc: "Understand user journey patterns" },
        { name: "Sentiment Analysis", icon: Sparkles, desc: "Track brand health & engagement" },
        { name: "Anomaly Detection", icon: Zap, desc: "Spot irregularities in usage" },
        { name: "Ethical Auditing", icon: Shield, desc: "Compliance & bias checks" }
    ];

    const constraints = [
        "GDPR/CCPA compliance check",
        "Bias detection in ML models",
        "Data minimization principles",
        "Transparency & consent management",
        "Fairness in prediction outputs"
    ];

    const stakeholdersList = [
        "Product Owner / Manager",
        "Data Engineer",
        "Data Scientist / Analyst",
        "Legal / Compliance Officer",
        "Users / Community Representative",
        "UX Researcher"
    ];

    const handleNext = () => setStep(step + 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const finalData = {
                ...formData,
                objective: formData.objective === 'Custom' ? customObjective : formData.objective
            };

            const response = await fetch(`${API_URL}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData)
            });
            if (response.ok) {
                const project = await response.json();
                onComplete(project.id);
            }
        } catch (error) {
            console.error("Project creation failed", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (field, value) => {
        setFormData(prev => {
            const current = prev[field];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [field]: updated };
        });
    };

    const addCustomConstraint = () => {
        if (customConstraint.trim()) {
            toggleSelection('ethical_constraints', customConstraint.trim());
            setCustomConstraint('');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Glass Card Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden relative"
            >
                {/* Decorative Background Gradients */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2" />

                <div className="p-8 border-b border-gray-100/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <Target className="text-teal-600" size={32} />
                            Project Scope Wizard
                        </h2>
                        <p className="text-slate-500 mt-1">Define your analytical goals and ethical boundaries.</p>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => (
                            <motion.div
                                key={i}
                                initial={false}
                                animate={{
                                    width: i === step ? 40 : 12,
                                    backgroundColor: i <= step ? '#0d9488' : '#e2e8f0'
                                }}
                                className="h-3 rounded-full cursor-pointer"
                                onClick={() => i < step && setStep(i)}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-10 min-h-[500px]">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <div>
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 block">Project Title</label>
                                <input
                                    type="text"
                                    className="w-full p-4 text-xl font-medium bg-white/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none placeholder:text-slate-300"
                                    placeholder="e.g., Q4 Customer Churn Analysis"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 block">Primary Goal</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {objectives.map(obj => (
                                        <button
                                            key={obj.name}
                                            onClick={() => setFormData({ ...formData, objective: obj.name })}
                                            className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${formData.objective === obj.name
                                                ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-white ring-2 ring-teal-500 shadow-lg shadow-teal-900/10'
                                                : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-md'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${formData.objective === obj.name ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600'}`}>
                                                <obj.icon size={24} />
                                            </div>
                                            <div className="font-bold text-slate-800 text-lg">{obj.name}</div>
                                            <div className="text-sm text-slate-500 mt-1">{obj.desc}</div>

                                            {formData.objective === obj.name && (
                                                <motion.div layoutId="check" className="absolute top-4 right-4 text-teal-500">
                                                    <Check size={20} />
                                                </motion.div>
                                            )}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setFormData({ ...formData, objective: 'Custom' })}
                                        className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-center items-center gap-2 group ${formData.objective === 'Custom'
                                            ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500'
                                            : 'border-slate-200 border-dashed hover:border-teal-400 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <Plus size={20} className="text-slate-400 group-hover:text-teal-600" />
                                        </div>
                                        <span className="font-semibold text-slate-500 group-hover:text-slate-700">Custom Goal</span>
                                    </button>
                                </div>

                                {/* Custom Goal Input */}
                                {formData.objective === 'Custom' && (
                                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-2 block">Describe your Custom Goal</label>
                                        <input
                                            type="text"
                                            className="w-full p-4 bg-teal-50/50 border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 placeholder:text-slate-400"
                                            placeholder="e.g. Optimize supply chain logistics for sustainability..."
                                            value={customObjective}
                                            onChange={(e) => setCustomObjective(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                )}

                                {/* Ethical Lens Analysis Card */}
                                {riskAnalysis && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className={`mt-6 p-5 rounded-2xl border-l-4 ${riskAnalysis.severity === 'high' ? 'bg-red-50 border-red-500 text-red-900' :
                                            riskAnalysis.severity === 'medium' ? 'bg-amber-50 border-amber-500 text-amber-900' :
                                                'bg-blue-50 border-blue-500 text-blue-900'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1"><Sparkles size={18} /></div>
                                            <div>
                                                <h4 className="font-bold text-sm uppercase tracking-wide opacity-80 mb-1">Ethical Lens Analysis</h4>
                                                <p className="font-semibold text-lg">{riskAnalysis.risk}</p>
                                                <p className="text-sm opacity-90 mt-1">{riskAnalysis.mitigation}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800">Ethical Constraints</h3>
                                    <p className="text-slate-500">Based on your goal <strong>"{formData.objective}"</strong>, we suggest:</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {constraints.map((c, idx) => (
                                    <motion.button
                                        key={c}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => toggleSelection('ethical_constraints', c)}
                                        className={`p-4 rounded-xl border flex items-center justify-between transition-all group ${formData.ethical_constraints.includes(c)
                                            ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-sm'
                                            : 'border-slate-200 hover:border-purple-300 hover:bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.ethical_constraints.includes(c) ? 'bg-purple-500 border-purple-500' : 'border-slate-300 group-hover:border-purple-400'}`}>
                                                {formData.ethical_constraints.includes(c) && <Check size={14} className="text-white" />}
                                            </div>
                                            <span className="font-medium">{c}</span>
                                        </div>
                                        {/* AI Suggestion Badge */}
                                        {/* In a real app, this logic would match the suggestions */}
                                        {formData.ethical_constraints.includes(c) && (
                                            <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-semibold">Active</span>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800">Key Stakeholders</h3>
                                    <p className="text-slate-500">Who needs to see this report?</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mb-8">
                                {stakeholdersList.map((s, idx) => (
                                    <motion.button
                                        key={s}
                                        layout
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => toggleSelection('stakeholders', s)}
                                        className={`px-5 py-3 rounded-full text-sm font-semibold border transition-all ${formData.stakeholders.includes(s)
                                            ? 'bg-slate-800 border-slate-800 text-white shadow-lg shadow-slate-900/20'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                                            }`}
                                    >
                                        {s}
                                    </motion.button>
                                ))}
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 block">Add Custom Stakeholder</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g., External Auditor"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                toggleSelection('stakeholders', e.target.value.trim());
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <button className="px-4 py-2 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 font-medium text-slate-700">Add</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="p-8 bg-white/50 backdrop-blur-md border-t border-gray-100 flex justify-between items-center">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-3 text-slate-500 font-semibold hover:text-slate-800 transition-colors"
                        >
                            Back
                        </button>
                    ) : <div />}

                    {step < 3 ? (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleNext}
                            disabled={!formData.title && step === 1}
                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg flex items-center gap-2 shadow-xl shadow-slate-900/20"
                        >
                            Next Step <ArrowRight size={20} />
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl hover:from-teal-400 hover:to-teal-500 shadow-xl shadow-teal-500/30 transition-all font-bold text-lg flex items-center gap-2"
                        >
                            {loading ? <Sparkles className="animate-spin" /> : <Check />}
                            Create Project
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
