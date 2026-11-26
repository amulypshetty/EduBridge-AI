
const bcrypt  = require("bcryptjs");
const pool    = require("./config/db");

const DEMO_ACCOUNTS = [
    { full_name: "Dr. Ananya Sharma", email: "faculty@edubridge.com", password: "Faculty@123", role: "faculty" },
    { full_name: "System Admin",      email: "admin@edubridge.com",   password: "Admin@123",   role: "admin"   },
    { full_name: "Amulya Shetty",     email: "student@example.com",   password: "Student@123", role: "student" },
];

async function seedDemoAccounts() {
    try {
        for (const account of DEMO_ACCOUNTS) {
            const hash = await bcrypt.hash(account.password, 10);
            await pool.query(
                `INSERT INTO users (full_name, email, password_hash, role)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (email) DO NOTHING`,
                [account.full_name, account.email, hash, account.role]
            );
        }
        console.log("✅  Demo accounts seeded (Faculty, Admin, Student).");
    } catch (err) {
        console.error("⚠️  Demo account seeding failed:", err.message);
    }
}

module.exports = seedDemoAccounts;
