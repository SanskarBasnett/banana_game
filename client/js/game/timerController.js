// Manages the countdown timer displayed during a puzzle round.
// Keeping timer logic separate means changes to timing never risk
// breaking puzzle submission or leaderboard code.

const timerDisplay = document.getElementById("timer");
const PUZZLE_SECONDS = 30;

let countdownInterval = null;
let puzzleEndsAt = 0;
let timeRemaining = PUZZLE_SECONDS;
let onExpireCallback = null;

export function startTimer(onExpire) {
    stopTimer();
    onExpireCallback = onExpire;
    puzzleEndsAt = Date.now() + PUZZLE_SECONDS * 1000;
    timerDisplay.classList.remove("warning");
    updateTimer();
    // Derive remaining time from a wall-clock timestamp so the display
    // stays accurate even when the browser throttles setInterval in background tabs
    countdownInterval = setInterval(updateTimer, 250);
}

export function stopTimer() {
    clearInterval(countdownInterval);
    countdownInterval = null;
}

function updateTimer() {
    timeRemaining = Math.max(0, Math.ceil((puzzleEndsAt - Date.now()) / 1000));

    timerDisplay.textContent = `Time: ${timeRemaining}s`;
    timerDisplay.classList.toggle("warning", timeRemaining <= 10 && timeRemaining > 0);

    if (timeRemaining <= 0) {
        stopTimer();
        if (typeof onExpireCallback === "function") onExpireCallback();
    }
}
