import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CreditCard, Lock, CheckCircle, LogOut, X, Shield, Zap, Terminal } from 'lucide-react';
import jsPDF from 'jspdf';
import toast, { Toaster } from 'react-hot-toast';

const StudentDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [fees, setFees] = useState([]);
    const [selectedFee, setSelectedFee] = useState(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        try {
            const res = await axios.get('/fees');
            setFees(res.data);
            toast.success('Fees loaded successfully!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to load fees');
        } finally {
            setLoading(false);
        }
    };

    const handlePayClick = (fee) => {
        setSelectedFee(fee);
        setShowPayModal(true);
        toast('Initializing secure payment...', { icon: '🔐' });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="min-h-screen bg-[#030712] text-white relative overflow-hidden">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#0f172a',
                        color: '#fff',
                        border: '1px solid rgba(6,182,212,0.3)',
                    },
                    success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }}
            />

            {/* Cybersecurity Grid Background */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

            {/* Neon Glow Orbs */}
            <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative z-10 p-6 md:p-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-cyan-500/20"
                >
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Shield size={40} className="text-cyan-400" />
                            <motion.div
                                className="absolute inset-0 bg-cyan-400/30 blur-lg rounded-full"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">
                                Welcome, {user?.name}
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-cyan-300/50 text-sm font-mono">ID: {user?.studentId || 'N/A'}</span>
                                <span className="flex items-center gap-1 text-emerald-400 text-xs">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    SECURE SESSION
                                </span>
                            </div>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            logout();
                            toast.success('Session terminated');
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-all font-mono text-sm"
                    >
                        <LogOut size={18} />
                        DISCONNECT
                    </motion.button>
                </motion.div>

                {/* Section Title */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex items-center gap-3 mb-8"
                >
                    <Terminal className="text-cyan-400" size={24} />
                    <h2 className="text-xl md:text-2xl font-bold text-white">Payment Requests</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/30 to-transparent" />
                </motion.div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 gap-4">
                        <Loader2 className="animate-spin text-cyan-400" size={48} />
                        <span className="text-cyan-300/50 font-mono text-sm">LOADING SECURE DATA...</span>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {fees.map((fee, index) => (
                            <motion.div
                                key={fee._id}
                                variants={itemVariants}
                                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                className="relative group bg-[#0a1628]/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-400/50 transition-all duration-300"
                            >
                                {/* Corner Accents */}
                                <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-cyan-500/50" />
                                <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-cyan-500/50" />
                                <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-cyan-500/50" />
                                <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-cyan-500/50" />

                                {/* Hover Glow */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                    <div className="absolute inset-0 bg-cyan-500/5 rounded-2xl" />
                                </div>

                                {/* Status Badge */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{fee.title}</h3>
                                        <span className="text-xs text-cyan-400/60 uppercase tracking-wider font-mono">{fee.category}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${fee.status === 'Paid'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        }`}>
                                        {fee.status === 'Paid' ? '✓ PAID' : '⏳ PENDING'}
                                    </span>
                                </div>

                                {/* Amount */}
                                <div className="text-4xl font-bold mb-6 font-mono">
                                    <span className="text-cyan-400">₹</span>
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200">
                                        {fee.amount.toLocaleString()}
                                    </span>
                                </div>

                                {/* Action Button */}
                                {fee.status === 'Paid' ? (
                                    <div className="flex items-center gap-2 text-emerald-400 font-medium font-mono text-sm">
                                        <CheckCircle size={20} />
                                        TRANSACTION COMPLETE
                                    </div>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handlePayClick(fee)}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 font-bold hover:from-cyan-500 hover:to-emerald-500 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                                    >
                                        <Zap size={18} />
                                        INITIATE PAYMENT
                                    </motion.button>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Payment Modal */}
                <AnimatePresence>
                    {showPayModal && selectedFee && (
                        <PaymentModal
                            fee={selectedFee}
                            onClose={() => {
                                setShowPayModal(false);
                                toast('Payment aborted', { icon: '❌' });
                            }}
                            onSuccess={() => {
                                setShowPayModal(false);
                                fetchFees();
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const PaymentModal = ({ fee, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [cardDetails, setCardDetails] = useState({ number: '', cvv: '', expiry: '' });
    const [otp, setOtp] = useState('');
    const [transactionId, setTransactionId] = useState(null);
    const [receiptData, setReceiptData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\s/g, '');
        const chunks = cleaned.match(/.{1,4}/g);
        return chunks ? chunks.join(' ') : cleaned;
    };

    const handleCardNumberChange = (e) => {
        const value = e.target.value.replace(/\s/g, '');
        if (value.length <= 16 && /^\d*$/.test(value)) {
            setCardDetails({ ...cardDetails, number: value });
        }
    };

    const validateExpiry = (expiry) => {
        if (!expiry || expiry.length !== 5) return false;
        const [month, year] = expiry.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        const expiryMonth = parseInt(month);
        const expiryYear = parseInt(year);
        if (expiryMonth < 1 || expiryMonth > 12) {
            toast.error('Invalid month!');
            return false;
        }
        if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
            toast.error('Card expired!');
            return false;
        }
        return true;
    };

    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        setCardDetails({ ...cardDetails, expiry: value });
    };

    const handleCardSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (cardDetails.number.length !== 16) {
            toast.error('Card must be 16 digits!');
            setError('Invalid card number');
            return;
        }
        if (cardDetails.cvv.length !== 3) {
            toast.error('CVV must be 3 digits!');
            setError('Invalid CVV');
            return;
        }
        if (!validateExpiry(cardDetails.expiry)) {
            setError('Invalid or expired card');
            return;
        }
        setLoading(true);
        toast.loading('Encrypting payment data...');
        try {
            const res = await axios.post('/pay/initiate', {
                feeId: fee._id,
                amount: fee.amount,
                cardNumber: cardDetails.number,
                cvv: cardDetails.cvv
            });
            setTransactionId(res.data.transactionId);
            setStep(2);
            toast.dismiss();
            toast.success('OTP dispatched to registered device');
        } catch (err) {
            toast.dismiss();
            toast.error('Payment initiation failed!');
            setError('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        toast.loading('Authenticating...');
        try {
            const res = await axios.post('/pay/verify', { transactionId, otp });
            setReceiptData(res.data.receipt);
            setStep(3);
            toast.dismiss();
            toast.success('Transaction verified! 🎉');
        } catch (err) {
            toast.dismiss();
            toast.error('Invalid OTP!');
            setError('Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const downloadReceipt = () => {
        if (!receiptData) return;
        toast.loading('Generating secure receipt...');
        const doc = new jsPDF();
        doc.setFillColor(3, 7, 18);
        doc.rect(0, 0, 210, 297, "F");
        doc.setFontSize(22);
        doc.setTextColor(6, 182, 212);
        doc.text("EduHash - Secure Payment Receipt", 105, 20, null, null, "center");
        doc.setDrawColor(6, 182, 212);
        doc.setLineWidth(0.5);
        doc.line(20, 25, 190, 25);
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text(`Transaction ID: ${receiptData.transactionId}`, 20, 40);
        doc.text(`Student Name: ${receiptData.studentName}`, 20, 50);
        doc.text(`Amount Paid: Rs. ${receiptData.amount}`, 20, 60);
        doc.text(`Date: ${new Date(receiptData.date).toLocaleString()}`, 20, 70);
        doc.setFontSize(10);
        doc.setTextColor(16, 185, 129);
        doc.text("Digital Signature:", 20, 85);
        doc.setFontSize(6);
        doc.setFont("courier");
        doc.setTextColor(150, 150, 150);
        const splitSig = doc.splitTextToSize(receiptData.signature, 170);
        doc.text(splitSig, 20, 92);
        doc.setFont("helvetica");
        doc.addImage(receiptData.qrCodeUrl, 'PNG', 70, 140, 70, 70);
        doc.setTextColor(6, 182, 212);
        doc.setFontSize(10);
        doc.text("Scan QR to Authenticate", 105, 215, null, null, "center");
        doc.save(`Receipt_${receiptData.transactionId}.pdf`);
        toast.dismiss();
        toast.success('Receipt downloaded!');
        onSuccess();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-[#0a1628]/95 backdrop-blur-xl rounded-2xl w-full max-w-md p-8 border border-cyan-500/30 relative shadow-2xl shadow-cyan-500/10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Corner Accents */}
                <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-cyan-500/50" />
                <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-cyan-500/50" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-cyan-500/50" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-cyan-500/50" />

                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-cyan-400 transition-colors">
                    <X size={24} />
                </button>

                {step === 1 && (
                    <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleCardSubmit} className="space-y-5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-cyan-500/20 p-3 rounded-xl text-cyan-400 border border-cyan-500/30">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Secure Payment</h3>
                                <p className="text-cyan-400/60 text-sm font-mono">SECURELY ENCRYPTED</p>
                            </div>
                        </div>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 bg-red-400/10 border border-red-400/30 p-3 rounded-lg text-sm font-mono">
                                ⚠ {error}
                            </motion.div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-cyan-300/80">Card Number</label>
                            <input
                                className="w-full bg-[#030712] border border-cyan-500/30 rounded-xl px-4 py-3.5 font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                                placeholder="1234 5678 9012 3456"
                                value={formatCardNumber(cardDetails.number)}
                                onChange={handleCardNumberChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-cyan-300/80">Expiry</label>
                                <input
                                    className="w-full bg-[#030712] border border-cyan-500/30 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    value={cardDetails.expiry}
                                    onChange={handleExpiryChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-cyan-300/80">CVV</label>
                                <input
                                    className="w-full bg-[#030712] border border-cyan-500/30 rounded-xl px-4 py-3.5 font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                                    placeholder="•••"
                                    maxLength={3}
                                    type="password"
                                    value={cardDetails.cvv}
                                    onChange={e => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setCardDetails({ ...cardDetails, cvv: value });
                                    }}
                                />
                            </div>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-lg flex items-center gap-2 font-mono">
                            <Lock size={14} />
                            END-TO-END ENCRYPTED CONNECTION
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                        >
                            {loading ? 'PROCESSING...' : `PAY ₹${fee.amount.toLocaleString()}`}
                        </motion.button>
                    </motion.form>
                )}

                {step === 2 && (
                    <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleOtpSubmit} className="space-y-6 text-center">
                        <div>
                            <h3 className="text-2xl font-bold mb-2 text-white">2FA Verification</h3>
                            <p className="text-sm text-cyan-400/60 font-mono">ENTER OTP FROM EMAIL</p>
                        </div>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 bg-red-400/10 border border-red-400/30 p-3 rounded-lg text-sm font-mono">
                                ⚠ {error}
                            </motion.div>
                        )}
                        <input
                            className="w-2/3 mx-auto bg-[#030712] border border-cyan-500/30 rounded-xl p-4 text-center text-2xl tracking-[0.5em] font-mono text-cyan-400 placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                            placeholder="000000"
                            maxLength={6}
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                        />
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        >
                            {loading ? 'VERIFYING...' : 'AUTHENTICATE'}
                        </motion.button>
                    </motion.form>
                )}

                {step === 3 && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 text-emerald-500 rounded-full flex items-center justify-center mx-auto"
                        >
                            <CheckCircle size={40} />
                        </motion.div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2 text-white">Transaction Complete</h3>
                            <p className="text-emerald-400/60 font-mono text-sm">DIGITALLY SIGNED & VERIFIED</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={downloadReceipt}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 font-bold transition-all shadow-lg shadow-cyan-500/20"
                        >
                            DOWNLOAD RECEIPT (PDF)
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default StudentDashboard;
