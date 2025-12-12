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
                    {/* Navigation Controls */}
                    <div className="flex justify-between items-center mb-6">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-slate-100"
                            >
                                ← Back
                            </button>
                        )}
                        <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            Step {step} of {steps.length}: {steps[step - 1].label}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <ProgressBar currentStep={step} steps={steps} />

                    {step === 1 && (
                        <div className="animate-in fade-in duration-500">
                            <ProjectSetup onComplete={handleProjectComplete} />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in duration-500">
                            <DataInventory projectId={projectId} onComplete={handleInventoryComplete} />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in duration-500">
                            <MetricBuilder projectId={projectId} onComplete={handleMetricsComplete} />
                        </div>
                    )}

                    {step === 4 && (
                        <div className="flex flex-col items-center animate-in fade-in duration-500">
                            <div className="text-center mb-10">
                                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                                    Upload Your Data
                                </h1>
                                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                    Securely upload your dataset. We'll apply the ethical constraints you defined.
                                </p>
                            </div>
                            <FileUpload projectId={projectId} onUploadComplete={handleUploadComplete} />
                        </div>
                    )}

                    {step === 5 && (
                        <div className="animate-in fade-in duration-500">
                            <DataCleaning
                                datasetId={datasetId}
                                onProceed={handleCleaningComplete}
                            />
                        </div>
                    )}

                    {step === 6 && (
                        <div className="animate-in fade-in duration-500">
                            <StoryWizard
                                datasetId={datasetId}
                                onComplete={handleStoryComplete}
                            />
                        </div>
                    )}

                    {step === 7 && (
                        <div className="animate-in fade-in duration-500">
                            <AnalysisDashboard storyId={storyId} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
