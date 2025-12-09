import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ScatterChart, Scatter
} from 'recharts';
import {
    Activity, Database, AlertTriangle, FileText, Download, Brain,
    TrendingUp, Zap, CheckCircle, Target, Shield, Sparkles, GitBranch, Lightbulb, Lock
} from 'lucide-react';

export default function AnalysisDashboard({ storyId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('insights');
    const [correlations, setCorrelations] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [clusters, setClusters] = useState(null);
    const [anomalies, setAnomalies] = useState(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/analysis/${storyId}`);
                if (response.ok) {
                    const result = await response.json();
                    setData(result);

                    // Fetch AI features in parallel
                    Promise.all([
                        fetch(`http://127.0.0.1:8000/ai/correlations/${storyId}`),
                        fetch(`http://127.0.0.1:8000/ai/recommendations/${storyId}`)
                    ]).then(async ([corrRes, recRes]) => {
                        if (corrRes.ok) {
                            const corrData = await corrRes.json();
                            setCorrelations(corrData.correlations || []);
                        }
                        if (recRes.ok) {
                            const recData = await recRes.json();
                            setRecommendations(recData.recommendations || []);
                        }
                    }).catch(err => console.error('Failed to fetch AI features:', err));
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [storyId]);

    const handleDownloadReport = () => {
        window.open(`http://127.0.0.1:8000/reports/${storyId}`, '_blank');
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'border-red-200 bg-red-50';
            case 'medium': return 'border-yellow-200 bg-yellow-50';
            case 'low': return 'border-green-200 bg-green-50';
            default: return 'border-gray-200 bg-gray-50';
        }
    };

    const getHealthColor = (score) => {
        if (score >= 90) return 'text-green-600 bg-green-100';
        if (score >= 75) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 animate-pulse text-lg">Analyzing your data...</p>
                <p className="text-gray-400 text-sm">Running quality checks, generating insights</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center p-8 text-red-500 bg-red-50 rounded-xl border border-red-200">
                <AlertTriangle size={48} className="mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Failed to load analysis data</h3>
                <p className="text-sm mt-2">Please try refreshing the page</p>
            </div>
        );
    }

    const { dataset_info, visualization, auto_insights, health_scores } = data;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-7xl mx-auto space-y-6"
        >
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Activity className="text-primary" />
                            Analysis Dashboard
                        </h2>
                        <p className="text-gray-500 mt-1">Powered by Aether Intelligence Engine</p>
                    </div>
                    <button
                        onClick={handleDownloadReport}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-semibold shadow-lg"
                    >
                        <Download size={16} />
                        Export Report
                    </button>
                </div>

                {/* Data Health Scores */}
                {health_scores && (
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Shield size={20} className="text-primary" />
                                Data Health Score
                            </h3>
                            <div className={`px-4 py-2 rounded-full font-bold text-2xl ${getHealthColor(health_scores.overall)}`}>
                                {health_scores.overall}%
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-600">Completeness</span>
                                    <span className="text-lg font-bold text-gray-900">{health_scores.completeness}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${health_scores.completeness}%` }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-600">Uniqueness</span>
                                    <span className="text-lg font-bold text-gray-900">{health_scores.uniqueness}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${health_scores.uniqueness}%` }}
                                        transition={{ duration: 1, delay: 0.4 }}
                                        className="h-full bg-gradient-to-r from-green-500 to-green-600"
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-600">Validity</span>
                                    <span className="text-lg font-bold text-gray-900">{health_scores.validity}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${health_scores.validity}%` }}
                                        transition={{ duration: 1, delay: 0.6 }}
                                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-6 overflow-x-auto">
                    {[
                        { id: 'insights', label: 'AI Insights', icon: Sparkles },
                        { id: 'overview', label: 'Overview', icon: Database },
                        { id: 'eda', label: 'Exploratory Analysis', icon: Activity },
                        { id: 'correlations', label: 'Correlations', icon: GitBranch },
                        { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
                        { id: 'quality', label: 'Data Quality', icon: Shield },
                        { id: 'visuals', label: 'Visualizations', icon: TrendingUp },
                        { id: 'ml', label: 'Deep Pattern Discovery', icon: Brain }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-4 text-sm font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {/* AI Insights Tab */}
                {activeTab === 'insights' && auto_insights && (
                    <motion.div
                        key="insights"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Sparkles className="text-primary" />
                                Auto-Generated Insights
                            </h3>
                            <div className="grid gap-4">
                                {auto_insights.map((insight, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`p-4 rounded-xl border-2 ${getPriorityColor(insight.priority)}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="text-3xl">{insight.icon}</div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                                                <p className="text-gray-700 text-sm">{insight.finding}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {insight.priority.toUpperCase()}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Phase 10: Fairness Warning */}
                        {data.bias_warnings && data.bias_warnings.length > 0 && (
                            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertTriangle className="text-amber-600 shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-amber-800">Fairness Warning Detected</h4>
                                    <ul className="list-disc list-inside text-sm text-amber-700 mt-1">
                                        {data.bias_warnings.map((w, i) => (
                                            <li key={i}>
                                                <strong>{w.column}:</strong> {w.issue} ({w.details})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Phase 4: Fairness Score Cards */}
                        {data.fairness_scores && Object.keys(data.fairness_scores).length > 0 && (
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.entries(data.fairness_scores).map(([col, score]) => (
                                    <div key={col} className={`bg-white p-4 rounded-xl border-t-4 shadow-sm ${score >= 80 ? 'border-teal-500' : score >= 50 ? 'border-amber-500' : 'border-red-500'
                                        }`}>
                                        <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Fairness Score</div>
                                        <div className="text-2xl font-bold text-slate-900 mt-1">{score}%</div>
                                        <div className="text-xs text-slate-400 mt-1">Column: {col}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Phase 10: Data Transparency Card */}
                        {data.data_card && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <Shield className="text-teal-600" size={20} />
                                    Data Transparency Card
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Source</div>
                                        <div className="text-slate-900 font-medium mt-1 truncate" title={data.data_card.source}>
                                            {data.data_card.source}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Dimensions</div>
                                        <div className="text-slate-900 font-medium mt-1">
                                            {data.data_card.rows} rows × {data.data_card.columns} cols
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">PII Status</div>
                                        <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${data.data_card.pii_detected ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {data.data_card.pii_detected ? <><Lock size={12} /> PII Detected</> : <><CheckCircle size={12} /> Clean</>}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Bias Check</div>
                                        <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${data.data_card.bias_detected ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {data.data_card.bias_detected ? '⚠️ Issues Found' : '✅ Passed'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center gap-3 mb-3 text-blue-700">
                                    <Database size={24} />
                                    <h3 className="font-semibold text-lg">Dataset Shape</h3>
                                </div>
                                <p className="text-4xl font-bold text-gray-900 mb-1">{dataset_info.rows.toLocaleString()}</p>
                                <p className="text-gray-500">Rows across {dataset_info.columns} columns</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center gap-3 mb-3 text-green-700">
                                    <CheckCircle size={24} />
                                    <h3 className="font-semibold text-lg">Data Cleaned</h3>
                                </div>
                                <p className="text-4xl font-bold text-gray-900 mb-1">{dataset_info.duplicates_removed.toLocaleString()}</p>
                                <p className="text-gray-500">Duplicates removed</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center gap-3 mb-3 text-purple-700">
                                    <Target size={24} />
                                    <h3 className="font-semibold text-lg">Completeness</h3>
                                </div>
                                <p className="text-4xl font-bold text-gray-900 mb-1">
                                    {health_scores ? health_scores.completeness : 100}%
                                </p>
                                <p className="text-gray-500">Data Health Score</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Correlations Tab */}
                {activeTab === 'correlations' && (
                    <motion.div
                        key="correlations"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <GitBranch className="text-primary" />
                            Discovered Correlations
                        </h3>
                        {correlations.length > 0 ? (
                            <div className="grid gap-4">
                                {correlations.map((corr, idx) => (
                                    <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{corr.var1} ↔ {corr.var2}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{corr.insight}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-2xl font-bold ${corr.direction === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {corr.direction === 'positive' ? '+' : ''}{(corr.correlation * 100).toFixed(0)}%
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full ${corr.strength === 'strong' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {corr.strength}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No strong correlations detected</p>
                        )}
                    </motion.div>
                )}

                {/* Recommendations Tab */}
                {activeTab === 'recommendations' && (
                    <motion.div
                        key="recommendations"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Lightbulb className="text-primary" />
                            AI Recommendations
                        </h3>
                        {recommendations.length > 0 ? (
                            <div className="space-y-4">
                                {recommendations.map((rec, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl border-2 ${getPriorityColor(rec.priority)}`}>
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-semibold text-gray-900">{rec.action}</h4>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {rec.priority}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">{rec.category}</span>
                                            <span className="text-gray-500">Impact: {rec.impact}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">Loading recommendations...</p>
                        )}
                    </motion.div>
                )}

                {/* Quality Tab */}
                {activeTab === 'quality' && (
                    <motion.div
                        key="quality"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <AlertTriangle className="text-amber-500" size={20} />
                            Missing Values Report
                        </h3>
                        {Object.keys(dataset_info.missing_values).length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                                <p className="text-green-600 font-semibold text-lg">No missing values detected!</p>
                                <p className="text-gray-500 mt-1">Your dataset is 100% complete</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {Object.entries(dataset_info.missing_values).map(([col, count]) => (
                                    <div key={col} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle size={20} className="text-amber-500" />
                                            <span className="font-medium text-gray-700">{col}</span>
                                        </div>
                                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                                            {count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Visuals Tab */}
                {activeTab === 'visuals' && visualization && (
                    <motion.div
                        key="visuals"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">
                            {visualization.type === 'bar' ? 'Category Distribution' : 'Correlation View'}
                        </h3>
                        <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {visualization.type === 'bar' ? (
                                    <BarChart data={visualization.data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey={visualization.x_axis} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey={visualization.y_axis} fill="#6366f1" />
                                    </BarChart>
                                ) : (
                                    <ScatterChart>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" dataKey={visualization.x_axis} name={visualization.x_axis} />
                                        <YAxis type="number" dataKey={visualization.y_axis} name={visualization.y_axis} />
                                        <Tooltip />
                                        <Scatter name="Data" data={visualization.data} fill="#6366f1" />
                                    </ScatterChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {/* Exploratory Analysis Tab */}
                {activeTab === 'eda' && data.advanced_stats && (
                    <motion.div
                        key="eda"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Distributions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(data.distributions).slice(0, 4).map(([col, dist], idx) => (
                                <div key={col} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{col} Distribution</h3>
                                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                                <span>Skew: {data.advanced_stats[col].skewness}</span>
                                                <span>Kurt: {data.advanced_stats[col].kurtosis}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-48 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={dist}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="range" tick={{ fontSize: 10 }} interval={1} />
                                                <YAxis tick={{ fontSize: 10 }} />
                                                <Tooltip />
                                                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Correlation Heatmap */}
                        {data.correlations && data.correlations.matrix && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <GitBranch className="text-primary" />
                                    Correlation Heatmap
                                </h3>
                                <div className="h-96 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                            <XAxis type="category" dataKey="x" name="Variable 1" interval={0} tick={{ fontSize: 12 }} />
                                            <YAxis type="category" dataKey="y" name="Variable 2" interval={0} tick={{ fontSize: 12 }} />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                                                if (payload && payload.length) {
                                                    const { x, y, value } = payload[0].payload;
                                                    return (
                                                        <div className="bg-white p-2 border border-gray-200 shadow-lg rounded text-xs">
                                                            <p className="font-bold">{x} ↔ {y}</p>
                                                            <p>Correlation: {value}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }} />
                                            <Scatter data={data.correlations.matrix} shape="square">
                                                {data.correlations.matrix.map((entry, index) => {
                                                    const val = entry.value;
                                                    const color = val > 0
                                                        ? `rgba(99, 102, 241, ${Math.abs(val)})` // Blue for positive
                                                        : `rgba(239, 68, 68, ${Math.abs(val)})`; // Red for negative
                                                    return <cell key={`cell-${index}`} fill={color} />;
                                                })}
                                            </Scatter>
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Deep Pattern Discovery Tab */}
                {activeTab === 'ml' && (
                    <motion.div
                        key="ml"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Brain size={120} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 flex items-center gap-3 relative z-10">
                                <Brain size={32} className="text-purple-300" />
                                Deep Pattern Discovery
                            </h3>
                            <p className="opacity-90 mb-6 text-lg max-w-2xl relative z-10">
                                Our AI engine automatically segments your data into natural groups and identifies anomalies that deviate from the norm. No training required.
                            </p>

                            {!clusters && !anomalies ? (
                                <button
                                    onClick={async () => {
                                        try {
                                            const [clusterRes, anomalyRes] = await Promise.all([
                                                fetch(`http://127.0.0.1:8000/ml/cluster/${storyId}`),
                                                fetch(`http://127.0.0.1:8000/ml/anomalies/${storyId}`)
                                            ]);

                                            if (clusterRes.ok) setClusters(await clusterRes.json());
                                            if (anomalyRes.ok) setAnomalies(await anomalyRes.json());
                                        } catch (e) {
                                            alert("Failed to run discovery");
                                        }
                                    }}
                                    className="px-8 py-4 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg flex items-center gap-2 relative z-10"
                                >
                                    <Sparkles size={20} />
                                    Run Deep Discovery
                                </button>
                            ) : (
                                <div className="flex gap-4 relative z-10">
                                    <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                        <span className="block text-sm opacity-70">Clusters Found</span>
                                        <span className="text-2xl font-bold">{clusters?.clusters?.length || 0}</span>
                                    </div>
                                    <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                        <span className="block text-sm opacity-70">Anomalies Detected</span>
                                        <span className="text-2xl font-bold">{anomalies?.anomaly_count || 0}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Clusters Section */}
                        {clusters && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                        <Target className="text-indigo-600" />
                                        Customer Segments (Clusters)
                                    </h3>
                                    <div className="h-80 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ScatterChart>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" dataKey="x" name={clusters.x_label} label={{ value: clusters.x_label, position: 'bottom' }} />
                                                <YAxis type="number" dataKey="y" name={clusters.y_label} label={{ value: clusters.y_label, angle: -90, position: 'left' }} />
                                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                                <Scatter name="Clusters" data={clusters.plot_data} fill="#8884d8">
                                                    {clusters.plot_data.map((entry, index) => (
                                                        <cell key={`cell-${index}`} fill={['#6366f1', '#ec4899', '#10b981'][entry.cluster % 3]} />
                                                    ))}
                                                </Scatter>
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {clusters.clusters.map((cluster, idx) => (
                                        <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
                                            <div className={`absolute top-0 left-0 w-1 h-full ${['bg-indigo-500', 'bg-pink-500', 'bg-emerald-500'][idx % 3]}`} />
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="font-bold text-gray-900">Segment {idx + 1}</h4>
                                                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
                                                    {cluster.percentage}% of data
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {Object.entries(cluster.characteristics).map(([key, val]) => (
                                                    <div key={key} className="flex justify-between text-sm">
                                                        <span className="text-gray-500 capitalize">{key}</span>
                                                        <span className="font-medium text-gray-900">{val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Anomalies Section */}
                        {anomalies && anomalies.anomaly_count > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 border-l-4 border-l-red-500">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <AlertTriangle className="text-red-500" />
                                    Top Anomalies Detected
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                            <tr>
                                                {Object.keys(anomalies.top_anomalies[0]).slice(0, 5).map(key => (
                                                    <th key={key} className="px-6 py-3">{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {anomalies.top_anomalies.map((row, idx) => (
                                                <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                                    {Object.values(row).slice(0, 5).map((val, i) => (
                                                        <td key={i} className="px-6 py-4 font-medium text-gray-900">
                                                            {val}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
