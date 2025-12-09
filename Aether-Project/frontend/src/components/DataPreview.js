import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Table, ArrowRight, FileText, Hash, Type, Calendar, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function DataPreview({ datasetId, onProceed }) {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [columnStats, setColumnStats] = useState({});

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/datasets/${datasetId}/preview`);
                if (response.ok) {
                    const data = await response.json();
                    setPreview(data);

                    // Analyze column types and quality
                    const stats = {};
                    data.columns.forEach(col => {
                        const values = data.rows.map(row => row[col]);
                        const nullCount = values.filter(v => v === null || v === undefined).length;
                        const nonNullValues = values.filter(v => v !== null && v !== undefined);

                        // Detect type
                        let detectedType = 'text';
                        if (nonNullValues.length > 0) {
                            const sample = nonNullValues[0];
                            if (typeof sample === 'number') {
                                detectedType = Number.isInteger(sample) ? 'integer' : 'decimal';
                            } else if (!isNaN(Date.parse(sample))) {
                                detectedType = 'date';
                            } else if (nonNullValues.length < 10 && new Set(nonNullValues).size < 5) {
                                detectedType = 'category';
                            }
                        }

                        stats[col] = {
                            type: detectedType,
                            nullCount: nullCount,
                            completeness: ((values.length - nullCount) / values.length * 100).toFixed(1),
                            uniqueCount: new Set(nonNullValues).size
                        };
                    });

                    setColumnStats(stats);
                }
            } catch (error) {
                console.error("Failed to fetch preview", error);
            } finally {
                setLoading(false);
            }
        };

        if (datasetId) {
            fetchPreview();
        }
    }, [datasetId]);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'integer':
            case 'decimal':
                return <Hash size={14} className="text-blue-600" />;
            case 'text':
                return <Type size={14} className="text-purple-600" />;
            case 'date':
                return <Calendar size={14} className="text-green-600" />;
            case 'category':
                return <FileText size={14} className="text-orange-600" />;
            default:
                return <Info size={14} className="text-gray-600" />;
        }
    };

    const getCompletenessColor = (completeness) => {
        if (completeness >= 95) return 'text-green-600';
        if (completeness >= 80) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-gray-500">Loading preview...</p>
                </div>
            </div>
        );
    }

    if (!preview) {
        return (
            <div className="text-center p-8 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle size={48} className="mx-auto text-red-500 mb-3" />
                <h3 className="text-lg font-semibold text-red-700">Could not load data preview</h3>
                <p className="text-sm text-red-600 mt-1">Please try again or upload a different file</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl mx-auto"
        >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                                <Table className="text-primary" size={28} />
                                Data Preview
                            </h2>
                            <p className="text-gray-600">Review your data quality and structure before proceeding</p>

                            {/* Quick Stats */}
                            <div className="flex gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                        {preview.columns.length} Columns
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                                        {preview.rows.length} Preview Rows
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-green-600" />
                                    <span className="text-sm text-gray-600">
                                        {Object.values(columnStats).filter(s => parseFloat(s.completeness) === 100).length} Complete Columns
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onProceed}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                        >
                            Proceed to Story
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Column Info */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex flex-wrap gap-3">
                        {preview.columns.map((col) => (
                            <div key={col} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-1.5">
                                    {getTypeIcon(columnStats[col]?.type)}
                                    <span className="font-medium text-gray-700 text-sm">{col}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className={`text-xs font-semibold ${getCompletenessColor(columnStats[col]?.completeness)}`}>
                                        {columnStats[col]?.completeness}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b-2 border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-500 w-12">#</th>
                                {preview.columns.map((col) => (
                                    <th key={col} className="px-6 py-3 font-semibold text-left whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(columnStats[col]?.type)}
                                                <span>{col}</span>
                                            </div>
                                            <span className="text-xs font-normal text-gray-500 capitalize">
                                                {columnStats[col]?.type}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {preview.rows.map((row, idx) => (
                                <motion.tr
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white border-b border-gray-100 hover:bg-blue-50 transition-colors"
                                >
                                    <td className="px-4 py-4 text-gray-400 font-medium">{idx + 1}</td>
                                    {preview.columns.map((col) => (
                                        <td key={`${idx}-${col}`} className="px-6 py-4 whitespace-nowrap">
                                            {row[col] !== null && row[col] !== undefined ? (
                                                <span className="text-gray-700">{String(row[col])}</span>
                                            ) : (
                                                <span className="text-gray-300 italic flex items-center gap-1">
                                                    <AlertCircle size={12} />
                                                    null
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Info size={14} />
                            <span>Showing first 5 rows • Data types auto-detected • Quality metrics calculated</span>
                        </div>
                        <button
                            onClick={onProceed}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                            Continue
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
