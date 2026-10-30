
const bcrypt = require("bcrypt");
const db = require("../config/database");

async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please complete all fields."
            });
        }

        if (username.length < 3) {
            return res.status(400).json({
                message: "Username must contain at least 3 characters."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters."
            });
        }

        const existingUser = db.prepare(
            "SELECT id FROM users WHERE username = ? OR email = ?"
        ).get(username, email);

        if (existingUser) {
            return res.status(409).json({
                message: "Username or email is already registered."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = db.prepare(`
            INSERT INTO users (username, email, password_hash)
            VALUES (?, ?, ?)
        `).run(username, email, passwordHash);

        req.session.userId = result.lastInsertRowid;

        return res.status(201).json({
            message: "Account created successfully!"
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Something went wrong during registration."
        });
    }
}

module.exports = { register };
