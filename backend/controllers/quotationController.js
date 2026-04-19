const db = require("../config/db");

exports.getQuotations = (req, res) => {
    const query = `
        SELECT *
        FROM quotations
        ORDER BY created_at DESC, id DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Get quotations error:", err);
            return res.status(500).json({ message: "Failed to fetch quotations" });
        }

        return res.status(200).json(results);
    });
};

exports.getQuotationById = (req, res) => {
    const { id } = req.params;

    db.query(
        "SELECT * FROM quotations WHERE id = ? LIMIT 1",
        [id],
        (err, results) => {
            if (err) {
                console.error("Get quotation by id error:", err);
                return res.status(500).json({ message: "Failed to fetch quotation" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "Quotation not found" });
            }

            return res.status(200).json(results[0]);
        }
    );
};

exports.createQuotation = (req, res) => {
    const {
        quotation_id,
        owner_email,
        owner_name,
        full_name,
        email,
        contact_number,
        event_type,
        preferred_date,
        event_time,
        venue,
        guests,
        package_type,
        classic_menu,
        add_ons,
        theme_preference,
        special_requests,
        package_price,
        add_ons_total,
        estimated_total,
        included_pax,
        pricing_type,
        rate_per_pax,
        excess_guests,
        excess_cost,
        package_inclusions,
        status,
    } = req.body;

    if (!full_name || !email || !event_type || !preferred_date || !venue) {
        return res.status(400).json({
            message:
                "full_name, email, event_type, preferred_date, and venue are required",
        });
    }

    const query = `
        INSERT INTO quotations (
            quotation_id,
            owner_email,
            owner_name,
            full_name,
            email,
            contact_number,
            event_type,
            preferred_date,
            event_time,
            venue,
            guests,
            package_type,
            classic_menu,
            add_ons,
            theme_preference,
            special_requests,
            package_price,
            add_ons_total,
            estimated_total,
            included_pax,
            pricing_type,
            rate_per_pax,
            excess_guests,
            excess_cost,
            package_inclusions,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        quotation_id || null,
        owner_email || null,
        owner_name || null,
        full_name,
        email,
        contact_number || null,
        event_type,
        preferred_date,
        event_time || null,
        venue,
        Number(guests || 0),
        package_type || null,
        classic_menu || null,
        JSON.stringify(Array.isArray(add_ons) ? add_ons : []),
        theme_preference || null,
        special_requests || null,
        Number(package_price || 0),
        Number(add_ons_total || 0),
        Number(estimated_total || 0),
        included_pax != null ? Number(included_pax) : null,
        pricing_type || "fixed",
        rate_per_pax != null ? Number(rate_per_pax) : null,
        Number(excess_guests || 0),
        Number(excess_cost || 0),
        JSON.stringify(Array.isArray(package_inclusions) ? package_inclusions : []),
        status || "Pending",
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

exports.updateQuotationStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: "status is required" });
    }

    const query = `
        UPDATE quotations
        SET status = ?
        WHERE id = ?
    `;

    db.query(query, [status, id], (err, result) => {
        if (err) {
            console.error("Update quotation status error:", err);
            return res.status(500).json({ message: "Failed to update quotation status" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Quotation not found" });
        }

        return res.status(200).json({
            message: "Quotation status updated successfully",
        });
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