/**
 * Payment Controller
 * Handles secure payment processing with AES encryption and 2FA
 */

const crypto = require('crypto');
const QRCode = require('qrcode');
const Fee = require('../models/Fee');
const Transaction = require('../models/Transaction');
const { transporter } = require('../config/email');
const { AES_ALGORITHM, AES_KEY, key } = require('../config/crypto');

// In-memory OTP store for payment verification (use Redis in production)
const otpStore = {};

/**
 * Initiate payment - encrypts card data and sends OTP
 */
const initiatePayment = async (req, res) => {
    try {
        const { feeId, amount, cardNumber, cvv } = req.body;
        console.log(`[PAYMENT INIT] User: ${req.user.name}, FeeID: ${feeId}, Amount: ${amount}`);

        // AES encryption for card data (Confidentiality)
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(AES_ALGORITHM, AES_KEY, iv);
        let encryptedCard = cipher.update(cardNumber + ':' + cvv, 'utf8', 'hex');
        encryptedCard += cipher.final('hex');

        const fee = await Fee.findById(feeId);
        if (!fee) {
            console.error('[PAYMENT ERROR] Fee not found');
            return res.status(404).json({ message: 'Fee record not found' });
        }

        // Check if already paid
        const existingPaid = await Transaction.findOne({
            studentId: req.user.id,
            feeId: feeId,
            status: 'Completed'
        });
        if (existingPaid) {
            return res.status(400).json({ message: 'Fee already paid.' });
        }

        // Check for existing pending transaction (update instead of duplicate)
        let transaction = await Transaction.findOne({
            studentId: req.user.id,
            feeId: feeId,
            status: 'Pending'
        });

        if (transaction) {
            // Update existing attempt
            transaction.amount = amount;
            transaction.encryptedCardData = encryptedCard;
            transaction.iv = iv.toString('hex');
        } else {
            // Create new transaction
            transaction = new Transaction({
                studentId: req.user.id,
                feeId,
                studentName: req.user.name,
                feeTitle: fee.title,
                amount,
                encryptedCardData: encryptedCard,
                iv: iv.toString('hex'),
                status: 'Pending'
            });
        }
        await transaction.save();

        // Generate and send OTP for 2FA
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[transaction._id] = otp;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: req.user.email,
            subject: 'EduHash Payment Verification Code',
            text: `Your One-Time Password (OTP) for payment confirmation is: ${otp}\n\nAmount: Rs. ${amount}\n\nThis code is valid for this transaction only.`
        };

        await transporter.sendMail(mailOptions);
        console.log(`[PAYMENT OTP] Sent to: ${req.user.email}`);

        res.json({ transactionId: transaction._id, message: 'OTP Sent' });
    } catch (error) {
        console.error('[PAYMENT CRASH]', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Verify payment OTP and complete transaction
 * Generates digital signature and QR code for receipt
 */
const verifyPayment = async (req, res) => {
    try {
        const { transactionId, otp } = req.body;

        if (otpStore[transactionId] !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // OTP correct - Finalize transaction
        const transaction = await Transaction.findById(transactionId);
        transaction.status = 'Completed';

        // Receipt data string for hashing
        const dataString = `${transaction.studentId}|${transaction.studentName}|${transaction.amount}|${transaction.date}|${transaction._id}`;

        // SHA-256 hash
        const hash = crypto.createHash('sha256').update(dataString).digest('hex');
        transaction.receiptHash = hash;

        // RSA digital signature
        const signature = key.sign(hash, 'base64', 'utf8');
        transaction.digitalSignature = signature;

        await transaction.save();
        delete otpStore[transactionId];

        // Generate QR code with signature data
        const qrCodeUrl = await QRCode.toDataURL(JSON.stringify({
            sig: signature,
            data: dataString
        }));

        console.log(`[PAYMENT] Completed: ${transaction.studentName} - ₹${transaction.amount}`);

        res.json({
            message: 'Payment Successful',
            receipt: {
                transactionId: transaction._id,
                studentName: transaction.studentName,
                amount: transaction.amount,
                date: transaction.date,
                signature: signature,
                hash: hash,
                qrCodeUrl: qrCodeUrl
            }
        });

    } catch (error) {
        console.error('[PAYMENT ERROR] Verification failed:', error.message);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Verify receipt authenticity using digital signature
 */
const verifyReceipt = async (req, res) => {
    try {
        const { signature, originalData } = req.body;

        console.log('=== VERIFICATION REQUEST ===');
        console.log('Received originalData:', originalData);
        console.log('Received signature:', signature);

        // Recalculate hash
        const calculatedHash = crypto.createHash('sha256').update(originalData).digest('hex');
        console.log('Calculated Hash:', calculatedHash);

        // Verify signature
        const isVerified = key.verify(calculatedHash, signature, 'utf8', 'base64');
        console.log('Verification Result:', isVerified);

        if (isVerified) {
            let verifiedData = {};

            if (originalData.includes('|')) {
                // V2 Format (Secure)
                const parts = originalData.split('|');
                verifiedData = {
                    studentId: parts[0],
                    studentName: parts[1],
                    amount: parts[2],
                    date: parts[3],
                    transactionId: parts[4],
                    version: 'v2'
                };
            } else {
                // Legacy Format
                const parts = originalData.split('-');
                verifiedData = {
                    studentId: parts[0],
                    amount: parts[1],
                    transactionId: parts[parts.length - 1],
                    studentName: "(Legacy Receipt)",
                    date: "Legacy Date",
                    version: 'v1'
                };
            }

            res.json({
                valid: true,
                message: '✅ Verified Authentic - Trusted Source',
                verifiedData: verifiedData,
                note: verifiedData.version === 'v2'
                    ? 'Full cryptographic verification active.'
                    : 'Legacy receipt verified (limited detail).'
            });
        } else {
            res.json({ valid: false, message: '❌ Tampered / Invalid Receipt' });
        }
    } catch (error) {
        console.error('Verification Error:', error);
        res.json({ valid: false, message: '❌ Verification Failed: ' + error.message });
    }
};

module.exports = {
    initiatePayment,
    verifyPayment,
    verifyReceipt
};
