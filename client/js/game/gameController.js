// Orchestrates the puzzle round lifecycle.
// Timer logic is in timerController.js; leaderboard rendering is in
// leaderboardController.js — each module has one reason to change.

import { getPuzzle, getSolution, submitAnswer, getPlayerStats } from "../api/apiClient.js";
import { formatMemberSince } from "../ui/Ui.controller.js";
import { startTimer, stopTimer } from "./timerController.js";
import { updateLeaderboard } from "./leaderboardController.js";
import { AppEvents, emit } from "../events.js";

const startButton     = document.getElementById("startButton");
const puzzleArea      = document.getElementById("puzzle-area");
const puzzleImage     = document.getElementById("puzzleImage");
const gameMessage     = document.getElementById("game-message");
const answerForm      = document.getElementById("answerForm");
const answerInput     = document.getElementById("answer");
const resultMessage   = document.getElementById("resultMessage");
const scoreDisplay    = document.getElementById("score");
const rankDisplay     = document.getElementById("playerRank");
const sinceDisplay    = document.getElementById("playerSince");
const headerRank      = document.getElementById("headerRank");
const solutionButton  = document.getElementById("solutionButton");
const solutionMessage = document.getElementById("solutionMessage");

let puzzleActive = false;

function setResult(message, type) {
    resultMessage.textContent = message;
    resultMessage.classList.remove("result-correct", "result-wrong", "result-info");
    if (type) resultMessage.classList.add(`result-${type}`);
}

async function updateStats() {
    try {
        const data = await getPlayerStats();
        scoreDisplay.textContent = data.totalScore;
        if (rankDisplay)  rankDisplay.textContent  = `#${data.rank}`;
        if (sinceDisplay) sinceDisplay.textContent = formatMemberSince(data.memberSince);
        if (headerRank)   headerRank.textContent   = `Rank #${data.rank}`;
    } catch (error) {
        console.error("Stats loading error:", error);
    }
}

function endPuzzle(reason) {
    stopTimer();
    puzzleActive = false;
    puzzleArea.hidden  = true;
    startButton.hidden   = false;
    startButton.disabled = false;
    emit(AppEvents.PUZZLE_ENDED, { reason });
}

async function startGame() {
    try {
        startButton.disabled  = true;
        startButton.hidden    = true;
        solutionButton.disabled = true;
        gameMessage.textContent = "Loading puzzle...";
        setResult("", null);
        solutionMessage.textContent = "";

        const puzzle = await getPuzzle();

        puzzleImage.src = puzzle.imageUrl;
        puzzleArea.hidden = false;
        gameMessage.textContent = "Solve the banana puzzle!";

        answerInput.value    = "";
        answerInput.disabled = false;
        answerForm.querySelector('button[type="submit"]').disabled = false;
        solutionButton.disabled   = false;
        solutionButton.textContent = "Show Solution";

        puzzleActive = true;

        startTimer(() => {
            endPuzzle("timeout");
            gameMessage.textContent = "Time's up!";
            setResult("No point awarded. Try another puzzle!", "info");
        });

        emit(AppEvents.PUZZLE_STARTED);

    } catch (error) {
        gameMessage.textContent    = error.message;
        startButton.hidden         = false;
        startButton.disabled       = false;
        solutionButton.disabled    = false;
    }
}

async function revealSolution() {
    if (!puzzleActive) return;

    solutionButton.disabled = true;

    try {
        const data = await getSolution();
        solutionMessage.textContent = `Correct solution: ${data.solution}`;
    } catch (error) {
        solutionMessage.textContent = error.message;

        if (error.status === 410) {
            endPuzzle("timeout");
            gameMessage.textContent = "Time's up!";
            setResult("No point awarded. Try another puzzle!", "info");
        } else {
            solutionButton.disabled = false;
        }
    }
}

async function checkAnswer(event) {
    event.preventDefault();
    if (!puzzleActive) return;

    puzzleActive = false;
    stopTimer();

    solutionButton.disabled = true;
    answerInput.disabled    = true;
    answerForm.querySelector('button[type="submit"]').disabled = true;

    try {
        const data = await submitAnswer(answerInput.value);

        setResult(data.message, data.correct ? "correct" : "wrong");
        scoreDisplay.textContent = data.score;

        // Emit player:updated instead of calling updateStats/updateLeaderboard directly —
        // any module can listen without importing gameController
        emit(AppEvents.PLAYER_UPDATED);

    } catch (error) {
        setResult(error.message, "info");
    }

    gameMessage.textContent = "Ready for another puzzle?";
    endPuzzle("answered");
}

startButton.addEventListener("click",   startGame);
answerForm.addEventListener("submit",   checkAnswer);
solutionButton.addEventListener("click", revealSolution);

// Refresh stats and leaderboard whenever any module emits player:updated
window.addEventListener(AppEvents.PLAYER_UPDATED, () => {
    updateStats();
    updateLeaderboard();
});

updateStats();
updateLeaderboard();
