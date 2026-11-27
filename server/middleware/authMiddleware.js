
const db = require("../config/database");

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Please log in to access this page."
        });
    }

    // Confirm the user still exists. A session can outlive the account it
    // references (e.g. an admin deleted it), so do not trust userId alone.
    const user = db.prepare(
        "SELECT id FROM users WHERE id = ?"
    ).get(req.session.userId);

    if (!user) {
        return res.status(401).json({
            message: "Please log in to access this page."
        });
    }

    next();
}

module.exports = requireAuth;
