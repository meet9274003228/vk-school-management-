document.addEventListener('DOMContentLoaded', () => {
    // Check Auth
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const navBtns = document.querySelectorAll('.nav-btn');
    const contentArea = document.getElementById('content-area');
    const logoutBtn = document.getElementById('logout-btn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('auth_token');
            window.location.href = '/login.html';
        });
    }

    // Handle Navigation Clicks
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            navBtns.forEach(b => b.classList.remove('active'));
            // Add active class
            btn.classList.add('active');
            
            const target = btn.getAttribute('data-target');
            loadContent(target);
        });
    });

    // Default Load
    loadContent('dashboard');

    async function loadContent(view) {
        contentArea.innerHTML = '<div class="loading">Loading...</div>';
        
        try {
            if (view === 'dashboard') {
                renderDashboard();
            } else if (view === 'students') {
                const res = await fetch('/api/students');
                const data = await res.json();
                renderStudents(data);
            } else if (view === 'teachers') {
                const res = await fetch('/api/teachers');
                const data = await res.json();
                renderTeachers(data);
            }
        } catch (error) {
            contentArea.innerHTML = `<div class="loading" style="color: #ef4444;">Error loading data. Is the server running?</div>`;
        }
    }

    function renderDashboard() {
        // Just mock some stats
        contentArea.innerHTML = `
            <h2>System Overview</h2>
            <br>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total Students</h3>
                    <div class="value">345</div>
                </div>
                <div class="stat-card">
                    <h3>Total Teachers</h3>
                    <div class="value">28</div>
                </div>
                <div class="stat-card">
                    <h3>Average Attendance</h3>
                    <div class="value">94%</div>
                </div>
            </div>
        `;
    }

    function renderStudents(students) {
        let html = `
            <h2>Student Directory</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Grade</th>
                        <th>Attendance</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;

        students.forEach(s => {
            html += `
                <tr>
                    <td>#${s.id}</td>
                    <td style="font-weight: 500;">${s.name}</td>
                    <td>${s.grade}</td>
                    <td>${s.attendance}</td>
                    <td><span class="badge">Active</span></td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        contentArea.innerHTML = html;
    }

    function renderTeachers(teachers) {
        let html = `
            <h2>Teacher Roster</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Subject</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;

        teachers.forEach(t => {
            html += `
                <tr>
                    <td>#${t.id}</td>
                    <td style="font-weight: 500;">${t.name}</td>
                    <td>${t.subject}</td>
                    <td><span class="badge" style="background: rgba(236,72,153,0.15); color: #f472b6; border-color: rgba(236,72,153,0.3);">Tenured</span></td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        contentArea.innerHTML = html;
    }
});
