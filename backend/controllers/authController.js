const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET || "secretkey",
        { expiresIn: "1d" }
    );
};

exports.register = async (req, res) => {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();
    const contactNumber = (req.body.contactNumber || "").trim();

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Name, email, and password are required.",
        });
    }

    pool.query(
        "SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1",
        [email],
        async (checkErr, checkResults) => {
            if (checkErr) {
                console.error("Register check error:", checkErr);
                return res.status(500).json({ message: "Database error" });
            }

            if (checkResults && checkResults.length > 0) {
                return res.status(409).json({ message: "Email already exists." });
            }

            try {
                const hashedPassword = await bcrypt.hash(password, 10);

                pool.query(
                    "INSERT INTO users (name, email, password, role, contact_number) VALUES (?, ?, ?, ?, ?)",
                    [name, email, hashedPassword, "client", contactNumber || null],
                    (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Register insert error:", insertErr);
                            return res.status(500).json({ message: "Registration failed" });
                        }

                        return res.status(201).json({
                            message: "Registration successful",
                            user: {
                                id: insertResult.insertId,
                                name,
                                email,
                                contactNumber,
                                role: "client",
                            },
                        });
                    }
                );
            } catch (error) {
                console.error("Register hash error:", error);
                return res.status(500).json({ message: "Server error" });
            }
        }
    );
};

exports.login = (req, res) => {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();

    console.log("LOGIN ATTEMPT:", { email });

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required.",
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
                const isMatch = await bcrypt.compare(password, user.password || "");

                if (!isMatch) {
                    return res.status(401).json({ message: "Invalid credentials" });
                }

                const token = signToken(user);

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