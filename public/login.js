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
                otpMessage.textContent = `A 6-digit OTP has been sent to ${contact}`;
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
