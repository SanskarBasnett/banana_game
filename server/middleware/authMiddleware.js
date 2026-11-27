const db = require("../config/database");

// Blocks unauthenticated requests to protected routes.
// Also confirms the account still exists in the database — a session can
// outlive its user if an admin deletes the account while the player is active.
// Attaches req.user so downstream controllers skip a redundant DB lookup.
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ message: "Please log in to access this page." });
    }

    const user = db.prepare(
        "SELECT id, username, email, role FROM users WHERE id = ?"
    ).get(req.session.userId);

    if (!user) {
        return res.status(401).json({ message: "Please log in to access this page." });
    }

    req.user = user;
    next();
}

module.exports = requireAuth;
