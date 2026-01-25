const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    feeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee', required: true },
    studentName: { type: String }, // Snapshot for easier querying
    feeTitle: { type: String },
    amount: { type: Number, required: true },

    // AES Encryption Fields for Card Data
    encryptedCardData: { type: String, required: true },
    iv: { type: String, required: true },

    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    date: { type: Date, default: Date.now },

    // Integrity Fields
    receiptHash: { type: String }, // SHA-256 of receipt data
    digitalSignature: { type: String } // RSA Signed Hash
});

module.exports = mongoose.model('Transaction', TransactionSchema);
