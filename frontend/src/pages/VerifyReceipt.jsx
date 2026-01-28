import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Upload, CheckCircle, XCircle, ArrowLeft, FileText, Shield, Lock, Fingerprint, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';
import jsQR from 'jsqr';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const VerifyReceipt = () => {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const extractQRFromPDF = async (file) => {
        try {
            toast.loading('Decrypting PDF document...');
            const arrayBuffer = await file.arrayBuffer();
            let pdf;
            try {
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                pdf = await loadingTask.promise;
            } catch (loadError) {
                throw new Error("Failed to load PDF file. It might be corrupted or password protected.");
            }

            const maxPages = Math.min(pdf.numPages, 3);
            let foundCode = null;

            for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
                if (foundCode) break;
                let page = null;
                try { page = await pdf.getPage(pageNum); } catch (pageError) { continue; }

                let pageText = '';
                try {
                    const textContent = await page.getTextContent();
                    pageText = textContent.items.map(item => item.str).join(' ');
                } catch (textErr) { }

                const attempts = [2.0, 3.0, 1.5];
                for (const scale of attempts) {
                    if (foundCode) break;
                    try {
                        const viewport = page.getViewport({ scale });
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d', { willReadFrequently: true });
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        context.fillStyle = 'white';
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        await page.render({ canvasContext: context, viewport }).promise;
                        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });

                        if (code) {
                            try {
                                const qrJson = JSON.parse(code.data);
                                const parts = qrJson.data.split('|');
                                if (parts.length >= 3) {
                                    const qrName = parts[1];
                                    const qrAmount = parts[2];
                                    const qrDateRaw = parts[3];
                                    const qrTxId = parts[4];

                                    // 1. Name Check (Strict Word Boundary)
                                    // Escaping special regex chars in name just in case
                                    const escapedName = qrName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                    const nameRegex = new RegExp(`(?:^|[^a-zA-Z0-9])${escapedName}(?:$|[^a-zA-Z0-9])`, 'i');

                                    // STRICT CHECK: Must match whole word logic (Regex)
                                    // Previously .includes() allowed "Alex" inside "Alexander". 
                                    if (!nameRegex.test(pageText)) {
                                        const msg = `⚠️ TAMPER DETECTED: Name mismatch! '${qrName}' not found exactly.`;
                                        toast.error(msg);
                                        throw new Error(msg);
                                    }

                                    const cleanPageText = pageText.replace(/,/g, '');
                                    // 2. Amount Check (Strict)
                                    // Look for: (Start of Line OR Non-Digit) + Amount + (End of Line OR Non-Digit)
                                    const amountRegex = new RegExp(`(?:^|[^\\d])${qrAmount}(?!\\d)`);
                                    if (!amountRegex.test(cleanPageText)) {
                                        const msg = `⚠️ TAMPER DETECTED: Amount mismatch! Expected '${qrAmount}'.`;
                                        toast.error(msg);
                                        throw new Error(msg);
                                    }

                                    // 3. Date & Time Check (Strict Full Match)
                                    // Generate the exact string expected on PDF
                                    const formattedDate = new Date(qrDateRaw).toLocaleString();

                                    // Escape for Regex (dates have many special chars like / : ,)
                                    const escapedFullDate = formattedDate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                                    // Regex: Boundary + DateString + Boundary
                                    // Boundary can be start of line, space, non-digit/non-word char
                                    const fullDateRegex = new RegExp(`(?:^|[^0-9/:\\-])${escapedFullDate}(?:$|[^0-9/:\\-])`);

                                    // REMOVED LOOSE SHORT DATE CHECK:
                                    // Previously, if the date matched (1/28/2026) but time was tampered (1:00 -> 2:00),
                                    // the short date check would pass, bypassing the time verification.
                                    // Now we enforce the FULL EXACT TIMESTAMP.

                                    if (!fullDateRegex.test(pageText)) {
                                        const msg = `⚠️ TAMPER DETECTED: Date/Time mismatch! Expected '${formattedDate}'.`;
                                        toast.error(msg);
                                        throw new Error(msg);
                                    }

                                    // 4. Transaction ID Check (Strict boundary)
                                    const txRegex = new RegExp(`(?:^|[^a-zA-Z0-9])${qrTxId}(?:$|[^a-zA-Z0-9])`);
                                    if (!pageText.includes(qrTxId)) {
                                        const msg = `⚠️ TAMPER DETECTED: Transaction ID mismatch!`;
                                        toast.error(msg);
                                        throw new Error(msg);
                                    }
                                }
                            } catch (tamperErr) {
                                // If it's a specific tamper error we just threw, re-throw it so outer catch sees it
                                if (tamperErr.message.includes("TAMPER DETECTED")) {
                                    throw tamperErr;
                                }
                                // Otherwise ignore JSON parse errors
                            }
                            foundCode = code.data;
                        }
                        canvas.width = 0;
                        canvas.height = 0;
                    } catch (renderError) {
                        // Propagate tamper errors immediately
                        if (renderError.message.includes("TAMPER DETECTED")) throw renderError;
                    }
                }
                page.cleanup();
            }

            if (foundCode) {
                toast.dismiss();
                toast.success('QR signature extracted!');
                return foundCode;
            }
            toast.dismiss();
            toast.error('No QR code detected in document.');
            return null;
        } catch (err) {
            toast.dismiss();
            // Don't overwrite specific tamper messages
            if (err.message.includes("TAMPER DETECTED")) {
                toast.error(err.message);
                return null;
            }
            toast.error(err.message || 'Failed to process document.');
            return null;
        }
    };

    const handleFileChange = async (file) => {
        if (!file) return;
        setLoading(true);
        setError(null);
        setResult(null);
        toast.dismiss();
        let qrData = null;

        try {
            if (file.type === 'application/pdf') {
                qrData = await extractQRFromPDF(file);
            } else if (file.type.startsWith('image/')) {
                toast.loading('Analyzing image...');
                qrData = await scanImage(file);
            } else {
                setError('Unsupported file type.');
                setLoading(false);
                return;
            }
            if (!qrData) { setLoading(false); return; }
            await verifySignature(qrData);
        } catch (err) {
            setError('Processing error occurred.');
            setLoading(false);
        }
    };

    const scanImage = (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            const reader = new FileReader();
            reader.onload = (e) => {
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });
                    if (code) {
                        toast.dismiss();
                        toast.success('QR code extracted!');
                        resolve(code.data);
                    } else {
                        toast.dismiss();
                        toast.error('No QR code visible in image.');
                        resolve(null);
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const verifySignature = async (qrString) => {
        try {
            let parsedData;
            try { parsedData = JSON.parse(qrString); } catch (e) {
                setError('Invalid QR data format.');
                setLoading(false);
                return;
            }
            if (!parsedData.sig || !parsedData.data) {
                setError('Invalid receipt format.');
                setLoading(false);
                return;
            }
            toast.loading('Verifying cryptographic signature...');
            const res = await axios.post('/verify-receipt', { signature: parsedData.sig, originalData: parsedData.data });
            setResult(res.data);
            toast.dismiss();
            if (res.data.valid) toast.success('Signature verified!');
            else toast.error('Verification failed');
        } catch (err) {
            toast.dismiss();
            setError('Server connection failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileChange(file);
    };

    return (
        <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Cybersecurity Grid */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

            {/* Neon Orbs */}
            <div className="fixed top-[-15%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse" />
            <div className="fixed bottom-[-15%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

            <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#0f172a', color: '#fff', border: '1px solid rgba(6,182,212,0.3)' } }} />

            <Link to="/" className="absolute top-8 left-8 z-50 text-cyan-400/60 hover:text-cyan-400 flex items-center gap-2 transition-all hover:gap-3 group font-mono text-sm">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span>BACK</span>
            </Link>

            <div className="max-w-2xl w-full relative z-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="relative">
                            <Scan size={50} className="text-cyan-400" />
                            <motion.div
                                className="absolute inset-0 bg-cyan-400/30 blur-xl rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 mb-3">
                        Verification Terminal
                    </h1>
                    <p className="text-cyan-300/50 text-lg font-light tracking-wide">Authenticate payment receipts using RSA digital signatures</p>

                    {/* Security Badges */}
                    <div className="flex items-center justify-center gap-6 mt-6">
                        <div className="flex items-center gap-2 text-emerald-400/70 text-xs font-mono">
                            <Lock size={14} />
                            <span>DIGITAL SIGNATURE</span>
                        </div>
                        <div className="flex items-center gap-2 text-cyan-400/70 text-xs font-mono">
                            <Fingerprint size={14} />
                            <span>SECURE HASH</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-400/70 text-xs font-mono">
                            <Shield size={14} />
                            <span>TAMPER-PROOF</span>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Shield className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                            <div className="text-sm text-left">
                                <p className="text-amber-300 font-semibold mb-1 font-mono">⚠ SECURITY ADVISORY</p>
                                <p className="text-amber-200/70">PDF text can be modified. <strong className="text-white">Trust ONLY verified QR data.</strong> Any field mismatch indicates tampering.</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="bg-[#0a1628]/80 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/20 shadow-2xl shadow-cyan-500/5 relative overflow-hidden">
                    {/* Corner Accents */}
                    <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-cyan-500/50" />
                    <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-cyan-500/50" />
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-cyan-500/50" />
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-cyan-500/50" />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        className={`border-2 border-dashed rounded-xl p-12 transition-all duration-300 cursor-pointer relative ${isDragging ? 'border-cyan-400 bg-cyan-500/10' : 'border-cyan-500/30 hover:border-cyan-400/50 hover:bg-cyan-500/5'}`}
                    >
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    handleFileChange(e.target.files[0]);
                                }
                                e.target.value = ''; // Reset to allow re-selection of same file
                            }}
                        />
                        <div className="flex flex-col items-center gap-4 text-center pointer-events-none">
                            <motion.div animate={{ y: isDragging ? -10 : 0, scale: isDragging ? 1.1 : 1 }} transition={{ duration: 0.2 }} className="bg-cyan-500/10 p-6 rounded-2xl border border-cyan-500/30">
                                <Upload size={48} className="text-cyan-400" />
                            </motion.div>
                            <div>
                                <p className="font-bold text-xl text-white mb-2">Upload Receipt Document</p>
                                <p className="text-cyan-400/50 text-sm mb-1 font-mono">DROP FILE OR CLICK TO BROWSE</p>
                                <p className="text-emerald-400/70 text-xs mt-3 font-mono">⚡ PDF QR AUTO-EXTRACTION ENABLED</p>
                            </div>
                        </div>
                    </motion.div>

                    {loading && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-cyan-400 font-mono text-sm">VERIFYING CRYPTOGRAPHIC SIGNATURE...</span>
                            </div>
                        </motion.div>
                    )}

                    <AnimatePresence>
                        {result && (
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", duration: 0.6 }} className={`mt-8 p-6 rounded-xl border-2 ${result.valid ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
                                        {result.valid ? <div className="bg-emerald-500/20 p-3 rounded-full border-2 border-emerald-500"><CheckCircle className="text-emerald-400" size={32} /></div> : <div className="bg-red-500/20 p-3 rounded-full border-2 border-red-500"><XCircle className="text-red-400" size={32} /></div>}
                                    </motion.div>
                                    <h3 className={`text-2xl font-bold font-mono ${result.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {result.valid ? 'SIGNATURE VALID' : 'VERIFICATION FAILED'}
                                    </h3>
                                </div>
                                <p className="text-center text-gray-300">{result.message}</p>
                                {result.valid && result.verifiedData && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4 pt-4 border-t border-emerald-500/30">
                                        <div className="flex items-center justify-center gap-2 text-emerald-300 text-xs mb-3 font-mono">
                                            <Shield size={14} />
                                            <span>DIGITALLY AUTHENTICATED</span>
                                        </div>
                                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
                                            <p className="text-emerald-400 font-semibold text-xs mb-3 font-mono">VERIFIED PAYLOAD:</p>
                                            <div className="space-y-2 text-sm font-mono">
                                                <div className="flex justify-between"><span className="text-gray-500">NAME:</span><span className="text-white">{result.verifiedData.studentName}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-500">AMOUNT:</span><span className="text-cyan-400">Rs. {result.verifiedData.amount}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-500">TX_ID:</span><span className="text-white text-xs">{result.verifiedData.transactionId}</span></div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8 p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg text-sm font-mono">
                                <div className="flex items-start gap-2"><XCircle size={18} className="flex-shrink-0 mt-0.5" /><span>⚠ {error}</span></div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#0a1628]/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4 text-center">
                        <FileText className="mx-auto mb-2 text-cyan-400" size={24} />
                        <p className="text-xs text-cyan-400/60 font-mono">PDF AUTO-SCAN</p>
                    </div>
                    <div className="bg-[#0a1628]/60 backdrop-blur-xl border border-emerald-500/20 rounded-xl p-4 text-center">
                        <Shield className="mx-auto mb-2 text-emerald-400" size={24} />
                        <p className="text-xs text-emerald-400/60 font-mono">SIGNATURE CHECK</p>
                    </div>
                    <div className="bg-[#0a1628]/60 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4 text-center">
                        <CheckCircle className="mx-auto mb-2 text-blue-400" size={24} />
                        <p className="text-xs text-blue-400/60 font-mono">INSTANT RESULT</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default VerifyReceipt;