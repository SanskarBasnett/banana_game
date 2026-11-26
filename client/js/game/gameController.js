
import {
    getPuzzle,
    getSolution,
    submitAnswer,
    getScores,
    getLeaderboard
} from "../api/apiClient.js";

const startButton = document.getElementById("startButton");
const puzzleArea = document.getElementById("puzzle-area");
const puzzleImage = document.getElementById("puzzleImage");
const gameMessage = document.getElementById("game-message");
const answerForm = document.getElementById("answerForm");
const answerInput = document.getElementById("answer");
const resultMessage = document.getElementById("resultMessage");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const leaderboardDisplay = document.getElementById("leaderboard");

const solutionButton = document.getElementById("solutionButton");
const solutionMessage = document.getElementById("solutionMessage");

const PUZZLE_SECONDS = 30;

let puzzleActive = false;
let countdownInterval = null;
let puzzleEndsAt = 0;
let timeRemaining = PUZZLE_SECONDS;

function setResult(message, type) {
    resultMessage.textContent = message;
    resultMessage.classList.remove(
        "result-correct",
        "result-wrong",
        "result-info"
    );

    if (type) {
        resultMessage.classList.add(`result-${type}`);
    }
}

async function updateScore() {
    try {
        const data = await getScores();
        scoreDisplay.textContent = data.score;
    } catch (error) {
        console.error("Score loading error:", error);
    }
}

// Load and display the global leaderboard
async function updateLeaderboard() {
    try {
        const data = await getLeaderboard();
        leaderboardDisplay.textContent = "";

        if (data.leaderboard.length === 0) {
            leaderboardDisplay.textContent = "No players yet.";
            return;
        }

        const currentUsername =
            document.getElementById("username").textContent.trim();

        const table = document.createElement("table");
        table.classList.add("leaderboard-table");

        const thead = document.createElement("thead");
        const header = document.createElement("tr");

        ["Rank", "Player", "Score"].forEach(title => {
            const th = document.createElement("th");
            th.scope = "col";
            th.textContent = title;
            header.appendChild(th);
        });

        thead.appendChild(header);

        const tbody = document.createElement("tbody");

        data.leaderboard.forEach((player, index) => {
            const row = document.createElement("tr");

            // Highlight the logged-in player
            if (player.username === currentUsername) {
                row.classList.add("current-user-row");
            }

            const rankCell = document.createElement("td");

            const medals = ["🥇", "🥈", "🥉"];

            if (index < 3) {
                rankCell.textContent = `${medals[index]} ${index + 1}`;
            } else {
                rankCell.textContent = index + 1;
            }

            const nameCell = document.createElement("td");
            nameCell.textContent = player.username;

            const scoreCell = document.createElement("td");
            scoreCell.textContent = player.totalScore;

            row.appendChild(rankCell);
            row.appendChild(nameCell);
            row.appendChild(scoreCell);

            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        leaderboardDisplay.appendChild(table);

    } catch (error) {
        leaderboardDisplay.textContent = "Unable to load leaderboard.";
        console.error("Leaderboard loading error:", error);
    }
}

function stopCountdown() {
    clearInterval(countdownInterval);
    countdownInterval = null;
}

function endPuzzle() {
    stopCountdown();
    puzzleActive = false;
    puzzleArea.hidden = true;
    startButton.hidden = false;
    startButton.disabled = false;
}

// Start the countdown
function startTimer() {
    stopCountdown();

    puzzleEndsAt = Date.now() + PUZZLE_SECONDS * 1000;
    timerDisplay.classList.remove("warning");

    updateTimer();

    // Derive the remaining time from a timestamp so throttled
    // background tabs do not fall out of sync.
    countdownInterval = setInterval(updateTimer, 250);
}

function updateTimer() {
    timeRemaining = Math.max(
        0,
        Math.ceil((puzzleEndsAt - Date.now()) / 1000)
    );

    timerDisplay.textContent = `Time: ${timeRemaining}s`;
    timerDisplay.classList.toggle(
        "warning",
        timeRemaining <= 10 && timeRemaining > 0
    );

    if (timeRemaining <= 0 && puzzleActive) {
        endPuzzle();
        gameMessage.textContent = "Time's up!";
        setResult("No point awarded. Try another puzzle!", "info");
    }
}

// Start a new puzzle
async function startGame() {
    try {
        startButton.disabled = true;
        startButton.hidden = true;
        solutionButton.disabled = true;
        gameMessage.textContent = "Loading puzzle...";
        setResult("", null);
        solutionMessage.textContent = "";

        const puzzle = await getPuzzle();

        puzzleImage.src = puzzle.imageUrl;
        puzzleArea.hidden = false;
        gameMessage.textContent = "Solve the banana puzzle!";

        answerInput.value = "";
        answerInput.disabled = false;
        answerForm.querySelector('button[type="submit"]').disabled = false;

        solutionButton.disabled = false;
        solutionButton.textContent = "Show Solution";

        puzzleActive = true;

        startTimer();

    } catch (error) {
        gameMessage.textContent = error.message;
        startButton.hidden = false;
        startButton.disabled = false;
    }
}

// Show the correct solution without ending the puzzle
async function revealSolution() {
    if (!puzzleActive) {
        return;
    }

    solutionButton.disabled = true;

    try {
        const data = await getSolution();

        solutionMessage.textContent = `Correct solution: ${data.solution}`;
        setResult("You can still submit your answer!", "info");

    } catch (error) {
        solutionMessage.textContent = error.message;

        if (error.status === 410) {
            endPuzzle();
            gameMessage.textContent = "Time's up!";
            setResult("No point awarded. Try another puzzle!", "info");
        } else {
            solutionButton.disabled = false;
        }
    }
}

// Check the submitted answer
async function checkAnswer(event) {
    event.preventDefault();

    if (!puzzleActive) {
        return;
    }

    puzzleActive = false;
    stopCountdown();

    solutionButton.disabled = true;
    answerInput.disabled = true;
    answerForm.querySelector('button[type="submit"]').disabled = true;

    try {
        const data = await submitAnswer(answerInput.value);

        setResult(data.message, data.correct ? "correct" : "wrong");
        scoreDisplay.textContent = data.score;

        await updateLeaderboard();

    } catch (error) {
        setResult(error.message, "info");
    }

    gameMessage.textContent = "Ready for another puzzle?";
    endPuzzle();
}

// Event listeners
startButton.addEventListener("click", startGame);
answerForm.addEventListener("submit", checkAnswer);
solutionButton.addEventListener("click", revealSolution);

updateScore();
updateLeaderboard();
