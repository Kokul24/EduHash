import { Link } from 'react-router-dom';
import { User, QrCode, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050510] relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[128px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-teal-600/20 rounded-full blur-[128px]" />

            <div className="z-10 text-center mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 mb-4"
                >
                    EduPay Secure
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 text-lg tracking-wide uppercase"
                >
                    Official Fee Portal
                </motion.p>
            </div>

            <div className="z-10 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-6">
                <Link to="/login" className="transform group hover:scale-105 transition-all duration-300">
                    <div className="h-64 rounded-3xl p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-fuchsia-600 to-pink-600 shadow-2xl shadow-pink-900/40 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                        <div className="bg-white/20 p-4 rounded-full mb-6 backdrop-blur-sm">
                            <User size={48} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Student & Staff Login</h2>
                        <p className="text-pink-100">Access your payment dashboard</p>
                    </div>
                </Link>

                <Link to="/verify" className="transform group hover:scale-105 transition-all duration-300">
                    <div className="h-64 rounded-3xl p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-teal-900/40 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                        <div className="bg-white/20 p-4 rounded-full mb-6 backdrop-blur-sm">
                            <QrCode size={48} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Verify Receipt</h2>
                        <p className="text-teal-100">Check payment authenticity</p>
                    </div>
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-8 flex items-center gap-2 text-gray-500 text-sm"
            >
                <Lock size={14} />
                <span>Secured by Digital Signature Technology</span>
            </motion.div>
        </div>
    );
};

export default Landing;
