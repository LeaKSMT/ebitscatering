const pool = require("../config/db");

const getStockStatus = (availableQuantity, reorderLevel = 0) => {
    const available = Number(availableQuantity || 0);
    const reorder = Number(reorderLevel || 0);

    if (available <= 0) return "Out of Stock";
    if (reorder > 0 && available <= reorder) return "Low Stock";
    return "In Stock";
};

const toNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const normalizeItem = (row) => ({
    id: row.id,
    itemName: row.itemName,
    item_name: row.item_name,
    category: row.category,
    unit: row.unit,

    quantity: row.quantity,
    totalQuantity: row.totalQuantity,
    availableQuantity: row.availableQuantity,
    damagedQuantity: row.damagedQuantity,
    missingQuantity: row.missingQuantity,

    reorderLevel: row.reorderLevel,
    status: row.status,
    conditionStatus: row.conditionStatus,
    replacementCost: row.replacementCost,
    remarks: row.remarks,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
});

exports.getInventoryItems = async (req, res) => {
    try {
        const [rows] = await pool.promise().query(`
            SELECT
                id,
                item_name AS itemName,
                item_name,
                category,
                unit,
                total_quantity AS quantity,
                total_quantity AS totalQuantity,
                available_quantity AS availableQuantity,
                damaged_quantity AS damagedQuantity,
                missing_quantity AS missingQuantity,
                reorder_level AS reorderLevel,
                stock_status AS status,
                condition_status AS conditionStatus,
                replacement_cost AS replacementCost,
                remarks,
                created_at AS createdAt,
                updated_at AS updatedAt
            FROM inventory_items
            WHERE archived_at IS NULL
            ORDER BY id DESC
        `);

        res.status(200).json({
            success: true,
            data: rows.map(normalizeItem),
        });
    } catch (error) {
        console.error("GET /inventory error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch inventory items",
        });
    }
};

