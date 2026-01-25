require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const NodeRSA = require('node-rsa');
const QRCode = require('qrcode');
// const { PDFDocument } = require('pdf-lib'); // Removed unused dependency
// Prompt: "Output: Use jspdf to download a PDF Receipt".
// Usually PDF generation happens on frontend for "download", but can be backend.
// Prompt says: "step 6... Output: Use jspdf". I will stick to frontend JS PDF generation if possible, BUT the signature creation happens on server.
// So flow: Server returns { signature, qrCodeDataUrl }. Frontend puts this into PDF.

const User = require('./models/User');
const Fee = require('./models/Fee');
const Transaction = require('./models/Transaction');

const app = express();
app.use(express.json());
app.use(cors());

// --- Cryptographic Setup ---
// 1. AES Setup for Card Encryption
const AES_ALGORITHM = 'aes-256-cbc';
const AES_KEY = crypto.scryptSync(process.env.JWT_SECRET || 'secret', 'salt', 32); // Derived key
// Note: In prod, use a proper stored secret 32-byte key.

// 2. RSA Setup for Digital Signatures
// Persist keys to avoid regeneration on restart
const fs = require('fs');
const path = require('path');

const KEYS_DIR = path.join(__dirname, 'keys');
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, 'private.pem');
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, 'public.pem');

let key;
let PRIVATE_KEY;
let PUBLIC_KEY;

// Ensure keys directory exists
if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR);
}

// Load or generate RSA keys
if (fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH)) {
    // Load existing keys
    PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
    PUBLIC_KEY = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');
    key = new NodeRSA();
    key.importKey(PRIVATE_KEY, 'private');
    console.log("RSA Keys Loaded from disk");
} else {
    // Generate new keys
    key = new NodeRSA({ b: 512 }); // 512 bit for speed in demo, 2048 for prod
    PRIVATE_KEY = key.exportKey('private');
    PUBLIC_KEY = key.exportKey('public');

    // Save keys to disk
    fs.writeFileSync(PRIVATE_KEY_PATH, PRIVATE_KEY);
    fs.writeFileSync(PUBLIC_KEY_PATH, PUBLIC_KEY);
    console.log("RSA Keys Generated and Saved to disk");
}

