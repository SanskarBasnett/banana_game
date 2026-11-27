const express     = require("express");
const router      = express.Router();
const { startPuzzle, showSolution, submitAnswer, getPlayerStats, getLeaderboard } = require("../controllers/gameController");
const requireAuth = require("../middleware/authMiddleware");

// All game routes require an active session
router.get("/puzzle",      requireAuth, startPuzzle);
router.get("/solution",    requireAuth, showSolution);
router.post("/answer",     requireAuth, submitAnswer);
router.get("/stats",       requireAuth, getPlayerStats);
router.get("/leaderboard", requireAuth, getLeaderboard);

module.exports = router;