exports.createInventoryItem = async (req, res) => {
    const connection = await pool.promise().getConnection();

    try {
        const itemName = req.body.itemName || req.body.item_name;
        const category = req.body.category;
        const unit = req.body.unit || "pcs";

        const totalQuantity = toNumber(
            req.body.totalQuantity ?? req.body.quantity,
            0
        );

        const availableQuantity = toNumber(
            req.body.availableQuantity ?? totalQuantity,
            totalQuantity
        );

        const reorderLevel = toNumber(req.body.reorderLevel, 0);
        const replacementCost = toNumber(req.body.replacementCost, 0);
        const conditionStatus = req.body.conditionStatus || "Good";
        const remarks = req.body.remarks || null;

        if (!itemName || !category) {
            return res.status(400).json({
                success: false,
                message: "Item name and category are required",
            });
        }

        if (totalQuantity < 0 || availableQuantity < 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity cannot be negative",
            });
        }

        await connection.beginTransaction();

        const stockStatus = getStockStatus(availableQuantity, reorderLevel);

        const [result] = await connection.query(
            `
            INSERT INTO inventory_items (
                item_name,
                category,
                unit,
                total_quantity,
                available_quantity,
                reorder_level,
                stock_status,
                condition_status,
                replacement_cost,
                remarks
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                itemName,
                category,
                unit,
                totalQuantity,
                availableQuantity,
                reorderLevel,
                stockStatus,
                conditionStatus,
                replacementCost,
                remarks,
            ]
        );

        await connection.query(
            `
            INSERT INTO inventory_logs (
                item_id,
                movement_type,
                quantity,
                before_available,
                after_available,
                remarks
            )
            VALUES (?, 'created', ?, 0, ?, ?)
            `,
            [result.insertId, totalQuantity, availableQuantity, "Inventory item created"]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Inventory item created successfully",
            itemId: result.insertId,
        });
    } catch (error) {
        await connection.rollback();
        console.error("POST /inventory error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create inventory item",
        });
    } finally {
        connection.release();
    }
};

exports.updateInventoryItem = async (req, res) => {
    const connection = await pool.promise().getConnection();

    try {
        const { id } = req.params;

        const [existingRows] = await connection.query(
            `
            SELECT *
            FROM inventory_items
            WHERE id = ? AND archived_at IS NULL
            `,
            [id]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Inventory item not found",
            });
        }

        const existing = existingRows[0];

        const itemName = req.body.itemName || req.body.item_name || existing.item_name;
        const category = req.body.category || existing.category;
        const unit = req.body.unit || existing.unit;

        const totalQuantity = toNumber(
            req.body.totalQuantity ?? req.body.quantity ?? existing.total_quantity,
            existing.total_quantity
        );

        const availableQuantity = toNumber(
            req.body.availableQuantity ?? existing.available_quantity,
            existing.available_quantity
        );

        const damagedQuantity = toNumber(
            req.body.damagedQuantity ?? existing.damaged_quantity,
            existing.damaged_quantity
        );

        const missingQuantity = toNumber(
            req.body.missingQuantity ?? existing.missing_quantity,
            existing.missing_quantity
        );

        const reorderLevel = toNumber(
            req.body.reorderLevel ?? existing.reorder_level,
            existing.reorder_level
        );

        const replacementCost = toNumber(
            req.body.replacementCost ?? existing.replacement_cost,
            existing.replacement_cost
        );

        const conditionStatus =
            req.body.conditionStatus || existing.condition_status || "Good";

        const remarks =
            req.body.remarks !== undefined ? req.body.remarks : existing.remarks;

        if (totalQuantity < 0 || availableQuantity < 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity cannot be negative",
            });
        }

        await connection.beginTransaction();

        const beforeAvailable = existing.available_quantity;
        const stockStatus = getStockStatus(availableQuantity, reorderLevel);

        await connection.query(
            `
            UPDATE inventory_items
            SET
                item_name = ?,
                category = ?,
                unit = ?,
                total_quantity = ?,
                available_quantity = ?,
                damaged_quantity = ?,
                missing_quantity = ?,
                reorder_level = ?,
                stock_status = ?,
                condition_status = ?,
                replacement_cost = ?,
                remarks = ?
            WHERE id = ?
            `,
            [
                itemName,
                category,
                unit,
                totalQuantity,
                availableQuantity,
                damagedQuantity,
                missingQuantity,
                reorderLevel,
                stockStatus,
                conditionStatus,
                replacementCost,
                remarks,
                id,
            ]
        );

        await connection.query(
            `
            INSERT INTO inventory_logs (
                item_id,
                movement_type,
                quantity,
                before_available,
                after_available,
                remarks
            )
            VALUES (?, 'updated', ?, ?, ?, ?)
            `,
            [
                id,
                Math.abs(availableQuantity - beforeAvailable),
                beforeAvailable,
                availableQuantity,
                "Inventory item updated",
            ]
        );

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Inventory item updated successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("PUT /inventory/:id error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update inventory item",
        });
    } finally {
        connection.release();
    }
};

exports.archiveInventoryItem = async (req, res) => {
    const connection = await pool.promise().getConnection();

    try {
        const { id } = req.params;

        await connection.beginTransaction();

        const [existingRows] = await connection.query(
            `
            SELECT *
            FROM inventory_items
            WHERE id = ? AND archived_at IS NULL
            `,
            [id]
        );

        if (existingRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Inventory item not found",
            });
        }

        await connection.query(
            `
            UPDATE inventory_items
            SET archived_at = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
            [id]
        );

        await connection.query(
            `
            INSERT INTO inventory_logs (
                item_id,
                movement_type,
                quantity,
                before_available,
                after_available,
                remarks
            )
            VALUES (?, 'archived', 0, ?, ?, ?)
            `,
            [
                id,
                existingRows[0].available_quantity,
                existingRows[0].available_quantity,
                "Inventory item archived",
            ]
        );

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Inventory item archived successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("DELETE /inventory/:id error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to archive inventory item",
        });
    } finally {
        connection.release();
    }
};

