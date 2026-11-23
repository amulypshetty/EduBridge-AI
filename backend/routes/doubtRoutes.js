
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    createDoubt,
    getAllDoubts,
    answerDoubt,
    getDoubtAnswers
} = require("../controllers/doubtController");

// STUDENT: POST A DOUBT
router.post(
    "/",
    verifyToken,
    authorizeRoles("student"),
    createDoubt
);

// FACULTY: VIEW ALL DOUBTS
router.get(
    "/",
    verifyToken,
    authorizeRoles("faculty"),
    getAllDoubts
);

// FACULTY: ANSWER A DOUBT
router.post(
    "/:id/answer",
    verifyToken,
    authorizeRoles("faculty"),
    answerDoubt
);

// STUDENT: VIEW ANSWERS
router.get(
    "/:id/answers",
    verifyToken,
    authorizeRoles("student"),
    getDoubtAnswers
);

module.exports = router;
