const db = require("../config/db");

exports.getQuotations = (req, res) => {
    db.query("SELECT * FROM quotations ORDER BY created_at DESC, id DESC", (err, results) => {
        if (err) {
            console.error("Get quotations error:", err);
            return res.status(500).json({ message: "Failed to fetch quotations" });
        }

        return res.status(200).json(results);
    });
};

exports.getQuotationById = (req, res) => {
    const { id } = req.params;

    db.query("SELECT * FROM quotations WHERE id = ? LIMIT 1", [id], (err, results) => {
        if (err) {
            console.error("Get quotation by id error:", err);
            return res.status(500).json({ message: "Failed to fetch quotation" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Quotation not found" });
        }

        return res.status(200).json(results[0]);
    });
};

exports.createQuotation = (req, res) => {
    const {
        client_name,
        client_email,
        contact_number,
        event_type,
        package_name,
        event_date,
        event_time,
        venue,
        guests,
        total_price,
        quotation_status,
        notes,
    } = req.body;

    if (!client_name || !client_email || !event_date || !venue) {
        return res.status(400).json({
            message: "client_name, client_email, event_date, and venue are required",
        });
    }

    const query = `
        INSERT INTO quotations
        (
            client_name,
            client_email,
            contact_number,
            event_type,
            package_name,
            event_date,
            event_time,
            venue,
            guests,
            total_price,
            quotation_status,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        client_name,
        client_email,
        contact_number || null,
        event_type || null,
        package_name || null,
        event_date,
        event_time || null,
        venue,
        guests || 0,
        total_price || 0,
        quotation_status || "pending",
        notes || null,
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Create quotation error:", err);
            return res.status(500).json({ message: "Failed to create quotation" });
        }

        return res.status(201).json({
            message: "Quotation created successfully",
            id: result.insertId,
        });
    });
};

exports.updateQuotation = (req, res) => {
    const { id } = req.params;
    const {
        client_name,
        client_email,
        contact_number,
        event_type,
        package_name,
        event_date,
        event_time,
        venue,
        guests,
        total_price,
        quotation_status,
        notes,
    } = req.body;

    const query = `
        UPDATE quotations
        SET
            client_name = ?,
            client_email = ?,
            contact_number = ?,
            event_type = ?,
            package_name = ?,
            event_date = ?,
            event_time = ?,
            venue = ?,
            guests = ?,
            total_price = ?,
            quotation_status = ?,
            notes = ?
        WHERE id = ?
    `;

    const values = [
        client_name,
        client_email,
        contact_number || null,
        event_type || null,
        package_name || null,
        event_date,
        event_time || null,
        venue,
        guests || 0,
        total_price || 0,
        quotation_status || "pending",
        notes || null,
        id,
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Update quotation error:", err);
            return res.status(500).json({ message: "Failed to update quotation" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Quotation not found" });
        }

        return res.status(200).json({ message: "Quotation updated successfully" });
    });
};

exports.deleteQuotation = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM quotations WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error("Delete quotation error:", err);
            return res.status(500).json({ message: "Failed to delete quotation" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Quotation not found" });
        }

        return res.status(200).json({ message: "Quotation deleted successfully" });
    });
};