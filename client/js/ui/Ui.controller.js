
let toastTimer = null;

export function setPlayerName(name) {
    const displayName = (name || "Player").trim() || "Player";
    const initial = (Array.from(displayName)[0] || "?").toUpperCase();

    ["username", "welcomeName"].forEach((id) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = displayName;
        }
    });

    ["playerAvatar", "welcomeAvatar"].forEach((id) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = initial;
        }
    });

    document.title = `${displayName} | Banana Game`;
}

export function formatMemberSince(value) {
    if (!value) {
        return "—";
    }

    const normalized = value.includes("T")
        ? value
        : `${value.replace(" ", "T")}Z`;

    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        year: "numeric"
    }).format(date);
}

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

    toastTimer = setTimeout(() => {
        toast.classList.remove("toast-visible");
    }, 2800);
}
