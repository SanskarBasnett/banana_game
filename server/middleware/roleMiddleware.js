const db = require("../config/database");

// Returns middleware that blocks users who don't have the required role.
// Can run after requireAuth (reusing req.user) or standalone (fresh DB lookup),
// so the role is never read from a potentially stale session value.
// 401 = not logged in, 403 = logged in but wrong role (least-privilege distinction).
function requireRole(role) {
    return function (req, res, next) {
        if (!req.session.userId) {
            return res.status(401).json({ message: "Please log in to access this page." });
        }

        const user = req.user || db.prepare(
            "SELECT id, username, role FROM users WHERE id = ?"
        ).get(req.session.userId);

        if (!user) {
            return res.status(401).json({ message: "Please log in to access this page." });
        }

        if (user.role !== role) {
            return res.status(403).json({ message: "You do not have permission to do that." });
        }

        req.user = user;
        next();
    };
}

module.exports = { requireRole };
