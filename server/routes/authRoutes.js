
const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

router.post("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                message: "Unable to log out."
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            message: "Logged out successfully."
        });
    });
});


module.exports = router;

const requireAuth = require("../middleware/authMiddleware");

router.get("/me", requireAuth, (req, res) => {
    const db = require("../config/database");

    const user = db.prepare(
        "SELECT id, username, email FROM users WHERE id = ?"
    ).get(req.session.userId);

    if (!user) {
        return res.status(401).json({
            message: "User account not found."
        });
    }

    res.json({
        authenticated: true,
        user
    });
});