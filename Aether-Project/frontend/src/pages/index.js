import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from '../components/FileUpload';
import DataCleaning from '../components/DataCleaning';
import StoryWizard from '../components/StoryWizard';
import AnalysisDashboard from '../components/AnalysisDashboard';
import ProgressBar from '../components/ProgressBar';
import ProjectSetup from '../components/ProjectSetup';
import DataInventory from '../components/DataInventory';
import MetricBuilder from '../components/MetricBuilder';

export default function Home() {
    const [step, setStep] = useState(1);
    const [projectId, setProjectId] = useState(null);
    const [datasetId, setDatasetId] = useState(null);
    const [storyId, setStoryId] = useState(null);
    const [metrics, setMetrics] = useState([]);

    const steps = [
        { label: 'Project Scope' },
        { label: 'Data Inventory' },
        { label: 'Success Metrics' },
        { label: 'Upload Data' },
        { label: 'Clean & Prep' },
        { label: 'Define Story' },
        { label: 'Deep Insights' }
    ];

    const handleProjectComplete = (id) => {
        setProjectId(id);
        setStep(2);
    };

    const handleInventoryComplete = () => {
        setStep(3);
    };

    const handleMetricsComplete = (selectedMetrics) => {
        setMetrics(selectedMetrics);
        setStep(4);
    };

    const handleUploadComplete = (data) => {
        if (data && data.dataset_id) {
            setDatasetId(data.dataset_id);
            setStep(5);
        } else if (data && data.id) {
            setDatasetId(data.id);
            setStep(5);
        }
    };

    const handleCleaningComplete = () => {
        setStep(6);
    };

    const handleStoryComplete = (id) => {
        setStoryId(id);
        setStep(7);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-500/20">
            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-slate-800 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-teal-900/20">
                            A
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                            Aether
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">v3.1 Ethical Flow</span>
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Progress Bar */}
                    <ProgressBar currentStep={step} steps={steps} />

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="project"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <ProjectSetup onComplete={handleProjectComplete} />
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="inventory"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <DataInventory projectId={projectId} onComplete={handleInventoryComplete} />
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="metrics"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <MetricBuilder projectId={projectId} onComplete={handleMetricsComplete} />
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col items-center"
                            >
                                <div className="text-center mb-10">
                                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                                        Upload Your Data
                                    </h1>
                                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                        Securely upload your dataset. We'll apply the ethical constraints you defined.
                                    </p>
                                </div>
                                <FileUpload projectId={projectId} onUploadComplete={handleUploadComplete} />
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div
                                key="clean"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <DataCleaning
                                    datasetId={datasetId}
                                    onProceed={handleCleaningComplete}
                                />
                            </motion.div>
                        )}

                        {step === 6 && (
                            <motion.div
                                key="story"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <StoryWizard
                                    datasetId={datasetId}
                                    onComplete={handleStoryComplete}
                                />
                            </motion.div>
                        )}

                        {step === 7 && (
                            <motion.div
                                key="analysis"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <AnalysisDashboard storyId={storyId} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
