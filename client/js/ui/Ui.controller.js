// Shared UI utilities used across multiple pages.
// Keeping display helpers here prevents duplication and makes it easy to
// update how names, toasts, or dates are rendered in one place.

let toastTimer = null;

// Updates every element that displays the player's name or avatar initial
export function setPlayerName(name) {
    const displayName = (name || "Player").trim() || "Player";
    const initial = (Array.from(displayName)[0] || "?").toUpperCase();

    ["username", "welcomeName"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = displayName;
    });

    ["playerAvatar", "welcomeAvatar"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = initial;
    });

    document.title = `${displayName} | Banana Game`;
}

// Shows or hides admin-only UI elements based on the user's role
export function setAdminVisible(isAdmin) {
    const link = document.getElementById("adminLink");
    if (link) link.hidden = !isAdmin;

    const eyebrow = document.getElementById("dashboardEyebrow");
    if (eyebrow) eyebrow.textContent = isAdmin ? "Admin Dashboard" : "Player Dashboard";

    const subtitle = document.getElementById("dashboardSubtitle");
    if (subtitle) {
        subtitle.textContent = isAdmin
            ? "Manage players, reset scores, and keep the leaderboard fair."
            : "Solve puzzles, earn points, and climb the global leaderboard.";
    }

    // Hide score/rank stats for admins — they don't play
    const statsGrid = document.getElementById("statsGrid");
    if (statsGrid) statsGrid.hidden = isAdmin;

    const headerRank = document.getElementById("headerRank");
    if (headerRank) headerRank.hidden = isAdmin;
}

// Formats a database timestamp into a readable "Mon YYYY" string
export function formatMemberSince(value) {
    if (!value) return "—";

    // SQLite stores dates as "YYYY-MM-DD HH:MM:SS"; normalise to ISO format
    const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" }).format(date);
}

// Displays a brief notification message at the bottom of the screen.
// Auto-dismisses after 2.8 s. Creates the toast element on first use.
export function showToast(message) {
    let toast = document.getElementById("toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        toast.setAttribute("role", "status");
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("toast-visible");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("toast-visible"), 2800);
}
