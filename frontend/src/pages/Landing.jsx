import { Link } from 'react-router-dom';
import { User, QrCode, Shield, Lock, Fingerprint, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#030712] relative overflow-hidden">
            {/* Cybersecurity Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

            {/* Animated Scan Line */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-pulse"
                    style={{ top: '30%', animation: 'scanline 4s ease-in-out infinite' }} />
            </div>

            {/* Neon Glow Orbs */}
            <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px]" />

            {/* Floating Particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 100 }}
                    animate={{
                        opacity: [0, 0.5, 0],
                        y: -100,
                        x: Math.sin(i) * 50
                    }}
                    transition={{
                        duration: 4 + Math.random() * 4,
                        repeat: Infinity,
                        delay: Math.random() * 5
                    }}
                    className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                    style={{
                        left: `${Math.random() * 100}%`,
                        bottom: 0
                    }}
                />
            ))}

            {/* Header Section */}
            <div className="z-10 text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    className="flex items-center justify-center gap-4 mb-6"
                >
                    <div className="relative">
                        <Shield size={60} className="text-cyan-400" />
                        <motion.div
                            className="absolute inset-0 bg-cyan-400/30 blur-xl rounded-full"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl md:text-7xl font-bold mb-4"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                        EduHash
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-cyan-300/60 text-lg tracking-[0.3em] uppercase font-light"
                >
                    Secure Payment Protocol
                </motion.p>

                {/* Security Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center justify-center gap-6 mt-8"
                >
                    <div className="flex items-center gap-2 text-emerald-400/70 text-xs text-nowrap">
                        <Lock size={14} />
                        <span>High-Grade Encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-400/70 text-xs text-nowrap">
                        <Fingerprint size={14} />
                        <span>Digitally Signed</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-400/70 text-xs">
                        <Zap size={14} />
                        <span>2FA Enabled</span>
                    </div>
                </motion.div>
            </div>

            {/* Action Cards */}
            <div className="z-10 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-6">
                <Link to="/login" className="group">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="h-64 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden border border-cyan-500/20 bg-[#0a1628]/80 backdrop-blur-xl"
                    >
                        {/* Animated Border Glow */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute inset-[-2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-2xl blur-sm animate-pulse" />
                            <div className="absolute inset-0 bg-[#0a1628] rounded-2xl" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                            <div className="bg-cyan-500/10 p-5 rounded-2xl mb-6 group-hover:bg-cyan-500/20 transition-colors border border-cyan-500/30">
                                <User size={40} className="text-cyan-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Secure Login</h2>
                            <p className="text-cyan-300/50">Access your encrypted dashboard</p>
                        </div>

                        {/* Corner Accents */}
                        <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-cyan-500/50" />
                        <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-cyan-500/50" />
                        <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-cyan-500/50" />
                        <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-cyan-500/50" />
                    </motion.div>
                </Link>

                <Link to="/verify" className="group">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="h-64 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden border border-emerald-500/20 bg-[#0a1628]/80 backdrop-blur-xl"
                    >
                        {/* Animated Border Glow */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute inset-[-2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-2xl blur-sm animate-pulse" />
                            <div className="absolute inset-0 bg-[#0a1628] rounded-2xl" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                            <div className="bg-emerald-500/10 p-5 rounded-2xl mb-6 group-hover:bg-emerald-500/20 transition-colors border border-emerald-500/30">
                                <QrCode size={40} className="text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Verify Receipt</h2>
                            <p className="text-emerald-300/50">Authenticate payment signature</p>
                        </div>

                        {/* Corner Accents */}
                        <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-emerald-500/50" />
                        <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-emerald-500/50" />
                        <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-emerald-500/50" />
                        <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-emerald-500/50" />
                    </motion.div>
                </Link>
            </div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-8 flex items-center gap-3 text-cyan-500/40 text-sm font-mono"
            >
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>SYSTEM SECURE</span>
                <span className="text-cyan-500/20">|</span>
                <span>v2.0.26</span>
            </motion.div>

            {/* CSS for scanline animation */}
            <style>{`
                @keyframes scanline {
                    0%, 100% { transform: translateY(-100vh); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(100vh); }
                }
            `}</style>
        </div>
    );
};

export default Landing;
