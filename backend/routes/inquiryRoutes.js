const express = require("express");
const router = express.Router();
const db = require("../config/db");

r
router.get("/", (req, res) => {
    const sql = `
        SELECT 
            id,
            client_name,
            client_email,
            sender,
            message,
            is_auto_acknowledgment,
            created_at
        FROM inquiries
        ORDER BY created_at ASC
    `;

    db.query(sql, (err, rows) => {
        if (err) {
            console.error("Get inquiries error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch inquiries",
                error: err.message,
            });
        }

        res.json(rows);
    });
});


router.get("/:email", (req, res) => {
    const email = String(req.params.email || "").trim().toLowerCase();

    const sql = `
        SELECT 
            id,
            client_name,
            client_email,
            sender,
            message,
            is_auto_acknowledgment,
            created_at
        FROM inquiries
        WHERE LOWER(client_email) = ?
        ORDER BY created_at ASC
    `;

    db.query(sql, [email], (err, rows) => {
        if (err) {
            console.error("Get client inquiries error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch client inquiries",
                error: err.message,
            });
        }

        res.json(rows);
    });
});

router.post("/", (req, res) => {
    const clientName = String(req.body.client_name || req.body.clientName || "Client").trim();
    const clientEmail = String(req.body.client_email || req.body.clientEmail || req.body.email || "")
        .trim()
        .toLowerCase();
    const sender = String(req.body.sender || "").trim().toLowerCase();
    const message = String(req.body.message || req.body.text || "").trim();
    const isAutoAcknowledgment = req.body.is_auto_acknowledgment || req.body.isAutoAcknowledgment ? 1 : 0;

    if (!clientEmail || !sender || !message) {
        return res.status(400).json({
            success: false,
            message: "client_email, sender, and message are required",
        });
    }

    if (!["client", "admin"].includes(sender)) {
        return res.status(400).json({
            success: false,
            message: "Sender must be client or admin",
        });
    }

    const sql = `
        INSERT INTO inquiries 
        (client_name, client_email, sender, message, is_auto_acknowledgment)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [clientName, clientEmail, sender, message, isAutoAcknowledgment],
        (err, result) => {
            if (err) {
                console.error("Create inquiry error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to create inquiry",
                    error: err.message,
                });
            }

            res.status(201).json({
                success: true,
                id: result.insertId,
                client_name: clientName,
                client_email: clientEmail,
                sender,
                message,
                is_auto_acknowledgment: isAutoAcknowledgment,
            });
        }
    );
});

router.delete("/:email", (req, res) => {
    const email = String(req.params.email || "").trim().toLowerCase();

    db.query(
        "DELETE FROM inquiries WHERE LOWER(client_email) = ?",
        [email],
        (err) => {
            if (err) {
                console.error("Delete inquiry conversation error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to delete conversation",
                    error: err.message,
                });
            }

            res.json({
                success: true,
                message: "Conversation deleted",
            });
        }
    );
});

module.exports = router;