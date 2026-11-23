
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    createResource,
    getAllResources
} = require("../controllers/resourceController");

// Faculty can create resources
router.post(
    "/",
    verifyToken,
    authorizeRoles("faculty"),
    createResource
);

// Authenticated users can view all resources
router.get(
    "/",
    verifyToken,
    getAllResources
);

module.exports = router;
