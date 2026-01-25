import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
                // Step 1: Validate Credentials & Request OTP
                toast.loading('Validating credentials...');
                const res = await axios.post('/auth/login', { email, password });
                toast.dismiss();

                if (res.data.requireOtp) {
                    setIs2FA(true);
                    toast.success('Credentials verified! OTP sent to email.');
                } else {
                    // Fallback for immediate login if 2FA disabled (not the case here but good practice)
                    completeLogin(res.data);
                }
            } else {
                // Step 2: Verify OTP
                toast.loading('Verifying OTP...');
                const res = await axios.post('/auth/verify-otp', { email, otp });
                toast.dismiss();
                completeLogin(res.data);
            }
        } catch (err) {
            toast.dismiss();
            const errorMsg = err.response?.data?.message || 'Login failed';
            setError(errorMsg);
            toast.error(errorMsg);
        }
    };

    const completeLogin = (data) => {
        login(data);
        toast.success(`Welcome back, ${data.name}!`);
        if (data.role === 'admin') navigate('/admin');
        else if (data.role === 'auditor') navigate('/auditor');
        else navigate('/student');
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-[#1a0b2e] via-[#16213e] to-[#0f0f23] relative overflow-hidden">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                    },
                }}
            />
            {/* Animated Background Orbs */}
            <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Back Button */}
            <Link to="/" className="absolute top-8 left-8 z-50 text-gray-400 hover:text-white flex items-center gap-2 transition-all hover:gap-3 group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back</span>
            </Link>

            {/* Left Side - Welcome Section */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex lg:w-1/2 flex-col justify-center items-start px-16 xl:px-24 relative z-10"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    <h1 className="text-5xl xl:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600">
                        Welcome Back
                    </h1>
                    <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                        Manage your university fees securely and efficiently
                    </p>
                </motion.div>

                {/* Decorative Elements */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="absolute bottom-20 left-20 w-64 h-64 border-2 border-purple-500 rounded-full"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.1, scale: 1 }}
                    transition={{ delay: 0.7, duration: 1 }}
                    className="absolute top-40 left-40 w-32 h-32 border-2 border-pink-500 rounded-full"
                />
            </motion.div>

            {/* Right Side - Login Form */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative z-10"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-[#0a0a1b]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mb-8"
                        >
                            <h2 className="text-3xl font-bold text-white mb-2">{is2FA ? 'Verify Identity' : 'Sign In'}</h2>
                            <p className="text-gray-400 text-sm">
                                {is2FA ? 'Enter the OTP sent to your email to continue' : 'Enter your credentials to continue'}
                            </p>
                        </motion.div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg mb-6 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <AnimatePresence mode='wait'>
                                {!is2FA ? (
                                    <motion.div
                                        key="credentials"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                className="w-full bg-[#0f0f23] border border-gray-700/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="student@university.edu"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                            <input
                                                type="password"
                                                className="w-full bg-[#0f0f23] border border-gray-700/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                    className="w-4 h-4 rounded border-gray-600 bg-[#0f0f23] text-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                                                />
                                                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
                                            </label>
                                            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="otp"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-300 mb-2">One-Time Password (OTP)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full bg-[#0f0f23] border border-blue-500/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all text-center tracking-[0.5em] text-xl font-bold"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder="000000"
                                                maxLength={6}
                                                required
                                                autoFocus
                                            />
                                            <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400" size={20} />
                                        </div>
                                        <p className="text-xs text-center mt-4 text-gray-400">
                                            OTP sent to <span className="text-blue-400">{email}</span>. Check your console/email.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:via-pink-500 hover:to-purple-500 transition-all shadow-lg shadow-pink-900/50 text-white"
                            >
                                {is2FA ? 'Verify & Login' : 'Sign In'}
                            </motion.button>

                            {is2FA && (
                                <button
                                    type="button"
                                    onClick={() => setIs2FA(false)}
                                    className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel & Try Different Account
                                </button>
                            )}
                        </form>

                        {!is2FA && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.1 }}
                                className="mt-6 text-center text-gray-400 text-sm"
                            >
                                Don't have an account? <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">Register</Link>
                            </motion.p>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
