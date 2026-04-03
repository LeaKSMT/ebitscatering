const PAX_RATE = 400;

export const QUICK_RATES = [
    { pax: 50, price: 25000 },
    { pax: 75, price: 30000 },
    { pax: 100, price: 40000 },
];

export const FREEBIES = ["Backdrop"];

export const CLASSIC_MENUS = [
    {
        name: "Classic A",
        items: [
            "Creamy Carbonara",
            "Chicken Cordon Bleu",
            "Vegetable",
            "Pork Asado",
            "Fish Fillet with Tartar Sauce",
            "Buko Pandan",
        ],
    },
    {
        name: "Classic B",
        items: [
            "Pancit Malabon",
            "Sliced Roast Pork with Mushroom Sauce",
            "Breaded Baked Chicken",
            "Buttered Mixed Seafood",
            "Vegetable",
            "Buko Salad",
        ],
    },
    {
        name: "Classic C",
        items: [
            "Spaghetti",
            "Vegetable",
            "Seafood Kare-Kare",
            "Grilled Pork with Mushroom Sauce",
            "Chicken Pastel",
            "Fruit Cocktail Salad",
        ],
    },
    {
        name: "Classic D",
        items: [
            "Mac and Cheese",
            "Pork Caldereta",
            "Vegetable",
            "Chicken Teriyaki",
            "Sweet and Sour Fish",
            "Coffee Jelly",
        ],
    },
];

export const ADD_ONS = [
    { name: "Lights and Sounds", price: 4000 },
    { name: "Host", price: 3500 },
    { name: "Cake", price: 2000 },
    { name: "Photo", price: 5000 },
    { name: "Photo Video", price: 15000 },
    { name: "SDE", price: 27000 },
    { name: "Clown", price: 3000 },
];

export const DEBUT_PACKAGES = [
    {
        name: "Classic Debut",
        eventType: "Debut",
        pricingType: "fixed",
        price: 48000,
        includedPax: 100,
        inclusions: [
            "Venue Styling",
            "Your choice of 3 main course",
            "Pasta and dessert",
            "Bottomless iced tea",
            "Complete catering set-up",
        ],
    },
    {
        name: "Rising Star Package",
        eventType: "Debut",
        pricingType: "fixed",
        price: 55000,
        includedPax: 100,
        inclusions: [
            "Backdrop",
            "Wine for toasting",
            "Basic sounds and lights",
            "Complete catering set-up",
        ],
    },
    {
        name: "All Star Debut Package",
        eventType: "Debut",
        pricingType: "fixed",
        price: 70000,
        includedPax: 100,
        inclusions: [
            "Photobooth",
            "Host with programme",
            "Sounds and lights",
            "Customized sintra board",
        ],
    },
    {
        name: "Diamond Elite Debut Package",
        eventType: "Debut",
        pricingType: "fixed",
        price: 80000,
        includedPax: 100,
        inclusions: [
            "Projector",
            "Sweets table",
            "Program coordinator",
            "Premium setup",
        ],
    },
];

export const WEDDING_PACKAGES = [
    {
        name: "Basic Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 58000,
        includedPax: 100,
        inclusions: [
            "2 main course",
            "Soup, pasta, dessert",
            "Backdrop",
            "Sounds and lights",
            "Photo booth",
            "Host with program",
        ],
    },
    {
        name: "Enhanced Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 65000,
        includedPax: 100,
        inclusions: [
            "Photo coverage",
            "Photo booth",
            "Host with program",
            "Elegant setup",
        ],
    },
    {
        name: "Premium Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 75000,
        includedPax: 100,
        inclusions: [
            "On-site photo coverage",
            "Host with program",
            "Naked cake",
            "Elegant couch",
        ],
    },
    {
        name: "Elite Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 82000,
        includedPax: 100,
        inclusions: [
            "HMUA",
            "Photo booth",
            "Host with program",
            "Cake and setup",
        ],
    },
    {
        name: "Ultimate Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 90000,
        includedPax: 100,
        inclusions: [
            "Video coverage",
            "MTV highlights",
            "Photo booth",
            "HMUA",
            "Grooming",
        ],
    },
];

export const PER_PAX_PACKAGES = [
    {
        name: "Birthday Catering Package",
        eventType: "Birthday",
        pricingType: "perPax",
        ratePerPax: PAX_RATE,
        includedPax: null,
        inclusions: ["Food", "Table setup", "Service staff"],
    },
    {
        name: "Anniversary Catering Package",
        eventType: "Anniversary",
        pricingType: "perPax",
        ratePerPax: PAX_RATE,
        includedPax: null,
        inclusions: ["Food", "Table setup", "Service staff"],
    },
    {
        name: "Baptismal Catering Package",
        eventType: "Baptismal",
        pricingType: "perPax",
        ratePerPax: PAX_RATE,
        includedPax: null,
        inclusions: ["Food", "Table setup", "Service staff"],
    },
];

