// Handles register and login form submissions.
// Uses the shared apiClient so headers and error handling stay consistent.

import { register, login } from "../api/apiClient.js";

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email    = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const message  = document.getElementById("message");
        const submit   = registerForm.querySelector('button[type="submit"]');

        submit.disabled = true;

        try {
            const data = await register({ username, email, password });

            message.textContent = data.message;
            registerForm.reset();

            // Short delay so the success message is readable before redirect
            setTimeout(() => { window.location.href = "index.html"; }, 800);

        } catch (error) {
            message.textContent = error.message;
            console.error(error);
        } finally {
            submit.disabled = false;
        }
    });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email    = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const message  = document.getElementById("message");
        const submit   = loginForm.querySelector('button[type="submit"]');

        submit.disabled = true;

        try {
            const data = await login({ email, password });

            message.textContent = data.message;
            window.location.href = "index.html";

        } catch (error) {
            message.textContent = error.message;
            console.error(error);
        } finally {
            submit.disabled = false;
        }
    });
}
