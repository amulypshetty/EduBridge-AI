
const express = require("express");
const router = express.Router();

const verifyToken    = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    getStats,
    getAllUsers,
    updateUserRole,
    deleteUser,
    deleteResource,
} = require("../controllers/adminController");

const protect = [verifyToken, authorizeRoles("admin")];

router.get("/stats",               ...protect, getStats);
router.get("/users",               ...protect, getAllUsers);
router.patch("/users/:id/role",    ...protect, updateUserRole);
router.delete("/users/:id",        ...protect, deleteUser);
router.delete("/resources/:id",    ...protect, deleteResource);

module.exports = router;
