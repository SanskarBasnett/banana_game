import { getMe, logout } from "./api/apiClient.js";
import { setPlayerName, setAdminVisible } from "./ui/Ui.controller.js";

// Confirm the session is valid before rendering any game content.
// Unauthenticated visitors are redirected immediately.
async function checkAuthentication() {
    try {
        // getMe() throws on 401, so a failed call means "not authenticated"
        const data = await getMe();

        setPlayerName(data.user.username);
        setAdminVisible(data.user.role === "admin");

        return true;

    } catch (error) {
        // Network failure or 401 — redirect rather than showing a broken page
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
            await logout();
            window.location.href = "login.html";
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            logoutButton.disabled = false;
        }
    });
}

const isAuthenticated = await checkAuthentication();

if (isAuthenticated) {
    // Dynamic imports mean these modules are never downloaded by unauthenticated visitors
    await import("./game/gameController.js");
    await import("./profile/profileController.js");
}
