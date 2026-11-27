
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




async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter your email and password."
            });
        }

        const user = db.prepare(
            "SELECT * FROM users WHERE email = ?"
        ).get(email);

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        req.session.userId = user.id;

        return res.status(200).json({
            message: "Login successful!",
            username: user.username,
            role: user.role
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Something went wrong during login."
        });
    }
}

function getMe(req, res) {
    try {
        const user = db.prepare(`
            SELECT id, username, email, role, created_at
            FROM users
            WHERE id = ?
        `).get(req.session.userId);

        if (!user) {
            return res.status(401).json({
                message: "User account not found."
            });
        }

        return res.json({
            authenticated: true,
            user
        });

    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            message: "Unable to load your profile."
        });
    }
}

async function updateProfile(req, res) {
    try {
        const { username, email, newPassword, confirmPassword } = req.body;

        if (!username || !email) {
            return res.status(400).json({
                message: "Please enter your username and email."
            });
        }

        const user = db.prepare(
            "SELECT * FROM users WHERE id = ?"
        ).get(req.session.userId);

        if (!user) {
            return res.status(401).json({
                message: "User account not found."
            });
        }

        const cleanUsername = username.trim();
        const cleanEmail = email.trim();

        if (cleanUsername.length < 3) {
            return res.status(400).json({
                message: "Username must contain at least 3 characters."
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        if (newPassword) {
            if (newPassword.length < 8) {
                return res.status(400).json({
                    message: "New password must contain at least 8 characters."
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    message: "Passwords do not match."
                });
            }
        }

        const existingUser = db.prepare(`
            SELECT id FROM users
            WHERE (username = ? OR email = ?) AND id != ?
        `).get(cleanUsername, cleanEmail, user.id);

        if (existingUser) {
            return res.status(409).json({
                message: "Username or email is already in use."
            });
        }

        const passwordHash = newPassword
            ? await bcrypt.hash(newPassword, 12)
            : user.password_hash;

        db.prepare(`
            UPDATE users
            SET username = ?, email = ?, password_hash = ?
            WHERE id = ?
        `).run(cleanUsername, cleanEmail, passwordHash, user.id);

        return res.json({
            message: "Profile updated successfully.",
            user: {
                id: user.id,
                username: cleanUsername,
                email: cleanEmail,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error("Update profile error:", error);

        return res.status(500).json({
            message: "Unable to update your profile."
        });
    }
}

module.exports = { register, login, getMe, updateProfile };