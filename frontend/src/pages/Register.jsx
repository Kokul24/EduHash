import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Shield, Lock, Fingerprint, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student', studentId: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Password Strength Analysis based on NIST SP 800-63B
    const passwordStrength = useMemo(() => {
        const pwd = formData.password;
        const rules = [
            { label: 'Minimum 12 characters', passed: pwd.length >= 12 },
            { label: 'No common patterns (123, abc, password)', passed: !/(?:123|abc|password|qwerty|admin)/i.test(pwd) },
            { label: 'Not just repeated characters', passed: !/(.)\1{3,}/.test(pwd) },
            { label: 'Mix of characters recommended', passed: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) || /\d/.test(pwd) },
        ];

        const passedCount = rules.filter(r => r.passed).length;
        let strength = 'Weak';
        let color = 'text-red-400';
        let bgColor = 'bg-red-500';

        if (passedCount === rules.length) {
            strength = 'Strong';
            color = 'text-emerald-400';
            bgColor = 'bg-emerald-500';
        } else if (passedCount >= 2) {
            strength = 'Medium';
            color = 'text-yellow-400';
            bgColor = 'bg-yellow-500';
        }

        return { rules, passedCount, total: rules.length, strength, color, bgColor };
    }, [formData.password]);

    const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate password match
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }

        // Validate password strength (NIST minimum)
        if (formData.password.length < 12) {
            toast.error('Password must be at least 12 characters (NIST requirement)');
            return;
        }

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
        <div className="min-h-screen flex items-center justify-center bg-[#030712] text-white relative overflow-hidden py-8">
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
                className="w-full max-w-lg p-8 bg-[#0a1628]/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl shadow-cyan-500/5 relative z-10 mx-4"
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

                    {/* Password Field with Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-cyan-300/80 mb-2">Password</label>
                        <div className="relative">
                            <input
                                className="w-full bg-[#030712] border border-cyan-500/30 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                                placeholder="••••••••••••"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
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

                    {/* Password Strength Indicator */}
                    {formData.password && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-[#030712]/80 border border-cyan-500/20 rounded-xl p-4 space-y-3"
                        >
                            {/* Strength Bar */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-cyan-400/60">PASSWORD STRENGTH</span>
                                <span className={`text-xs font-mono font-bold ${passwordStrength.color}`}>
                                    {passwordStrength.strength.toUpperCase()}
                                </span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(passwordStrength.passedCount / passwordStrength.total) * 100}%` }}
                                    className={`h-full ${passwordStrength.bgColor} transition-all duration-300`}
                                />
                            </div>

                            {/* NIST Rules Checklist */}
                            <div className="space-y-2 pt-2 border-t border-cyan-500/10">
                                <p className="text-xs text-cyan-400/50 font-mono mb-2">NIST SP 800-63B COMPLIANCE:</p>
                                {passwordStrength.rules.map((rule, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs font-mono">
                                        {rule.passed ? (
                                            <CheckCircle size={14} className="text-emerald-400" />
                                        ) : (
                                            <XCircle size={14} className="text-red-400/60" />
                                        )}
                                        <span className={rule.passed ? 'text-emerald-400/80' : 'text-gray-500'}>
                                            {rule.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Confirm Password Field with Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-cyan-300/80 mb-2">Confirm Password</label>
                        <div className="relative">
                            <input
                                className={`w-full bg-[#030712] border rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all ${formData.confirmPassword
                                        ? (passwordsMatch ? 'border-emerald-500/50 focus:border-emerald-400 focus:ring-emerald-400/50' : 'border-red-500/50 focus:border-red-400 focus:ring-red-400/50')
                                        : 'border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/50'
                                    }`}
                                placeholder="••••••••••••"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400/60 hover:text-cyan-400 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {/* Match Status */}
                        {formData.confirmPassword && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`flex items-center gap-2 mt-2 text-xs font-mono ${passwordsMatch ? 'text-emerald-400' : 'text-red-400'}`}
                            >
                                {passwordsMatch ? (
                                    <>
                                        <CheckCircle size={14} />
                                        <span>Passwords match</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle size={14} />
                                        <span>Passwords do not match</span>
                                    </>
                                )}
                            </motion.div>
                        )}
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
                        disabled={loading || !passwordsMatch || formData.password.length < 12}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
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
