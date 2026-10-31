
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

let puzzleActive = false;
let countdownInterval = null;
let timeRemaining = 30;

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

        const table = document.createElement("table");
        table.classList.add("leaderboard-table");

        const header = document.createElement("tr");

        ["Rank", "Player", "Score"].forEach(title => {
            const th = document.createElement("th");
            th.textContent = title;
            header.appendChild(th);
        });

        table.appendChild(header);

        data.leaderboard.forEach((player, index) => {
            const row = document.createElement("tr");

            const rankCell = document.createElement("td");
            rankCell.textContent = index + 1;

            const nameCell = document.createElement("td");
            nameCell.textContent = player.username;

            const scoreCell = document.createElement("td");
            scoreCell.textContent = player.totalScore;

            row.appendChild(rankCell);
            row.appendChild(nameCell);
            row.appendChild(scoreCell);

            table.appendChild(row);
        });

        leaderboardDisplay.appendChild(table);

    } catch (error) {
        leaderboardDisplay.textContent = "Unable to load leaderboard.";
        console.error("Leaderboard loading error:", error);
    }
}

// Start the countdown
function startTimer() {
    clearInterval(countdownInterval);

    timeRemaining = 30;
    timerDisplay.textContent = "Time: 30s";
    timerDisplay.classList.remove("warning");

    countdownInterval = setInterval(() => {
        timeRemaining--;

        timerDisplay.textContent = `Time: ${timeRemaining}s`;

        if (timeRemaining <= 10) {
            timerDisplay.classList.add("warning");
        }

        if (timeRemaining <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            puzzleActive = false;

            puzzleArea.hidden = true;
            gameMessage.textContent = "Time's up!";
            resultMessage.textContent = "No point awarded. Try another puzzle!";
            startButton.disabled = false;
        }
    }, 1000);
}

// Start a new puzzle
async function startGame() {
    try {
        startButton.disabled = true;
        solutionButton.disabled = true;
        gameMessage.textContent = "Loading puzzle...";
        resultMessage.textContent = "";
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
    } finally {
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
        resultMessage.textContent = "You can still submit your answer!";

        // Keep the puzzle, timer and answer form active

    } catch (error) {
        solutionMessage.textContent = error.message;

        if (error.status === 410) {
            puzzleActive = false;
            clearInterval(countdownInterval);
            countdownInterval = null;

            puzzleArea.hidden = true;
            gameMessage.textContent = "Time's up!";
            resultMessage.textContent = "No point awarded. Try another puzzle!";
            startButton.disabled = false;
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
    clearInterval(countdownInterval);
    countdownInterval = null;

    solutionButton.disabled = true;
    answerInput.disabled = true;
    answerForm.querySelector('button[type="submit"]').disabled = true;

    try {
        const data = await submitAnswer(answerInput.value);

        resultMessage.textContent = data.message;
        scoreDisplay.textContent = data.score;

        await updateLeaderboard();

        puzzleArea.hidden = true;
        gameMessage.textContent = "Ready for another puzzle?";

    } catch (error) {
        resultMessage.textContent = error.message;
        puzzleArea.hidden = true;
        gameMessage.textContent = "Ready for another puzzle?";
    }

    startButton.disabled = false;
}

// Event listeners
startButton.addEventListener("click", startGame);
answerForm.addEventListener("submit", checkAnswer);
solutionButton.addEventListener("click", revealSolution);

updateScore();
updateLeaderboard();
