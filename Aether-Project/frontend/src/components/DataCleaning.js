import { useState, useEffect } from 'react';
import { API_URL } from '../services/api';
import { motion } from 'framer-motion';
import {
    Table, ArrowRight, Trash2, Edit2, Droplet, RefreshCw,
    AlertCircle, CheckCircle, Save, X, Wand2, Shield
} from 'lucide-react';

export default function DataCleaning({ datasetId, onProceed, onBack }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [editingCol, setEditingCol] = useState(null);
    const [renameValue, setRenameValue] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/datasets/${datasetId}/preview`);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (datasetId) fetchData();
    }, [datasetId]);

    const handleClean = async (operation, params = {}) => {
        setProcessing(true);
        try {
            const response = await fetch(`${API_URL}/datasets/${datasetId}/clean`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operation, params })
            });

            if (response.ok) {
                await fetchData(); // Refresh data
                setEditingCol(null);
            } else {
                alert("Operation failed");
            }
        } catch (error) {
            console.error("Cleaning failed", error);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (!data) return <div className="text-red-500 text-center">Failed to load data</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl mx-auto space-y-6"
        >
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Wand2 className="text-primary" />
                        Interactive Data Cleaning
                    </h2>
                    <p className="text-gray-500">Prepare your data for analysis. Fix issues now for better results later.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleClean('drop_duplicates')}
                        disabled={processing}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                    >
                        <RefreshCw size={16} className={processing ? "animate-spin" : ""} />
                        Remove Duplicates
                    </button>
                    <button
                        onClick={onProceed}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold shadow-lg"
                    >
                        All Good, Proceed
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            {/* PII Warning Banner */}
            {data.pii_warnings && data.pii_warnings.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="text-red-600 shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-red-900">Privacy Warning: PII Detected</h3>
                        <p className="text-sm text-red-700 mt-1">
                            We found potential Personally Identifiable Information (PII) in the following columns:
                            <span className="font-semibold"> {data.pii_warnings.map(w => w.column).join(', ')}</span>.
                            Please anonymize this data before proceeding.
                        </p>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                                {data.columns.map((col) => (
                                    <th key={col} className="px-6 py-4 font-semibold whitespace-nowrap min-w-[200px]">
                                        <div className="flex flex-col gap-2">
                                            {editingCol === col ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={renameValue}
                                                        onChange={(e) => setRenameValue(e.target.value)}
                                                        className="px-2 py-1 border rounded text-xs w-full"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleClean('rename_column', { old_name: col, new_name: renameValue })}
                                                        className="text-green-600 hover:bg-green-50 p-1 rounded"
                                                    >
                                                        <Save size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingCol(null)}
                                                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between group">
                                                    <span>{col}</span>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => { setEditingCol(col); setRenameValue(col); }}
                                                            className="p-1 hover:bg-gray-200 rounded text-gray-500"
                                                            title="Rename"
                                                        >
                                                            <Edit2 size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleClean('drop_column', { column: col })}
                                                            className="p-1 hover:bg-red-100 text-red-500 rounded"
                                                            title="Drop Column"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Column Actions */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleClean('impute', { column: col, method: 'mean' })}
                                                    className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 w-full text-center"
                                                >
                                                    Fill Missing
                                                </button>
                                                <button
                                                    onClick={() => handleClean('anonymize', { column: col })}
                                                    className="text-[10px] px-2 py-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 w-full text-center flex items-center justify-center gap-1"
                                                    title="Hash values to protect privacy"
                                                >
                                                    <Shield size={10} />
                                                    Anonymize
                                                </button>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.rows.map((row, idx) => (
                                <tr key={idx} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                                    {data.columns.map((col) => (
                                        <td key={`${idx}-${col}`} className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {row[col] === null ? (
                                                <span className="text-red-400 italic text-xs flex items-center gap-1">
                                                    <AlertCircle size={10} /> null
                                                </span>
                                            ) : (
                                                String(row[col])
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
                    Showing first 5 rows • Changes are applied immediately
                </div>
            </div>
        </motion.div>
    );
}
