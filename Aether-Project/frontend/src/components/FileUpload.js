import { useState, useRef } from 'react';
import { API_URL } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export default function FileUpload({ onUploadComplete, projectId }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [warnings, setWarnings] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setMessage('');
            setWarnings([]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setMessage('');
            setWarnings([]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setMessage('');
        setWarnings([]);

        const formData = new FormData();
        formData.append('file', file);
        if (projectId) {
            formData.append('project_id', projectId);
        }

        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Success: ${data.info}`);
                if (data.warnings && data.warnings.length > 0) {
                    setWarnings(data.warnings);
                }
                if (onUploadComplete) {
                    onUploadComplete(data);
                }
            } else {
                setMessage('Upload failed');
            }
        } catch (error) {
            setMessage('Error uploading file');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-sm"
            >
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
            relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300
            ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}
          `}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".csv,.xlsx,.json,.parquet"
                    />

                    <div className="flex flex-col items-center gap-4">
                        <div className={`p-4 rounded-full ${isDragging ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                            <UploadCloud size={32} />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-gray-700">
                                {file ? file.name : "Click to upload or drag and drop"}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                CSV, Excel, JSON, or Parquet (Max 50MB)
                            </p>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {file && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6"
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                                disabled={uploading}
                                className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={20} />
                                        Start Analysis
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {warnings.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
                        >
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-yellow-600 shrink-0" size={20} />
                                <div>
                                    <h4 className="font-semibold text-yellow-800">Ethical Guardrails Alert</h4>
                                    <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                                        {warnings.map((w, idx) => (
                                            <li key={idx}>
                                                <span className="font-medium">{w.type}</span> detected in column <span className="font-mono bg-yellow-100 px-1 rounded">{w.column}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
