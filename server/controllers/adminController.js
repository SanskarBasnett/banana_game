
const db = require("../config/database");

// Helper: count admins
function countAdmins() {
    return db.prepare(
        "SELECT COUNT(*) AS count FROM users WHERE role = 'admin'"
    ).get().count;
}

// List all users with their score, for admins.
// password_hash is deliberately never selected.
function listUsers(req, res) {
    try {
        const users = db.prepare(`
            SELECT users.id, users.username, users.email, users.role,
                   users.created_at AS createdAt,
                   COALESCE(SUM(scores.score), 0) AS totalScore
            FROM users
            LEFT JOIN scores ON scores.user_id = users.id
            GROUP BY users.id
            ORDER BY users.id ASC
        `).all();

        res.json({ users });

    } catch (error) {
        console.error("List users error:", error);
        res.status(500).json({ message: "Unable to load users." });
    }
}

// Delete a user and all of their scores. Transactional.
function deleteUser(req, res) {
    try {
        const targetId = Number(req.params.id);

        if (!Number.isInteger(targetId)) {
            return res.status(400).json({ message: "Invalid user id." });
        }

        if (targetId === req.session.userId) {
            return res.status(409).json({
                message: "You cannot delete your own account."
            });
        }

        const target = db.prepare(
            "SELECT id, role FROM users WHERE id = ?"
        ).get(targetId);

        if (!target) {
            return res.status(404).json({ message: "User not found." });
        }

        if (target.role === "admin" && countAdmins() <= 1) {
            return res.status(409).json({
                message: "Cannot delete the last admin."
            });
        }

        // scores.user_id references users(id); delete child rows first.
        // Wrapped in a transaction so a failure cannot orphan scores.
        const deleteUserAndScores = db.transaction((userId) => {
            db.prepare("DELETE FROM scores WHERE user_id = ?").run(userId);
            db.prepare("DELETE FROM users WHERE id = ?").run(userId);
        });

        deleteUserAndScores(targetId);

        return res.json({ message: "User deleted.", user: { id: targetId } });

    } catch (error) {
        console.error("Delete user error:", error);
        return res.status(500).json({ message: "Unable to delete user." });
    }
}

// Reset one user's score to zero. The account stays; only scores are removed.
function resetUserScore(req, res) {
    try {
        const targetId = Number(req.params.id);

        if (!Number.isInteger(targetId)) {
            return res.status(400).json({ message: "Invalid user id." });
        }

        const target = db.prepare(
            "SELECT id FROM users WHERE id = ?"
        ).get(targetId);

        if (!target) {
            return res.status(404).json({ message: "User not found." });
        }

        db.prepare("DELETE FROM scores WHERE user_id = ?").run(targetId);

        return res.json({
            message: "Score reset.",
            user: { id: targetId, totalScore: 0 }
        });

    } catch (error) {
        console.error("Reset score error:", error);
        return res.status(500).json({ message: "Unable to reset score." });
    }
}

// Reset every score. The leaderboard is derived from the scores table, so
// clearing it resets the leaderboard to all zeros.
function resetAllScores(req, res) {
    try {
        db.prepare("DELETE FROM scores").run();

        return res.json({ message: "All scores reset. Leaderboard cleared." });

    } catch (error) {
        console.error("Reset all scores error:", error);
        return res.status(500).json({ message: "Unable to reset scores." });
    }
}

module.exports = {
    listUsers,
    deleteUser,
    resetUserScore,
    resetAllScores
};
