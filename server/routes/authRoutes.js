const express    = require("express");
const router     = express.Router();
const { register, login, getMe, updateProfile } = require("../controllers/authController");
const requireAuth = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login",    login);

router.post("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({ message: "Unable to log out." });
        }
        // Clear the cookie so the browser stops sending the now-invalid session ID
        res.clearCookie("banana.sid");
        res.json({ message: "Logged out successfully." });
    });
});

router.get("/me",          requireAuth, getMe);
router.put("/profile",     requireAuth, updateProfile);

module.exports = router;
