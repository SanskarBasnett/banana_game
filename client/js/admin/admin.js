// Client-side gate for admin.html.
// Checks the user is authenticated AND has role 'admin' before loading the
// dashboard. The real enforcement is server-side — this just prevents
// rendering a page that would immediately 403 on every API call.

import { getMe } from "../api/apiClient.js";

const message = document.getElementById("adminMessage");

async function start() {
    let data;

    try {
        data = await getMe();
    } catch (error) {
        // 401 or network failure — getMe() throws on a non-OK response
        console.error("Authentication check failed:", error);
        window.location.href = "login.html";
        return;
    }

    if (data.user.role !== "admin") {
        // Logged-in player — redirect to the game page instead of showing an error
        window.location.href = "index.html";
        return;
    }

    // Dynamic import means the admin controller is never downloaded by players
    await import("./adminController.js");
}

start().catch((error) => {
    console.error("Admin bootstrap error:", error);
    if (message) message.textContent = "Unable to load admin dashboard.";
});