exports.releaseItemToBooking = async (req, res) => {
    const connection = await pool.promise().getConnection();

    try {
        const bookingId = toNumber(req.body.booking_id || req.body.bookingId);
        const itemId = toNumber(req.body.item_id || req.body.itemId);
        const quantityReleased = toNumber(
            req.body.quantity_released || req.body.quantityReleased
        );
        const remarks = req.body.remarks || null;

        if (!bookingId || !itemId || quantityReleased <= 0) {
            return res.status(400).json({
                success: false,
                message: "Booking ID, item ID, and quantity released are required",
            });
        }

        await connection.beginTransaction();

        const [itemRows] = await connection.query(
            `
            SELECT *
            FROM inventory_items
            WHERE id = ? AND archived_at IS NULL
            FOR UPDATE
            `,
            [itemId]
        );

        if (itemRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Inventory item not found",
            });
        }

        const item = itemRows[0];

        if (item.available_quantity < quantityReleased) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Not enough available stock. Available: ${item.available_quantity}`,
            });
        }

        const beforeAvailable = item.available_quantity;
        const afterAvailable = beforeAvailable - quantityReleased;
        const stockStatus = getStockStatus(afterAvailable, item.reorder_level);

        await connection.query(
            `
            UPDATE inventory_items
            SET available_quantity = ?, stock_status = ?
            WHERE id = ?
            `,
            [afterAvailable, stockStatus, itemId]
        );

        await connection.query(
            `
            INSERT INTO booking_inventory_items (
                booking_id,
                item_id,
                quantity_released,
                status,
                remarks
            )
            VALUES (?, ?, ?, 'Released', ?)
            ON DUPLICATE KEY UPDATE
                quantity_released = quantity_released + VALUES(quantity_released),
                status = 'Released',
                remarks = VALUES(remarks),
                updated_at = CURRENT_TIMESTAMP
            `,
            [bookingId, itemId, quantityReleased, remarks]
        );

        await connection.query(
            `
            INSERT INTO inventory_logs (
                item_id,
                booking_id,
                movement_type,
                quantity,
                before_available,
                after_available,
                remarks
            )
            VALUES (?, ?, 'released', ?, ?, ?, ?)
            `,
            [
                itemId,
                bookingId,
                quantityReleased,
                beforeAvailable,
                afterAvailable,
                remarks || "Item released to booking/event",
            ]
        );

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Item released to booking successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("POST /inventory/release error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to release item to booking",
        });
    } finally {
        connection.release();
    }
};

exports.savePostEventCheck = async (req, res) => {
    const connection = await pool.promise().getConnection();

    try {
        const bookingId = toNumber(req.body.booking_id || req.body.bookingId);
        const itemId = toNumber(req.body.item_id || req.body.itemId);

        const returnedGood = toNumber(req.body.returned_good || req.body.returnedGood);
        const damaged = toNumber(req.body.damaged);
        const missing = toNumber(req.body.missing);
        const remarks = req.body.remarks || null;

        if (!bookingId || !itemId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID and item ID are required",
            });
        }

        if (returnedGood < 0 || damaged < 0 || missing < 0) {
            return res.status(400).json({
                success: false,
                message: "Returned, damaged, and missing quantities cannot be negative",
            });
        }

        await connection.beginTransaction();

        const [releaseRows] = await connection.query(
            `
            SELECT *
            FROM booking_inventory_items
            WHERE booking_id = ? AND item_id = ?
            FOR UPDATE
            `,
            [bookingId, itemId]
        );

        if (releaseRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "No released item record found for this booking",
            });
        }

        const release = releaseRows[0];
        const totalChecked = returnedGood + damaged + missing;

        if (totalChecked > release.quantity_released) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Checked quantity cannot exceed released quantity (${release.quantity_released})`,
            });
        }

        const [itemRows] = await connection.query(
            `
            SELECT *
            FROM inventory_items
            WHERE id = ? AND archived_at IS NULL
            FOR UPDATE
            `,
            [itemId]
        );

        if (itemRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Inventory item not found",
            });
        }

        const item = itemRows[0];

        const deltaReturnedGood = returnedGood - release.returned_good;
        const deltaDamaged = damaged - release.damaged;
        const deltaMissing = missing - release.missing;

        const beforeAvailable = item.available_quantity;
        const afterAvailable = beforeAvailable + deltaReturnedGood;

        if (afterAvailable < 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "Available quantity cannot become negative",
            });
        }

        const afterDamaged = item.damaged_quantity + deltaDamaged;
        const afterMissing = item.missing_quantity + deltaMissing;

        if (afterDamaged < 0 || afterMissing < 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "Damaged or missing quantity cannot become negative",
            });
        }

        const stockStatus = getStockStatus(afterAvailable, item.reorder_level);
        const conditionStatus = afterDamaged > 0 ? "Needs Repair" : item.condition_status;

        await connection.query(
            `
            UPDATE inventory_items
            SET
                available_quantity = ?,
                damaged_quantity = ?,
                missing_quantity = ?,
                stock_status = ?,
                condition_status = ?
            WHERE id = ?
            `,
            [
                afterAvailable,
                afterDamaged,
                afterMissing,
                stockStatus,
                conditionStatus,
                itemId,
            ]
        );

        const checkStatus =
            totalChecked === release.quantity_released ? "Checked" : "Partially Checked";

        await connection.query(
            `
            UPDATE booking_inventory_items
            SET
                returned_good = ?,
                damaged = ?,
                missing = ?,
                status = ?,
                remarks = ?
            WHERE booking_id = ? AND item_id = ?
            `,
            [
                returnedGood,
                damaged,
                missing,
                checkStatus,
                remarks,
                bookingId,
                itemId,
            ]
        );

        if (deltaReturnedGood !== 0) {
            await connection.query(
                `
                INSERT INTO inventory_logs (
                    item_id,
                    booking_id,
                    movement_type,
                    quantity,
                    before_available,
                    after_available,
                    remarks
                )
                VALUES (?, ?, 'return_good', ?, ?, ?, ?)
                `,
                [
                    itemId,
                    bookingId,
                    Math.abs(deltaReturnedGood),
                    beforeAvailable,
                    afterAvailable,
                    remarks || "Good items returned after event",
                ]
            );
        }

        if (deltaDamaged > 0) {
            await connection.query(
                `
                INSERT INTO inventory_logs (
                    item_id,
                    booking_id,
                    movement_type,
                    quantity,
                    before_available,
                    after_available,
                    remarks
                )
                VALUES (?, ?, 'damaged', ?, ?, ?, ?)
                `,
                [
                    itemId,
                    bookingId,
                    deltaDamaged,
                    afterAvailable,
                    afterAvailable,
                    remarks || "Damaged items recorded after event",
                ]
            );
        }

        if (deltaMissing > 0) {
            await connection.query(
                `
                INSERT INTO inventory_logs (
                    item_id,
                    booking_id,
                    movement_type,
                    quantity,
                    before_available,
                    after_available,
                    remarks
                )
                VALUES (?, ?, 'missing', ?, ?, ?, ?)
                `,
                [
                    itemId,
                    bookingId,
                    deltaMissing,
                    afterAvailable,
                    afterAvailable,
                    remarks || "Missing items recorded after event",
                ]
            );
        }

        const issueQty = Math.max(deltaDamaged, 0) + Math.max(deltaMissing, 0);
        const replacementCost = Number(item.replacement_cost || 0);
        const issueAmount = issueQty * replacementCost;

        if (issueQty > 0 && issueAmount > 0) {
            const expenseType =
                deltaMissing > 0 ? "Missing Item Replacement" : "Equipment Repair";

            await connection.query(
                `
                INSERT INTO expenses (
                    booking_id,
                    source,
                    reference_id,
                    expense_type,
                    description,
                    amount,
                    expense_date,
                    remarks
                )
                VALUES (?, 'post_event_check', ?, ?, ?, ?, CURDATE(), ?)
                `,
                [
                    bookingId,
                    itemId,
                    expenseType,
                    `Post-event item issue: ${item.item_name}`,
                    issueAmount,
                    remarks || "Auto-generated from post-event inventory check",
                ]
            );
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Post-event item check saved successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("POST /inventory/return-check error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to save post-event item check",
        });
    } finally {
        connection.release();
    }
};

