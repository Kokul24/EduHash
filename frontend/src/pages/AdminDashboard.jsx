import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogOut, Plus, DollarSign, UserPlus, GraduationCap } from 'lucide-react';
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
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 rounded-xl text-sm flex items-center gap-2">
                    <span>✅ Auditor account created successfully. Credentials sent to email.</span>
                </div>
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
                {status.loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus size={18} /> Create Auditor Account</>}
            </button>
        </form>
    );
};

// Sub-component for Student Form (New)
const StudentForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '', studentId: '' });
    const [status, setStatus] = useState({ loading: false, success: false, error: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: false, error: '' });

        try {
            await axios.post('/admin/create-student', formData);
            setStatus({ loading: false, success: true, error: '' });
            setFormData({ name: '', email: '', studentId: '' });
            toast.success('Student created & credentials emailed!');
            setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create student';
            setStatus({ loading: false, success: false, error: msg });
            toast.error(msg);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {status.success && (
                <div className="p-3 bg-indigo-500/20 border border-indigo-500/50 text-indigo-200 rounded-xl text-sm flex items-center gap-2">
                    <span>✅ Student account created. Credentials sent to email.</span>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Student Name</label>
                <input
                    className="w-full bg-[#0f0f23] border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    placeholder="e.g., Alex Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Student ID</label>
                    <input
                        className="w-full bg-[#0f0f23] border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                        placeholder="STU-001"
                        value={formData.studentId}
                        onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <input
                        className="w-full bg-[#0f0f23] border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                        placeholder="student@university.edu"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>
            </div>

            <button
                disabled={status.loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl font-bold hover:from-indigo-500 hover:to-blue-500 transition-all shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {status.loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><GraduationCap size={18} /> Create Student Account</>}
            </button>
        </form>
    );
};

const AdminDashboard = () => {
    const { logout } = useContext(AuthContext);
    const [feeData, setFeeData] = useState({ title: '', amount: '', category: 'Tuition', description: '' });
    const [success, setSuccess] = useState(false);

    const handleFeeSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/fees', feeData);
            setSuccess(true);
            setFeeData({ title: '', amount: '', category: 'Tuition', description: '' });
            toast.success('Fee Published!');
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            toast.error('Failed to publish fee');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1b] via-[#0f0f23] to-[#1a0b2e] text-white relative overflow-hidden">
            <Toaster position="top-right" toastOptions={{ style: { background: '#0f172a', color: '#fff', border: '1px solid rgba(139,92,246,0.3)' } }} />

            {/* Background & Header */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex justify-between items-center p-8 border-b border-white/10 backdrop-blur-sm">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Admin Dashboard</h1>
                    <p className="text-gray-400 mt-1">Manage users and financial events</p>
                </div>
                <button onClick={logout} className="flex items-center gap-2 px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-all">
                    <LogOut size={18} /> Logout
                </button>
            </motion.div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-start min-h-[calc(100vh-120px)] p-8 gap-8 pb-20">

                {/* 1. Create Fee Event */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
                    <div className="bg-[#0a0a1b]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl"><Plus size={24} /></div>
                            <div>
                                <h2 className="text-2xl font-bold">Publish Fee Event</h2>
                                <p className="text-gray-400 text-sm">Create global payment requirements</p>
                            </div>
                        </div>

                        <form onSubmit={handleFeeSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                                    <input className="w-full bg-[#0f0f23] border border-gray-700/50 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500 transition-all" value={feeData.title} onChange={e => setFeeData({ ...feeData, title: e.target.value })} placeholder="e.g., Semester 6 Tuition" required />
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                                    <DollarSign className="absolute left-3 top-[46px] text-gray-500" size={18} />
                                    <input className="w-full bg-[#0f0f23] border border-gray-700/50 rounded-xl pl-10 pr-4 py-3.5 text-white focus:outline-none focus:border-blue-500 transition-all" value={feeData.amount} onChange={e => setFeeData({ ...feeData, amount: e.target.value })} placeholder="50000" type="number" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                    <select className="w-full bg-[#0f0f23] border border-gray-700/50 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500 transition-all" value={feeData.category} onChange={e => setFeeData({ ...feeData, category: e.target.value })}>
                                        <option>Tuition</option><option>Library</option><option>Laboratory</option><option>Hostel</option><option>Sports</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                    <input className="w-full bg-[#0f0f23] border border-gray-700/50 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500 transition-all" value={feeData.description} onChange={e => setFeeData({ ...feeData, description: e.target.value })} placeholder="Description..." />
                                </div>
                            </div>
                            <button className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2">
                                <Plus size={20} /> Publish Event
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* 2. User Management Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">

                    {/* Create Student */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <div className="bg-[#0a0a1b]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl h-full relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-3 rounded-xl"><GraduationCap size={24} /></div>
                                <div><h2 className="text-xl font-bold">Register Student</h2><p className="text-gray-400 text-sm">Create student account</p></div>
                            </div>
                            <StudentForm />
                        </div>
                    </motion.div>

                    {/* Create Auditor */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <div className="bg-[#0a0a1b]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl h-full relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-3 rounded-xl"><UserPlus size={24} /></div>
                                <div><h2 className="text-xl font-bold">Register Auditor</h2><p className="text-gray-400 text-sm">Create auditor account</p></div>
                            </div>
                            <AuditorForm />
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
