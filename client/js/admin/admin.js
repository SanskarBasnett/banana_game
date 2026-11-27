
// Admin page gate: only logged-in users with role 'admin' may load this page.
// The real protection is server-side (/api/admin requires role 'admin');
// this is only to avoid rendering a page that would 403.

const message = document.getElementById("adminMessage");

async function start() {
    let response;

    try {
        response = await fetch("/api/auth/me");
    } catch (error) {
        console.error("Authentication error:", error);
        window.location.href = "login.html";
        return;
    }

    if (!response.ok) {
        window.location.href = "login.html";
        return;
    }

    const data = await response.json();

    if (data.user.role !== "admin") {
        window.location.href = "index.html";
        return;
    }

    await import("./adminController.js");
}

start().catch((error) => {
    console.error(error);
    if (message) message.textContent = "Unable to load admin dashboard.";
});
