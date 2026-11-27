require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path    = require("path");

// Importing database.js runs table creation and the demo admin seed on startup
require("./config/database");

const app  = express();
const PORT = process.env.PORT || 3000;

const authRoutes  = require("./routes/authRoutes");
const gameRoutes  = require("./routes/gameRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        // Custom name avoids leaking "connect.sid" (the library default) in DevTools
        name: "banana.sid",
        cookie: {
            httpOnly: true,   // Blocks JS from reading the cookie, preventing XSS session theft
            sameSite: "lax",  // Prevents the cookie being sent on cross-site POST (CSRF mitigation)
            secure: process.env.NODE_ENV === "production", // HTTPS-only in production; false for localhost
            maxAge: 1000 * 60 * 60 * 8  // 8-hour session lifetime
        }
    })
);

app.use(express.static(path.join(__dirname, "../client")));

app.get("/api/health", (req, res) => {
    res.json({ status: "success", message: "Banana Game server is running." });
});

app.use("/api/auth",  authRoutes);
app.use("/api/game",  gameRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
    console.log(`Banana Game running at http://localhost:${PORT}`);
});
