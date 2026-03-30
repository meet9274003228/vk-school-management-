document.addEventListener('DOMContentLoaded', () => {
    // Form Elements
    const loginForm = document.getElementById('login-form');
    const forgotForm = document.getElementById('forgot-form');
    const otpForm = document.getElementById('otp-form');
    const messageBox = document.getElementById('auth-message');
    const otpMessage = document.getElementById('otp-sent-message');

    // Switch buttons
    const showForgotBtn = document.getElementById('show-forgot');
    const showLoginFromForgot = document.getElementById('show-login-from-forgot');
    const showLoginFromOtp = document.getElementById('show-login-from-otp');

    let currentContact = '';

    // Custom Cursor Logic
    const cursor = document.querySelector('.cursor-glow');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        document.querySelectorAll('button, a, input, .surface-card, .glass-panel').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('active'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
        });
    }

    // Initialize Particles
    if (window.particlesJS) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 60, density: { enable: true, value_area: 800 } },
                color: { value: '#6366f1' },
                shape: { type: 'circle' },
                opacity: { value: 0.3, random: true },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: '#818cf8', opacity: 0.2, width: 1 },
                move: { enable: true, speed: 1.2, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false }
            },
            interactivity: {
                detect_on: 'canvas',
                events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
                modes: { grab: { distance: 140, line_linked: { opacity: 0.8 } }, push: { particles_nb: 3 } }
            },
            retina_detect: true
        });
    }

    // Switch Forms Logic
    function showForm(form) {
        document.querySelectorAll('.auth-form').forEach(f => {
            f.classList.remove('active');
            f.style.display = 'none';
        });
        form.classList.add('active');
        form.style.display = 'flex';
        messageBox.textContent = '';
        messageBox.className = 'auth-message';
    }

    // Initial Setup
    showForm(loginForm);

    showForgotBtn.addEventListener('click', (e) => { e.preventDefault(); showForm(forgotForm); });
    showLoginFromForgot.addEventListener('click', (e) => { e.preventDefault(); showForm(loginForm); });
    showLoginFromOtp.addEventListener('click', (e) => { e.preventDefault(); showForm(loginForm); });

    function showMessage(text, isError = false) {
        messageBox.textContent = text;
        messageBox.className = 'auth-message ' + (isError ? 'error' : 'success');
        messageBox.style.display = 'block';
    }

    // Handlers
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('auth_user', data.user || 'Guest');
                window.location.href = '/index.html';
            } else {
                showMessage(data.message, true);
            }
        } catch (err) {
            showMessage("Server error", true);
        }
    });

    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const contact = document.getElementById('forgot-contact').value;

        try {
            const res = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contact })
            });
            const data = await res.json();

            if (data.success) {
                currentContact = contact;
                otpMessage.textContent = data.message;
                showForm(otpForm);
            } else {
                showMessage(data.message, true);
            }
        } catch (err) {
            showMessage("Server error", true);
        }
    });

    otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp = document.getElementById('otp-code').value;
        const newPassword = document.getElementById('new-password').value;

        try {
            const res = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contact: currentContact, otp, newPassword })
            });
            const data = await res.json();

            if (data.success) {
                showMessage("Password reset successfully! Redirecting to login...", false);
                setTimeout(() => showForm(loginForm), 2000);
            } else {
                showMessage(data.message, true);
            }
        } catch (err) {
            showMessage("Server error", true);
        }
    });
});
