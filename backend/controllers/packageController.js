const db = require("../config/db");

function normalizePackage(row) {
    let features = [];

    try {
        features = JSON.parse(row.features || "[]");
    } catch {
        features = [];
    }

    return {
        id: row.id,
        title: row.title,
        category: row.category,
        packageGroup: row.package_group,
        pax: row.pax,
        price: `₱${Number(row.price || 0).toLocaleString()}`,
        rawPrice: Number(row.price || 0),
        features,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

exports.getPackages = (req, res) => {
    const query = `
        SELECT *
        FROM packages
        WHERE is_active = 1
        ORDER BY 
            CASE 
                WHEN package_group = 'Wedding' THEN 1
                WHEN package_group = 'Debut' THEN 2
                WHEN package_group = 'Add-on' THEN 3
                ELSE 4
            END,
            title ASC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Get packages error:", err);
            return res.status(500).json({
                message: "Failed to fetch packages",
                error: err.message,
            });
        }

        return res.status(200).json((results || []).map(normalizePackage));
    });
};

exports.updatePackage = (req, res) => {
    const role = String(req.user?.role || "").trim().toLowerCase();

    if (role !== "admin") {
        return res.status(403).json({
            message: "Only admin can update packages",
        });
    }

    const { id } = req.params;
    const { price, title, pax, features } = req.body;

    const numericPrice = Number(String(price || "").replace(/[₱,\s]/g, ""));

    if (!numericPrice || numericPrice < 0) {
        return res.status(400).json({
            message: "Valid price is required",
        });
    }

    const updateQuery = `
        UPDATE packages
        SET
            title = COALESCE(?, title),
            pax = COALESCE(?, pax),
            price = ?,
            features = COALESCE(?, features)
        WHERE id = ?
    `;

    const values = [
        title || null,
        pax || null,
        numericPrice,
        Array.isArray(features) ? JSON.stringify(features) : null,
        id,
    ];

    db.query(updateQuery, values, (err, result) => {
        if (err) {
            console.error("Update package error:", err);
            return res.status(500).json({
                message: "Failed to update package",
                error: err.message,
            });
        }

        if (!result || result.affectedRows === 0) {
            return res.status(404).json({
                message: "Package not found",
            });
        }

        return res.status(200).json({
            message: "Package updated successfully",
        });
    });
};