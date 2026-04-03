const db = require("../config/db");

exports.getPayments = (req, res) => {
    db.query("SELECT * FROM payments ORDER BY created_at DESC, id DESC", (err, results) => {
        if (err) {
            console.error("Get payments error:", err);
            return res.status(500).json({ message: "Failed to fetch payments" });
        }

        return res.status(200).json(results);
    });
};

exports.getPaymentById = (req, res) => {
    const { id } = req.params;

    db.query("SELECT * FROM payments WHERE id = ? LIMIT 1", [id], (err, results) => {
        if (err) {
            console.error("Get payment by id error:", err);
            return res.status(500).json({ message: "Failed to fetch payment" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Payment not found" });
        }

        return res.status(200).json(results[0]);
    });
};

exports.createPayment = (req, res) => {
    const {
        booking_id,
        client_name,
        client_email,
        amount,
        payment_method,
        payment_status,
        reference_number,
        notes,
    } = req.body;

    if (!client_name || !client_email || !amount) {
        return res.status(400).json({
            message: "client_name, client_email, and amount are required",
        });
    }

    const query = `
        INSERT INTO payments
        (
            booking_id,
            client_name,
            client_email,
            amount,
            payment_method,
            payment_status,
            reference_number,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        booking_id || null,
        client_name,
        client_email,
        amount,
        payment_method || null,
        payment_status || "pending",
        reference_number || null,
        notes || null,
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Create payment error:", err);
            return res.status(500).json({ message: "Failed to create payment" });
        }

        return res.status(201).json({
            message: "Payment created successfully",
            id: result.insertId,
        });
    });
};

exports.updatePayment = (req, res) => {
    const { id } = req.params;
    const {
        booking_id,
        client_name,
        client_email,
        amount,
        payment_method,
        payment_status,
        reference_number,
        notes,
    } = req.body;

    const query = `
        UPDATE payments
        SET
            booking_id = ?,
            client_name = ?,
            client_email = ?,
            amount = ?,
            payment_method = ?,
            payment_status = ?,
            reference_number = ?,
            notes = ?
        WHERE id = ?
    `;

    const values = [
        booking_id || null,
        client_name,
        client_email,
        amount,
        payment_method || null,
        payment_status || "pending",
        reference_number || null,
        notes || null,
        id,
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Update payment error:", err);
            return res.status(500).json({ message: "Failed to update payment" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Payment not found" });
        }

        return res.status(200).json({ message: "Payment updated successfully" });
    });
};

exports.deletePayment = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM payments WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error("Delete payment error:", err);
            return res.status(500).json({ message: "Failed to delete payment" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Payment not found" });
        }

        return res.status(200).json({ message: "Payment deleted successfully" });
    });
};