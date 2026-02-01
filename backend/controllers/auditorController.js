/**
 * Auditor Controller
 * Handles auditor-specific analytics and reporting
 */

const Fee = require('../models/Fee');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

/**
 * Get auditor dashboard statistics
 * Returns transactions, payment status distribution, and revenue by category
 */
const getStats = async (req, res) => {
    try {
        // 1. Fetch all reference data
        const transactions = await Transaction.find().sort({ date: -1 }).lean();
        const fees = await Fee.find().lean();
        const students = await User.find({ role: 'student' }).lean();

        // 2. Identify Paid Pairs (Student + Fee)
        const paidPairs = new Set();
        transactions.forEach(t => {
            if (t.status === 'Completed') {
                paidPairs.add(`${t.studentId.toString()}_${t.feeId.toString()}`);
            }
        });

        // 3. Generate Virtual "Pending" Transactions for Feed
        const pendingTransactions = [];

        students.forEach(student => {
            fees.forEach(fee => {
                const pairKey = `${student._id.toString()}_${fee._id.toString()}`;

                // If this student hasn't paid this fee, add a virtual pending record
                if (!paidPairs.has(pairKey)) {
                    pendingTransactions.push({
                        _id: `pending_${student._id}_${fee._id}`, // unique virtual ID
                        studentName: student.name,
                        feeTitle: fee.title,
                        amount: fee.amount,
                        status: 'Pending',
                        date: new Date(), // Current time to appear at top
                        feeId: fee._id,
                        studentId: student._id
                    });
                }
            });
        });

        // 4. Combine Real Completed + Virtual Pending
        const completedTransactions = transactions.filter(t => t.status === 'Completed');

        // Put pending first so they are visible immediately
        const feedData = [...pendingTransactions, ...completedTransactions];

        // 5. Calculate Stats
        const paidCount = completedTransactions.length;
        const pendingCount = pendingTransactions.length;

        // 6. Revenue Calculation
        const revenueByCategory = {};
        completedTransactions.forEach(t => {
            const fee = fees.find(f => f._id.toString() === t.feeId.toString());
            const category = fee ? fee.category : 'Misc';
            revenueByCategory[category] = (revenueByCategory[category] || 0) + t.amount;
        });

        const revenueData = Object.keys(revenueByCategory).map(key => ({
            name: key,
            value: revenueByCategory[key]
        }));

        const statusData = [
            { name: 'Paid', value: paidCount },
            { name: 'Pending', value: pendingCount }
        ];

        console.log(`[AUDITOR] Feed Generated: ${paidCount} Paid, ${pendingCount} Pending`);

        res.json({ transactions: feedData, statusData, revenueData });

    } catch (error) {
        console.error('[AUDITOR ERROR] Get stats failed:', error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getStats
};