export const DECORATION_THEMES = [
    { name: "Elegant White & Gold", category: "Wedding" },
    { name: "Garden Theme", category: "Wedding" },
    { name: "Princess Theme", category: "Birthday" },
    { name: "Superhero Theme", category: "Birthday" },
    { name: "Floral Arrangements", category: "All Events" },
    { name: "Balloon Arch", category: "All Events" },
];

export function safeParse(key, fallback = []) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

export function formatCurrency(value) {
    return `₱${Number(value || 0).toLocaleString()}`;
}

export function formatDate(dateStr) {
    if (!dateStr) return "No date set";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function formatShortDate(dateStr) {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function normalizeStatus(status = "") {
    return String(status).trim().toLowerCase();
}

function getKeysByPrefix(prefix) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (key === prefix || key.startsWith(`${prefix}_`)) {
            keys.push(key);
        }
    }
    return keys;
}

export function getCollection(prefix) {
    const keys = getKeysByPrefix(prefix);
    const items = keys.flatMap((key) => {
        const parsed = safeParse(key, []);
        return Array.isArray(parsed) ? parsed : [];
    });

    const seen = new Set();

    return items.filter((item, index) => {
        const id =
            item?.id ||
            item?.quotationId ||
            item?.bookingId ||
            item?.paymentId ||
            item?.inquiryId ||
            `${prefix}_${index}`;

        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });
}

export function updateRecordInCollection(prefix, recordId, updater) {
    const keys = getKeysByPrefix(prefix);

    keys.forEach((key) => {
        const records = safeParse(key, []);
        if (!Array.isArray(records)) return;

        let changed = false;

        const updated = records.map((record) => {
            const currentId =
                record?.id ||
                record?.quotationId ||
                record?.bookingId ||
                record?.paymentId ||
                record?.inquiryId;

            if (currentId === recordId) {
                changed = true;
                return updater(record);
            }

            return record;
        });

        if (changed) {
            localStorage.setItem(key, JSON.stringify(updated));
        }
    });
}

export function removeRecordFromCollection(prefix, recordId) {
    const keys = getKeysByPrefix(prefix);

    keys.forEach((key) => {
        const records = safeParse(key, []);
        if (!Array.isArray(records)) return;

        const filtered = records.filter((record) => {
            const currentId =
                record?.id ||
                record?.quotationId ||
                record?.bookingId ||
                record?.paymentId ||
                record?.inquiryId;

            return currentId !== recordId;
        });

        localStorage.setItem(key, JSON.stringify(filtered));
    });
}

export function prependRecordToOwnerCollection(prefix, ownerEmail, record) {
    const key = ownerEmail ? `${prefix}_${ownerEmail}` : `${prefix}_guest`;
    const existing = safeParse(key, []);
    localStorage.setItem(key, JSON.stringify([record, ...existing]));
}

