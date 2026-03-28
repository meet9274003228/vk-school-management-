document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const token = localStorage.getItem('auth_token');
    if (!token && window.location.pathname !== '/login.html') {
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

    // Switch Views
    navBtns.forEach(btn => {
        if(btn.id === 'logout-btn') return;
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadContent(btn.getAttribute('data-target'));
        });
    });

    loadContent('dashboard');

    async function loadContent(view) {
        contentArea.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Fetching ${view}...</p>
            </div>`;
        
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
            contentArea.innerHTML = `<div class="loading-state"><p style="color:var(--danger)">Network Error: Could not connect to API</p></div>`;
        }
    }

    function renderDashboard() {
        contentArea.innerHTML = `
            <div class="section-header">
                <h1>Overview</h1>
                <p>Welcome back, Admin. Here's what's happening today.</p>
            </div>
            
            <div class="stats-grid">
                <div class="surface-card stat-card">
                    <h3>Total Students</h3>
                    <div class="value">1,245</div>
                </div>
                <div class="surface-card stat-card">
                    <h3>Active Teachers</h3>
                    <div class="value">84</div>
                </div>
                <div class="surface-card stat-card">
                    <h3>Avg. Attendance</h3>
                    <div class="value">96%</div>
                </div>
            </div>

            <div class="chart-container">
                <canvas id="attendanceChart"></canvas>
            </div>
        `;

        // Render Chart.js beautifully!
        const ctx = document.getElementById('attendanceChart').getContext('2d');
        
        // Create an elegant gradient fill
        let gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)'); // Primary color
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                datasets: [{
                    label: 'Campus Attendance (%)',
                    data: [94, 96, 95, 98, 93],
                    borderColor: '#6366f1',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    pointBackgroundColor: '#ec4899',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                color: '#a1a1aa',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(24, 24, 27, 0.9)',
                        titleFont: { family: 'Plus Jakarta Sans', size: 14 },
                        bodyFont: { family: 'Plus Jakarta Sans', size: 14 },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false
                    }
                },
                scales: {
                    x: { grid: { display: false, drawBorder: false }, ticks: { color: '#a1a1aa' } },
                    y: { grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false }, ticks: { color: '#a1a1aa' }, min: 80, max: 100 }
                }
            }
        });
    }

    function renderStudents(students) {
        let html = `
            <div class="section-header">
                <h1>Student Master Roster</h1>
                <p>Manage and monitor student statuses across all grades.</p>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Grade</th>
                            <th>Attendance</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        students.forEach(s => {
            const avatarUrl = `https://ui-avatars.com/api/?name=${s.name.replace(' ', '+')}&background=random&color=fff`;
            html += `
                <tr>
                    <td>
                        <div class="user-cell">
                            <img src="${avatarUrl}" class="user-avatar" alt="Avatar"/>
                            <div>
                                <div class="user-name">${s.name}</div>
                                <div class="user-sub">#ID-00${s.id}</div>
                            </div>
                        </div>
                    </td>
                    <td style="font-weight: 500;">${s.grade}</td>
                    <td>${s.attendance}</td>
                    <td><span class="badge badge-success">Enrolled</span></td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        contentArea.innerHTML = html;
    }

    function renderTeachers(teachers) {
        let html = `
            <div class="section-header">
                <h1>Faculty Directory</h1>
                <p>Manage the teaching staff assignments.</p>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Teacher</th>
                            <th>Subject Speciality</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        teachers.forEach(t => {
            const avatarUrl = `https://ui-avatars.com/api/?name=${t.name.replace(' ', '+')}&background=ec4899&color=fff`;
            html += `
                <tr>
                    <td>
                        <div class="user-cell">
                            <img src="${avatarUrl}" class="user-avatar" alt="Avatar"/>
                            <div>
                                <div class="user-name">${t.name}</div>
                                <div class="user-sub">Faculty ID: ${t.id}</div>
                            </div>
                        </div>
                    </td>
                    <td>${t.subject}</td>
                    <td><span class="badge badge-pink">Tenured</span></td>
                    <td><a href="#" style="color:var(--primary-light); text-decoration:none;">View Profile</a></td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        contentArea.innerHTML = html;
    }
});
