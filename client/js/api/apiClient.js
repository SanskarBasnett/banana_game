// All server API calls go through apiRequest so error handling and headers
// are consistent across every module — no other file calls fetch directly.

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: { "Content-Type": "application/json", ...options.headers }
    });

    const data = await response.json();

    if (!response.ok) {
        // Attach the HTTP status so callers can branch on specific codes
        // e.g. 410 Gone when a puzzle times out server-side
        const error = new Error(data.message || "Something went wrong.");
        error.status = response.status;
        throw error;
    }

    return data;
}

// Game
export const getPuzzle      = ()       => apiRequest("/api/game/puzzle");
export const getSolution    = ()       => apiRequest("/api/game/solution");
export const getPlayerStats = ()       => apiRequest("/api/game/stats");
export const getLeaderboard = ()       => apiRequest("/api/game/leaderboard");
export const submitAnswer   = (answer) => apiRequest("/api/game/answer", {
    method: "POST",
    body: JSON.stringify({ answer })
});

// Auth
export const register        = (user)    => apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(user)
});
export const login           = (user)    => apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(user)
});
export const logout          = ()        => apiRequest("/api/auth/logout", { method: "POST" });
export const getMe           = ()        => apiRequest("/api/auth/me");
export const updateProfile   = (profile) => apiRequest("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify(profile)
});

// Admin
export const getAdminUsers   = ()   => apiRequest("/api/admin/users");
export const resetAllScores  = ()   => apiRequest("/api/admin/scores/reset",           { method: "POST" });
export const deleteUser      = (id) => apiRequest(`/api/admin/users/${id}`,            { method: "DELETE" });
export const resetUserScore  = (id) => apiRequest(`/api/admin/users/${id}/reset-score`, { method: "POST" });
