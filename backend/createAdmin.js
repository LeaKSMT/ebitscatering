const bcrypt = require("bcrypt");
const db = require("./config/db");

async function createAdmin() {
    try {
        const email = "owner@ebitscatering.com".trim().toLowerCase();
        const plainPassword = "ebitscatering000";
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        db.query(
            "SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1",
            [email],
            (err, results) => {
                if (err) {
                    console.error("Check error:", err);
                    process.exit();
                }

                if (results.length > 0) {
                    db.query(
                        "UPDATE users SET password = ?, role = 'admin', name = 'Business Owner', updated_at = NOW() WHERE LOWER(email) = ?",
                        [hashedPassword, email],
                        (err2) => {
                            if (err2) {
                                console.error("Update error:", err2);
                            } else {
                                console.log("ADMIN UPDATED SUCCESSFULLY");
                                console.log("Email:", email);
                                console.log("Password:", plainPassword);
                            }
                            process.exit();
                        }
                    );
                } else {
                    db.query(
                        "INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
                        ["Business Owner", email, hashedPassword, "admin"],
                        (err3) => {
                            if (err3) {
                                console.error("Insert error:", err3);
                            } else {
                                console.log("ADMIN CREATED SUCCESSFULLY");
                                console.log("Email:", email);
                                console.log("Password:", plainPassword);
                            }
                            process.exit();
                        }
                    );
                }
            }
        );
    } catch (error) {
        console.error("Unexpected error:", error);
        process.exit();
    }
}

createAdmin();