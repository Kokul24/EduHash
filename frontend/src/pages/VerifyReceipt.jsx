import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Upload, CheckCircle, XCircle, ArrowLeft, FileText, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';
import jsQR from 'jsqr';

// Configure PDF.js worker using static file in public folder
// This is the most reliable method avoiding bundler issues
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const VerifyReceipt = () => {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // No need for useEffect to set worker anymore

    const extractQRFromPDF = async (file) => {
        try {
            toast.loading('Processing PDF document...');

            const arrayBuffer = await file.arrayBuffer();

            // Load the document using the standard promise approach
            // We use a try-catch block specifically for loading to catch file corruption
            let pdf;
            try {
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                pdf = await loadingTask.promise;
            } catch (loadError) {
                console.error("PDF Load Error:", loadError);
                throw new Error("Failed to load PDF file. It might be corrupted or password protected.");
            }

            console.log(`PDF loaded. Pages: ${pdf.numPages}`);

            // Loop through pages (limit to first 3 to save resources)
            const maxPages = Math.min(pdf.numPages, 3);
            let foundCode = null;

            for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
                if (foundCode) break; // Stop if found

                console.log(`Scanning page ${pageNum}...`);

                let page = null;
                try {
                    page = await pdf.getPage(pageNum);
                } catch (pageError) {
                    console.warn(`Skipping page ${pageNum} due to error:`, pageError);
                    continue;
                }

                // 1. Extract Text Content from the page for Anti-Tamper Check
                let pageText = '';
                try {
                    const textContent = await page.getTextContent();
                    pageText = textContent.items.map(item => item.str).join(' ');
                } catch (textErr) {
                    console.warn("Could not extract text for tamper check:", textErr);
                }

                // Try multiple scales if the first one fails
                const attempts = [2.0, 3.0, 1.5];

                for (const scale of attempts) {
                    if (foundCode) break;

                    try {
                        const viewport = page.getViewport({ scale });
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d', { willReadFrequently: true });
                        const renderContext = {
                            canvasContext: context,
                            viewport: viewport
                        };

                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        // Important: Draw white background first (PDFs are transparent)
                        context.fillStyle = 'white';
                        context.fillRect(0, 0, canvas.width, canvas.height);

                        await page.render(renderContext).promise;

                        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height, {
                            inversionAttempts: "attemptBoth",
                        });

                        if (code) {
                            console.log('QR Found:', code.data);

                            // --- TAMPER DETECTION LOGIC ---
                            try {
                                const qrJson = JSON.parse(code.data);
                                // The data string is: StudentID|StudentName|Amount|Date|TransactionID
                                const parts = qrJson.data.split('|');

                                if (parts.length >= 3) {
                                    const qrName = parts[1];
                                    const qrAmount = parts[2];
                                    const qrDateRaw = parts[3];
                                    const qrTxId = parts[4];

                                    console.log("Checking Tamper:", { qrName, qrAmount, qrDateRaw, qrTxId });

                                    if (!pageText.includes(qrName)) {
                                        toast.error(`⚠️ TAMPER DETECTED: Name '${qrName}' not found on receipt text!`);
                                        throw new Error("Tampered Receipt Detected: Visual name does not match digital record.");
                                    }

                                    // Strict Amount Check (Prevents 12000 matching 120000)
                                    // We use Regex to look for the amount NOT followed by another digit
                                    // We also stripping commas from page text to handle "12,000" vs "12000"
                                    const cleanPageText = pageText.replace(/,/g, '');
                                    const amountRegex = new RegExp(`${qrAmount}(?!\\d)`); // Lookahead: Next char must NOT be a digit

                                    if (!amountRegex.test(cleanPageText)) {
                                        toast.error(`⚠️ TAMPER DETECTED: Amount '${qrAmount}' mismatch!`);
                                        throw new Error(`Tampered Receipt Detected: Visual amount (${cleanPageText.match(/\d+/g)?.find(n => n.includes(qrAmount)) || 'modified'}) does not match digital record (${qrAmount}).`);
                                    }

                                    // Date Check (Formatted)
                                    // We convert the raw date from QR to the localized string used on PDF
                                    const formattedDate = new Date(qrDateRaw).toLocaleString();
                                    // Remove commas for looser matching just in case extraction logic is weird
                                    // But usually includes works fine if locale matches.
                                    if (!pageText.includes(formattedDate)) {
                                        // Fallback: Try just the date part if time caused mismatch
                                        const justDate = new Date(qrDateRaw).toLocaleDateString();
                                        if (!pageText.includes(justDate)) {
                                            toast.error(`⚠️ TAMPER DETECTED: Date mismatch!`);
                                            throw new Error("Tampered Receipt Detected: Visual date does not match digital record.");
                                        }
                                    }

                                    // Transaction ID Check
                                    if (!pageText.includes(qrTxId)) {
                                        toast.error(`⚠️ TAMPER DETECTED: Transaction ID mismatch!`);
                                        throw new Error("Tampered Receipt Detected: Visual Transaction ID does not match digital record.");
                                    }
                                }
                            } catch (tamperErr) {
                                if (tamperErr.message.includes("Tampered")) {
                                    throw tamperErr; // Propagate the specific tamper error
                                }
                                // Ignore JSON parse errors if format is different (legacy receipts)
                                console.log("Skipping tamper check (legacy format or parse error)");
                            }
                            // -----------------------------

                            foundCode = code.data;
                        }

                        // Cleanup canvas memory
                        canvas.width = 0;
                        canvas.height = 0;
                    } catch (renderError) {
                        // Re-throw if it's our tamper error
                        if (renderError.message.includes("Tampered")) throw renderError;
                        console.warn(`Render error on p${pageNum} s${scale}:`, renderError);
                    }
                }

                // Cleanup page resources
                page.cleanup();
            }

            if (foundCode) {
                toast.dismiss();
                toast.success('QR code found in PDF!');
                return foundCode;
            }

            // If we get here, no QR was found
            toast.dismiss();
            toast.error('No QR code detected in the PDF file.');
            return null;

        } catch (err) {
            console.error('PDF Error:', err);
            toast.dismiss();
            toast.error(err.message || 'Failed to read PDF file.');
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
                // Handle Image Logic
                toast.loading('Scanning image...');
                qrData = await scanImage(file); // Extracted into helper function below
            } else {
                setError('Unsupported file type. Please upload a PDF or Image.');
                setLoading(false);
                return;
            }

            if (!qrData) {
                setLoading(false);
                return; // Error already handled in extraction functions
            }

            // Verify Logic
            await verifySignature(qrData);

        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred processing the file.');
            setLoading(false);
        }
    };

    // Helper for Images (cleaned up from your original code)
    const scanImage = (file) => {
        return new Promise((resolve, reject) => {
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
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "attemptBoth"
                    });

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
            try {
                parsedData = JSON.parse(qrString);
            } catch (e) {
                setError('The QR code does not contain valid JSON data for this system.');
                setLoading(false);
                return;
            }

            if (!parsedData.sig || !parsedData.data) {
                setError('Invalid receipt format. Missing signature or data.');
                setLoading(false);
                return;
            }

            toast.loading('Verifying with server...');

            const res = await axios.post('/verify-receipt', {
                signature: parsedData.sig,
                originalData: parsedData.data
            });

            setResult(res.data);
            toast.dismiss();

            if (res.data.valid) {
                toast.success('Verified Successfully!');
            } else {
                toast.error('Verification Failed');
            }

        } catch (err) {
            console.error(err);
            toast.dismiss();
            setError('Server connection failed during verification.');
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

    // ... Rest of your render logic (JSX) stays exactly the same ...
    // Copy the return (...) statement from your original code here

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1b] via-[#0f0f23] to-[#1a0b2e] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* ... Keep your exact existing JSX ... */}

            {/* JUST A PLACEHOLDER FOR BREVITY - PASTE YOUR JSX HERE */}
            <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
            <Link to="/" className="absolute top-8 left-8 z-50 text-gray-400 hover:text-white flex items-center gap-2 transition-all hover:gap-3 group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back</span>
            </Link>

            <div className="max-w-2xl w-full relative z-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="bg-gradient-to-br from-teal-600 to-emerald-600 p-3 rounded-xl"><Shield size={32} /></div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-500 mb-3">Public Verification Portal</h1>
                    <p className="text-gray-400 text-lg">Verify the authenticity of payment receipts using digital signatures</p>

                    {/* Security Notice */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4"
                    >
                        <div className="flex items-start gap-3">
                            <Shield className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                            <div className="text-sm">
                                <p className="text-yellow-300 font-semibold mb-1">⚠️ Security Notice</p>
                                <p className="text-yellow-200/80">
                                    PDF text can be edited by anyone. <strong>Always trust ONLY the verified data</strong> extracted from the QR code.
                                    If PDF content differs from verified data, the receipt has been tampered with.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="bg-[#0a0a1b]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} className={`border-2 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer relative ${isDragging ? 'border-teal-500 bg-teal-500/10' : 'border-gray-600 hover:border-teal-500/50 hover:bg-teal-500/5'}`}>
                        <input type="file" accept="image/*,application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e.target.files[0])} />
                        <div className="flex flex-col items-center gap-4 text-center pointer-events-none">
                            <motion.div animate={{ y: isDragging ? -10 : 0, scale: isDragging ? 1.1 : 1 }} transition={{ duration: 0.2 }} className="bg-gradient-to-br from-teal-600/20 to-emerald-600/20 p-6 rounded-2xl border border-teal-500/30">
                                <Upload size={48} className="text-teal-400" />
                            </motion.div>
                            <div>
                                <p className="font-bold text-xl text-white mb-2">Upload Receipt QR Image</p>
                                <p className="text-gray-400 text-sm mb-1">Drag & Drop or Click to Browse</p>
                                <p className="text-yellow-500 text-xs mt-2 font-medium">⚡ For PDF receipts: Upload the PDF directly and QR will be extracted automatically</p>
                            </div>
                        </div>
                    </motion.div>

                    {loading && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-teal-500/10 border border-teal-500/30 rounded-xl">
                                <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-teal-400 font-medium">Scanning & Verifying Digital Signature...</span>
                            </div>
                        </motion.div>
                    )}

                    <AnimatePresence>
                        {result && (
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", duration: 0.6 }} className={`mt-8 p-6 rounded-2xl border-2 ${result.valid ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
                                        {result.valid ? <div className="bg-green-500/20 p-3 rounded-full border-2 border-green-500"><CheckCircle className="text-green-400" size={32} /></div> : <div className="bg-red-500/20 p-3 rounded-full border-2 border-red-500"><XCircle className="text-red-400" size={32} /></div>}
                                    </motion.div>
                                    <h3 className={`text-2xl font-bold ${result.valid ? 'text-green-400' : 'text-red-400'}`}>{result.valid ? 'Verified Authentic' : 'Verification Failed'}</h3>
                                </div>
                                <p className="text-center text-gray-300 text-lg">{result.message}</p>
                                {result.valid && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4 pt-4 border-t border-green-500/30">
                                        <div className="flex items-center justify-center gap-2 text-green-300 text-sm mb-3"><Shield size={16} /><span>Digital signature verified using RSA-SHA256</span></div>
                                        {result.verifiedData && (
                                            <div className="mt-4 bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                                                <p className="text-green-400 font-semibold text-sm mb-3">Verified Fields:</p>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between"><span className="text-gray-400">Name:</span><span className="text-white font-mono">{result.verifiedData.studentName}</span></div>
                                                    <div className="flex justify-between"><span className="text-gray-400">Amount:</span><span className="text-white font-mono">Rs. {result.verifiedData.amount}</span></div>
                                                    <div className="flex justify-between"><span className="text-gray-400">Transaction:</span><span className="text-white font-mono text-xs">{result.verifiedData.transactionId}</span></div>
                                                </div>
                                                <p className="text-green-300 text-xs mt-3 text-center">✓ Tampering any field will fail verification</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8 p-4 bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl text-sm">
                                <div className="flex items-start gap-2"><XCircle size={18} className="flex-shrink-0 mt-0.5" /><span>{error}</span></div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#0a0a1b]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center"><FileText className="mx-auto mb-2 text-teal-400" size={24} /><p className="text-sm text-gray-400">Auto-extract QR from PDF</p></div>
                    <div className="bg-[#0a0a1b]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center"><Shield className="mx-auto mb-2 text-emerald-400" size={24} /><p className="text-sm text-gray-400">RSA signature verification</p></div>
                    <div className="bg-[#0a0a1b]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center"><CheckCircle className="mx-auto mb-2 text-green-400" size={24} /><p className="text-sm text-gray-400">Instant authenticity check</p></div>
                </motion.div>
            </div>
        </div>
    );
};

export default VerifyReceipt;