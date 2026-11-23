
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");

const verifyToken = require("./middleware/authMiddleware");

const authorizeRoles = require("./middleware/authorizeRoles");

const resourceRoutes = require("./routes/resourceRoutes");

const doubtRoutes = require("./routes/doubtRoutes");

const quizRoutes = require("./routes/quizRoutes");

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/quizzes", quizRoutes);


// Welcome route
app.get("/", (req, res) => {
    res.send("Welcome to EduBridge AI Backend!");
});

// Health check API
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "EduBridge AI Backend is running!"
    });
});

// Test PostgreSQL connection
app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT current_database() AS database"
        );

        res.status(200).json({
            success: true,
            message: "PostgreSQL connected successfully!",
            database: result.rows[0].database
        });

    } catch (error) {
        console.error("Database error:", error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});


// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`EduBridge AI Backend running on port ${PORT}`);
});

// Protected user profile route
app.get("/api/auth/profile", verifyToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authenticated successfully",
        user: req.user
    });
});


app.get(
    "/api/test/faculty",
    verifyToken,
    authorizeRoles("faculty"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Faculty access granted!",
            user: req.user
        });
    }
);