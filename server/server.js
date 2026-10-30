
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");

const db = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        }
    })
);

// Serve frontend files
app.use(express.static(path.join(__dirname, "../client")));

// Test API route
app.get("/api/health", (req, res) => {
    res.json({
        status: "success",
        message: "Banana Game server is running."
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Banana Game running at http://localhost:${PORT}`);
});
