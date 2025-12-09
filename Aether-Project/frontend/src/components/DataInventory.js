import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ShieldAlert, Lock, Globe, Building } from 'lucide-react';

export default function DataInventory({ projectId, onComplete }) {
    const [formData, setFormData] = useState({
        dataset_name: '',
        source: '',
        sensitivity: 'Internal'
    });
    const [riskAssessment, setRiskAssessment] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/projects/${projectId}/inventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                const result = await response.json();
                setRiskAssessment(result.risk_assessment);
                // If risks are acceptable, proceed after a short delay
                setTimeout(() => onComplete(result.inventory.id), 2000);
            }
        } catch (error) {
            console.error("Inventory creation failed", error);
        } finally {
            setLoading(false);
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
                    <FileText className="text-teal-600" />
                    Data Inventory & Risk Check
                </h2>
                <p className="text-slate-500 mt-1">Describe your data before uploading to assess privacy risks.</p>
            </div>

            <div className="p-8 space-y-6">
                {!riskAssessment.length ? (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Dataset Name</label>
                            <input
                                type="text"
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="e.g., Q3 Sales Records"
                                value={formData.dataset_name}
                                onChange={e => setFormData({ ...formData, dataset_name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data Source</label>
                            <input
                                type="text"
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="e.g., CRM Export, Public API"
                                value={formData.source}
                                onChange={e => setFormData({ ...formData, source: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">Sensitivity Level</label>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { id: 'Public', icon: Globe, desc: "Open Data" },
                                    { id: 'Internal', icon: Building, desc: "Company Only" },
                                    { id: 'Restricted', icon: Lock, desc: "PII / Sensitive" }
                                ].map(level => (
                                    <button
                                        key={level.id}
                                        onClick={() => setFormData({ ...formData, sensitivity: level.id })}
                                        className={`p-4 rounded-xl border text-left transition-all ${formData.sensitivity === level.id
                                                ? 'border-teal-500 bg-teal-50 text-teal-900 ring-1 ring-teal-500'
                                                : 'border-slate-200 hover:border-teal-300'
                                            }`}
                                    >
                                        <level.icon className={`mb-2 ${formData.sensitivity === level.id ? 'text-teal-600' : 'text-slate-400'}`} />
                                        <div className="font-semibold">{level.id}</div>
                                        <div className="text-xs opacity-70">{level.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || !formData.dataset_name}
                            className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all font-semibold mt-4"
                        >
                            {loading ? "Assessing Risks..." : "Assess Risk & Continue"}
                        </button>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8"
                    >
                        <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Risk Assessment Complete</h3>
                        <div className="bg-slate-50 rounded-xl p-4 text-left max-w-md mx-auto mb-6 border border-slate-200">
                            {riskAssessment.map((risk, idx) => (
                                <div key={idx} className="flex items-start gap-2 mb-2 text-slate-700 text-sm">
                                    <span className="text-amber-500 mt-1">⚠️</span>
                                    {risk}
                                </div>
                            ))}
                            {riskAssessment.length === 0 && (
                                <p className="text-green-600 text-center">No high-level risks detected based on metadata.</p>
                            )}
                        </div>
                        <p className="text-slate-500 animate-pulse">Proceeding to upload...</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
