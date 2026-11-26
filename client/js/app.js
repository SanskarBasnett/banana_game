
async function checkAuthentication() {
    try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
            window.location.href = "login.html";
            return false;
        }

        const data = await response.json();

        document.getElementById("username").textContent =
            data.user.username;

        return true;

    } catch (error) {
        console.error("Authentication error:", error);
        window.location.href = "login.html";
        return false;
    }
}

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        logoutButton.disabled = true;

        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST"
            });

            if (response.ok) {
                window.location.href = "login.html";
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            logoutButton.disabled = false;
        }
    });
}

const isAuthenticated = await checkAuthentication();

if (isAuthenticated) {
    await import("./game/gameController.js");
}
