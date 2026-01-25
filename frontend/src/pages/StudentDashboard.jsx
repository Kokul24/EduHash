import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CreditCard, Lock, CheckCircle, LogOut, X } from 'lucide-react';
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
        toast('Opening payment portal...', { icon: '💳' });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1b] via-[#0f0f23] to-[#1a0b2e] text-white relative overflow-hidden">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            {/* Animated Background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative z-10 p-6 md:p-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-white/10"
                >
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            Welcome, {user?.name}
                        </h1>
                        <p className="text-gray-400 mt-1">Student ID: {user?.studentId || 'N/A'}</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            logout();
                            toast.success('Logged out successfully');
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                    >
                        <LogOut size={18} />
                        Logout
                    </motion.button>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-xl md:text-2xl font-semibold mb-8"
                >
                    Fee Payments
                </motion.h2>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="animate-spin text-blue-500" size={48} />
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
                                className="relative group bg-[#0a0a1b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                            >
                                {/* Status Badge */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{fee.title}</h3>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">{fee.category}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${fee.status === 'Paid'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                        }`}>
                                        {fee.status}
                                    </span>
                                </div>

                                {/* Amount */}
                                <div className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                                    ₹{fee.amount.toLocaleString()}
                                </div>

                                {/* Action Button */}
                                {fee.status === 'Paid' ? (
                                    <div className="flex items-center gap-2 text-green-400 font-medium">
                                        <CheckCircle size={20} /> Payment Complete
                                    </div>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handlePayClick(fee)}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 font-bold hover:from-orange-400 hover:to-pink-400 transition-all shadow-lg hover:shadow-orange-500/30"
                                    >
                                        Pay Now
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
                                toast('Payment cancelled', { icon: '❌' });
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

    // Format card number with spaces every 4 digits
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

    // Validate expiry date
    const validateExpiry = (expiry) => {
        if (!expiry || expiry.length !== 5) return false;

        const [month, year] = expiry.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
        const currentMonth = currentDate.getMonth() + 1;

        const expiryMonth = parseInt(month);
        const expiryYear = parseInt(year);

        if (expiryMonth < 1 || expiryMonth > 12) {
            toast.error('Invalid month! Must be between 01-12');
            return false;
        }

        if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
            toast.error('Card has expired! Please use a valid card');
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

        // Validate card number
        if (cardDetails.number.length !== 16) {
            toast.error('Card number must be 16 digits!');
            setError('Invalid Card Details. Card must be 16 digits.');
            return;
        }

        // Validate CVV
        if (cardDetails.cvv.length !== 3) {
            toast.error('CVV must be 3 digits!');
            setError('Invalid CVV. Must be 3 digits.');
            return;
        }

        // Validate expiry
        if (!validateExpiry(cardDetails.expiry)) {
            setError('Invalid or expired card');
            return;
        }

        setLoading(true);
        toast.loading('Processing payment...');

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
            toast.success('OTP sent! Check your email or server console');
        } catch (err) {
            toast.dismiss();
            toast.error('Payment initiation failed!');
            setError('Payment Initiation Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        toast.loading('Verifying OTP...');

        try {
            const res = await axios.post('/pay/verify', {
                transactionId,
                otp
            });
            setReceiptData(res.data.receipt);
            setStep(3);
            toast.dismiss();
            toast.success('Payment successful! 🎉');
        } catch (err) {
            toast.dismiss();
            toast.error('Invalid OTP! Please try again');
            setError('Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const downloadReceipt = () => {
        if (!receiptData) return;

        toast.loading('Generating receipt...');

        const doc = new jsPDF();

        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, 210, 297, "F");

        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("EduPay Secure - Payment Receipt", 105, 20, null, null, "center");

        doc.setLineWidth(0.5);
        doc.line(20, 25, 190, 25);

        doc.setFontSize(12);
        doc.text(`Transaction ID: ${receiptData.transactionId}`, 20, 40);
        doc.text(`Student Name: ${receiptData.studentName}`, 20, 50);
        doc.text(`Amount Paid: Rs. ${receiptData.amount}`, 20, 60);
        doc.text(`Date: ${new Date(receiptData.date).toLocaleString()}`, 20, 70);

        // Digital Signature Section - More Professional
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text("🔒 Digital Signature (SHA-256 with RSA):", 20, 85);

        doc.setFontSize(7);
        doc.setFont("courier"); // Monospace font for signature
        doc.setTextColor(100, 100, 100);
        const splitSig = doc.splitTextToSize(receiptData.signature, 170);
        doc.text(splitSig, 20, 92);

        // Reset font
        doc.setFont("helvetica");
        doc.setTextColor(40, 40, 40);

        doc.addImage(receiptData.qrCodeUrl, 'PNG', 70, 140, 70, 70);
        doc.setFontSize(10);
        doc.text("Scan to Authenticate", 105, 215, null, null, "center");

        doc.save(`Receipt_${receiptData.transactionId}.pdf`);

        toast.dismiss();
        toast.success('Receipt downloaded successfully!');
        onSuccess();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-[#0a0a1b]/95 backdrop-blur-xl rounded-3xl w-full max-w-md p-8 border border-white/10 relative shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                {step === 1 && (
                    <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onSubmit={handleCardSubmit}
                        className="space-y-5"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-600/20 p-3 rounded-xl text-blue-400">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Secure Payment</h3>
                                <p className="text-sm text-gray-400">AES-256 Encrypted</p>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 bg-red-400/10 border border-red-400/30 p-3 rounded-lg text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Card Number</label>
                            <input
                                className="w-full bg-[#0f0f23] border border-gray-700/50 rounded-xl px-4 py-3.5 font-mono text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                placeholder="1234 5678 9012 3456"
                                value={formatCardNumber(cardDetails.number)}
                                onChange={handleCardNumberChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Expiry</label>
                                <input
                                    className="w-full bg-[#0f0f23] border border-gray-700/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    value={cardDetails.expiry}
                                    onChange={handleExpiryChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">CVV</label>
                                <input
                                    className="w-full bg-[#0f0f23] border border-gray-700/50 rounded-xl px-4 py-3.5 font-mono text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    placeholder="123"
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

                        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs p-3 rounded-lg flex items-start gap-2">
                            <Lock size={16} className="mt-0.5 flex-shrink-0" />
                            <span>Your data is encrypted using AES-256 before transmission and storage.</span>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-bold transition-all shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : `Pay ₹${fee.amount.toLocaleString()}`}
                        </motion.button>
                    </motion.form>
                )}

                {step === 2 && (
                    <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onSubmit={handleOtpSubmit}
                        className="space-y-6 text-center"
                    >
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Enter OTP</h3>
                            <p className="text-sm text-gray-400">Check your email or server console for the code</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 bg-red-400/10 border border-red-400/30 p-3 rounded-lg text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <input
                            className="w-2/3 mx-auto bg-[#0f0f23] border border-gray-700/50 rounded-xl p-4 text-center text-2xl tracking-widest font-mono text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            placeholder="000000"
                            maxLength={6}
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                        />

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 font-bold transition-all shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </motion.button>
                    </motion.form>
                )}

                {step === 3 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="w-20 h-20 bg-green-500/20 border-2 border-green-500 text-green-500 rounded-full flex items-center justify-center mx-auto"
                        >
                            <CheckCircle size={40} />
                        </motion.div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
                            <p className="text-gray-400">Your transaction has been securely recorded.</p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={downloadReceipt}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-bold transition-all shadow-lg"
                        >
                            Download Receipt (PDF)
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default StudentDashboard;
