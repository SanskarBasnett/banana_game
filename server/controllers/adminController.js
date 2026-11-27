const db = require("../config/database");

// Guards against deleting the only remaining admin, which would lock
// everyone out of the admin dashboard permanently
function countAdmins() {
    return db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'").get().count;
}

function listUsers(req, res) {
    try {
        // LEFT JOIN includes players with zero scores; COALESCE turns NULL into 0.
        // password_hash is deliberately excluded — hashes must never leave the server.
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

function deleteUser(req, res) {
    try {
        const targetId = Number(req.params.id);

        if (!Number.isInteger(targetId)) {
            return res.status(400).json({ message: "Invalid user id." });
        }

        if (targetId === req.session.userId) {
            return res.status(409).json({ message: "You cannot delete your own account." });
        }

        const target = db.prepare("SELECT id, role FROM users WHERE id = ?").get(targetId);

        if (!target) {
            return res.status(404).json({ message: "User not found." });
        }

        if (target.role === "admin" && countAdmins() <= 1) {
            return res.status(409).json({ message: "Cannot delete the last admin." });
        }

        // Wrap in a transaction — if either DELETE fails, neither is committed,
        // preventing orphaned score rows that reference a deleted user
        db.transaction((id) => {
            db.prepare("DELETE FROM scores WHERE user_id = ?").run(id);
            db.prepare("DELETE FROM users  WHERE id = ?").run(id);
        })(targetId);

        return res.json({ message: "User deleted.", user: { id: targetId } });

    } catch (error) {
        console.error("Delete user error:", error);
        return res.status(500).json({ message: "Unable to delete user." });
    }
}

function resetUserScore(req, res) {
    try {
        const targetId = Number(req.params.id);

        if (!Number.isInteger(targetId)) {
            return res.status(400).json({ message: "Invalid user id." });
        }

        const target = db.prepare("SELECT id FROM users WHERE id = ?").get(targetId);

        if (!target) {
            return res.status(404).json({ message: "User not found." });
        }

        db.prepare("DELETE FROM scores WHERE user_id = ?").run(targetId);

        return res.json({ message: "Score reset.", user: { id: targetId, totalScore: 0 } });

    } catch (error) {
        console.error("Reset score error:", error);
        return res.status(500).json({ message: "Unable to reset score." });
    }
}

function resetAllScores(req, res) {
    try {
        // The leaderboard is derived by summing the scores table, so clearing
        // it resets all ranks and scores to zero without touching user accounts
        db.prepare("DELETE FROM scores").run();

        return res.json({ message: "All scores reset. Leaderboard cleared." });

    } catch (error) {
        console.error("Reset all scores error:", error);
        return res.status(500).json({ message: "Unable to reset scores." });
    }
}

module.exports = { listUsers, deleteUser, resetUserScore, resetAllScores };
