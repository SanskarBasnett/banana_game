const { getPuzzle } = require("../services/bananaApiService");
const db = require("../config/database");

const PUZZLE_TIME_LIMIT = 30 * 1000; // milliseconds

async function startPuzzle(req, res) {
    try {
        const puzzle = await getPuzzle();

        // Store the solution server-side so the client never sees the answer
        req.session.currentSolution  = puzzle.solution;
        req.session.puzzleStartedAt  = Date.now();

        res.json({ imageUrl: puzzle.imageUrl, timeLimit: 30 });

    } catch (error) {
        console.error("Start puzzle error:", error);
        res.status(500).json({ message: "Unable to load a puzzle. Please try again." });
    }
}

function showSolution(req, res) {
    try {
        const { currentSolution, puzzleStartedAt } = req.session;

        if (currentSolution === undefined || puzzleStartedAt === undefined) {
            return res.status(400).json({ message: "No active puzzle." });
        }

        if (Date.now() - puzzleStartedAt >= PUZZLE_TIME_LIMIT) {
            delete req.session.currentSolution;
            delete req.session.puzzleStartedAt;
            return res.status(410).json({ message: "Time's up! The solution is no longer available." });
        }

        // The solution stays in the session so the player can still submit
        res.json({ solution: currentSolution });

    } catch (error) {
        console.error("Show solution error:", error);
        res.status(500).json({ message: "Unable to show the solution." });
    }
}

function submitAnswer(req, res) {
    try {
        const { answer } = req.body;

        if (answer === undefined || answer === null || answer === "") {
            return res.status(400).json({ message: "Please enter an answer." });
        }

        const playerAnswer  = Number(answer);
        const { currentSolution, puzzleStartedAt } = req.session;

        if (!Number.isInteger(playerAnswer) || currentSolution === undefined || puzzleStartedAt === undefined) {
            return res.status(400).json({ message: "Invalid answer or no active puzzle." });
        }

        if (Date.now() - puzzleStartedAt >= PUZZLE_TIME_LIMIT) {
            delete req.session.currentSolution;
            delete req.session.puzzleStartedAt;
            return res.status(410).json({ message: "Time's up! No point was awarded." });
        }

        // Clear the puzzle from the session — only one submission per round
        delete req.session.currentSolution;
        delete req.session.puzzleStartedAt;

        const correct = playerAnswer === currentSolution;

        if (correct) {
            db.prepare("INSERT INTO scores (user_id, score) VALUES (?, ?)").run(req.session.userId, 1);
        }

        const { total: totalScore } = db.prepare(
            "SELECT COALESCE(SUM(score), 0) AS total FROM scores WHERE user_id = ?"
        ).get(req.session.userId);

        return res.json({
            correct,
            message: correct ? "Correct! You earned 1 point." : "Incorrect answer. Try another puzzle!",
            score: totalScore
        });

    } catch (error) {
        console.error("Submit answer error:", error);
        res.status(500).json({ message: "Unable to check your answer." });
    }
}

function getPlayerStats(req, res) {
    try {
        // req.user is attached by requireAuth, so no second user lookup needed
        const { id: userId, username } = req.user;

        const { totalScore } = db.prepare(
            "SELECT COALESCE(SUM(score), 0) AS totalScore FROM scores WHERE user_id = ?"
        ).get(userId);

        // Rank = number of players who score strictly higher, plus 1.
        // Ties are broken alphabetically so rank is deterministic.
        const { rank } = db.prepare(`
            SELECT COUNT(*) + 1 AS rank
            FROM (
                SELECT users.id, users.username, COALESCE(SUM(scores.score), 0) AS total
                FROM users
                LEFT JOIN scores ON users.id = scores.user_id
                WHERE users.role = 'player'
                GROUP BY users.id, users.username
            )
            WHERE total > ? OR (total = ? AND username < ?)
        `).get(totalScore, totalScore, username);

        const { created_at: memberSince } = db.prepare(
            "SELECT created_at FROM users WHERE id = ?"
        ).get(userId);

        res.json({ totalScore, rank, memberSince });

    } catch (error) {
        console.error("Player stats error:", error);
        res.status(500).json({ message: "Unable to load your statistics." });
    }
}

function getLeaderboard(req, res) {
    try {
        const leaderboard = db.prepare(`
            SELECT users.username, COALESCE(SUM(scores.score), 0) AS totalScore
            FROM users
            LEFT JOIN scores ON users.id = scores.user_id
            WHERE users.role = 'player'
            GROUP BY users.id, users.username
            ORDER BY totalScore DESC, users.username ASC
            LIMIT 10
        `).all();

        res.json({ leaderboard });

    } catch (error) {
        console.error("Leaderboard error:", error);
        res.status(500).json({ message: "Unable to load leaderboard." });
    }
}

module.exports = { startPuzzle, showSolution, submitAnswer, getPlayerStats, getLeaderboard };
