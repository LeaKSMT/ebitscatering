const db = require("../config/db");

function isAdmin(req) {
    const role = String(req.user?.role || "").trim().toLowerCase();
    return role === "admin";
}

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
        description: row.description || "",
        category: row.category,
        packageGroup: row.package_group,
        pax: row.pax,
        price: `₱${Number(row.price || 0).toLocaleString()}`,
        rawPrice: Number(row.price || 0),
        features,
        isActive: Boolean(row.is_active),
        showOnClient: Boolean(row.show_on_client),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function parsePrice(price) {
    return Number(String(price || "").replace(/[₱,\s]/g, ""));
}

function normalizeFeatures(features) {
    if (Array.isArray(features)) {
        return features
            .map((item) => String(item || "").trim())
            .filter(Boolean);
    }

    if (typeof features === "string") {
        return features
            .split(/\n|,/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

exports.getPackages = (req, res) => {
    const query = `
        SELECT *
        FROM packages
        ORDER BY 
            CASE 
                WHEN package_group = 'Wedding' THEN 1
                WHEN package_group = 'Debut' THEN 2
                WHEN package_group = 'Birthday' THEN 3
                WHEN package_group = 'Corporate' THEN 4
                WHEN package_group = 'Add-on' THEN 5
                ELSE 6
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

exports.getPublicPackages = (req, res) => {
    const query = `
        SELECT *
        FROM packages
        WHERE is_active = 1
          AND show_on_client = 1
        ORDER BY 
            CASE 
                WHEN package_group = 'Wedding' THEN 1
                WHEN package_group = 'Debut' THEN 2
                WHEN package_group = 'Birthday' THEN 3
                WHEN package_group = 'Corporate' THEN 4
                WHEN package_group = 'Add-on' THEN 5
                ELSE 6
            END,
            title ASC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Get public packages error:", err);
            return res.status(500).json({
                message: "Failed to fetch public packages",
                error: err.message,
            });
        }

        return res.status(200).json((results || []).map(normalizePackage));
    });
};

exports.createPackage = (req, res) => {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "Only admin can create packages",
        });
    }

    const {
        title,
        description,
        category,
        packageGroup,
        package_group,
        pax,
        price,
        features,
        isActive,
        is_active,
        showOnClient,
        show_on_client,
    } = req.body;

    const cleanTitle = String(title || "").trim();
    const cleanCategory = String(category || "").trim();
    const cleanPackageGroup = String(packageGroup || package_group || cleanCategory || "").trim();
    const cleanPax = String(pax || "").trim();
    const numericPrice = parsePrice(price);
    const cleanFeatures = normalizeFeatures(features);

    if (!cleanTitle) {
        return res.status(400).json({
            message: "Package title is required",
        });
    }

    if (!cleanCategory) {
        return res.status(400).json({
            message: "Package category is required",
        });
    }

    if (!numericPrice || numericPrice < 0) {
        return res.status(400).json({
            message: "Valid price is required",
        });
    }

    const activeValue =
        isActive === false || is_active === 0 || is_active === false ? 0 : 1;

    const showValue =
        showOnClient === false || show_on_client === 0 || show_on_client === false ? 0 : 1;

    const query = `
        INSERT INTO packages
            (title, description, category, package_group, pax, price, features, is_active, show_on_client)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        cleanTitle,
        description || null,
        cleanCategory,
        cleanPackageGroup,
        cleanPax || null,
        numericPrice,
        JSON.stringify(cleanFeatures),
        activeValue,
        showValue,
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Create package error:", err);
            return res.status(500).json({
                message: "Failed to create package",
                error: err.message,
            });
        }

        return res.status(201).json({
            message: "Package created successfully",
            id: result.insertId,
        });
    });
};

exports.updatePackage = (req, res) => {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "Only admin can update packages",
        });
    }

    const { id } = req.params;

    const {
        title,
        description,
        category,
        packageGroup,
        package_group,
        pax,
        price,
        features,
        isActive,
        is_active,
        showOnClient,
        show_on_client,
    } = req.body;

    const numericPrice = parsePrice(price);

    if (!numericPrice || numericPrice < 0) {
        return res.status(400).json({
            message: "Valid price is required",
        });
    }

    const cleanFeatures = normalizeFeatures(features);

    const activeValue =
        isActive === false || is_active === 0 || is_active === false ? 0 : 1;

    const showValue =
        showOnClient === false || show_on_client === 0 || show_on_client === false ? 0 : 1;

    const updateQuery = `
        UPDATE packages
        SET
            title = ?,
            description = ?,
            category = ?,
            package_group = ?,
            pax = ?,
            price = ?,
            features = ?,
            is_active = ?,
            show_on_client = ?
        WHERE id = ?
    `;

    const values = [
        String(title || "").trim(),
        description || null,
        String(category || "").trim(),
        String(packageGroup || package_group || category || "").trim(),
        String(pax || "").trim(),
        numericPrice,
        JSON.stringify(cleanFeatures),
        activeValue,
        showValue,
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

exports.updatePackageStatus = (req, res) => {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "Only admin can update package status",
        });
    }

    const { id } = req.params;
    const { isActive, is_active, showOnClient, show_on_client } = req.body;

    const activeValue =
        isActive === false || is_active === 0 || is_active === false ? 0 : 1;

    const showValue =
        showOnClient === false || show_on_client === 0 || show_on_client === false ? 0 : 1;

    const query = `
        UPDATE packages
        SET is_active = ?, show_on_client = ?
        WHERE id = ?
    `;

    db.query(query, [activeValue, showValue, id], (err, result) => {
        if (err) {
            console.error("Update package status error:", err);
            return res.status(500).json({
                message: "Failed to update package status",
                error: err.message,
            });
        }

        if (!result || result.affectedRows === 0) {
            return res.status(404).json({
                message: "Package not found",
            });
        }

        return res.status(200).json({
            message: "Package status updated successfully",
        });
    });
};

exports.archivePackage = (req, res) => {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "Only admin can archive packages",
        });
    }

    const { id } = req.params;

    const query = `
        UPDATE packages
        SET is_active = 0, show_on_client = 0
        WHERE id = ?
    `;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Archive package error:", err);
            return res.status(500).json({
                message: "Failed to archive package",
                error: err.message,
            });
        }

        if (!result || result.affectedRows === 0) {
            return res.status(404).json({
                message: "Package not found",
            });
        }

        return res.status(200).json({
            message: "Package archived successfully",
        });
    });
};