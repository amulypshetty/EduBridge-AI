
const pool = require("../config/db");

// ─── GET PLATFORM STATS ───────────────────────────────────────────────────────
const getStats = async (req, res) => {
    try {
        const [users, resources, doubts, quizzes] = await Promise.all([
            pool.query(`SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE role = 'student') AS students,
                COUNT(*) FILTER (WHERE role = 'faculty') AS faculty,
                COUNT(*) FILTER (WHERE role = 'admin')   AS admins
              FROM users`),
            pool.query(`SELECT COUNT(*) AS total FROM resources`),
            pool.query(`SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'Pending')  AS pending,
                COUNT(*) FILTER (WHERE status = 'Answered') AS answered
              FROM doubts`),
            pool.query(`SELECT COUNT(*) AS total FROM quizzes`),
        ]);

        const u = users.rows[0];
        const d = doubts.rows[0];

        res.status(200).json({
            success: true,
            stats: {
                totalUsers:     Number(u.total),
                totalStudents:  Number(u.students),
                totalFaculty:   Number(u.faculty),
                totalAdmins:    Number(u.admins),
                totalResources: Number(resources.rows[0].total),
                totalDoubts:    Number(d.total),
                pendingDoubts:  Number(d.pending),
                answeredDoubts: Number(d.answered),
                totalQuizzes:   Number(quizzes.rows[0].total),
            }
        });
    } catch (error) {
        console.error("Admin stats error:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch platform statistics" });
    }
};


// ─── GET ALL USERS ────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT user_id, full_name, email, role, created_at
             FROM users
             ORDER BY created_at DESC`
        );
        res.status(200).json({ success: true, count: result.rows.length, users: result.rows });
    } catch (error) {
        console.error("Admin get users error:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
};


// ─── UPDATE USER ROLE ─────────────────────────────────────────────────────────
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!["student", "faculty", "admin"].includes(role)) {
            return res.status(400).json({ success: false, message: "Role must be student, faculty, or admin" });
        }

        // Prevent demoting yourself
        if (Number(id) === req.user.user_id) {
            return res.status(400).json({ success: false, message: "You cannot change your own role" });
        }

        const result = await pool.query(
            `UPDATE users SET role = $1 WHERE user_id = $2
             RETURNING user_id, full_name, email, role`,
            [role, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: `Role updated to ${role}`, user: result.rows[0] });
    } catch (error) {
        console.error("Admin update role error:", error.message);
        res.status(500).json({ success: false, message: "Failed to update user role" });
    }
};


// ─── DELETE USER ──────────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (Number(id) === req.user.user_id) {
            return res.status(400).json({ success: false, message: "You cannot delete your own account" });
        }

        const result = await pool.query(
            "DELETE FROM users WHERE user_id = $1 RETURNING user_id, full_name",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: `User "${result.rows[0].full_name}" deleted successfully` });
    } catch (error) {
        console.error("Admin delete user error:", error.message);
        res.status(500).json({ success: false, message: "Failed to delete user" });
    }
};


// ─── DELETE RESOURCE ──────────────────────────────────────────────────────────
const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM resources WHERE resource_id = $1 RETURNING resource_id, title",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Resource not found" });
        }

        res.status(200).json({ success: true, message: `Resource "${result.rows[0].title}" removed successfully` });
    } catch (error) {
        console.error("Admin delete resource error:", error.message);
        res.status(500).json({ success: false, message: "Failed to delete resource" });
    }
};


module.exports = { getStats, getAllUsers, updateUserRole, deleteUser, deleteResource };
