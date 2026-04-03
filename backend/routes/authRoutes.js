const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/login", (req, res) => {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();

    console.log("LOGIN ATTEMPT:", { email, password });

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    db.query(
        "SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1",
        [email],
        async (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error" });
            }

            console.log("DB RESULTS:", results);

            if (!results || results.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const user = results[0];

            try {
                const isMatch = await bcrypt.compare(password, user.password);
                console.log("PASSWORD MATCH:", isMatch);

                if (!isMatch) {
                    return res.status(401).json({ message: "Invalid password" });
                }

                const token = jwt.sign(
                    {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                );

                return res.status(200).json({
                    message: "Login successful",
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                });
            } catch (compareError) {
                console.error("Compare error:", compareError);
                return res.status(500).json({ message: "Password verification failed" });
            }
        }
    );
});

module.exports = router;