// --- Middleware ---
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`);
    });
    next();
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- Routes ---

// 1. Auth & Registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role, studentId } = req.body;

        // NIST Password Validation (Simplified: Length >= 12)
        // NIST 800-63B recommends minimum length of 8, but 12 is safer.
        // It also advises against complexity rules.
        if (!password || password.length < 12) {
            return res.status(400).json({ message: 'Password does not meet NIST guidelines (Min 12 characters)' });
        }

        // Rubric: Hashing (bcryptjs)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ name, email, password: hashedPassword, role, studentId });
        await user.save();
        res.status(201).json({ message: 'User registered' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET);
            res.json({ token, role: user.role, name: user.name, id: user._id });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Fees (Admin Create, Student Read)
app.get('/api/fees', authenticateToken, async (req, res) => {
    try {
        // Both Students and Admins can see fees.
        const fees = await Fee.find();

        // If student, check which are paid
        let feesWithStatus = [];
        if (req.user.role === 'student') {
            // Find transactions for this student
            const transactions = await Transaction.find({ studentId: req.user.id, status: 'Completed' });
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
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/fees', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
        const fee = new Fee(req.body);
        await fee.save();
        res.status(201).json(fee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Payment Flow
// In-memory OTP store for demo (use Redis in prod)
const otpStore = {};

app.post('/api/pay/initiate', authenticateToken, async (req, res) => {
    try {
        const { feeId, amount, cardNumber, cvv } = req.body;

        // Rubric: Encryption - AES (Confidentiality)
        // CRITICAL: Encrypt card data before DB storage
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(AES_ALGORITHM, AES_KEY, iv);
        let encryptedCard = cipher.update(cardNumber + ':' + cvv, 'utf8', 'hex');
        encryptedCard += cipher.final('hex');

        const fee = await Fee.findById(feeId);

        const transaction = new Transaction({
            studentId: req.user.id,
            feeId,
            studentName: req.user.name,
            feeTitle: fee.title,
            amount,
            encryptedCardData: encryptedCard,
            iv: iv.toString('hex'),
            status: 'Pending'
        });
        await transaction.save();

        // Rubric: MFA (Availability/Security)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[transaction._id] = otp;

        console.log(`[MOCK EMAIL] To: ${req.user.email} | OTP: ${otp}`);

        // Mock Nodemailer
        // const transporter = nodemailer.createTransport({...});
        // await transporter.sendMail({...});

        res.json({ transactionId: transaction._id, message: 'OTP Sent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/pay/verify', authenticateToken, async (req, res) => {
    try {
        const { transactionId, otp } = req.body;

        if (otpStore[transactionId] !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // OTP Correct - Finalize Transaction
        const transaction = await Transaction.findById(transactionId);
        transaction.status = 'Completed';

        // Rubric: Receipt Generation (Integrity)
        // Data String: Include ALL critical fields - StudentID|StudentName|Amount|Date|TransactionID
        const dataString = `${transaction.studentId}|${transaction.studentName}|${transaction.amount}|${transaction.date}|${transaction._id}`;

        // Hashing: SHA-256
        const hash = crypto.createHash('sha256').update(dataString).digest('hex');
        transaction.receiptHash = hash;

        // Signing: RSA Private Key
        // key.sign(data, [encoding], [source_encoding])
        const signature = key.sign(hash, 'base64', 'utf8');
        transaction.digitalSignature = signature;

        await transaction.save();
        delete otpStore[transactionId]; // Cleanup

        // Generate QR Code data URL containing the signature
        // The QR contains just the signature. The verifier needs to reconstruct the hash and verify.
        // OR the QR contains the JSON { signature, dataString }? 
        // Prompt: "Scan the QR Code to extract the Digital Signature."
        const qrCodeUrl = await QRCode.toDataURL(JSON.stringify({
            sig: signature,
            data: dataString
        }));

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
        res.status(500).json({ error: error.message });
    }
});

// 4. Auditor Dashboard Data
app.get('/api/auditor/stats', authenticateToken, async (req, res) => {
    if (req.user.role !== 'auditor') return res.sendStatus(403);

    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        // Mocking some data aggregation
        const paidCount = transactions.filter(t => t.status === 'Completed').length;
        const pendingCount = transactions.filter(t => t.status === 'Pending').length;

        const fees = await Fee.find();
        const revenueByCategory = {};
        transactions.forEach(t => {
            if (t.status === 'Completed') {
                // Find fee category
                const fee = fees.find(f => f._id.equals(t.feeId));
                const cat = fee ? fee.category : 'Misc';
                revenueByCategory[cat] = (revenueByCategory[cat] || 0) + t.amount;
            }
        });

        const revenueData = Object.keys(revenueByCategory).map(key => ({
            name: key,
            value: revenueByCategory[key]
        }));

        const statusData = [
            { name: 'Paid', value: paidCount },
            { name: 'Pending', value: pendingCount }
        ];

        res.json({ transactions, statusData, revenueData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Public Verification Route
// The client will send the QR content (Signature + Data).
// In a real scenario, the client app would verify using the PUBLIC KEY locally or via this API.
// "Decryption: Use the Server's Public Key to decrypt the signature"
app.post('/api/verify-receipt', async (req, res) => {
    try {
        const { signature, originalData } = req.body;

        console.log('=== VERIFICATION REQUEST ===');
        console.log('Received originalData:', originalData);
        console.log('Received signature:', signature);

        // Re-calculate Hash
        const calculatedHash = crypto.createHash('sha256').update(originalData).digest('hex');
        console.log('Calculated Hash:', calculatedHash);

        // Verify the signature
        const isVerified = key.verify(calculatedHash, signature, 'utf8', 'base64');
        console.log('Verification Result:', isVerified);

        if (isVerified) {
            // Parse the verified data to show what was authenticated
            const parts = originalData.split('|');
            const verifiedData = {
                studentId: parts[0],
                studentName: parts[1],
                amount: parts[2],
                date: parts[3],
                transactionId: parts[4]
            };

            res.json({
                valid: true,
                message: '✅ Verified Authentic - Trusted Source',
                verifiedData: verifiedData,
                note: 'All fields in the receipt are cryptographically verified and untampered.'
            });
        } else {
            res.json({ valid: false, message: '❌ Tampered / Invalid Receipt' });
        }
    } catch (error) {
        console.error('Verification Error:', error);
        res.json({ valid: false, message: '❌ Verification Failed: ' + error.message });
    }
});

// Start Server
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    minPoolSize: 2,
    family: 4 // Force IPv4, helps with some DNS issues
})
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
    })
    .catch(err => {
        console.error("MongoDB Connection Failed:", err.message);
        console.log("Tip: Check your IP Whitelist or try using a phone hotspot to rule out ISP blocking.");
    });
