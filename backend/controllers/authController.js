const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = (req, res) => {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required",
        });
    }

    pool.query(
        "SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1",
        [email],
        async (err, results) => {
            if (err) {
                console.error("Login DB error:", err);
                return res.status(500).json({ message: "Server error" });
            }

            if (!results || results.length === 0) {
                return res.status(401).json({ message: "User not found" });
            }

            const user = results[0];

            try {
                const isMatch = await bcrypt.compare(password, user.password);

                if (!isMatch) {
                    return res.status(401).json({ message: "Invalid credentials" });
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
            } catch (error) {
                console.error("Password compare error:", error);
                return res.status(500).json({ message: "Server error" });
            }
        }
    );
};

exports.me = (req, res) => {
    pool.query(
        "SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1",
        [req.user.id],
        (err, results) => {
            if (err) {
                console.error("Fetch profile error:", err);
                return res.status(500).json({ message: "Server error" });
            }

            if (!results || results.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.status(200).json(results[0]);
        }
    );
};