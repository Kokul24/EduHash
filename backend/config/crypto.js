/**
 * Cryptographic Configuration
 * AES and RSA key setup for encryption and digital signatures
 */

const crypto = require('crypto');
const NodeRSA = require('node-rsa');
const fs = require('fs');
const path = require('path');

// Validate JWT_SECRET exists
if (!process.env.JWT_SECRET) {
    console.error("CRITICAL ERROR: JWT_SECRET is missing in .env. Cannot start secure server.");
    process.exit(1);
}

// --- AES Setup for Card Encryption ---
const AES_ALGORITHM = 'aes-256-cbc';
const AES_KEY = crypto.scryptSync(process.env.JWT_SECRET, 'salt', 32);

// --- RSA Setup for Digital Signatures ---
const KEYS_DIR = path.join(__dirname, '..', 'keys');
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
    console.log("🔐 RSA Keys Loaded from disk");
} else {
    // Generate new keys
    key = new NodeRSA({ b: 512 }); // 512 bit for demo, use 2048 for production
    PRIVATE_KEY = key.exportKey('private');
    PUBLIC_KEY = key.exportKey('public');

    // Save keys to disk
    fs.writeFileSync(PRIVATE_KEY_PATH, PRIVATE_KEY);
    fs.writeFileSync(PUBLIC_KEY_PATH, PUBLIC_KEY);
    console.log("🔐 RSA Keys Generated and Saved to disk");
}

module.exports = {
    AES_ALGORITHM,
    AES_KEY,
    key,
    PRIVATE_KEY,
    PUBLIC_KEY
};
