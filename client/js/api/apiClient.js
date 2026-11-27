
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || "Something went wrong.");
        error.status = response.status;
        throw error;
    }

    return data;
}

export function getPuzzle() {
    return apiRequest("/api/game/puzzle");
}

export function submitAnswer(answer) {
    return apiRequest("/api/game/answer", {
        method: "POST",
        body: JSON.stringify({ answer })
    });
}

export function getScores() {
    return apiRequest("/api/game/scores");
}

export function getPlayerStats() {
    return apiRequest("/api/game/stats");
}

export function getMe() {
    return apiRequest("/api/auth/me");
}

export function updateProfile(profile) {
    return apiRequest("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify(profile)
    });
}

export function getLeaderboard() {
    return apiRequest("/api/game/leaderboard");
}

// Get the solution for the current puzzle
export function getSolution() {
    return apiRequest("/api/game/solution");
}

// ---- Admin ----

export function getAdminUsers() {
    return apiRequest("/api/admin/users");
}

export function deleteUser(id) {
    return apiRequest(`/api/admin/users/${id}`, {
        method: "DELETE"
    });
}

export function resetUserScore(id) {
    return apiRequest(`/api/admin/users/${id}/reset-score`, {
        method: "POST"
    });
}

export function resetAllScores() {
    return apiRequest("/api/admin/scores/reset", {
        method: "POST"
    });
}