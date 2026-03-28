const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

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

app.post('/api/forgot-password', (req, res) => {
    const { contact } = req.body;
    if (!contact) return res.status(400).json({ success: false, message: 'Contact is required' });
    
    // Simulate finding user & generating OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    otpStore.set(contact, otp);
    
    // ✨ SIMULATED SMS / EMAIL ✨
    console.log(`\n========================================`);
    console.log(`📨 [OTP SIMULATION] Sending OTP to ${contact}`);
    console.log(`🔑 Your verification code is: ${otp}`);
    console.log(`========================================\n`);

    res.json({ success: true, message: 'OTP sent' });
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
