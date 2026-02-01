# EduPay Secure (EduHash) - Secure Student Fee Portal

## Project Overview
EduPay Secure is a MERN stack application designed to demonstrate high-security coding practices for a university lab evaluation. It strictly follows NIST SP 800-63B guidelines and implements the CIA Triad.

**Key Features:**
- **Zero-Latency Authentication:** Optimized asynchronous background processes for instant login and user creation.
- **Admin-Controlled User Management:** Centralized creation of Student and Auditor accounts by an Administrator.
- **Access Control Visualization:** Interactive RBAC Matrix available on the login portal.

## 📁 Project Structure (v2.1 - Optimized)

```
EduHash/
├── backend/
│   ├── config/              # Configuration modules
│   │   ├── crypto.js        # AES & RSA key management
│   │   ├── database.js      # MongoDB connection
│   │   ├── email.js         # Nodemailer transporter (Async)
│   │   └── index.js         # Export all configs
│   ├── controllers/         # Business logic handlers
│   │   ├── adminController.js    # Student & Auditor creation
│   │   ├── auditorController.js  # Analytics, Gap Analysis
│   │   ├── authController.js     # Login, 2FA, Key Exchange
│   │   ├── feeController.js      # Fee CRUD operations
│   │   ├── paymentController.js  # Payment & verification
│   │   └── index.js
│   ├── middleware/          # Auth & authorization
│   │   ├── auth.js          # JWT verification, RBAC
│   │   ├── logger.js        # Request logging
│   │   └── index.js
│   ├── models/              # MongoDB schemas
│   │   ├── Fee.js
│   │   ├── Transaction.js
│   │   └── User.js
│   ├── routes/              # API endpoint definitions
│   │   ├── adminRoutes.js
│   │   ├── auditorRoutes.js
│   │   ├── authRoutes.js
│   │   ├── feeRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── index.js
│   ├── keys/                # RSA key storage
│   └── server.js            # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── RBACMatrix.jsx    # RBAC Portal Modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AuditorDashboard.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── VerifyReceipt.jsx
│   │   └── App.jsx
│   └── ...
└── README.md
```

## 🔐 Security Architecture (CIA Triad)

### 1. Confidentiality (Encryption)
- **Data at Rest:** Credit Card numbers are encrypted using **AES-256-CBC** before saving to MongoDB.
- **Data in Transit:** API requests designed for HTTPS.
- **Passwords:** Hashed using **bcryptjs** with Salt (10 rounds).

### 2. Integrity (Hashing & Digital Signatures)
- **Receipt Generation:**
    1. **Hashing:** A **SHA-256** hash is generated from transaction details.
    2. **Signing:** Hash is signed using the Server's **RSA Private Key**.
    3. **Verification:** Public verification uses **RSA Public Key** to validate.

### 3. Availability (MFA & RBAC)
- **Multi-Factor Authentication (MFA):** Email OTP for login and payments.
- **Role-Based Access Control (RBAC):** Middleware enforces strict boundaries.

## 📋 NIST 800-63B Compliance

### Password Policy
- **Minimum Length:** 12 characters (NIST recommendation)
- **Admin-Generated Passwords:** Randomly generated, secure credentials sent via email.
- **Bcrypt Hashing:** With salt for secure storage.

### RBAC Matrix
Click the **"View System Access Rights"** link on the Login page to open the permissions matrix popup.

## 🚀 How to Run

### Prerequisites
- Node.js installed
- MongoDB URI configured in `backend/.env`

### Step 1: Start Backend
```bash
cd backend
# Optional: Run seed once to create initial Admin
# node seed.js 
npm install
npm run dev
```
*Server runs on http://localhost:5000*

### Step 2: Start Frontend
```bash
cd frontend
npm install
npm run dev
```
*Client runs on http://localhost:5173*

## 👥 User Roles & Permissions

| Permission | Student | Admin | Auditor |
|------------|---------|-------|---------|
| Register Account | ❌ (Admin only) | ❌ | ❌ |
| Create Student | ❌ | ✅ | ❌ |
| Create Auditor | ❌ | ✅ | ❌ |
| Login with 2FA | ✅ | ✅ | ✅ |
| View Fees | ✅ | ✅ | ❌ |
| Create Fee | ❌ | ✅ | ❌ |
| Make Payment | ✅ | ❌ | ❌ |
| View Analytics | ❌ | ❌ | ✅ (Gap Analysis) |
| Verify Receipt | ✅ | ✅ | ✅ |

## 🔍 Verification Process
1. **Admin Creation:** Log in as Admin to create Student accounts. Credentials are emailed.
2. **Payment:** Log in as Student, pay fees, generate receipt.
3. **Verification:** Use "Verify Receipt" page with the digital signature.

## 📝 API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - Login (initiates 2FA, Latency Optimized)
- `POST /verify-otp` - Verify OTP and get token
- `GET /public-key` - Get RSA public key

### Admin (`/api/admin`)
- `POST /create-auditor` - Create auditor account
- `POST /create-student` - Create student account

### Fees (`/api/fees`)
- `GET /` - Get all fees
- `POST /` - Create new fee

### Payments (`/api/pay`)
- `POST /initiate` - Start payment
- `POST /verify` - Verify OTP and complete

### Auditor (`/api/auditor`)
- `GET /stats` - Get analytics dashboard data

### Verification
- `POST /api/verify-receipt` - Public endpoint to verify receipts
