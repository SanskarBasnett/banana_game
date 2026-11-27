const express    = require("express");
const router     = express.Router();
const { listUsers, deleteUser, resetUserScore, resetAllScores } = require("../controllers/adminController");
const { requireRole } = require("../middleware/roleMiddleware");

// Every admin route requires role 'admin'.
// A logged-in player gets 403; an unauthenticated user gets 401.
router.use(requireRole("admin"));

router.get("/users",                  listUsers);
router.delete("/users/:id",           deleteUser);
router.post("/users/:id/reset-score", resetUserScore);
router.post("/scores/reset",          resetAllScores);

module.exports = router;
