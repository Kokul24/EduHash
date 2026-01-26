import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Shield, Lock, Fingerprint } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', studentId: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        toast.loading('Creating secure account...');
        try {
            await axios.post('/auth/register', formData);
            toast.dismiss();
            toast.success('Account created! Redirecting...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            toast.dismiss();
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#030712] text-white relative overflow-hidden">
            {/* Cybersecurity Grid */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

            {/* Neon Orbs */}
            <div className="fixed top-[-15%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse" />
            <div className="fixed bottom-[-15%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

            <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#0f172a', color: '#fff', border: '1px solid rgba(6,182,212,0.3)' } }} />

            {/* Back Button */}
            <Link to="/" className="absolute top-8 left-8 z-50 text-cyan-400/60 hover:text-cyan-400 flex items-center gap-2 transition-all hover:gap-3 group font-mono text-sm">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span>BACK</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md p-8 bg-[#0a1628]/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl shadow-cyan-500/5 relative z-10"
            >
                {/* Corner Accents */}
                <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-cyan-500/50" />
                <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-cyan-500/50" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-cyan-500/50" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-cyan-500/50" />

                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-cyan-500/20 p-3 rounded-xl border border-cyan-500/30">
                        <UserPlus size={24} className="text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Create Account</h2>
                        <p className="text-cyan-400/50 text-sm font-mono">STUDENT REGISTRATION</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-cyan-300/80 mb-2">Full Name</label>
                        <input
                            className="w-full bg-[#030712] border border-cyan-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-cyan-300/80 mb-2">Email Address</label>
                        <input
                            className="w-full bg-[#030712] border border-cyan-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-mono"
                            placeholder="student@university.edu"
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-cyan-300/80 mb-2">Password</label>
                        <input
                            className="w-full bg-[#030712] border border-cyan-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                            placeholder="••••••••••••"
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-cyan-300/80 mb-2">Student ID <span className="text-cyan-500/40">(Optional)</span></label>
                        <input
                            className="w-full bg-[#030712] border border-cyan-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-mono"
                            placeholder="STU-2024-XXXX"
                            value={formData.studentId}
                            onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                        />
                    </div>

                    {/* Info Badge */}
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg text-sm font-mono flex items-center gap-2">
                        <Shield size={16} className="text-emerald-400" />
                        <span className="text-emerald-300/80">SECURE STUDENT ACCOUNT</span>
                    </div>

                    {/* Security Features */}
                    <div className="flex items-center justify-center gap-4 py-2">
                        <div className="flex items-center gap-1 text-cyan-400/50 text-xs font-mono">
                            <Lock size={12} />
                            <span>ENCRYPTED</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-400/50 text-xs font-mono">
                            <Fingerprint size={12} />
                            <span>2FA</span>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 font-mono"
                    >
                        {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
                    </motion.button>
                </form>

                <p className="mt-6 text-center text-cyan-400/50 text-sm font-mono">
                    EXISTING USER? <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">LOGIN</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
