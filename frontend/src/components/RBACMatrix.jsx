import { useState } from 'react';
import { createPortal } from 'react-dom'; // Import portal
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, ChevronRight, Lock, User, Eye, CheckCircle2 } from 'lucide-react';

/**
 * Role-Based Access Control Matrix Component
 * Simplified High-Level Access Table
 * Uses Portal to render outside parent styling constraints
 */

const roleDefinitions = [
    {
        role: 'Admin',
        icon: Lock,
        color: 'text-violet-400',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/20',
        description: 'Privileged access to create and manage *Auditor and Student* accounts, configure global fee structures, and oversee financial operations. Maintains full system control but strictly prohibited from altering immutable transaction logs.'
    },
    {
        role: 'Student',
        icon: User,
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        description: 'Authorized to view assigned fee dues, initiate secure payments via 2FA, and verify digital receipts. Access is strictly limited to personal data.'
    },
    {
        role: 'Auditor',
        icon: Eye,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        description: 'Read-only access to the command center data, including live transaction feeds, revenue analytics, and payment status distribution. Cannot modify any data.'
    }
];

const RBACMatrix = ({ trigger }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Custom Trigger */}
            {trigger ? (
                <div onClick={() => setIsOpen(true)}>{trigger}</div>
            ) : null}

            {/* Modal Overlay - Rendered via Portal to escape parent clipping */}
            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
                            onClick={() => setIsOpen(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="bg-[#0a0a1b]/95 border border-violet-500/30 w-full max-w-4xl rounded-2xl shadow-2xl relative overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-violet-600/10 to-purple-600/10">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gradient-to-br from-violet-600 to-purple-600 p-3 rounded-xl shadow-lg shadow-violet-600/20">
                                            <Shield size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">System Access Matrix</h2>
                                            <p className="text-violet-300/60 text-sm mt-1">Role-based security clearance definitions</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                    >
                                        <X size={24} className="text-gray-400 group-hover:text-white transition-colors" />
                                    </button>
                                </div>

                                {/* Table Content */}
                                <div className="p-8">
                                    <div className="rounded-xl border border-white/10 overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-white/5 border-b border-white/10">
                                                    <th className="p-4 pl-6 text-gray-400 font-medium uppercase tracking-wider text-sm w-1/4">Role</th>
                                                    <th className="p-4 text-gray-400 font-medium uppercase tracking-wider text-sm">Capability Scope</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                                {roleDefinitions.map((role, index) => (
                                                    <motion.tr
                                                        key={role.role}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                                                    >
                                                        <td className="p-6 align-middle">
                                                            <div className={`flex items-center gap-3 font-bold text-base md:text-lg ${role.color}`}>
                                                                <div className={`p-2 rounded-lg ${role.bg} ${role.border} border`}>
                                                                    <role.icon size={20} />
                                                                </div>
                                                                {role.role}
                                                            </div>
                                                        </td>
                                                        <td className="p-6 align-middle">
                                                            <p className="text-gray-300 leading-relaxed text-sm md:text-[15px]">
                                                                {role.description}
                                                            </p>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 font-mono">
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                        Access rights are immutable and enforced by backend middleware
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export default RBACMatrix;
