const db = require("../config/db");

const PAX_RATE = 400;

const PACKAGE_PRICE_MAP = {
    "Birthday Catering Package": { pricingType: "perPax", ratePerPax: 400, includedPax: null },
    "Anniversary Catering Package": { pricingType: "perPax", ratePerPax: 400, includedPax: null },
    "Baptismal Catering Package": { pricingType: "perPax", ratePerPax: 400, includedPax: null },

    "Classic Debut": { pricingType: "fixed", price: 48000, includedPax: 100 },
    "Rising Star Package": { pricingType: "fixed", price: 55000, includedPax: 100 },
    "All Star Debut Package": { pricingType: "fixed", price: 70000, includedPax: 100 },
    "Diamond Elite Debut Package": { pricingType: "fixed", price: 80000, includedPax: 100 },

    "Basic Wedding Package": { pricingType: "fixed", price: 58000, includedPax: 100 },
    "Enhanced Wedding Package": { pricingType: "fixed", price: 65000, includedPax: 100 },
    "Premium Wedding Package": { pricingType: "fixed", price: 75000, includedPax: 100 },
    "Elite Wedding Package": { pricingType: "fixed", price: 82000, includedPax: 100 },
    "Ultimate Wedding Package": { pricingType: "fixed", price: 90000, includedPax: 100 },
};

const ADD_ON_PRICE_MAP = {
    "Lights and Sounds": 4000,
    Host: 3500,
    Cake: 2000,
    Photo: 5000,
    "Photo Video": 15000,
    SDE: 27000,
    Clown: 3000,
};

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

function isAdminUser(req) {
    return normalizeStatus(req.user?.role) === "admin";
}

function getUserEmail(req) {
    return String(req.user?.email || "").trim().toLowerCase();
}

