document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const msgDiv = document.getElementById('msg');

    // --- LOGIN FORM HANDLER ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            msgDiv.textContent = ''; // Clear previous messages

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const res = await fetch('http://localhost:5000/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.msg || 'Login failed');
                }

                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                window.location.href = 'index.html';

            } catch (error) {
                msgDiv.style.color = 'red';
                msgDiv.textContent = error.message;
            }
        });
    }

    // --- REGISTRATION FORM HANDLER (NEW) ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            msgDiv.textContent = ''; // Clear previous messages

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const res = await fetch('https://nutricafe-1.onrender.com/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });
                
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.msg || 'Registration failed');
                }
                
                msgDiv.style.color = 'green';
                msgDiv.textContent = 'Registration successful! Please log in.';

                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } catch (error) {
                msgDiv.style.color = 'red';
                msgDiv.textContent = error.message;
            }
        });
    }
});