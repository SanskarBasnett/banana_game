
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

let puzzleActive = false;

async function updateScore() {
    try {
        const data = await getScores();
        scoreDisplay.textContent = data.score;
    } catch (error) {
        console.error("Score loading error:", error);
    }
}

async function startGame() {
    try {
        startButton.disabled = true;
        gameMessage.textContent = "Loading puzzle...";

        const puzzle = await getPuzzle();

        puzzleImage.src = puzzle.imageUrl;
        puzzleArea.hidden = false;
        gameMessage.textContent = "Solve the banana puzzle!";
        resultMessage.textContent = "";

        answerInput.value = "";
        puzzleActive = true;

    } catch (error) {
        gameMessage.textContent = error.message;
    } finally {
        startButton.disabled = false;
    }
}

async function checkAnswer(event) {
    event.preventDefault();

    if (!puzzleActive) {
        return;
    }

    try {
        const data = await submitAnswer(answerInput.value);

        resultMessage.textContent = data.message;
        scoreDisplay.textContent = data.score;

        puzzleActive = false;
        puzzleArea.hidden = true;
        gameMessage.textContent = "Ready for another puzzle?";

    } catch (error) {
        resultMessage.textContent = error.message;
    }
}

startButton.addEventListener("click", startGame);
answerForm.addEventListener("submit", checkAnswer);

updateScore();
