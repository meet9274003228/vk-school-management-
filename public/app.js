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
        const user = localStorage.getItem('auth_user') || 'Admin';
        const hour = new Date().getHours();
        let greeting = 'Good evening';
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 18) greeting = 'Good afternoon';

        contentArea.innerHTML = `
            <div class="section-header">
                <h1>${greeting}, ${user}!</h1>
                <p>Here is your intelligent overview for today.</p>
            </div>
            
            <div class="stats-grid">
                <div class="surface-card stat-card">
                    <h3>Total Enrolled</h3>
                    <div class="value">1,245<span style="font-size:0.9rem; color:var(--success); margin-left:8px;">↑ 12%</span></div>
                    <div style="height:4px; background:rgba(255,255,255,0.1); border-radius:2px; margin-top:12px; overflow:hidden;">
                        <div style="height:100%; width:85%; background:var(--primary-light);"></div>
                    </div>
                </div>
                <div class="surface-card stat-card">
                    <h3>Active Teachers</h3>
                    <div class="value">84<span style="font-size:0.9rem; color:var(--success); margin-left:8px;">↑ 3%</span></div>
                    <div style="height:4px; background:rgba(255,255,255,0.1); border-radius:2px; margin-top:12px; overflow:hidden;">
                        <div style="height:100%; width:92%; background:var(--secondary);"></div>
                    </div>
                </div>
                <div class="surface-card stat-card">
                    <h3>Campus Safety Index</h3>
                    <div class="value">99.8%<span style="font-size:0.9rem; color:var(--text-muted); margin-left:8px;">- 0%</span></div>
                    <div style="height:4px; background:rgba(255,255,255,0.1); border-radius:2px; margin-top:12px; overflow:hidden;">
                        <div style="height:100%; width:99%; background:#38bdf8;"></div>
                    </div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 28px; margin-top: 20px;">
                <!-- Main Chart -->
                <div class="surface-card" style="padding:24px;">
                    <h3 style="margin-bottom:16px; color:var(--text-main); font-weight:600;">Attendance Trends</h3>
                    <div style="height: 300px; width: 100%;">
                        <canvas id="mainChart"></canvas>
                    </div>
                </div>

                <!-- Secondary Column -->
                <div style="display:flex; flex-direction:column; gap:28px;">
                    <!-- Activity Feed -->
                    <div class="surface-card" style="padding:24px; flex:1;">
                        <h3 style="margin-bottom:16px; color:var(--text-main); font-weight:600;">Live Feed</h3>
                        <div style="display:flex; flex-direction:column; gap:16px;">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <div style="width:10px; height:10px; border-radius:50%; background:var(--primary-light);"></div>
                                <div style="font-size:0.9rem;"><strong style="color:#fff;">Mr. Anderson</strong> posted grades. <span style="color:var(--text-muted); font-size:0.8rem;">2 min ago</span></div>
                            </div>
                            <div style="display:flex; align-items:center; gap:12px;">
                                <div style="width:10px; height:10px; border-radius:50%; background:var(--secondary);"></div>
                                <div style="font-size:0.9rem;"><strong style="color:#fff;">Jane Smith</strong> registered for AP Physics. <span style="color:var(--text-muted); font-size:0.8rem;">15 min ago</span></div>
                            </div>
                            <div style="display:flex; align-items:center; gap:12px;">
                                <div style="width:10px; height:10px; border-radius:50%; background:#38bdf8;"></div>
                                <div style="font-size:0.9rem;"><strong style="color:#fff;">System</strong> completed daily backup. <span style="color:var(--text-muted); font-size:0.8rem;">1 hr ago</span></div>
                            </div>
                        </div>
                    </div>
                    <!-- Doughnut Chart -->
                    <div class="surface-card" style="padding:24px;">
                        <h3 style="margin-bottom:16px; color:var(--text-main); font-weight:600;">Demographics</h3>
                        <div style="height: 180px; width: 100%;">
                            <canvas id="pieChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render Main Line Chart
        const ctxMain = document.getElementById('mainChart').getContext('2d');
        let gradientMain = ctxMain.createLinearGradient(0, 0, 0, 300);
        gradientMain.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
        gradientMain.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

        new Chart(ctxMain, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                datasets: [{
                    label: 'Campus Attendance (%)',
                    data: [85, 96, 95, 98, 93],
                    borderColor: '#818cf8',
                    backgroundColor: gradientMain,
                    borderWidth: 3,
                    pointBackgroundColor: '#ec4899',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false }, ticks: { color: '#94a3b8' }, min: 80, max: 100 }
                }
            }
        });

        // Render Doughnut Chart
        const ctxPie = document.getElementById('pieChart').getContext('2d');
        new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: ['Freshmen', 'Sophomores', 'Juniors', 'Seniors'],
                datasets: [{
                    data: [35, 25, 20, 20],
                    backgroundColor: ['#6366f1', '#ec4899', '#38bdf8', '#8b5cf6'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: {family: 'Plus Jakarta Sans'} } } },
                cutout: '70%'
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