export function getAllQuotations() {
    return getCollection("clientQuotations")
        .map((item) => ({
            id: item.id || item.quotationId,
            quotationId: item.quotationId || "Q00",
            ownerEmail: item.ownerEmail || item.email || "",
            fullName: item.fullName || item.ownerName || item.name || "Client",
            email: item.email || item.ownerEmail || "",
            contactNumber: item.contactNumber || "",
            eventType: item.eventType || "Event",
            preferredDate: item.preferredDate || item.eventDate || item.date || "",
            eventTime: item.eventTime || "",
            venue: item.venue || "",
            guests: Number(item.guests || item.guestCount || 0),
            packageType: item.packageType || "",
            classicMenu: item.classicMenu || "",
            addOns: Array.isArray(item.addOns) ? item.addOns : [],
            themePreference: item.themePreference || "",
            specialRequests: item.specialRequests || "",
            packagePrice: Number(item.packagePrice || 0),
            addOnsTotal: Number(item.addOnsTotal || 0),
            estimatedTotal: Number(item.estimatedTotal || item.totalAmount || 0),
            status: item.status || "Pending",
            createdAt: item.createdAt || "",
        }))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export function getAllBookings() {
    return getCollection("clientBookings")
        .map((item, index) => ({
            id: item.id || item.bookingId || `booking_${index}`,
            bookingId: item.bookingId || `B${String(index + 1).padStart(3, "0")}`,
            quotationId: item.quotationId || "",
            ownerEmail: item.ownerEmail || item.email || "",
            fullName: item.fullName || item.clientName || item.name || "Client",
            email: item.email || item.ownerEmail || "",
            contactNumber: item.contactNumber || "",
            eventType: item.eventType || "Event",
            eventDate:
                item.eventDate || item.preferredDate || item.date || item.bookingDate || "",
            eventTime: item.eventTime || "",
            venue: item.venue || "",
            guestCount: Number(item.guestCount || item.guests || 0),
            packageType: item.packageType || "",
            classicMenu: item.classicMenu || "",
            addOns: Array.isArray(item.addOns) ? item.addOns : [],
            themePreference: item.themePreference || "",
            specialRequests: item.specialRequests || item.notes || "",
            totalAmount: Number(
                item.totalAmount || item.estimatedTotal || item.packagePrice || 0
            ),
            paymentStatus: item.paymentStatus || "unpaid",
            status: item.status || item.bookingStatus || "confirmed",
            assignedStaff: Array.isArray(item.assignedStaff) ? item.assignedStaff : [],
            payments: Array.isArray(item.payments) ? item.payments : [],
            createdAt: item.createdAt || "",
        }))
        .sort((a, b) => new Date(a.eventDate || 0) - new Date(b.eventDate || 0));
}

export function getAllPayments() {
    return getCollection("clientPaymentHistory")
        .map((item, index) => ({
            id: item.id || item.paymentId || `payment_${index}`,
            paymentId: item.paymentId || `P${String(index + 1).padStart(3, "0")}`,
            bookingId: item.bookingId || "",
            ownerEmail: item.ownerEmail || "",
            clientName: item.clientName || item.fullName || item.name || "Client",
            paymentType: item.paymentType || item.type || "Payment",
            paymentMethod: item.paymentMethod || item.method || "Not specified",
            amount: Number(item.amount || item.paymentAmount || item.total || 0),
            referenceNumber: item.referenceNumber || item.reference || "",
            createdAt: item.createdAt || item.date || new Date().toISOString(),
        }))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export function savePaymentRecord(payment) {
    const existing = safeParse("clientPaymentHistory", []);
    localStorage.setItem(
        "clientPaymentHistory",
        JSON.stringify([payment, ...existing])
    );
}

export function getAllExpenses() {
    return getCollection("adminExpenses")
        .map((item, index) => ({
            id: item.id || `expense_${index}`,
            bookingId: item.bookingId || "",
            eventType: item.eventType || "",
            clientName: item.clientName || "",
            amount: Number(item.amount || 0),
            category: item.category || "",
            createdAt: item.createdAt || new Date().toISOString(),
        }))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export function getAllInquiries() {
    return getCollection("adminInquiries")
        .map((item) => ({
            id: item.id || item.inquiryId,
            inquiryId: item.inquiryId || item.id,
            ownerEmail: item.ownerEmail || item.email || "",
            fullName: item.fullName || "Client",
            email: item.email || "",
            contactNumber: item.contactNumber || "",
            eventType: item.eventType || "",
            preferredDate: item.preferredDate || "",
            guests: Number(item.guests || 0),
            message: item.message || "",
            status: item.status || "New",
            adminReply: item.adminReply || "",
            createdAt: item.createdAt || "",
            repliedAt: item.repliedAt || "",
            convertedAt: item.convertedAt || "",
        }))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export function createBookingFromQuotation(quotation) {
    const bookings = getAllBookings();

    const existing = bookings.find(
        (item) => item.quotationId === quotation.quotationId || item.id === quotation.id
    );

    if (existing) return existing;

    const nextId = `booking_${Date.now()}`;
    const nextBookingNo = bookings.length + 1;
    const bookingId = `B${String(nextBookingNo).padStart(3, "0")}`;

    const booking = {
        id: nextId,
        bookingId,
        quotationId: quotation.quotationId,
        ownerEmail: quotation.ownerEmail || quotation.email || "",
        fullName: quotation.fullName,
        email: quotation.email || quotation.ownerEmail || "",
        contactNumber: quotation.contactNumber || "",
        eventType: quotation.eventType,
        eventDate: quotation.preferredDate || "",
        eventTime: quotation.eventTime || "",
        venue: quotation.venue || "",
        guestCount: Number(quotation.guests || 0),
        packageType: quotation.packageType || "",
        classicMenu: quotation.classicMenu || "",
        addOns: Array.isArray(quotation.addOns) ? quotation.addOns : [],
        themePreference: quotation.themePreference || "",
        specialRequests: quotation.specialRequests || "",
        totalAmount: Number(quotation.estimatedTotal || 0),
        paymentStatus: "unpaid",
        status: "confirmed",
        assignedStaff: [],
        payments: [],
        createdAt: new Date().toISOString(),
    };

    prependRecordToOwnerCollection("clientBookings", booking.ownerEmail, booking);
    return booking;
}

export function getBookingPaymentSummary(booking) {
    const paymentHistory = getAllPayments().filter(
        (item) => item.bookingId === booking.bookingId
    );

    const inlinePayments = Array.isArray(booking.payments)
        ? booking.payments.map((amount, index) => ({
            id: `inline_${booking.bookingId}_${index}`,
            bookingId: booking.bookingId,
            amount: Number(amount || 0),
            createdAt: booking.createdAt || new Date().toISOString(),
        }))
        : [];

    const payments = [...paymentHistory, ...inlinePayments];

    const paid = payments.reduce(
        (sum, item) => sum + Number(item.amount || item || 0),
        0
    );

    const totalAmount = Number(booking.totalAmount || 0);
    const balance = Math.max(totalAmount - paid, 0);

    let paymentStatus = "unpaid";
    if (paid > 0 && balance > 0) paymentStatus = "partial";
    if (totalAmount > 0 && paid >= totalAmount) paymentStatus = "paid";

    return { paid, balance, paymentStatus, payments };
}

export function getMonthlyFinancialRows() {
    const bookings = getAllBookings();
    const expenses = getAllExpenses();
    const monthsMap = new Map();

    bookings.forEach((booking) => {
        const rawDate = booking.eventDate || booking.createdAt;
        const date = new Date(rawDate);
        if (Number.isNaN(date.getTime())) return;

        const key = `${date.getFullYear()}-${date.getMonth()}`;
        const label = date.toLocaleDateString("en-PH", {
            month: "short",
            year: "numeric",
        });

        if (!monthsMap.has(key)) {
            monthsMap.set(key, { label, revenue: 0, expenses: 0 });
        }

        monthsMap.get(key).revenue += Number(booking.totalAmount || 0);
    });

    expenses.forEach((expense) => {
        const date = new Date(expense.createdAt);
        if (Number.isNaN(date.getTime())) return;

        const key = `${date.getFullYear()}-${date.getMonth()}`;
        const label = date.toLocaleDateString("en-PH", {
            month: "short",
            year: "numeric",
        });

        if (!monthsMap.has(key)) {
            monthsMap.set(key, { label, revenue: 0, expenses: 0 });
        }

        monthsMap.get(key).expenses += Number(expense.amount || 0);
    });

    return [...monthsMap.values()].map((row) => {
        const profit = row.revenue - row.expenses;
        const margin = row.revenue > 0 ? (profit / row.revenue) * 100 : 0;

        return {
            ...row,
            profit,
            margin,
        };
    });
}

export function getDemandForecast() {
    const bookings = getAllBookings();
    const total = bookings.length;

    const eventTypes = ["Birthday", "Wedding", "Debut", "Baptismal", "Anniversary"];

    return eventTypes.map((type) => {
        const count = bookings.filter((item) => item.eventType === type).length;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        return { type, count, percent };
    });
}

export function getActiveClientsFromBookings() {
    const bookings = getAllBookings();
    const map = new Map();

    bookings.forEach((item) => {
        const key = item.ownerEmail || item.email || item.fullName;
        if (!key) return;

        if (!map.has(key)) {
            map.set(key, {
                clientKey: key,
                fullName: item.fullName || "Client",
                email: item.email || item.ownerEmail || "",
                contactNumber: item.contactNumber || "",
                bookings: [],
            });
        }

        map.get(key).bookings.push(item);
    });

    return [...map.values()];
}

export function saveAdminEmployees(records) {
    localStorage.setItem("adminEmployees", JSON.stringify(records));
}

export function getAdminEmployees() {
    return safeParse("adminEmployees", []);
}

export function saveAdminPayrollSettings(records) {
    localStorage.setItem("adminPayrollSettings", JSON.stringify(records));
}

export function getAdminPayrollSettings() {
    return safeParse("adminPayrollSettings", []);
}

export function saveAdminPayrollRecords(records) {
    localStorage.setItem("adminPayrollRecords", JSON.stringify(records));
}

export function getAdminPayrollRecords() {
    return safeParse("adminPayrollRecords", []);
}

export function saveAdminInventory(records) {
    localStorage.setItem("adminInventory", JSON.stringify(records));
}

export function getAdminInventory() {
    return safeParse("adminInventory", []);
}

export function saveAdminDecorations(records) {
    localStorage.setItem("adminDecorations", JSON.stringify(records));
}

export function getAdminDecorations() {
    const stored = safeParse("adminDecorations", []);
    return stored.length > 0 ? stored : DECORATION_THEMES;
}

export function saveAdminPackageContent(records) {
    localStorage.setItem("adminPackageContent", JSON.stringify(records));
}

export function getAdminPackageContent() {
    const stored = safeParse("adminPackageContent", []);
    return stored.length > 0
        ? stored
        : [...PER_PAX_PACKAGES, ...DEBUT_PACKAGES, ...WEDDING_PACKAGES];
}