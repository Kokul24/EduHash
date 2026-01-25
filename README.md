# EduPay Secure (EduHash) - Secure Student Fee Portal

## Project Overview
EduPay Secure is a MERN stack application designed to demonstrate high-security coding practices for a university lab evaluation. It strictly follows NIST SP 800-63-2 guidelines and implements the CIA Triad.

## Security Architecture (CIA Triad)

### 1. Confidentiality (Encryption)
- **Data at Rest:** Credit Card numbers are NEVER stored in plain text. They are encrypted using **AES-256-CBC** before saving to MongoDB.
- **Data in Transit:** All API requests use HTTPS concepts (Simulated via standard HTTP for localhost, but architecture supports TLS).
- **Passwords:** Hashed using **bcryptjs** with Salt before storage.

### 2. Integrity (Hashing & Digital Signatures)
- **Receipt Generation:**
    1.  **Hashing:** A **SHA-256** hash is generated from the transaction details (Student ID + Amount + Date).
    2.  **Signing:** This hash is signed using the Server's **RSA Private Key**.
    3.  **Verification:** The Public Verification Portal uses the **RSA Public Key** to decrypt the signature and compare hashes ensuring the receipt has not been tampered with.

### 3. Availability (MFA & RBAC)
- **Multi-Factor Authentication (MFA):** Critical actions (Payments) require a secondary OTP verification step.
- **Role-Based Access Control (RBAC):** Middleware enforces strict boundaries between Admin, Student, and Auditor roles.

## How to Run

### Prerequisites
- Node.js installed.
- MongoDB Atlas URI is pre-configured in `backend/.env`.

### Step 1: Start Backend
```bash
cd backend
npm install
node server.js
```
*The server runs on http://localhost:5000*
*Note: The RSA Keys will be generated on the first start.*

### Step 2: Start Frontend
```bash
cd frontend
npm install
npm run dev
```
*The client runs on http://localhost:5173*

## User Roles (Credentials)
You can register new users, but here are the roles:
1.  **Student:** Can view own fees and pay.
2.  **Admin:** Can create fees (Use Postman or register a user with role 'admin' directly via DB or modifying the register code lightly for setup).
    *   *Tip:* Register a user, then manually change their role to 'admin' in MongoDB for initial setup, or use the Register page (I enabled a role selector for demo purposes).
3.  **Auditor:** View-only access to dashboards.

## Verification Process
1.  Complete a payment as a Student.
2.  Download the Receipt PDF.
3.  Take a screenshot/image of the QR Code on the receipt.
4.  Go to the "Verify Receipt" page (accessible from Landing).
5.  Upload the QR Code image.
6.  System will verify the Digital Signature.
