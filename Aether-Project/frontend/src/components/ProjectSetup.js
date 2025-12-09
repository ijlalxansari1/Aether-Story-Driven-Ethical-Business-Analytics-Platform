import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Target, Users, Shield, Check, Plus } from 'lucide-react';

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
    const [loading, setLoading] = useState(false);

    const objectives = [
        "Churn Prediction",
        "Behavioral Analysis",
        "Sentiment & Engagement Tracking",
        "Anomaly Detection in Usage",
        "Ethical Compliance Auditing"
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
        "Users / Community Representative"
    ];

    const handleNext = () => setStep(step + 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Use custom objective if selected
            const finalData = {
                ...formData,
                objective: formData.objective === 'Custom' ? customObjective : formData.objective
            };

            const response = await fetch('http://127.0.0.1:8000/projects/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData)
            });
            if (response.ok) {
                const project = await response.json();
                onComplete(project.id);
            } else {
                console.error("Server error:", await response.text());
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
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Target className="text-teal-600" />
                    Project Scope Wizard
                </h2>
                <div className="flex gap-2 mt-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-teal-500' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </div>

            <div className="p-8 min-h-[400px]">
                {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h3 className="text-xl font-semibold mb-6">1. Define Your Objective</h3>
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-700">Project Title</label>
                            <input
                                type="text"
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="e.g., Q4 Customer Churn Analysis"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />

                            <label className="block text-sm font-medium text-slate-700 mt-4">Primary Goal</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {objectives.map(obj => (
                                    <button
                                        key={obj}
                                        onClick={() => setFormData({ ...formData, objective: obj })}
                                        className={`p-3 rounded-lg border text-left transition-all ${formData.objective === obj
                                            ? 'border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-500'
                                            : 'border-slate-200 hover:border-teal-300'
                                            }`}
                                    >
                                        {obj}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setFormData({ ...formData, objective: 'Custom' })}
                                    className={`p-3 rounded-lg border text-left transition-all ${formData.objective === 'Custom'
                                        ? 'border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-500'
                                        : 'border-slate-200 hover:border-teal-300'
                                        }`}
                                >
                                    Dynamic Option (Custom)
                                </button>
                            </div>

                            {formData.objective === 'Custom' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <label className="block text-sm font-medium text-slate-700 mt-2">Custom Objective Description</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 mt-1 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                        placeholder="Describe your specific objective..."
                                        value={customObjective}
                                        onChange={e => setCustomObjective(e.target.value)}
                                    />
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Shield className="text-teal-600" size={20} />
                            2. Ethical Constraints
                        </h3>
                        <p className="text-slate-500 mb-4">Select the frameworks that apply to this analysis.</p>
                        <div className="grid grid-cols-1 gap-3">
                            {constraints.map(c => (
                                <button
                                    key={c}
                                    onClick={() => toggleSelection('ethical_constraints', c)}
                                    className={`p-4 rounded-lg border flex items-center justify-between transition-all ${formData.ethical_constraints.includes(c)
                                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                                        : 'border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="font-medium">{c}</span>
                                    {formData.ethical_constraints.includes(c) && <Check size={20} />}
                                </button>
                            ))}

                            {/* Dynamic Option for Constraints */}
                            <div className="flex gap-2 mt-2">
                                <input
                                    type="text"
                                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                    placeholder="Add custom ethical consideration..."
                                    value={customConstraint}
                                    onChange={e => setCustomConstraint(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addCustomConstraint()}
                                />
                                <button
                                    onClick={addCustomConstraint}
                                    className="p-3 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            {/* Display Custom Constraints */}
                            {formData.ethical_constraints.filter(c => !constraints.includes(c)).map(c => (
                                <button
                                    key={c}
                                    onClick={() => toggleSelection('ethical_constraints', c)}
                                    className="p-4 rounded-lg border border-teal-500 bg-teal-50 text-teal-700 flex items-center justify-between"
                                >
                                    <span className="font-medium">{c} (Custom)</span>
                                    <Check size={20} />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Users className="text-teal-600" size={20} />
                            3. Key Stakeholders
                        </h3>
                        <div className="space-y-4">
                            <p className="text-slate-500">Who will be using these insights?</p>

                            {/* Predefined Stakeholders */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {stakeholdersList.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => toggleSelection('stakeholders', s)}
                                        className={`px-3 py-2 rounded-full text-sm border transition-all ${formData.stakeholders.includes(s)
                                                ? 'bg-teal-100 border-teal-500 text-teal-800'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            <label className="block text-sm font-medium text-slate-700">Add Specific Stakeholder (Dynamic)</label>
                            <input
                                type="text"
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="e.g., Community Manager"
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        if (e.target.value.trim()) {
                                            toggleSelection('stakeholders', e.target.value.trim());
                                            e.target.value = '';
                                        }
                                    }
                                }}
                            />

                            <div className="flex flex-wrap gap-2 mt-4">
                                {formData.stakeholders.map((s, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm flex items-center gap-2">
                                        {s}
                                        <button onClick={() => toggleSelection('stakeholders', s)} className="hover:text-red-500">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between">
                {step > 1 ? (
                    <button onClick={() => setStep(step - 1)} className="px-6 py-2 text-slate-600 font-medium hover:text-slate-900">
                        Back
                    </button>
                ) : <div></div>}

                {step < 3 ? (
                    <button
                        onClick={handleNext}
                        disabled={!formData.title && step === 1}
                        className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        Next Step <ArrowRight size={18} />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all font-semibold flex items-center gap-2"
                    >
                        {loading ? "Creating..." : "Create Project"}
                    </button>
                )}
            </div>
        </div>
    );
}
