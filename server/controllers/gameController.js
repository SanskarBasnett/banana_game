
const { getPuzzle } = require("../services/bananaApiService");
const db = require("../config/database");

const PUZZLE_TIME_LIMIT = 30 * 1000;

// Get a new puzzle
async function startPuzzle(req, res) {
    try {
        const puzzle = await getPuzzle();

        req.session.currentSolution = puzzle.solution;
        req.session.puzzleStartedAt = Date.now();

        res.json({
            imageUrl: puzzle.imageUrl,
            timeLimit: 30,
            message: "Puzzle loaded successfully."
        });

    } catch (error) {
        console.error("Start puzzle error:", error);

        res.status(500).json({
            message: "Unable to load a puzzle. Please try again."
        });
    }
}

// Reveal the solution without ending the puzzle
function showSolution(req, res) {
    try {
        const correctAnswer = req.session.currentSolution;
        const puzzleStartedAt = req.session.puzzleStartedAt;

        if (
            correctAnswer === undefined ||
            puzzleStartedAt === undefined
        ) {
            return res.status(400).json({
                message: "No active puzzle."
            });
        }

        const elapsedTime = Date.now() - puzzleStartedAt;

        if (elapsedTime >= PUZZLE_TIME_LIMIT) {
            delete req.session.currentSolution;
            delete req.session.puzzleStartedAt;

            return res.status(410).json({
                message: "Time's up! The solution is no longer available."
            });
        }

        // Keep the answer in the session for submission
        res.json({
            solution: correctAnswer,
            message: "Here is the correct solution."
        });

    } catch (error) {
        console.error("Show solution error:", error);

        res.status(500).json({
            message: "Unable to show the solution."
        });
    }
}

// Submit an answer
function submitAnswer(req, res) {
    try {
        const { answer } = req.body;

        if (answer === undefined || answer === null || answer === "") {
            return res.status(400).json({
                message: "Please enter an answer."
            });
        }

        const playerAnswer = Number(answer);
        const correctAnswer = req.session.currentSolution;
        const puzzleStartedAt = req.session.puzzleStartedAt;

        if (
            !Number.isInteger(playerAnswer) ||
            correctAnswer === undefined ||
            puzzleStartedAt === undefined
        ) {
            return res.status(400).json({
                message: "Invalid answer or no active puzzle."
            });
        }

        const elapsedTime = Date.now() - puzzleStartedAt;

        if (elapsedTime >= PUZZLE_TIME_LIMIT) {
            delete req.session.currentSolution;
            delete req.session.puzzleStartedAt;

            return res.status(410).json({
                message: "Time's up! No point was awarded."
            });
        }

        // End the puzzle after one submission
        delete req.session.currentSolution;
        delete req.session.puzzleStartedAt;

        if (playerAnswer === correctAnswer) {
            db.prepare(`
                INSERT INTO scores (user_id, score)
                VALUES (?, ?)
            `).run(req.session.userId, 1);
        }

        const totalScore = db.prepare(`
            SELECT COALESCE(SUM(score), 0) AS total
            FROM scores
            WHERE user_id = ?
        `).get(req.session.userId).total;

        if (playerAnswer === correctAnswer) {
            return res.json({
                correct: true,
                message: "Correct! You earned 1 point.",
                score: totalScore
            });
        }

        return res.json({
            correct: false,
            message: "Incorrect answer. Try another puzzle!",
            score: totalScore
        });

    } catch (error) {
        console.error("Submit answer error:", error);

        res.status(500).json({
            message: "Unable to check your answer."
        });
    }
}

// Get the player's total score
function getScores(req, res) {
    const result = db.prepare(`
        SELECT COALESCE(SUM(score), 0) AS total
        FROM scores
        WHERE user_id = ?
    `).get(req.session.userId);

    res.json({
        score: result.total
    });
}

// Get the global top 10 leaderboard
function getLeaderboard(req, res) {
    try {
        const leaderboard = db.prepare(`
            SELECT
                users.username,
                COALESCE(SUM(scores.score), 0) AS totalScore
            FROM users
            LEFT JOIN scores ON users.id = scores.user_id
            GROUP BY users.id, users.username
            ORDER BY totalScore DESC, users.username ASC
            LIMIT 10
        `).all();

        res.json({
            leaderboard
        });

    } catch (error) {
        console.error("Leaderboard error:", error);

        res.status(500).json({
            message: "Unable to load leaderboard."
        });
    }
}

module.exports = {
    startPuzzle,
    showSolution,
    submitAnswer,
    getScores,
    getLeaderboard
};
