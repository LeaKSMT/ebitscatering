const db = require("../config/db");

function normalizeValue(value) {
    return String(value || "").trim().toLowerCase();
}

exports.getNotifications = (req, res) => {
    const userEmail = normalizeValue(req.user?.email);

    if (!userEmail) {
        return res.status(401).json({ message: "Unauthorized user" });
    }

    const query = `
        SELECT *
        FROM notifications
        WHERE LOWER(COALESCE(user_email, '')) = ?
        ORDER BY created_at DESC
    `;

    db.query(query, [userEmail], (err, results) => {
        if (err) {
            console.error("Get notifications error:", err);
            return res.status(500).json({
                message: "Failed to fetch notifications",
                error: err.message,
            });
        }

        return res.status(200).json(results || []);
    });
};

exports.markNotificationAsRead = (req, res) => {
    const { id } = req.params;
    const userEmail = normalizeValue(req.user?.email);

    if (!userEmail) {
        return res.status(401).json({ message: "Unauthorized user" });
    }

    const query = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = ?
        AND LOWER(COALESCE(user_email, '')) = ?
    `;

    db.query(query, [id, userEmail], (err, result) => {
        if (err) {
            console.error("Mark notification as read error:", err);
            return res.status(500).json({
                message: "Failed to update notification",
                error: err.message,
            });
        }

        if (!result || result.affectedRows === 0) {
            return res.status(404).json({ message: "Notification not found" });
        }

        return res.status(200).json({ message: "Notification marked as read" });
    });
};

exports.markAllNotificationsAsRead = (req, res) => {
    const userEmail = normalizeValue(req.user?.email);

    if (!userEmail) {
        return res.status(401).json({ message: "Unauthorized user" });
    }

    const query = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE LOWER(COALESCE(user_email, '')) = ?
    `;

    db.query(query, [userEmail], (err) => {
        if (err) {
            console.error("Mark all notifications as read error:", err);
            return res.status(500).json({
                message: "Failed to update notifications",
                error: err.message,
            });
        }

        return res.status(200).json({ message: "All notifications marked as read" });
    });
};