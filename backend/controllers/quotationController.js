const db = require("../config/db");

function normalizeStatus(status) {
    return String(status || "").trim().toLowerCase();
}

function shouldCreateBooking(status) {
    const normalized = normalizeStatus(status);
    return (
        normalized === "approved" ||
        normalized === "confirmed" ||
        normalized === "paid" ||
        normalized === "upcoming" ||
        normalized === "ongoing"
    );
}

exports.getQuotations = (req, res) => {
    const query = `
        SELECT *
        FROM quotations
        ORDER BY id DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Get quotations error:", err);
            return res.status(500).json({
                message: "Failed to fetch quotations",
                error: err.message,
            });
        }

        return res.status(200).json(results || []);
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
                return res.status(500).json({
                    message: "Failed to fetch quotation",
                    error: err.message,
                });
            }

            if (!results || results.length === 0) {
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

    db.query(
        "SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM quotations",
        (idErr, idResults) => {
            if (idErr) {
                console.error("Get next quotation id error:", idErr);
                return res.status(500).json({
                    message: "Failed to create quotation",
                    error: idErr.message,
                });
            }

            const nextId = idResults?.[0]?.nextId || 1;

            const query = `
                INSERT INTO quotations (
                    id,
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
                    created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                nextId,
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
                new Date(),
            ];

            db.query(query, values, (err, result) => {
                if (err) {
                    console.error("Create quotation error:", err);
                    return res.status(500).json({
                        message: "Failed to create quotation",
                        error: err.message,
                    });
                }

                return res.status(201).json({
                    message: "Quotation created successfully",
                    id: nextId,
                    insertId: result?.insertId || nextId,
                });
            });
        }
    );
};

exports.updateQuotationStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: "status is required" });
    }

    db.query(
        "SELECT * FROM quotations WHERE id = ? LIMIT 1",
        [id],
        (fetchErr, quotationResults) => {
            if (fetchErr) {
                console.error("Fetch quotation before status update error:", fetchErr);
                return res.status(500).json({
                    message: "Failed to update quotation status",
                    error: fetchErr.message,
                });
            }

            if (!quotationResults || quotationResults.length === 0) {
                return res.status(404).json({ message: "Quotation not found" });
            }

            const quotation = quotationResults[0];

            db.query(
                `
                    UPDATE quotations
                    SET status = ?
                    WHERE id = ?
                `,
                [status, id],
                (updateErr, updateResult) => {
                    if (updateErr) {
                        console.error("Update quotation status error:", updateErr);
                        return res.status(500).json({
                            message: "Failed to update quotation status",
                            error: updateErr.message,
                        });
                    }

                    if (!updateResult || updateResult.affectedRows === 0) {
                        return res.status(404).json({ message: "Quotation not found" });
                    }

                    if (!shouldCreateBooking(status)) {
                        return res.status(200).json({
                            message: "Quotation status updated successfully",
                        });
                    }

                    const bookingLookupQuery = `
                        SELECT id
                        FROM bookings
                        WHERE client_email = ?
                          AND event_date = ?
                          AND venue = ?
                          AND package_name = ?
                          AND event_type = ?
                        LIMIT 1
                    `;

                    const bookingLookupValues = [
                        quotation.email || quotation.owner_email || "",
                        quotation.preferred_date,
                        quotation.venue || "",
                        quotation.package_type || "",
                        quotation.event_type || "",
                    ];

                    db.query(
                        bookingLookupQuery,
                        bookingLookupValues,
                        (bookingCheckErr, bookingResults) => {
                            if (bookingCheckErr) {
                                console.error(
                                    "Check existing booking error:",
                                    bookingCheckErr
                                );
                                return res.status(500).json({
                                    message:
                                        "Quotation status updated but failed to sync booking",
                                    error: bookingCheckErr.message,
                                });
                            }

                            if (bookingResults && bookingResults.length > 0) {
                                return res.status(200).json({
                                    message: "Quotation status updated successfully",
                                    bookingSynced: true,
                                    bookingCreated: false,
                                });
                            }

                            const notesParts = [];

                            if (quotation.classic_menu) {
                                notesParts.push(`Classic Menu: ${quotation.classic_menu}`);
                            }

                            try {
                                const parsedAddOns = JSON.parse(quotation.add_ons || "[]");
                                if (Array.isArray(parsedAddOns) && parsedAddOns.length > 0) {
                                    notesParts.push(`Add-ons: ${parsedAddOns.join(", ")}`);
                                }
                            } catch {
                                if (quotation.add_ons) {
                                    notesParts.push(`Add-ons: ${quotation.add_ons}`);
                                }
                            }

                            if (quotation.theme_preference) {
                                notesParts.push(
                                    `Theme Preference: ${quotation.theme_preference}`
                                );
                            }

                            if (quotation.special_requests) {
                                notesParts.push(
                                    `Special Requests: ${quotation.special_requests}`
                                );
                            }

                            if (quotation.quotation_id) {
                                notesParts.push(`Quotation ID: ${quotation.quotation_id}`);
                            }

                            const bookingInsertQuery = `
                                INSERT INTO bookings
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
                                    payment_status,
                                    booking_status,
                                    notes
                                )
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `;

                            const bookingInsertValues = [
                                quotation.full_name || quotation.owner_name || "Client",
                                quotation.email || quotation.owner_email || null,
                                quotation.contact_number || null,
                                quotation.event_type || null,
                                quotation.package_type || null,
                                quotation.preferred_date,
                                quotation.event_time || null,
                                quotation.venue,
                                Number(quotation.guests || 0),
                                Number(quotation.estimated_total || 0),
                                normalizeStatus(status) === "paid" ? "paid" : "pending",
                                status,
                                notesParts.join(" | ") || null,
                            ];

                            db.query(
                                bookingInsertQuery,
                                bookingInsertValues,
                                (bookingInsertErr) => {
                                    if (bookingInsertErr) {
                                        console.error(
                                            "Create booking from quotation error:",
                                            bookingInsertErr
                                        );
                                        return res.status(500).json({
                                            message:
                                                "Quotation status updated but failed to create booking",
                                            error: bookingInsertErr.message,
                                        });
                                    }

                                    return res.status(200).json({
                                        message: "Quotation status updated successfully",
                                        bookingSynced: true,
                                        bookingCreated: true,
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

exports.deleteQuotation = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM quotations WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error("Delete quotation error:", err);
            return res.status(500).json({
                message: "Failed to delete quotation",
                error: err.message,
            });
        }

        if (!result || result.affectedRows === 0) {
            return res.status(404).json({ message: "Quotation not found" });
        }

        return res.status(200).json({ message: "Quotation deleted successfully" });
    });
};