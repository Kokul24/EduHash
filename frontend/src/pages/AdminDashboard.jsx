import { useState } from 'react';
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogOut, Plus, DollarSign, UserPlus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Sub-component for Auditor Form
const AuditorForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [status, setStatus] = useState({ loading: false, success: false, error: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: false, error: '' });

        try {
            await axios.post('/admin/create-auditor', formData);
            setStatus({ loading: false, success: true, error: '' });
            setFormData({ name: '', email: '' });
            toast.success('Auditor created & credentials emailed!');
            setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create auditor';
            setStatus({ loading: false, success: false, error: msg });
            toast.error(msg);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {status.success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 rounded-xl text-sm flex items-center gap-2">
                    <span>✅ Auditor account created successfully. Credentials sent to email.</span>
                </motion.div>
            )}

            {status.error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-xl text-sm">
                    ⚠️ {status.error}
                </motion.div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Auditor Name</label>
                <input
                    className="w-full bg-[#0f0f23] border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    placeholder="e.g., Sarah Jenkins"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input
                    className="w-full bg-[#0f0f23] border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    placeholder="auditor@example.com"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                />
            </div>

            <button
                disabled={status.loading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {status.loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <UserPlus size={18} />
                        Create Auditor Account
                    </>
                )}
            </button>
        </form>
    );
};

const AdminDashboard = () => {
    const { logout } = useContext(AuthContext);
    const [formData, setFormData] = useState({ title: '', amount: '', category: 'Tuition', description: '' });
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/fees', formData);
            setSuccess(true);
            setFormData({ title: '', amount: '', category: 'Tuition', description: '' });
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1b] via-[#0f0f23] to-[#1a0b2e] text-white relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 flex justify-between items-center p-8 border-b border-white/10 backdrop-blur-sm"
            >
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Admin Dashboard</h1>
                    <p className="text-gray-400 mt-1">Manage fee events and university payments</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                >
                    <LogOut size={18} />
                    Logout
                </motion.button>
            </motion.div>

            {/* Main Content - Centered */}
            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="w-full max-w-2xl"
                >
                    <div className="bg-[#0a0a1b]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-3 mb-8"
                        >
                            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Create New Fee Event</h2>
                                <p className="text-gray-400 text-sm">Add a new payment requirement for students</p>
                            </div>
                        </motion.div>

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-6 p-4 bg-green-500/20 border border-green-500/50 text-green-200 rounded-xl flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Fee event created successfully!
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <label className="block text-sm font-medium text-gray-300 mb-2">Fee Title</label>
                                <input
                                    className="w-full bg-[#0f0f23] border border-gray-700/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    placeholder="e.g., Semester 6 Tuition"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <label className="block text-sm font-medium text-gray-300 mb-2">Amount (₹)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                    <input
                                        className="w-full bg-[#0f0f23] border border-gray-700/50 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        placeholder="50000"
                                        type="number"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                <select
                                    className="w-full bg-[#0f0f23] border border-gray-700/50 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option>Tuition</option>
                                    <option>Library</option>
                                    <option>Laboratory</option>
                                    <option>Exam</option>
                                    <option>Hostel</option>
                                    <option>Sports</option>
                                </select>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 }}
                            >
                                <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                                <textarea
                                    className="w-full bg-[#0f0f23] border border-gray-700/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                    placeholder="Additional details about this fee..."
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2"
                            >
                                <Plus size={20} />
                                Publish Fee Event
                            </motion.button>
                        </form>
                    </div>
                </motion.div>

                {/* Create Auditor Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="w-full max-w-2xl mt-8"
                >
                    <div className="bg-[#0a0a1b]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        {/* Gradient Border Effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />

                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-3 rounded-xl">
                                <UserPlus size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-white">Register New Auditor</h2>
                                <p className="text-gray-400 text-sm">Create account & email credentials automatically</p>
                            </div>
                        </div>

                        <AuditorForm />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
