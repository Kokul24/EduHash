import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogOut, TrendingUp, CheckCircle, Clock, DollarSign, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';

const AuditorDashboard = () => {
    const { logout } = useContext(AuthContext);
    const [data, setData] = useState({ transactions: [], statusData: [], revenueData: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/auditor/stats');
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Color schemes
    const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Green (Completed), Amber (Pending), Red (Failed)
    const BAR_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];

    // Calculate totals for summary cards
    const totalRevenue = data.revenueData.reduce((sum, item) => sum + (item.value || 0), 0);
    const completedCount = data.statusData.find(s => s.name === 'Completed')?.value || 0;
    const pendingCount = data.statusData.find(s => s.name === 'Pending')?.value || 0;
    const totalTransactions = data.transactions.length;

    // Custom label for Pie Chart
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="#9ca3af" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs">
                {name} ({(percent * 100).toFixed(0)}%)
            </text>
        );
    };

    // Custom Tooltip
    // Tooltip for Revenue (Currency)
    const CurrencyTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-3 shadow-xl">
                    <p className="text-gray-300 font-medium">{label || payload[0].name}</p>
                    <p className="text-emerald-400 font-bold">₹{payload[0].value.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    // Tooltip for Counts (Status)
    const CountTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-3 shadow-xl">
                    <p className="text-gray-300 font-medium">{payload[0].name}</p>
                    <p className="text-emerald-400 font-bold">{payload[0].value} Transactions</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1b] via-[#0f0f23] to-[#1a0b2e] text-white">
            {/* Animated Background */}
            <div className="fixed top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[150px] animate-pulse" />
            <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative z-10 p-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                            Auditor Command Center
                        </h1>
                        <p className="text-gray-400 mt-1">Real-time financial analytics and transaction monitoring</p>
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

                {/* Summary Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                >
                    <div className="bg-[#13141f]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/20 p-3 rounded-xl">
                                <DollarSign className="text-emerald-400" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Total Revenue</p>
                                <p className="text-2xl font-bold text-white">₹{totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#13141f]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500/20 p-3 rounded-xl">
                                <TrendingUp className="text-blue-400" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Total Transactions</p>
                                <p className="text-2xl font-bold text-white">{totalTransactions}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#13141f]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-500/20 p-3 rounded-xl">
                                <CheckCircle className="text-green-400" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Completed</p>
                                <p className="text-2xl font-bold text-white">{completedCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#13141f]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-500/20 p-3 rounded-xl">
                                <Clock className="text-amber-400" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Pending</p>
                                <p className="text-2xl font-bold text-white">{pendingCount}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="flex gap-6 h-[calc(100vh-320px)]">
                    {/* Left Panel: Transaction Feed */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-1/3 bg-[#13141f]/80 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col overflow-hidden"
                    >
                        <div className="p-5 border-b border-white/10 flex items-center gap-3">
                            <BarChart3 className="text-blue-400" size={20} />
                            <span className="font-bold text-gray-200">Live Transaction Feed</span>
                            <span className="ml-auto bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                                {data.transactions.length} records
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                </div>
                            ) : data.transactions.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">No transactions found</div>
                            ) : (
                                data.transactions.map((t, idx) => (
                                    <motion.div
                                        key={t._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-4 bg-[#1c1d2e]/80 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all"
                                    >
                                        <div className="flex justify-between text-gray-200 font-medium">
                                            <span className="truncate max-w-[150px]">{t.feeTitle}</span>
                                            <span className="text-emerald-400 font-bold">₹{t.amount?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500 text-xs mt-2">
                                            <span>{t.studentName}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${t.status === 'Completed'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {t.status}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-gray-600 mt-2 font-mono truncate">
                                            ID: {t._id}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Right Panel: Analytics */}
                    <div className="w-2/3 flex flex-col gap-6">
                        {/* Pie Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex-1 bg-[#13141f]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 flex flex-col"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <PieChartIcon className="text-emerald-400" size={20} />
                                <h3 className="text-gray-300 font-bold">Payment Status Distribution</h3>
                            </div>
                            <div className="flex-1 min-h-0">
                                {data.statusData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data.statusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={renderCustomLabel}
                                                labelLine={false}
                                            >
                                                {data.statusData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                                                        stroke="transparent"
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CountTooltip />} />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                formatter={(value) => <span className="text-gray-300 text-sm">{value}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        No status data available
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Bar Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex-1 bg-[#13141f]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 flex flex-col"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <BarChart3 className="text-blue-400" size={20} />
                                <h3 className="text-gray-300 font-bold">Revenue by Fee Category</h3>
                            </div>
                            <div className="flex-1 min-h-0">
                                {data.revenueData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#6b7280"
                                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                                axisLine={{ stroke: '#374151' }}
                                            />
                                            <YAxis
                                                stroke="#6b7280"
                                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                                axisLine={{ stroke: '#374151' }}
                                                tickFormatter={(value) => `₹${value.toLocaleString()}`}
                                            />
                                            <Tooltip content={<CurrencyTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                                            <Bar
                                                dataKey="value"
                                                fill="url(#barGradient)"
                                                radius={[8, 8, 0, 0]}
                                                maxBarSize={60}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        No revenue data available
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditorDashboard;
