const db = require("../config/db");
const { sendBookingApprovedEmail } = require("../utils/emailSender");

function normalizeValue(value) {
    return String(value || "").trim().toLowerCase();
}

function isAdminUser(req) {
    return normalizeValue(req.user?.role) === "admin";
}

function getUserEmail(req) {
    return normalizeValue(req.user?.email);
}

function createBookingApprovedNotification(booking) {
    return new Promise((resolve, reject) => {
        const message = `Your booking for ${booking.event_type || "your event"
            } on ${booking.event_date || "your selected date"
            } has been approved.`;

        const query = `
            INSERT INTO notifications
            (
                user_email,
                message,
                type,
                is_read,
                created_at
            )
            VALUES (?, ?, ?, FALSE, NOW())
        `;

        const values = [booking.client_email, message, "booking_approved"];

        db.query(query, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

exports.getBookings = (req, res) => {
    const admin = isAdminUser(req);
    const userEmail = getUserEmail(req);

    let query = `SELECT * FROM bookings`;
    const values = [];

    if (!admin) {
        if (!userEmail) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        query += ` WHERE LOWER(COALESCE(client_email, '')) = ?`;
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

    let query = `SELECT * FROM bookings WHERE id = ?`;
    const values = [id];

    if (!admin) {
        query += ` AND LOWER(COALESCE(client_email, '')) = ?`;
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

    let getQuery = `SELECT * FROM bookings WHERE id = ?`;
    const getValues = [id];

    if (!admin) {
        getQuery += ` AND LOWER(COALESCE(client_email, '')) = ?`;
        getValues.push(userEmail);
    }

    db.query(getQuery, getValues, (getErr, oldRows) => {
        if (getErr) {
            console.error("Get old booking error:", getErr);
            return res.status(500).json({
                message: "Failed to check booking",
                error: getErr.message,
            });
        }

        if (!oldRows || oldRows.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const oldBooking = oldRows[0];

        const nextClientName = client_name ?? oldBooking.client_name;
        const nextClientEmail = normalizeValue(
            client_email || oldBooking.client_email || userEmail
        );
        const nextContactNumber = contact_number ?? oldBooking.contact_number;
        const nextEventType = event_type ?? oldBooking.event_type;
        const nextPackageName = package_name ?? oldBooking.package_name;
        const nextEventDate = event_date ?? oldBooking.event_date;
        const nextEventTime = event_time ?? oldBooking.event_time;
        const nextVenue = venue ?? oldBooking.venue;
        const nextGuests = guests ?? oldBooking.guests;
        const nextTotalPrice = total_price ?? oldBooking.total_price;
        const nextPaymentStatus = payment_status ?? oldBooking.payment_status ?? "pending";
        const nextBookingStatus = booking_status ?? oldBooking.booking_status ?? "pending";
        const nextNotes = notes ?? oldBooking.notes;

        if (!admin && nextClientEmail !== userEmail) {
            return res.status(403).json({
                message: "You can only update your own booking",
            });
        }

        const oldStatus = normalizeValue(oldBooking.booking_status);
        const newStatus = normalizeValue(nextBookingStatus);

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
            nextClientName,
            nextClientEmail,
            nextContactNumber || null,
            nextEventType || null,
            nextPackageName || null,
            nextEventDate,
            nextEventTime || null,
            nextVenue,
            Number(nextGuests || 0),
            Number(nextTotalPrice || 0),
            nextPaymentStatus || "pending",
            nextBookingStatus || "pending",
            nextNotes || null,
            id,
        ];

        if (!admin) {
            query += ` AND LOWER(COALESCE(client_email, '')) = ?`;
            values.push(userEmail);
        }

        db.query(query, values, async (err, result) => {
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

            const shouldNotify =
                admin && oldStatus !== "approved" && newStatus === "approved";

            if (shouldNotify) {
                const approvedBooking = {
                    id,
                    client_name: nextClientName,
                    client_email: nextClientEmail,
                    contact_number: nextContactNumber,
                    event_type: nextEventType,
                    package_name: nextPackageName,
                    event_date: nextEventDate,
                    event_time: nextEventTime,
                    venue: nextVenue,
                    guests: nextGuests,
                    total_price: nextTotalPrice,
                };

                try {
                    await createBookingApprovedNotification(approvedBooking);
                } catch (notifErr) {
                    console.error("Booking approved notification error:", notifErr);
                }

                try {
                    await sendBookingApprovedEmail(approvedBooking);
                } catch (emailErr) {
                    console.error("Booking approved email error:", emailErr);
                }
            }

            return res.status(200).json({
                message: shouldNotify
                    ? "Booking updated successfully, notification created, and approval email sent"
                    : "Booking updated successfully",
            });
        });
    });
};

exports.deleteBooking = (req, res) => {
    const { id } = req.params;
    const admin = isAdminUser(req);
    const userEmail = getUserEmail(req);

    if (!id) {
        return res.status(400).json({
            message: "Booking ID is required",
        });
    }

    let checkQuery = `
        SELECT * FROM bookings
        WHERE id = ?
    `;

    const checkValues = [id];

    if (!admin) {
        if (!userEmail) {
            return res.status(401).json({
                message: "Unauthorized user",
            });
        }

        checkQuery += `
            AND LOWER(COALESCE(client_email, '')) = ?
        `;
        checkValues.push(userEmail);
    }

    db.query(checkQuery, checkValues, (checkErr, rows) => {
        if (checkErr) {
            console.error("Check booking before delete error:", checkErr);
            return res.status(500).json({
                message: "Failed to check booking",
                error: checkErr.message,
            });
        }

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                message: "Booking not found or you are not allowed to delete it",
            });
        }

        let deleteQuery = `
            DELETE FROM bookings
            WHERE id = ?
        `;

        const deleteValues = [id];

        if (!admin) {
            deleteQuery += `
                AND LOWER(COALESCE(client_email, '')) = ?
            `;
            deleteValues.push(userEmail);
        }

        db.query(deleteQuery, deleteValues, (deleteErr, result) => {
            if (deleteErr) {
                console.error("Delete booking error:", deleteErr);
                return res.status(500).json({
                    message: "Failed to delete booking",
                    error: deleteErr.message,
                });
            }

            if (!result || result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Booking not found",
                });
            }

            return res.status(200).json({
                message: "Booking deleted successfully",
                deletedId: Number(id),
            });
        });
    });
};