
const express = require("express");
const router = express.Router();

const {
    startPuzzle,
    showSolution,
    submitAnswer,
    getScores,
    getLeaderboard
} = require("../controllers/gameController");

const requireAuth = require("../middleware/authMiddleware");

router.get("/puzzle", requireAuth, startPuzzle);
router.get("/solution", requireAuth, showSolution);
router.post("/answer", requireAuth, submitAnswer);
router.get("/scores", requireAuth, getScores);
router.get("/leaderboard", requireAuth, getLeaderboard);

module.exports = router;
