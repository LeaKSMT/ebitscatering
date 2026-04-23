const express = require("express");
const router = express.Router();

const {
    register,
    login,
    logout,
    googleAuth,
    me,
    forgotPassword,
    resetPassword,
} = require("../controllers/authController");

const { verifyToken } = require("../middleware/authMiddleware");

router.options("/register", (req, res) => res.sendStatus(204));
router.options("/login", (req, res) => res.sendStatus(204));
router.options("/google", (req, res) => res.sendStatus(204));
router.options("/logout", (req, res) => res.sendStatus(204));
router.options("/me", (req, res) => res.sendStatus(204));
router.options("/forgot-password", (req, res) => res.sendStatus(204));
router.options("/reset-password", (req, res) => res.sendStatus(204));

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/logout", logout);
router.get("/me", verifyToken, me);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;