function safeJsonParse(value, fallback = []) {
    try {
        const parsed = JSON.parse(value || "[]");
        return Array.isArray(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
}
function parseInputDate(value) {
    if (!value) return null;

    const dateText = String(value).slice(0, 10);
    const [year, month, day] = dateText.split("-").map(Number);

    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day);
}

function isPastDateValue(value) {
    const selectedDate = parseInputDate(value);

    if (!selectedDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    return selectedDate < today;
}
function getPackageFromDatabase(packageType) {
    return new Promise((resolve) => {
        if (!packageType) {
            return resolve(null);
        }

        const query = `
    SELECT *
    FROM packages
    WHERE LOWER(TRIM(title)) = LOWER(TRIM(?))
    LIMIT 1
`;

        db.query(query, [packageType], (err, results) => {
            if (err) {
                console.error("Fetch package price error:", err.message);
                return resolve(null);
            }

            if (!results || results.length === 0) {
                return resolve(null);
            }

            const pkg = results[0];

            const rawPrice =
                pkg.price ??
                pkg.rawPrice ??
                pkg.raw_price ??
                pkg.package_price ??
                pkg.total_price ??
                pkg.amount ??
                0;

            const rawRatePerPax =
                pkg.rate_per_pax ??
                pkg.ratePerPax ??
                pkg.pax_rate ??
                pkg.price_per_pax ??
                pkg.per_pax_price ??
                null;

            const rawIncludedPax =
                pkg.included_pax ??
                pkg.includedPax ??
                pkg.pax ??
                pkg.good_for ??
                pkg.guests ??
                null;

            const pricingType =
                pkg.pricing_type ||
                pkg.pricingType ||
                (rawRatePerPax && Number(rawRatePerPax) > 0 ? "perPax" : "fixed");

            resolve({
                pricingType,
                price: Number(rawPrice || 0),
                ratePerPax: rawRatePerPax != null ? Number(rawRatePerPax) : null,
                includedPax: rawIncludedPax != null ? Number(rawIncludedPax) : null,
            });
        });
    });
}
function getAddOnsTotalFromDatabase(addOns = []) {
    return new Promise((resolve) => {
        if (!Array.isArray(addOns) || addOns.length === 0) {
            return resolve(0);
        }

        const normalizedNames = addOns
            .map((name) => String(name || "").trim().toLowerCase())
            .filter(Boolean);

        if (normalizedNames.length === 0) {
            return resolve(0);
        }

        const placeholders = normalizedNames.map(() => "?").join(",");

        const query = `
            SELECT title, price
            FROM packages
            WHERE package_group = 'Add-on'
              AND LOWER(TRIM(title)) IN (${placeholders})
        `;

        db.query(query, normalizedNames, (err, results) => {
            if (err) {
                console.error("Fetch add-on prices error:", err.message);

                const fallbackTotal = addOns.reduce(
                    (sum, name) => sum + Number(ADD_ON_PRICE_MAP[name] || 0),
                    0
                );

                return resolve(fallbackTotal);
            }

            const dbPriceMap = {};

            (results || []).forEach((item) => {
                dbPriceMap[String(item.title || "").trim().toLowerCase()] =
                    Number(item.price || 0);
            });

            const total = addOns.reduce((sum, name) => {
                const key = String(name || "").trim().toLowerCase();

                if (dbPriceMap[key] !== undefined) {
                    return sum + Number(dbPriceMap[key] || 0);
                }

                return sum + Number(ADD_ON_PRICE_MAP[name] || 0);
            }, 0);

            return resolve(total);
        });
    });
}
async function computeQuotationPricing(packageType, guests, addOns = []) {
    const databasePackage = await getPackageFromDatabase(packageType);
    const fallbackPackage = PACKAGE_PRICE_MAP[packageType];
    const selectedPackage = databasePackage || fallbackPackage;

    const guestCount = Number(guests || 0);

    const addOnsTotal = await getAddOnsTotalFromDatabase(
        Array.isArray(addOns) ? addOns : []
    );

    if (!selectedPackage) {
        return {
            packagePrice: 0,
            addOnsTotal,
            estimatedTotal: addOnsTotal,
            includedPax: null,
            pricingType: "fixed",
            ratePerPax: null,
            excessGuests: 0,
            excessCost: 0,
        };
    }

    if (selectedPackage.pricingType === "perPax") {
        const ratePerPax = Number(selectedPackage.ratePerPax || selectedPackage.price || PAX_RATE || 0);
        const packagePrice = guestCount * ratePerPax;

        return {
            packagePrice,
            addOnsTotal,
            estimatedTotal: packagePrice + addOnsTotal,
            includedPax: null,
            pricingType: "perPax",
            ratePerPax,
            excessGuests: 0,
            excessCost: 0,
        };
    }

    const includedPax = Number(selectedPackage.includedPax || 0);
    const excessGuests = includedPax > 0 && guestCount > includedPax ? guestCount - includedPax : 0;
    const excessCost = excessGuests * PAX_RATE;
    const packagePrice = Number(selectedPackage.price || 0) + excessCost;

    return {
        packagePrice,
        addOnsTotal,
        estimatedTotal: packagePrice + addOnsTotal,
        includedPax: includedPax || null,
        pricingType: "fixed",
        ratePerPax: null,
        excessGuests,
        excessCost,
    };
}

exports.getQuotations = (req, res) => {
    const userEmail = getUserEmail(req);

    if (!userEmail) {
        return res.status(401).json({ message: "Unauthorized user" });
    }

    let query = `SELECT * FROM quotations`;
    let values = [];

    if (!isAdminUser(req)) {
        query += `
            WHERE LOWER(COALESCE(owner_email, '')) = ?
               OR LOWER(COALESCE(email, '')) = ?
        `;
        values = [userEmail, userEmail];
    }

    query += ` ORDER BY id DESC`;

    db.query(query, values, (err, results) => {
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
    const userEmail = getUserEmail(req);
    const admin = isAdminUser(req);

    let query = `SELECT * FROM quotations WHERE id = ?`;
    let values = [id];

    if (!admin) {
        query += `
            AND (
                LOWER(COALESCE(owner_email, '')) = ?
                OR LOWER(COALESCE(email, '')) = ?
            )
        `;
        values.push(userEmail, userEmail);
    }

    query += ` LIMIT 1`;

    db.query(query, values, (err, results) => {
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
    });
};

exports.createQuotation = async (req, res) => {
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
        package_inclusions,
        status,
        payments,
        expenses,
        inquiries,
        event_outcome,
        evaluation_notes,
        client_satisfaction,
        staff_performance,
        assigned_staff,
    } = req.body;

    if (!full_name || !email || !event_type || !preferred_date || !venue) {
        return res.status(400).json({
            message: "full_name, email, event_type, preferred_date, and venue are required",
        });
    }
    if (isPastDateValue(preferred_date)) {
        return res.status(400).json({
            message: "Past dates are not allowed. Please select today or a future date.",
        });
    }
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedOwnerEmail = String(owner_email || email || "")
        .trim()
        .toLowerCase();

    const selectedAddOns = Array.isArray(add_ons) ? add_ons : [];
    const recalculated = await computeQuotationPricing(
        package_type || null,
        Number(guests || 0),
        selectedAddOns
    );

    const insertQuery = `
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
            status,
            payments,
            expenses,
            inquiries,
            event_outcome,
            evaluation_notes,
            client_satisfaction,
            staff_performance,
            assigned_staff
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        quotation_id || `Q${Date.now()}`,
        normalizedOwnerEmail || null,
        owner_name || full_name || null,
        full_name,
        normalizedEmail,
        contact_number || null,
        event_type,
        preferred_date,
        event_time || null,
        venue,
        Number(guests || 0),
        package_type || null,
        classic_menu || null,
        JSON.stringify(selectedAddOns),
        theme_preference || null,
        special_requests || null,
        recalculated.packagePrice,
        recalculated.addOnsTotal,
        recalculated.estimatedTotal,
        recalculated.includedPax,
        recalculated.pricingType,
        recalculated.ratePerPax,
        recalculated.excessGuests,
        recalculated.excessCost,
        JSON.stringify(Array.isArray(package_inclusions) ? package_inclusions : []),
        status || "Pending",
        JSON.stringify(Array.isArray(payments) ? payments : []),
        JSON.stringify(Array.isArray(expenses) ? expenses : []),
        JSON.stringify(Array.isArray(inquiries) ? inquiries : []),
        event_outcome || null,
        evaluation_notes || null,
        client_satisfaction || null,
        staff_performance || null,
        JSON.stringify(Array.isArray(assigned_staff) ? assigned_staff : []),
    ];

    db.query(insertQuery, values, (err, result) => {
        if (err) {
            console.error("Create quotation error:", err);
            return res.status(500).json({
                message: "Failed to create quotation",
                error: err.message,
            });
        }

        return res.status(201).json({
            message: "Quotation created successfully",
            id: result.insertId,
            insertId: result.insertId,
            recalculated: true,
            estimatedTotal: recalculated.estimatedTotal,
        });
    });
};

exports.updateQuotation = (req, res) => {
    const { id } = req.params;
    const userEmail = getUserEmail(req);
    const admin = isAdminUser(req);

    let fetchQuery = `SELECT * FROM quotations WHERE id = ?`;
    const fetchValues = [id];

    if (!admin) {
        fetchQuery += `
            AND (
                LOWER(COALESCE(owner_email, '')) = ?
                OR LOWER(COALESCE(email, '')) = ?
            )
        `;
        fetchValues.push(userEmail, userEmail);
    }

    fetchQuery += ` LIMIT 1`;

    db.query(fetchQuery, fetchValues, async (fetchErr, results) => {
        if (fetchErr) {
            console.error("Fetch quotation before update error:", fetchErr);
            return res.status(500).json({
                message: "Failed to update quotation",
                error: fetchErr.message,
            });
        }

        if (!results || results.length === 0) {
            return res.status(404).json({ message: "Quotation not found" });
        }

        const current = results[0];
        const body = req.body || {};
        const currentStatus = normalizeStatus(current.status);

        if (!admin && currentStatus !== "pending") {
            return res.status(403).json({
                message: "Only pending quotations can be edited.",
            });
        }

        const nextOwnerEmail = String(
            body.ownerEmail ||
            body.owner_email ||
            current.owner_email ||
            current.email ||
            ""
        )
            .trim()
            .toLowerCase();

        const nextEmail = String(body.email || current.email || nextOwnerEmail || "")
            .trim()
            .toLowerCase();

        const addOns =
            body.addOns ??
            body.add_ons ??
            safeJsonParse(current.add_ons);

        const packageInclusions =
            admin && (body.packageInclusions || body.package_inclusions)
                ? body.packageInclusions || body.package_inclusions
                : safeJsonParse(current.package_inclusions);

        const assignedStaff =
            admin && (body.assignedStaff || body.assigned_staff)
                ? body.assignedStaff || body.assigned_staff
                : safeJsonParse(current.assigned_staff);

        const payments =
            admin && body.payments ? body.payments : safeJsonParse(current.payments);

        const expenses =
            admin && body.expenses ? body.expenses : safeJsonParse(current.expenses);

        const inquiries =
            admin && body.inquiries ? body.inquiries : safeJsonParse(current.inquiries);

        const nextPackageType =
            body.packageType ||
            body.package_type ||
            current.package_type ||
            null;

        const nextGuests = Number(body.guests ?? body.guestCount ?? current.guests ?? 0);

        const nextPreferredDate =
            body.preferredDate ||
            body.preferred_date ||
            body.eventDate ||
            current.preferred_date ||
            null;

        if (isPastDateValue(nextPreferredDate)) {
            return res.status(400).json({
                message: "Past dates are not allowed. Please select today or a future date.",
            });
        }

        const recalculated = await computeQuotationPricing(
            nextPackageType,
            nextGuests,
            Array.isArray(addOns) ? addOns : []
        );

        const updateQuery = `
            UPDATE quotations
            SET
                owner_email = ?,
                owner_name = ?,
                full_name = ?,
                email = ?,
                contact_number = ?,
                event_type = ?,
                preferred_date = ?,
                event_time = ?,
                venue = ?,
                guests = ?,
                package_type = ?,
                classic_menu = ?,
                add_ons = ?,
                theme_preference = ?,
                special_requests = ?,
                package_price = ?,
                add_ons_total = ?,
                estimated_total = ?,
                included_pax = ?,
                pricing_type = ?,
                rate_per_pax = ?,
                excess_guests = ?,
                excess_cost = ?,
                package_inclusions = ?,
                status = ?,
                payments = ?,
                expenses = ?,
                inquiries = ?,
                event_outcome = ?,
                evaluation_notes = ?,
                client_satisfaction = ?,
                staff_performance = ?,
                assigned_staff = ?
            WHERE id = ?
        `;

        const updateValues = [
            nextOwnerEmail || null,
            body.ownerName ||
            body.owner_name ||
            current.owner_name ||
            body.fullName ||
            body.full_name ||
            current.full_name ||
            null,
            body.fullName || body.full_name || current.full_name,
            nextEmail || null,
            body.contactNumber || body.contact_number || current.contact_number || null,
            body.eventType || body.event_type || current.event_type || null,
            nextPreferredDate,
            body.eventTime || body.event_time || current.event_time || null,
            body.venue || current.venue || null,
            nextGuests,
            nextPackageType,
            admin
                ? body.classicMenu || body.classic_menu || current.classic_menu || null
                : current.classic_menu || null,
            JSON.stringify(Array.isArray(addOns) ? addOns : []),
            body.themePreference || body.theme_preference || current.theme_preference || null,
            body.specialRequests || body.special_requests || current.special_requests || null,

            recalculated.packagePrice,
            recalculated.addOnsTotal,
            recalculated.estimatedTotal,
            recalculated.includedPax,
            recalculated.pricingType,
            recalculated.ratePerPax,
            recalculated.excessGuests,
            recalculated.excessCost,

            JSON.stringify(Array.isArray(packageInclusions) ? packageInclusions : []),
            admin ? body.status || current.status || "Pending" : current.status || "Pending",
            JSON.stringify(Array.isArray(payments) ? payments : []),
            JSON.stringify(Array.isArray(expenses) ? expenses : []),
            JSON.stringify(Array.isArray(inquiries) ? inquiries : []),
            admin ? body.eventOutcome || body.event_outcome || current.event_outcome || null : current.event_outcome || null,
            admin ? body.evaluationNotes || body.evaluation_notes || current.evaluation_notes || null : current.evaluation_notes || null,
            admin ? body.clientSatisfaction || body.client_satisfaction || current.client_satisfaction || null : current.client_satisfaction || null,
            admin ? body.staffPerformance || body.staff_performance || current.staff_performance || null : current.staff_performance || null,
            JSON.stringify(Array.isArray(assignedStaff) ? assignedStaff : []),
            id,
        ];

        db.query(updateQuery, updateValues, (updateErr, updateResult) => {
            if (updateErr) {
                console.error("Update quotation error:", updateErr);
                return res.status(500).json({
                    message: "Failed to update quotation",
                    error: updateErr.message,
                });
            }

            if (!updateResult || updateResult.affectedRows === 0) {
                return res.status(404).json({ message: "Quotation not found" });
            }

            return res.status(200).json({
                message: "Quotation updated successfully",
                recalculated: true,
                estimatedTotal: recalculated.estimatedTotal,
            });
        });
    });
};

exports.updateQuotationStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userEmail = getUserEmail(req);
    const admin = isAdminUser(req);

    if (!status) {
        return res.status(400).json({ message: "status is required" });
    }

    let fetchQuery = `SELECT * FROM quotations WHERE id = ?`;
    let fetchValues = [id];

    if (!admin) {
        fetchQuery += `
            AND (
                LOWER(COALESCE(owner_email, '')) = ?
                OR LOWER(COALESCE(email, '')) = ?
            )
        `;
        fetchValues.push(userEmail, userEmail);
    }

    fetchQuery += ` LIMIT 1`;

    db.query(fetchQuery, fetchValues, (fetchErr, quotationResults) => {
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

        if (shouldCreateBooking(status) && isPastDateValue(quotation.preferred_date)) {
            return res.status(400).json({
                message: "This quotation has a past event date and cannot be approved as a booking.",
            });
        }

        db.query(
            `UPDATE quotations SET status = ? WHERE id = ?`,
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
                            console.error("Check existing booking error:", bookingCheckErr);
                            return res.status(500).json({
                                message: "Quotation status updated but failed to sync booking",
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
                            notesParts.push(`Theme Preference: ${quotation.theme_preference}`);
                        }

                        if (quotation.special_requests) {
                            notesParts.push(`Special Requests: ${quotation.special_requests}`);
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
                                        message: "Quotation status updated but failed to create booking",
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
    });
};

exports.deleteQuotation = (req, res) => {
    const { id } = req.params;
    const userEmail = getUserEmail(req);
    const admin = isAdminUser(req);

    let fetchQuery = `SELECT * FROM quotations WHERE id = ?`;
    let fetchValues = [id];

    if (!admin) {
        fetchQuery += `
            AND (
                LOWER(COALESCE(owner_email, '')) = ?
                OR LOWER(COALESCE(email, '')) = ?
            )
        `;
        fetchValues.push(userEmail, userEmail);
    }

    fetchQuery += ` LIMIT 1`;

    db.query(fetchQuery, fetchValues, (fetchErr, results) => {
        if (fetchErr) {
            console.error("Fetch quotation before delete error:", fetchErr);
            return res.status(500).json({
                message: "Failed to delete quotation",
                error: fetchErr.message,
            });
        }

        if (!results || results.length === 0) {
            return res.status(404).json({ message: "Quotation not found" });
        }

        const current = results[0];

        if (!admin && normalizeStatus(current.status) !== "pending") {
            return res.status(403).json({
                message: "Only pending quotations can be deleted.",
            });
        }

        db.query(`DELETE FROM quotations WHERE id = ?`, [id], (err, result) => {
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

            return res.status(200).json({
                message: "Quotation deleted successfully",
            });
        });
    });
};