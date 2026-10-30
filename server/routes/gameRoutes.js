
const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/authMiddleware");

const {
    startPuzzle,
    submitAnswer,
    getScores
} = require("../controllers/gameController");

router.get("/puzzle", requireAuth, startPuzzle);
router.post("/answer", requireAuth, submitAnswer);
router.get("/scores", requireAuth, getScores);

module.exports = router;
