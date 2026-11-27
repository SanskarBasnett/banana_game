
const db = require("../config/database");

// Requires an authenticated session AND the given role, e.g. requireRole("admin").
// The role is read from the database on every request, not trusted from the
// client or from a potentially stale session value.
function requireRole(role) {
    return function (req, res, next) {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Please log in to access this page."
            });
        }

        const user = db.prepare(
            "SELECT id, username, role FROM users WHERE id = ?"
        ).get(req.session.userId);

        if (!user) {
            return res.status(401).json({
                message: "Please log in to access this page."
            });
        }

        if (user.role !== role) {
            return res.status(403).json({
                message: "You do not have permission to do that."
            });
        }

        req.user = user;
        next();
    };
}

module.exports = { requireRole };
