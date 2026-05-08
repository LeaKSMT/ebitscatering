const db = require("../config/db");

function canManagePackages(req) {
    const role = String(req.user?.role || "").trim().toLowerCase();
    return ["admin", "owner", "administrator"].includes(role);
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
    const cleaned = String(price ?? "").replace(/[₱,\s]/g, "");

    if (!cleaned) return NaN;

    return Number(cleaned);
}

function normalizeFeatures(features) {
    if (Array.isArray(features)) {
        return features
            .map((item) => String(item || "").trim())
            .filter(Boolean);
    }

    if (typeof features === "string") {
        const trimmed = features.trim();

        if (!trimmed) return [];

        try {
            const parsed = JSON.parse(trimmed);

            if (Array.isArray(parsed)) {
                return parsed
                    .map((item) => String(item || "").trim())
                    .filter(Boolean);
            }
        } catch {
            // fallback below
        }

        return trimmed
            .split(/\n|,/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

function parseBooleanValue(value, defaultValue = true) {
    if (value === undefined || value === null || value === "") {
        return defaultValue ? 1 : 0;
    }

    if (
        value === false ||
        value === 0 ||
        value === "0" ||
        String(value).toLowerCase() === "false" ||
        String(value).toLowerCase() === "no" ||
        String(value).toLowerCase() === "inactive"
    ) {
        return 0;
    }

    return 1;
}

function makeSlug(value) {
    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function createPackageId(packageGroup) {
    const groupSlug = makeSlug(packageGroup || "package");
    const random = Math.random().toString(36).slice(2, 7);

    return `${groupSlug}-${Date.now()}-${random}`;
}

function getOrderCaseSql() {
    return `
        CASE 
            WHEN package_group = 'Wedding' THEN 1
            WHEN package_group = 'Debut' THEN 2
            WHEN package_group = 'Birthday' THEN 3
            WHEN package_group = 'Corporate' THEN 4
            WHEN package_group = 'Anniversary' THEN 5
            WHEN package_group = 'Christening' THEN 6
            WHEN package_group = 'Add-on' THEN 7
            ELSE 8
        END,
        title ASC
    `;
}

exports.getPackages = (req, res) => {
    const query = `
        SELECT *
        FROM packages
        ORDER BY ${getOrderCaseSql()}
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
        ORDER BY ${getOrderCaseSql()}
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
    if (!canManagePackages(req)) {
        return res.status(403).json({
            message: "Only admin or owner can create packages",
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
    const cleanPackageGroup = String(
        packageGroup || package_group || cleanCategory || "Custom"
    ).trim();
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

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
            message: "Valid price is required",
        });
    }

    const activeValue = parseBooleanValue(
        isActive !== undefined ? isActive : is_active,
        true
    );

    const showValue = parseBooleanValue(
        showOnClient !== undefined ? showOnClient : show_on_client,
        true
    );

    const packageId = createPackageId(cleanPackageGroup);

    const query = `
        INSERT INTO packages
            (
                id,
                title,
                description,
                category,
                package_group,
                pax,
                price,
                features,
                is_active,
                show_on_client
            )
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        packageId,
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

    db.query(query, values, (err) => {
        if (err) {
            console.error("Create package error:", err);
            return res.status(500).json({
                message: "Failed to create package",
                error: err.message,
            });
        }

        return res.status(201).json({
            message: "Package created successfully",
            id: packageId,
        });
    });
};

exports.updatePackage = (req, res) => {
    if (!canManagePackages(req)) {
        return res.status(403).json({
            message: "Only admin or owner can update packages",
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

    const cleanTitle = String(title || "").trim();
    const cleanCategory = String(category || "").trim();
    const cleanPackageGroup = String(
        packageGroup || package_group || cleanCategory || "Custom"
    ).trim();
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

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
            message: "Valid price is required",
        });
    }

    const activeValue = parseBooleanValue(
        isActive !== undefined ? isActive : is_active,
        true
    );

    const showValue = parseBooleanValue(
        showOnClient !== undefined ? showOnClient : show_on_client,
        true
    );

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
        cleanTitle,
        description || null,
        cleanCategory,
        cleanPackageGroup,
        cleanPax || null,
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
    if (!canManagePackages(req)) {
        return res.status(403).json({
            message: "Only admin or owner can update package status",
        });
    }

    const { id } = req.params;
    const { isActive, is_active, showOnClient, show_on_client } = req.body;

    const activeValue = parseBooleanValue(
        isActive !== undefined ? isActive : is_active,
        true
    );

    const showValue = parseBooleanValue(
        showOnClient !== undefined ? showOnClient : show_on_client,
        true
    );

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
    if (!canManagePackages(req)) {
        return res.status(403).json({
            message: "Only admin or owner can archive packages",
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