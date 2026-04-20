const db = require("../config/db");

function normalizeValue(value) {
    return String(value || "").trim().toLowerCase();
}

function isAdminUser(req) {
    return normalizeValue(req.user?.role) === "admin";
}

function getUserEmail(req) {
    return normalizeValue(req.user?.email);
}

exports.getBookings = (req, res) => {
    const admin = isAdminUser(req);
    const userEmail = getUserEmail(req);

    let query = `
        SELECT * FROM bookings
    `;
    let values = [];

    if (!admin) {
        if (!userEmail) {
            return res.status(401).json({
                message: "Unauthorized user",
            });
        }

        query += `
            WHERE LOWER(COALESCE(client_email, '')) = ?
        `;
        values.push(userEmail);
    }

    query += ` ORDER BY id DESC`;

    db.query(query, values, (err, results) => {
        if (err) {
            console.error("Get bookings error:", err);
            return res.status(500).json({
                message: "Failed to fetch bookings",
                error: err.message,
            });
        }

        return res.status(200).json(results || []);
    });
};

exports.getBookingById = (req, res) => {
    const { id } = req.params;
    const admin = isAdminUser(req);
    const userEmail = getUserEmail(req);

    let query = `
        SELECT * FROM bookings
        WHERE id = ?
    `;
    let values = [id];

    if (!admin) {
        query += `
            AND LOWER(COALESCE(client_email, '')) = ?
        `;
        values.push(userEmail);
    }

    query += ` LIMIT 1`;

    db.query(query, values, (err, results) => {
        if (err) {
            console.error("Get booking by id error:", err);
            return res.status(500).json({
                message: "Failed to fetch booking",
                error: err.message,
            });
        }

        if (!results || results.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        return res.status(200).json(results[0]);
    });
};

exports.createBooking = (req, res) => {
    const admin = isAdminUser(req);
    const userEmail = getUserEmail(req);

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
        payment_status,
        booking_status,
        notes,
    } = req.body;

    const normalizedClientEmail = normalizeValue(client_email || userEmail);

    if (!client_name || !normalizedClientEmail || !event_date || !venue) {
        return res.status(400).json({
            message: "client_name, client_email, event_date, and venue are required",
        });
    }

    if (!admin && normalizedClientEmail !== userEmail) {
        return res.status(403).json({
            message: "You can only create bookings for your own account",
        });
    }

    const query = `
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

    const values = [
        client_name,
        normalizedClientEmail,
        contact_number || null,
        event_type || null,
        package_name || null,
        event_date,
        event_time || null,
        venue,
        Number(guests || 0),
        Number(total_price || 0),
        payment_status || "pending",
        booking_status || "pending",
        notes || null,
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Create booking error:", err);
            return res.status(500).json({
                message: "Failed to create booking",
                error: err.message,
            });
        }

        return res.status(201).json({
            message: "Booking created successfully",
            id: result.insertId,
        });
    });
};

exports.updateBooking = (req, res) => {
    const { id } = req.params;
    const admin = isAdminUser(req);
    const userEmail = getUserEmail(req);

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
        payment_status,
        booking_status,
        notes,
    } = req.body;

    const normalizedClientEmail = normalizeValue(client_email || userEmail);

    if (!admin && normalizedClientEmail !== userEmail) {
        return res.status(403).json({
            message: "You can only update your own booking",
        });
    }

    let query = `
        UPDATE bookings
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
            payment_status = ?,
            booking_status = ?,
            notes = ?
        WHERE id = ?
    `;
    const values = [
        client_name,
        normalizedClientEmail,
        contact_number || null,
        event_type || null,
        package_name || null,
        event_date,
        event_time || null,
        venue,
        Number(guests || 0),
        Number(total_price || 0),
        payment_status || "pending",
        booking_status || "pending",
        notes || null,
        id,
    ];

    if (!admin) {
        query += ` AND LOWER(COALESCE(client_email, '')) = ?`;
        values.push(userEmail);
    }

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Update booking error:", err);
            return res.status(500).json({
                message: "Failed to update booking",
                error: err.message,
            });
        }

        if (!result || result.affectedRows === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        return res.status(200).json({ message: "Booking updated successfully" });
    });
};

exports.deleteBooking = (req, res) => {
    const { id } = req.params;
    const admin = isAdminUser(req);
    const userEmail = getUserEmail(req);

    let query = `DELETE FROM bookings WHERE id = ?`;
    const values = [id];

    if (!admin) {
        query += ` AND LOWER(COALESCE(client_email, '')) = ?`;
        values.push(userEmail);
    }

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Delete booking error:", err);
            return res.status(500).json({
                message: "Failed to delete booking",
                error: err.message,
            });
        }

        if (!result || result.affectedRows === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        return res.status(200).json({ message: "Booking deleted successfully" });
    });
};