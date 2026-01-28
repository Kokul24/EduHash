import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Lock, Fingerprint, Terminal, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [is2FA, setIs2FA] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (!is2FA) {
                toast.loading('Authenticating...');
                const res = await axios.post('/auth/login', { email, password });
                toast.dismiss();
                if (res.data.requireOtp) {
                    setIs2FA(true);
                    toast.success('OTP dispatched to registered device');
                } else {
                    completeLogin(res.data);
                }
            } else {
                toast.loading('Verifying 2FA token...');
                const res = await axios.post('/auth/verify-otp', { email, otp });
                toast.dismiss();
                completeLogin(res.data);
            }
        } catch (err) {
            toast.dismiss();
            const errorMsg = err.response?.data?.message || 'Authentication failed';
            setError(errorMsg);
            toast.error(errorMsg);
        }
    };

    const completeLogin = (data) => {
        login(data);
        toast.success(`Access granted: ${data.name}`);
        if (data.role === 'admin') navigate('/admin');
        else if (data.role === 'auditor') navigate('/auditor');
        else navigate('/student');
    };

    return (
        <div className="min-h-screen flex bg-[#030712] relative overflow-hidden">
            {/* Cybersecurity Grid */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

            <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#0f172a', color: '#fff', border: '1px solid rgba(6,182,212,0.3)' } }} />

            {/* Neon Orbs */}
            <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse" />
            <div className="fixed bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Back Button */}
            <Link to="/" className="absolute top-8 left-8 z-50 text-cyan-400/60 hover:text-cyan-400 flex items-center gap-2 transition-all hover:gap-3 group font-mono text-sm">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span>BACK</span>
            </Link>

            {/* Left Side - Welcome Section */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex lg:w-1/2 flex-col justify-center items-start px-16 xl:px-24 relative z-10"
            >
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="flex items-center gap-3 mb-6">
                        <Terminal className="text-cyan-400" size={32} />
                        <span className="text-cyan-400/60 font-mono text-sm">SECURE_LOGIN://</span>
                    </div>
                    <h1 className="text-5xl xl:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400">
                        Access Portal
                    </h1>
                    <p className="text-cyan-300/50 text-lg leading-relaxed max-w-md">
                        Encrypted authentication with 2FA verification protocol
                    </p>

                    {/* Security Features */}
                    <div className="flex flex-col gap-3 mt-8">
                        <div className="flex items-center gap-3 text-emerald-400/70 text-sm font-mono">
                            <Lock size={16} />
                            <span>END-TO-END ENCRYPTION</span>
                        </div>
                        <div className="flex items-center gap-3 text-cyan-400/70 text-sm font-mono">
                            <Fingerprint size={16} />
                            <span>2FA EMAIL VERIFICATION</span>
                        </div>
                        <div className="flex items-center gap-3 text-blue-400/70 text-sm font-mono">
                            <ShieldCheck size={16} />
                            <span>SECURE PASSWORD HASHING</span>
                        </div>
                    </div>
                </motion.div>

                {/* Decorative Circuit Lines */}
                <div className="absolute bottom-20 left-20 w-64 h-64 border border-cyan-500/20 rounded-full" />
                <div className="absolute top-40 left-40 w-32 h-32 border border-emerald-500/20 rounded-full" />
            </motion.div>

            {/* Right Side - Login Form */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative z-10"
            >
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full max-w-md">
                    <div className="bg-[#0a1628]/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-2xl shadow-cyan-500/5 relative overflow-hidden">
                        {/* Corner Accents */}
                        <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-cyan-500/50" />
                        <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-cyan-500/50" />
                        <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-cyan-500/50" />
                        <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-cyan-500/50" />

                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">{is2FA ? '2FA Verification' : 'Sign In'}</h2>
                            <p className="text-cyan-400/50 text-sm font-mono">
                                {is2FA ? 'ENTER OTP FROM EMAIL' : 'ENTER CREDENTIALS TO AUTHENTICATE'}
                            </p>
                        </motion.div>

                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg mb-6 text-sm font-mono">
                                ⚠ {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <AnimatePresence mode='wait'>
                                {!is2FA ? (
                                    <motion.div key="credentials" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-cyan-300/80 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                className="w-full bg-[#030712] border border-cyan-500/30 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-mono"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="user@eduhash.edu"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-cyan-300/80 mb-2">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="w-full bg-[#030712] border border-cyan-500/30 rounded-xl px-4 py-3.5 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••••••"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400/60 hover:text-cyan-400 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                    className="w-4 h-4 rounded border-cyan-500/30 bg-[#030712] text-cyan-500 focus:ring-1 focus:ring-cyan-400/50 cursor-pointer"
                                                />
                                                <span className="text-cyan-400/60 group-hover:text-cyan-400 transition-colors font-mono text-xs">REMEMBER_SESSION</span>
                                            </label>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        <label className="block text-sm font-medium text-cyan-300/80 mb-2">One-Time Password</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full bg-[#030712] border border-cyan-500/30 rounded-xl px-4 py-3.5 text-cyan-400 placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all text-center tracking-[0.5em] text-xl font-mono"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder="000000"
                                                maxLength={6}
                                                required
                                                autoFocus
                                            />
                                            <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
                                        </div>
                                        <p className="text-xs text-center mt-4 text-cyan-400/50 font-mono">
                                            OTP SENT TO <span className="text-cyan-400">{email}</span>
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 transition-all shadow-lg shadow-cyan-500/20 text-white font-mono"
                            >
                                {is2FA ? 'VERIFY & LOGIN' : 'AUTHENTICATE'}
                            </motion.button>

                            {is2FA && (
                                <button type="button" onClick={() => setIs2FA(false)} className="w-full text-sm text-cyan-400/60 hover:text-cyan-400 transition-colors font-mono">
                                    ← CANCEL / TRY DIFFERENT ACCOUNT
                                </button>
                            )}
                        </form>

                        {!is2FA && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-6 text-center text-cyan-400/50 text-sm font-mono">
                                NO ACCOUNT? <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors">REGISTER</Link>
                            </motion.p>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
