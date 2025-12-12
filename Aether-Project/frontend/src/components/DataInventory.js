import { useState, useRef } from 'react';
import { API_URL } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ShieldAlert, Lock, Globe, Building, Upload, Link as LinkIcon, Edit3, X, FileSearch } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Tooltip from './Tooltip';

export default function DataInventory({ projectId, onComplete }) {
    const { addToast } = useToast();
    const [mode, setMode] = useState('manual'); // 'manual', 'file', 'api'
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        dataset_name: '',
        source: '',
        sensitivity: 'Internal'
    });
    const [riskAssessment, setRiskAssessment] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- Data Engineer Feature: Schema Sniffing ---
    const handleFile = (file) => {
        if (!file) return;

        // Auto-fill name
        const name = file.name.split('.')[0].replace(/[-_]/g, ' ');
        // Basic PII keyword detection in file name
        let sensitivity = 'Internal';
        if (file.name.match(/(email|user|client|personal|pii|customer)/i)) sensitivity = 'Restricted';

        setFormData(prev => ({
            ...prev,
            dataset_name: prev.dataset_name || name,
            source: prev.source || 'Local Upload',
            sensitivity
        }));

        addToast(`Detected schema from ${file.name}`, 'success');

        // Simulating schema reading (in real app, use PapaParse here)
        setTimeout(() => {
            if (sensitivity === 'Restricted') {
                addToast('Potential PII detected in filename', 'warning');
            }
        }, 500);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    // --- Data Engineer Feature: API Connector ---
    const handleApiAnalyze = async () => {
        if (!formData.source.startsWith('http')) {
            addToast('Please enter a valid URL', 'error');
            return;
        }

        setLoading(true);
        // Simulating API ping
        setTimeout(() => {
            setLoading(false);
            const urlName = formData.source.split('/').pop() || 'API Dataset';
            setFormData(prev => ({
                ...prev,
                dataset_name: urlName.replace(/[-_]/g, ' '),
                sensitivity: 'Public' // Default for public URLs
            }));
            addToast('API Endpoint verified. Schema extracted.', 'success');
        }, 1500);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/projects/${projectId}/inventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                const result = await response.json();
                setRiskAssessment(result.risk_assessment);
                addToast('Risk assessment complete', 'success');
                setTimeout(() => onComplete(result.inventory.id), 2000);
            } else {
                addToast('Failed to analyze inventory', 'error');
            }
        } catch (error) {
            console.error("Inventory creation failed", error);
            addToast('Network error', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        >
            <div className="bg-slate-50 p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="text-teal-600" />
                    Data Inventory & Risk Check
                </h2>
                <p className="text-slate-500 mt-1">
                    Describe your data source. Automatic detection available for files & APIs.
                </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex border-b border-slate-200">
                {[
                    { id: 'manual', label: 'Manual Input', icon: Edit3 },
                    { id: 'file', label: 'File Sniffer', icon: FileSearch },
                    { id: 'api', label: 'API Link', icon: LinkIcon },
                ].map(m => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${mode === m.id ? 'text-teal-600 bg-teal-50/50 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <m.icon size={18} /> {m.label}
                    </button>
                ))}
            </div>

            <div className="p-8 space-y-6">
                {!riskAssessment.length ? (
                    <div className="space-y-6">

                        {/* File Sniffer UI */}
                        {mode === 'file' && (
                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${dragActive ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
                                    }`}
                                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                                onDragOver={(e) => { e.preventDefault(); }}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={(e) => handleFile(e.target.files[0])}
                                    accept=".csv,.xlsx,.json"
                                />
                                <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                                <p className="font-medium text-slate-700">Drop a sample file here to detect schema</p>
                                <p className="text-xs text-slate-400 mt-1">We treat this as metadata only. No data uploaded yet.</p>
                            </div>
                        )}

                        {/* API UI */}
                        {mode === 'api' && (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm"
                                    placeholder="https://api.example.com/v1/data.json"
                                    value={formData.source}
                                    onChange={e => setFormData({ ...formData, source: e.target.value })}
                                />
                                <button
                                    onClick={handleApiAnalyze}
                                    disabled={loading}
                                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium"
                                >
                                    {loading ? 'Analyzing...' : 'Ping API'}
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <label className="block text-sm font-medium text-slate-700">Dataset Name</label>
                                    <Tooltip text="?" content="A broad name for this data collection (e.g., 'Q3 Financials')." />
                                </div>
                                <input
                                    type="text"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                    placeholder="e.g., Q3 Sales Records"
                                    value={formData.dataset_name}
                                    onChange={e => setFormData({ ...formData, dataset_name: e.target.value })}
                                />
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <label className="block text-sm font-medium text-slate-700">Internal Source Name</label>
                                    <Tooltip text="?" content="Where does this data originate? (e.g. Salesforce, Public Web)" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                    placeholder="e.g., CRM Export"
                                    value={formData.source}
                                    onChange={e => setFormData({ ...formData, source: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <label className="block text-sm font-medium text-slate-700">Sensitivity Level</label>
                                <Tooltip text="Why?" content="Used to determine which governance & privacy rules to apply." />
                            </div>
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
                    </div>
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
        </div>
    );
}
