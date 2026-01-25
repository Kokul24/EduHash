import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AuditorDashboard = () => {
    const { logout } = useContext(AuthContext);
    const [data, setData] = useState({ transactions: [], statusData: [], revenueData: [] });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/auditor/stats');
                setData(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const COLORS = ['#10b981', '#f59e0b']; // Green, Amber

    return (
        <div className="min-h-screen bg-[#0b0c15] text-white p-6 h-screen flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-100">Auditor Command Center</h1>
                <button onClick={logout} className="text-sm text-gray-400 hover:text-white">Logout</button>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Left Panel: Transaction Feed */}
                <div className="w-1/3 bg-[#13141f] rounded-2xl border border-gray-800 flex flex-col">
                    <div className="p-4 border-b border-gray-800 font-bold text-gray-300">Transaction Feed</div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {data.transactions.map(t => (
                            <div key={t._id} className="p-3 bg-[#1c1d2e] rounded-lg border border-gray-700/50 text-sm">
                                <div className="flex justify-between text-gray-200 font-medium">
                                    <span>{t.feeTitle}</span>
                                    <span>₹{t.amount}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-xs mt-1">
                                    <span>{t.studentName}</span>
                                    <span className={t.status === 'Completed' ? 'text-green-500' : 'text-orange-500'}>{t.status}</span>
                                </div>
                                <div className="text-[10px] text-gray-600 mt-1 font-mono truncate">{t._id}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Analytics */}
                <div className="w-2/3 flex flex-col gap-6">
                    {/* Top Right: Pie Chart */}
                    <div className="flex-1 bg-[#13141f] rounded-2xl border border-gray-800 p-6 flex flex-col">
                        <h3 className="text-gray-400 text-sm font-bold uppercase mb-4">Payment Status</h3>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bottom Right: Bar Chart */}
                    <div className="flex-1 bg-[#13141f] rounded-2xl border border-gray-800 p-6 flex flex-col">
                        <h3 className="text-gray-400 text-sm font-bold uppercase mb-4">Revenue by Category</h3>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.revenueData}>
                                    <XAxis dataKey="name" stroke="#4b5563" />
                                    <YAxis stroke="#4b5563" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditorDashboard;
