
const { getPuzzle } = require("../services/bananaApiService");
const db = require("../config/database");

// Get a new puzzle
async function startPuzzle(req, res) {
    try {
        const puzzle = await getPuzzle();

        // Keep the correct answer in the server session
        req.session.currentSolution = puzzle.solution;

        res.json({
            imageUrl: puzzle.imageUrl,
            message: "Puzzle loaded successfully."
        });

    } catch (error) {
        console.error("Start puzzle error:", error);

        res.status(500).json({
            message: "Unable to load a puzzle. Please try again."
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

        if (
            !Number.isInteger(playerAnswer) ||
            correctAnswer === undefined
        ) {
            return res.status(400).json({
                message: "Invalid answer or no active puzzle."
            });
        }

        // Allow only one submission per puzzle
        delete req.session.currentSolution;

        if (playerAnswer === correctAnswer) {
            db.prepare(`
                INSERT INTO scores (user_id, score)
                VALUES (?, ?)
            `).run(req.session.userId, 1);

            const totalScore = db.prepare(`
                SELECT COALESCE(SUM(score), 0) AS total
                FROM scores
                WHERE user_id = ?
            `).get(req.session.userId).total;

            return res.json({
                correct: true,
                message: "Correct! You earned 1 point.",
                score: totalScore
            });
        }

        const totalScore = db.prepare(`
            SELECT COALESCE(SUM(score), 0) AS total
            FROM scores
            WHERE user_id = ?
        `).get(req.session.userId).total;

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

module.exports = {
    startPuzzle,
    submitAnswer,
    getScores
};
