
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
        throw new Error(data.message || "Something went wrong.");
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

export function getLeaderboard() {
    return apiRequest("/api/game/leaderboard");
}