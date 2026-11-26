
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const FACULTY_ACCESS_CODE = "EDUBRIDGE-FACULTY";

// ─── REGISTRATION (Student or Faculty) ───────────────────────────────────────
const register = async (req, res) => {
    try {
        const { full_name, email, password, role, faculty_code } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email and password are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const assignedRole = role === "faculty" ? "faculty" : "student";

        // Faculty code verification
        if (assignedRole === "faculty") {
            if (!faculty_code || faculty_code.trim() !== FACULTY_ACCESS_CODE) {
                return res.status(403).json({ success: false, message: "Invalid Faculty Access Code" });
            }
        }

        const existingUser = await pool.query("SELECT user_id FROM users WHERE email = $1", [normalizedEmail]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ success: false, message: "Email already registered" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (full_name, email, password_hash, role)
             VALUES ($1, $2, $3, $4)
             RETURNING user_id, full_name, email, role, created_at`,
            [full_name.trim(), normalizedEmail, passwordHash, assignedRole]
        );

        const newUser = result.rows[0];

        // For faculty registration, return a token so they can be redirected directly
        if (assignedRole === "faculty") {
            const token = jwt.sign({ user_id: newUser.user_id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
            return res.status(201).json({
                success: true,
                message: "Faculty account created successfully",
                token,
                user: { user_id: newUser.user_id, full_name: newUser.full_name, email: newUser.email, role: newUser.role }
            });
        }

        res.status(201).json({ success: true, message: "Student registered successfully", user: newUser });

    } catch (error) {
        console.error("Registration error:", error.message);
        res.status(500).json({ success: false, message: "Registration failed" });
    }
};


// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const result = await pool.query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: { user_id: user.user_id, full_name: user.full_name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ success: false, message: "Login failed" });
    }
};


module.exports = { register, login };
