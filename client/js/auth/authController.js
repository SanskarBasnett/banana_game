
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const message = document.getElementById("message");
        const submitButton = registerForm.querySelector('button[type="submit"]');

        submitButton.disabled = true;

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });

            const data = await response.json();

            message.textContent = data.message;

            if (response.ok) {
                registerForm.reset();

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 800);
            }
        } catch (error) {
            message.textContent = "Unable to connect to the server.";
            console.error(error);
        } finally {
            submitButton.disabled = false;
        }
    });
}


const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const message = document.getElementById("message");
        const submitButton = loginForm.querySelector('button[type="submit"]');

        submitButton.disabled = true;

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            message.textContent = data.message;

            if (response.ok) {
                window.location.href = "index.html";
            }
        } catch (error) {
            message.textContent = "Unable to connect to the server.";
            console.error(error);
        } finally {
            submitButton.disabled = false;
        }
    });
}
