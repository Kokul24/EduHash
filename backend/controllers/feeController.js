/**
 * Fee Controller
 * Handles fee-related operations for students and admins
 */

const Fee = require('../models/Fee');
const Transaction = require('../models/Transaction');

/**
 * Get all fees
 * For students: includes payment status (Paid/Pending)
 * For others: returns fees with N/A status
 */
const getAllFees = async (req, res) => {
    try {
        const fees = await Fee.find();
        let feesWithStatus = [];

        if (req.user.role === 'student') {
            // Get completed transactions for this student
            const transactions = await Transaction.find({
                studentId: req.user.id,
                status: 'Completed'
            });
            const paidFeeIds = transactions.map(t => t.feeId.toString());

            feesWithStatus = fees.map(f => ({
                ...f.toObject(),
                status: paidFeeIds.includes(f._id.toString()) ? 'Paid' : 'Pending'
            }));
        } else {
            feesWithStatus = fees.map(f => ({ ...f.toObject(), status: 'N/A' }));
        }

        res.json(feesWithStatus);
    } catch (error) {
        console.error('[FEE ERROR] Get fees failed:', error.message);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Create a new fee (Admin only)
 */
const createFee = async (req, res) => {
    try {
        const { title, amount, category, description } = req.body;

        if (!title || !amount) {
            return res.status(400).json({ message: 'Title and amount are required' });
        }

        const fee = new Fee({ title, amount, category, description });
        await fee.save();

        console.log(`[FEE] New fee created: ${title} - ₹${amount}`);
        res.status(201).json(fee);
    } catch (error) {
        console.error('[FEE ERROR] Create fee failed:', error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllFees,
    createFee
};
