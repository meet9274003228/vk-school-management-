const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// --- Email Transporter Setup ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- Mock Data ---
let students = [
  { id: 1, name: 'John Doe', grade: '10th', attendance: '95%' },
  { id: 2, name: 'Jane Smith', grade: '11th', attendance: '98%' },
  { id: 3, name: 'Sam Wilson', grade: '9th', attendance: '88%' }
];

let teachers = [
  { id: 1, name: 'Mr. Anderson', subject: 'Mathematics' },
  { id: 2, name: 'Mrs. Davis', subject: 'History' }
];

// --- Mock Auth & DB ---
const USERS = {
    'admin': 'password123'
};
const otpStore = new Map();

// --- Auth Endpoints ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (USERS[username] && USERS[username] === password) {
        return res.json({ success: true, token: 'mock-jwt-token-xyz' });
    }
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
});

app.post('/api/forgot-password', async (req, res) => {
    const { contact } = req.body;
    if (!contact) return res.status(400).json({ success: false, message: 'Contact is required' });
    
    // Simulate finding user & generating OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    otpStore.set(contact, otp);
    
    // Attempt real email dispatch if format looks like email and Env Vars are present
    if (contact.includes('@') && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
            await transporter.sendMail({
                from: `"Sangarsh Science Education" <${process.env.EMAIL_USER}>`,
                to: contact,
                subject: 'Your Password Reset OTP',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
                        <h2 style="color: #4f46e5; text-align: center;">Sangarsh Science Education</h2>
                        <h3 style="color: #333; text-align: center;">Password Reset Code</h3>
                        <p style="text-align: center; color: #555;">You requested a password reset. Please use the following 6-digit OTP to verify your identity:</p>
                        <div style="background-color: #f4f4f5; padding: 15px; text-align: center; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #000; margin: 20px 0;">
                            ${otp}
                        </div>
                        <p style="text-align: center; font-size: 12px; color: #aaa;">If you did not request this, please ignore this email.</p>
                    </div>
                `
            });
            console.log(`✅ Authentic Email successfully sent to ${contact}`);
        } catch (err) {
            console.error('Email send failed:', err);
            return res.status(500).json({ success: false, message: 'Failed to send OTP email. Internal Server Error.' });
        }
    } else {
        // Fallback Simulation for local testing or SMS mode
        console.log(`\n========================================`);
        console.log(`📨 [OTP SIMULATION] Target: ${contact}`);
        console.log(`🔑 Verification code: ${otp}`);
        console.log(`========================================\n`);
    }

    res.json({ success: true, message: 'OTP verification sent securely!' });
});

app.post('/api/verify-otp', (req, res) => {
    const { contact, otp, newPassword } = req.body;
    if (!otpStore.has(contact) || otpStore.get(contact) !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    
    // Save new password
    USERS['admin'] = newPassword; 
    otpStore.delete(contact);
    
    res.json({ success: true, message: 'Password reset completely!' });
});

// --- Simple API Endpoints ---
app.get('/api/students', (req, res) => { res.json(students); });
app.get('/api/teachers', (req, res) => { res.json(teachers); });

// Fallback to serving the main index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running beautifully on http://localhost:${PORT}`);
});
