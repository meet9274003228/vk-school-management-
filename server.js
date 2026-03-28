const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files from the 'public' directory
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

// --- Simple API Endpoints ---
app.get('/api/students', (req, res) => {
  res.json(students);
});

app.get('/api/teachers', (req, res) => {
  res.json(teachers);
});

// Fallback to serving the main index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running beautifully on http://localhost:${PORT}`);
});
