
const pool = require("../config/db");

// STUDENT: POST A DOUBT
const createDoubt = async (req, res) => {
    try {
        const { question, is_anonymous } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({
                success: false,
                message: "Question is required"
            });
        }

        const anonymous = is_anonymous === true;

        const result = await pool.query(
            `INSERT INTO doubts
            (student_id, question, is_anonymous, status)
            VALUES ($1, $2, $3, $4)
            RETURNING doubt_id, question, is_anonymous, status, created_at`,
            [
                req.user.user_id,
                question.trim(),
                anonymous,
                "Pending"
            ]
        );

        res.status(201).json({
            success: true,
            message: "Doubt posted successfully",
            doubt: result.rows[0]
        });

    } catch (error) {
        console.error("Create doubt error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to post doubt"
        });
    }
};


// FACULTY: VIEW ALL DOUBTS
const getAllDoubts = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                d.doubt_id,
                d.question,
                d.is_anonymous,
                CASE
                    WHEN d.is_anonymous = true THEN 'Anonymous'
                    ELSE u.full_name
                END AS student_name,
                d.status,
                d.created_at
            FROM doubts d
            JOIN users u ON d.student_id = u.user_id
            ORDER BY d.created_at DESC`
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            doubts: result.rows
        });

    } catch (error) {
        console.error("Get doubts error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch doubts"
        });
    }
};


// FACULTY: ANSWER A DOUBT
const answerDoubt = async (req, res) => {
    try {
        const doubtId = req.params.id;
        const { answer_text } = req.body;

        if (!answer_text || !answer_text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Answer text is required"
            });
        }

        const doubtResult = await pool.query(
            "SELECT doubt_id FROM doubts WHERE doubt_id = $1",
            [doubtId]
        );

        if (doubtResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Doubt not found"
            });
        }

        const result = await pool.query(
            `INSERT INTO answers
            (doubt_id, faculty_id, answer_text)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [
                doubtId,
                req.user.user_id,
                answer_text.trim()
            ]
        );

        await pool.query(
            "UPDATE doubts SET status = $1 WHERE doubt_id = $2",
            ["Answered", doubtId]
        );

        res.status(201).json({
            success: true,
            message: "Answer submitted successfully",
            answer: result.rows[0]
        });

    } catch (error) {
        console.error("Answer doubt error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to submit answer"
        });
    }
};




// STUDENT: VIEW ANSWERS FOR PUBLIC OR OWN DOUBTS
const getDoubtAnswers = async (req, res) => {
    try {
        const doubtId = req.params.id;

        // Check whether the doubt is public or belongs to this student
        const doubtResult = await pool.query(
            `SELECT doubt_id, student_id, is_anonymous
             FROM doubts
             WHERE doubt_id = $1
             AND (student_id = $2 OR is_anonymous = false)`,
            [doubtId, req.user.user_id]
        );

        if (doubtResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Doubt not found or access denied"
            });
        }

        // Fetch answers
        const result = await pool.query(
            `SELECT
                a.answer_id,
                a.doubt_id,
                a.answer_text,
                a.created_at,
                u.full_name AS faculty_name
             FROM answers a
             JOIN users u ON a.faculty_id = u.user_id
             WHERE a.doubt_id = $1
             ORDER BY a.created_at ASC`,
            [doubtId]
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            answers: result.rows
        });

    } catch (error) {
        console.error("Get answers error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch answers"
        });
    }
};


// EXPORT FUNCTIONS
module.exports = {
    createDoubt,
    getAllDoubts,
    answerDoubt,
    getDoubtAnswers
};