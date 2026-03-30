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

    // Creative Elements Init
    const cursor = document.querySelector('.cursor-glow');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        const addCursorHover = () => {
            document.querySelectorAll('button, a, input, .surface-card, .data-table tr').forEach(el => {
                if(!el.dataset.cursorBound) {
                    el.addEventListener('mouseenter', () => cursor.classList.add('active'));
                    el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
                    el.dataset.cursorBound = 'true';
                }
            });
        };
        // Re-bind cursor on mutations
        const observer = new MutationObserver(() => addCursorHover());
        observer.observe(document.body, { childList: true, subtree: true });
        addCursorHover();
    }

    if (window.particlesJS) {
        particlesJS('particles-js', {
            particles: { number: { value: 60, density: { enable: true, value_area: 800 } }, color: { value: '#6366f1' }, shape: { type: 'circle' }, opacity: { value: 0.3, random: true }, size: { value: 3, random: true }, line_linked: { enable: true, distance: 150, color: '#818cf8', opacity: 0.2, width: 1 }, move: { enable: true, speed: 1.2, out_mode: 'out' } },
            interactivity: { detect_on: 'canvas', events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true }, modes: { grab: { distance: 140, line_linked: { opacity: 0.8 } } } }, retina_detect: true
        });
    }

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
            } else if (view === 'courses') {
                const res = await fetch('/api/courses');
                const data = await res.json();
                renderCourses(data);
            } else if (view === 'grades') {
                const res = await fetch('/api/grades');
                const data = await res.json();
                renderGrades(data);
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
            <div class="section-header stagger-1">
                <h1>${greeting}, ${user}!</h1>
                <p class="typewriter-cursor" id="dashboard-subtitle"></p>
            </div>
            
            <div class="stats-grid stagger-2">
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

            <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 28px; margin-top: 20px;" class="stagger-3">
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

        // Typewriter Effect
        const phrases = ["Here is your intelligent overview for today.", "Welcome to the future of education.", "Streamlining modern school management."];
        let i = 0, j = 0, currentPhrase = [];
        let isDeleting = false, isEnd = false;
        
        function loop() {
            const el = document.getElementById('dashboard-subtitle');
            if(!el) return;
            isEnd = false;
            el.innerHTML = currentPhrase.join('');
            
            if (i < phrases.length) {
                if (!isDeleting && j <= phrases[i].length) {
                    currentPhrase.push(phrases[i][j]);
                    j++; el.innerHTML = currentPhrase.join('');
                }
                if(isDeleting && j <= phrases[i].length) {
                    currentPhrase.pop();
                    j--; el.innerHTML = currentPhrase.join('');
                }
                if (j == phrases[i].length) {
                    isEnd = true; isDeleting = true;
                }
                if (isDeleting && j === 0) {
                    currentPhrase = []; isDeleting = false;
                    i++; if (i == phrases.length) i = 0;
                }
            }
            const spedUp = Math.random() * (80 - 50) + 50;
            const normalSpeed = Math.random() * (150 - 100) + 100;
            setTimeout(loop, isEnd ? 2000 : isDeleting ? spedUp : normalSpeed);
        }
        loop();
    }

    function renderStudents(students) {
        let html = `
            <div class="section-header stagger-1">
                <h1>Student Master Roster</h1>
                <p>Manage and monitor student statuses across all grades.</p>
            </div>
            <div class="table-container stagger-2">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Grade</th>
                            <th>Attendance</th>
                            <th>Status</th>
                            <th>Actions</th>
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
                    <td><button class="nav-btn profile-btn" style="padding: 6px 12px; font-size: 0.85rem;" data-id="${s.id}">View Profile</button></td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        contentArea.innerHTML = html;

        document.querySelectorAll('.profile-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                loadStudentProfile(id);
            });
        });
    }

    function renderTeachers(teachers) {
        let html = `
            <div class="section-header stagger-1">
                <h1>Faculty Directory</h1>
                <p>Manage the teaching staff assignments.</p>
            </div>
            <div class="table-container stagger-2">
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

    function renderCourses(courses) {
        let html = `
            <div class="section-header stagger-1">
                <h1>Active Courses</h1>
                <p>Curriculum currently offered this semester.</p>
            </div>
            <div class="table-container stagger-2">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Course Name</th>
                            <th>Lead Instructor</th>
                            <th>Enrolled</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        courses.forEach(c => {
            html += `
                <tr>
                    <td style="font-weight: 600; color:#fff;">${c.title} <span style="display:block; font-size:0.8rem; color:var(--text-muted); font-weight:normal;">CODE-${c.id}</span></td>
                    <td>${c.teacher}</td>
                    <td>${c.students} Students</td>
                    <td><span class="badge badge-success">Ongoing</span></td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        contentArea.innerHTML = html;
    }

    function renderGrades(grades) {
        let html = `
            <div class="section-header stagger-1">
                <h1>Recent Exam Grades</h1>
                <p>Performance metrics from the latest assessment periods.</p>
            </div>
            <div class="table-container stagger-2">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Course & Assessment</th>
                            <th>Score</th>
                            <th>Standing</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        grades.forEach(g => {
            let badgeClass = 'badge-success';
            if(g.status === 'Average') badgeClass = 'badge-pink';
            
            html += `
                <tr>
                    <td style="font-weight: 600; color:#fff;">${g.student}</td>
                    <td>${g.course} <span style="display:block; font-size:0.8rem; color:var(--text-muted); font-weight:normal;">${g.exam}</span></td>
                    <td style="font-size: 1.1rem; font-weight:bold; color:#fff;">${g.score}</td>
                    <td><span class="badge ${badgeClass}">${g.status}</span></td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        contentArea.innerHTML = html;
    }

    async function loadStudentProfile(id) {
        contentArea.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading Profile Data...</p>
            </div>`;
        try {
            const res = await fetch(`/api/students/${id}`);
            if(!res.ok) throw new Error("Not found");
            const data = await res.json();
            renderStudentProfile(data);
        } catch (error) {
            contentArea.innerHTML = `<div class="loading-state"><p style="color:var(--danger)">Error loading profile.</p><button class="btn-primary" onclick="window.location.reload()">Refresh Page</button></div>`;
        }
    }

    function renderStudentProfile(data) {
        const s = data.student;
        const grades = data.grades;
        const avatarUrl = `https://ui-avatars.com/api/?name=${s.name.replace(' ', '+')}&background=6366f1&color=fff&size=128`;
        
        let gradesHtml = '';
        if(grades.length === 0) {
            gradesHtml = '<p style="color:var(--text-muted)">No recent grades found.</p>';
        } else {
            grades.forEach(g => {
                let badgeClass = 'badge-success';
                if(g.status === 'Average') badgeClass = 'badge-pink';
                gradesHtml += `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
                        <div>
                            <div style="font-weight:600; color:#fff;">${g.course}</div>
                            <div style="font-size:0.85rem; color:var(--text-muted);">${g.exam}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:1.1rem; font-weight:bold; color:#fff;">${g.score}</div>
                            <span class="badge ${badgeClass}" style="font-size:0.7rem;">${g.status}</span>
                        </div>
                    </div>
                `;
            });
        }

        contentArea.innerHTML = `
            <div style="margin-bottom: 24px; animation: slideDown 0.4s ease forwards;">
                <button class="nav-btn" id="back-to-students" style="padding: 10px 20px; margin-bottom: 20px; background: rgba(255,255,255,0.05); color:#fff;">
                    ← Back to Roster
                </button>
                <div class="surface-card" style="display:flex; align-items:center; gap:28px; padding:32px;">
                    <img src="${avatarUrl}" style="border-radius:50%; width:100px; height:100px; box-shadow:0 10px 25px rgba(0,0,0,0.5); border:3px solid var(--primary-light);" />
                    <div>
                        <h1 style="font-size:2.5rem; color:#fff; letter-spacing:-1px; margin-bottom:4px;">${s.name}</h1>
                        <p style="color:var(--primary-light); font-size:1.1rem; font-weight:500;">Grade: ${s.grade} | Attendance: ${s.attendance}</p>
                    </div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:28px; animation: slideUp 0.6s ease forwards;">
                <div class="surface-card" style="padding:32px;">
                    <h2 style="font-size:1.3rem; margin-bottom:24px; color:#fff; font-weight:700;">Personal Information</h2>
                    <div style="display:flex; flex-direction:column; gap:20px;">
                        <div>
                            <div style="font-size:0.85rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Email Address</div>
                            <div style="font-size:1.05rem; color:#fff;">${s.email}</div>
                        </div>
                        <div>
                            <div style="font-size:0.85rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Phone Number</div>
                            <div style="font-size:1.05rem; color:#fff;">${s.phone}</div>
                        </div>
                        <div>
                            <div style="font-size:0.85rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Home Address</div>
                            <div style="font-size:1.05rem; color:#fff;">${s.address}</div>
                        </div>
                        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.08); margin: 8px 0;" />
                        <div>
                            <div style="font-size:0.85rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Primary Guardian</div>
                            <div style="font-size:1.05rem; color:#fff;">${s.parentName} <span style="color:var(--text-muted); font-size:0.9rem; margin-left:8px;">${s.parentPhone}</span></div>
                        </div>
                    </div>
                </div>

                <div class="surface-card" style="padding:32px;">
                    <h2 style="font-size:1.3rem; margin-bottom:24px; color:#fff; font-weight:700;">Academic Performance</h2>
                    <div style="display:flex; flex-direction:column;">
                        ${gradesHtml}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('back-to-students').addEventListener('click', () => {
            document.querySelector('.nav-btn[data-target="students"]').click();
        });
    }
});
