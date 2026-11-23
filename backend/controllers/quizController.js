
const pool = require("../config/db");

// FACULTY: CREATE A QUIZ
const createQuiz = async (req, res) => {
    try {
        const { title, subject } = req.body;

        if (!title || !title.trim() || !subject || !subject.trim()) {
            return res.status(400).json({
                success: false,
                message: "Quiz title and subject are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO quizzes
            (faculty_id, title, subject)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [
                req.user.user_id,
                title.trim(),
                subject.trim()
            ]
        );

        res.status(201).json({
            success: true,
            message: "Quiz created successfully",
            quiz: result.rows[0]
        });

    } catch (error) {
        console.error("Create quiz error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create quiz"
        });
    }
};


// FACULTY: ADD A QUESTION TO A QUIZ
const addQuestion = async (req, res) => {
    try {
        const { quizId } = req.params;

        const {
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option
        } = req.body;

        // Validate question and options
        if (
            !question_text?.trim() ||
            !option_a?.trim() ||
            !option_b?.trim() ||
            !option_c?.trim() ||
            !option_d?.trim() ||
            !correct_option
        ) {
            return res.status(400).json({
                success: false,
                message: "Question, all four options, and correct option are required"
            });
        }

        const correctAnswer = String(correct_option).toUpperCase();

        if (!["A", "B", "C", "D"].includes(correctAnswer)) {
            return res.status(400).json({
                success: false,
                message: "Correct option must be A, B, C, or D"
            });
        }

        // Check whether this quiz belongs to the logged-in faculty
        const quiz = await pool.query(
            `SELECT quiz_id
             FROM quizzes
             WHERE quiz_id = $1 AND faculty_id = $2`,
            [quizId, req.user.user_id]
        );

        if (quiz.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found or access denied"
            });
        }

        // Insert the question
        const result = await pool.query(
            `INSERT INTO quiz_questions
            (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                quizId,
                question_text.trim(),
                option_a.trim(),
                option_b.trim(),
                option_c.trim(),
                option_d.trim(),
                correctAnswer
            ]
        );

        res.status(201).json({
            success: true,
            message: "Question added successfully",
            question: result.rows[0]
        });

    } catch (error) {
        console.error("Add question error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to add question"
        });
    }
};

// STUDENT: VIEW ALL AVAILABLE QUIZZES
const getAllQuizzes = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                q.quiz_id,
                q.title,
                q.subject,
                q.created_at,
                u.full_name AS faculty_name,
                COUNT(qq.question_id)::INTEGER AS total_questions
             FROM quizzes q
             JOIN users u ON q.faculty_id = u.user_id
             LEFT JOIN quiz_questions qq ON q.quiz_id = qq.quiz_id
             GROUP BY q.quiz_id, u.full_name
             ORDER BY q.created_at DESC`
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            quizzes: result.rows
        });

    } catch (error) {
        console.error("Get quizzes error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch quizzes"
        });
    }
};

// STUDENT: VIEW QUESTIONS OF A QUIZ
const getQuizQuestions = async (req, res) => {
    try {
        const { quizId } = req.params;

        // Check whether the quiz exists
        const quiz = await pool.query(
            `SELECT quiz_id, title, subject
             FROM quizzes
             WHERE quiz_id = $1`,
            [quizId]
        );

        if (quiz.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            });
        }

        // Fetch questions without correct answers
        const result = await pool.query(
            `SELECT
                question_id,
                question_text,
                option_a,
                option_b,
                option_c,
                option_d
             FROM quiz_questions
             WHERE quiz_id = $1
             ORDER BY question_id ASC`,
            [quizId]
        );

        res.status(200).json({
            success: true,
            quiz: quiz.rows[0],
            count: result.rows.length,
            questions: result.rows
        });

    } catch (error) {
        console.error("Get quiz questions error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch quiz questions"
        });
    }
};


// STUDENT: SUBMIT QUIZ AND CALCULATE SCORE
const submitQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { answers } = req.body;

        // Validate submitted answers
        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please submit your answers"
            });
        }

        // Fetch all questions and correct answers for this quiz
        const result = await pool.query(
            `SELECT question_id, correct_option
             FROM quiz_questions
             WHERE quiz_id = $1`,
            [quizId]
        );

        const questions = result.rows;

        if (questions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found or has no questions"
            });
        }

        // Check that every question is answered exactly once
        if (answers.length !== questions.length) {
            return res.status(400).json({
                success: false,
                message: "Please answer all questions"
            });
        }

        const submittedIds = answers.map(answer => Number(answer.question_id));
        const validIds = questions.map(question => question.question_id);

        if (
            new Set(submittedIds).size !== submittedIds.length ||
            !submittedIds.every(id => validIds.includes(id))
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid or duplicate question IDs"
            });
        }

        // Calculate the score
        let score = 0;

        for (const answer of answers) {
            const question = questions.find(
                q => q.question_id === Number(answer.question_id)
            );

            const selectedOption = String(answer.selected_option || "").toUpperCase();

            if (!["A", "B", "C", "D"].includes(selectedOption)) {
                return res.status(400).json({
                    success: false,
                    message: "Selected option must be A, B, C, or D"
                });
            }

            if (selectedOption === question.correct_option) {
                score++;
            }
        }

        // Save the quiz attempt
        const savedAttempt = await pool.query(
            `INSERT INTO quiz_attempts
             (quiz_id, student_id, score)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [quizId, req.user.user_id, score]
        );

        res.status(201).json({
            success: true,
            message: "Quiz submitted successfully",
            result: {
                score,
                total_questions: questions.length,
                correct_answers: score,
                attempt: savedAttempt.rows[0]
            }
        });

    } catch (error) {
        console.error("Submit quiz error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to submit quiz"
        });
    }
};

// STUDENT: VIEW PREVIOUS QUIZ RESULTS
const getQuizResults = async (req, res) => {
    try {
        const { quizId } = req.params;

        const result = await pool.query(
            `SELECT
                qa.attempt_id,
                qa.quiz_id,
                q.title,
                q.subject,
                qa.score,
                (
                    SELECT COUNT(*)
                    FROM quiz_questions qq
                    WHERE qq.quiz_id = qa.quiz_id
                )::INTEGER AS total_questions,
                qa.attempted_at
             FROM quiz_attempts qa
             JOIN quizzes q ON qa.quiz_id = q.quiz_id
             WHERE qa.quiz_id = $1
             AND qa.student_id = $2
             ORDER BY qa.attempted_at DESC`,
            [quizId, req.user.user_id]
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            results: result.rows
        });

    } catch (error) {
        console.error("Get quiz results error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch quiz results"
        });
    }
};

module.exports = {
    createQuiz,
    addQuestion,
    getAllQuizzes,
    getQuizQuestions,
    submitQuiz,
    getQuizResults
};