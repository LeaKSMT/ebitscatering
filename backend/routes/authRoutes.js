const express = require("express");
const router = express.Router();

const {
    register,
    login,
    logout,
    googleAuth,
    me,
} = require("../controllers/authController");

const { verifyToken } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/logout", logout);
router.get("/me", verifyToken, me);

module.exports = router;