
async function checkAuthentication() {
    try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
            window.location.href = "login.html";
            return;
        }

        const data = await response.json();

        document.getElementById("username").textContent =
            data.user.username;

    } catch (error) {
        console.error("Authentication error:", error);
        window.location.href = "login.html";
    }
}

checkAuthentication();


const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST"
            });

            if (response.ok) {
                window.location.href = "login.html";
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
    });
}

import "./game/gameController.js";