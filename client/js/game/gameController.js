
import {
    getPuzzle,
    submitAnswer,
    getScores
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
        gameMessage.textContent = "Loading puzzle...";
        resultMessage.textContent = "";

        const puzzle = await getPuzzle();

        puzzleImage.src = puzzle.imageUrl;
        puzzleArea.hidden = false;
        gameMessage.textContent = "Solve the banana puzzle!";

        answerInput.value = "";
        puzzleActive = true;

        startTimer();

    } catch (error) {
        gameMessage.textContent = error.message;
    } finally {
        startButton.disabled = false;
    }
}

// Check the submitted answer
async function checkAnswer(event) {
    event.preventDefault();

    if (!puzzleActive) {
        return;
    }

    // Prevent multiple submissions
    puzzleActive = false;
    clearInterval(countdownInterval);
    countdownInterval = null;

    try {
        const data = await submitAnswer(answerInput.value);

        resultMessage.textContent = data.message;
        scoreDisplay.textContent = data.score;

        puzzleArea.hidden = true;
        gameMessage.textContent = "Ready for another puzzle?";

    } catch (error) {
        resultMessage.textContent = error.message;
        puzzleArea.hidden = true;
        gameMessage.textContent = "Ready for another puzzle?";
    }

    startButton.disabled = false;
}

startButton.addEventListener("click", startGame);
answerForm.addEventListener("submit", checkAnswer);

updateScore();
