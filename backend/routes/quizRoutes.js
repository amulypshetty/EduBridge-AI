const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    createQuiz,
    addQuestion,
    getAllQuizzes,
    getQuizQuestions,
    submitQuiz,
    getQuizResults
} = require("../controllers/quizController");
// FACULTY: CREATE A QUIZ
router.post("/", verifyToken, authorizeRoles("faculty"), createQuiz);

// FACULTY: ADD QUESTIONS TO A QUIZ
router.post("/:quizId/questions", verifyToken, authorizeRoles("faculty"), addQuestion);

// STUDENT: VIEW ALL AVAILABLE QUIZZES
router.get("/", verifyToken, authorizeRoles("student"), getAllQuizzes);

// STUDENT: VIEW QUESTIONS OF A QUIZ
router.get("/:quizId/questions", verifyToken, authorizeRoles("student"), getQuizQuestions);

// STUDENT: SUBMIT QUIZ
router.post("/:quizId/submit", verifyToken, authorizeRoles("student"), submitQuiz);

// STUDENT: VIEW QUIZ RESULTS
router.get("/:quizId/results", verifyToken, authorizeRoles("student"), getQuizResults);

module.exports = router;