exports.getBookingInventoryItems = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const [rows] = await pool.promise().query(
            `
            SELECT
                bii.id,
                bii.booking_id AS bookingId,
                bii.item_id AS itemId,
                ii.item_name AS itemName,
                ii.category,
                ii.unit,
                bii.quantity_released AS quantityReleased,
                bii.returned_good AS returnedGood,
                bii.damaged,
                bii.missing,
                bii.status,
                bii.remarks,
                bii.created_at AS createdAt,
                bii.updated_at AS updatedAt
            FROM booking_inventory_items bii
            JOIN inventory_items ii ON ii.id = bii.item_id
            WHERE bii.booking_id = ?
            ORDER BY bii.id DESC
            `,
            [bookingId]
        );

        res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error("GET /inventory/booking/:bookingId error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch booking inventory items",
        });
    }
};

exports.getInventoryLogs = async (req, res) => {
    try {
        const [rows] = await pool.promise().query(`
            SELECT
                il.id,
                il.item_id AS itemId,
                ii.item_name AS itemName,
                il.booking_id AS bookingId,
                il.movement_type AS movementType,
                il.quantity,
                il.before_available AS beforeAvailable,
                il.after_available AS afterAvailable,
                il.remarks,
                il.created_at AS createdAt
            FROM inventory_logs il
            LEFT JOIN inventory_items ii ON ii.id = il.item_id
            ORDER BY il.id DESC
            LIMIT 200
        `);

        res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error("GET /inventory/logs error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch inventory logs",
        });
    }
};