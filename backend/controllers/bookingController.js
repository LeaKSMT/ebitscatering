const db = require("../config/db");

exports.getBookings = (req, res) => {
    const query = `
        SELECT * FROM bookings
        ORDER BY id DESC
    `;

    db.query(query, (err, results) => {
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

    db.query("SELECT * FROM bookings WHERE id = ? LIMIT 1", [id], (err, results) => {
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

    if (!client_name || !client_email || !event_date || !venue) {
        return res.status(400).json({
            message: "client_name, client_email, event_date, and venue are required",
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
        client_email,
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

    const query = `
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
        client_email,
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

    db.query("DELETE FROM bookings WHERE id = ?", [id], (err, result) => {
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