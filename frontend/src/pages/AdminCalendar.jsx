import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Phone,
    User,
    X,
    Plus,
    Trash2,
    CircleDollarSign,
    Users,
    FileText,
    Clock3,
    BadgeCheck,
    PartyPopper,
    Mail,
    Sparkles,
} from "lucide-react";

const PAX_RATE = 400;

const dynamicPerPaxPackages = [
    {
        name: "Birthday Catering Package",
        eventType: "Birthday",
        pricingType: "perPax",
        ratePerPax: PAX_RATE,
    },
    {
        name: "Anniversary Catering Package",
        eventType: "Anniversary",
        pricingType: "perPax",
        ratePerPax: PAX_RATE,
    },
    {
        name: "Baptismal Catering Package",
        eventType: "Baptismal",
        pricingType: "perPax",
        ratePerPax: PAX_RATE,
    },
];

const debutPackages = [
    {
        name: "Classic Debut",
        eventType: "Debut",
        pricingType: "fixed",
        price: 48000,
        includedPax: 100,
    },
    {
        name: "Rising Star Package",
        eventType: "Debut",
        pricingType: "fixed",
        price: 55000,
        includedPax: 100,
    },
    {
        name: "All Star Debut Package",
        eventType: "Debut",
        pricingType: "fixed",
        price: 70000,
        includedPax: 100,
    },
    {
        name: "Diamond Elite Debut Package",
        eventType: "Debut",
        pricingType: "fixed",
        price: 80000,
        includedPax: 100,
    },
];

const weddingPackages = [
    {
        name: "Basic Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 58000,
        includedPax: 100,
    },
    {
        name: "Enhanced Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 65000,
        includedPax: 100,
    },
    {
        name: "Premium Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 75000,
        includedPax: 100,
    },
    {
        name: "Elite Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 82000,
        includedPax: 100,
    },
    {
        name: "Ultimate Wedding Package",
        eventType: "Wedding",
        pricingType: "fixed",
        price: 90000,
        includedPax: 100,
    },
];

const classicMenus = ["Classic A", "Classic B", "Classic C", "Classic D"];

const addOnOptions = [
    { name: "Lights and Sounds", price: 4000 },
    { name: "Host", price: 3500 },
    { name: "Cake", price: 2000 },
    { name: "Photo", price: 5000 },
    { name: "Photo Video", price: 15000 },
    { name: "SDE", price: 27000 },
    { name: "Clown", price: 3000 },
];

const allPackages = [
    ...dynamicPerPaxPackages,
    ...debutPackages,
    ...weddingPackages,
];

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

function safeParse(key, fallback = []) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function formatCurrency(value) {
    return `₱${Number(value || 0).toLocaleString()}`;
}

function formatDate(dateStr) {
    if (!dateStr) return "—";

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function getMonthLabel(date) {
    return date.toLocaleDateString("en-PH", {
        month: "long",
        year: "numeric",
    });
}

function getAllScopedBookings() {
    const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith("clientBookings_")
    );

    let all = [];

    keys.forEach((key) => {
        const items = safeParse(key, []);
        if (Array.isArray(items)) {
            all = [...all, ...items];
        }
    });

    return all;
}

function getInitialForm(selectedDate = "") {
    return {
        fullName: "",
        contactNumber: "",
        email: "",
        eventType: "",
        preferredDate: selectedDate,
        eventTime: "",
        venue: "",
        guests: "",
        packageType: "",
        classicMenu: "",
        addOns: [],
        themePreference: "",
        specialRequests: "",
        status: "Confirmed",
    };
}

function AdminCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [form, setForm] = useState(getInitialForm());

    const refreshBookings = () => {
        const allBookings = getAllScopedBookings()
            .filter((item) => item.preferredDate)
            .sort(
                (a, b) =>
                    new Date(a.preferredDate).getTime() -
                    new Date(b.preferredDate).getTime()
            );

        setBookings(allBookings);
    };

    useEffect(() => {
        refreshBookings();
    }, []);

    const availablePackages = useMemo(() => {
        if (!form.eventType) return [];

        if (form.eventType === "Wedding") return weddingPackages;
        if (form.eventType === "Debut") return debutPackages;

        if (
            form.eventType === "Birthday" ||
            form.eventType === "Anniversary" ||
            form.eventType === "Baptismal"
        ) {
            return dynamicPerPaxPackages.filter(
                (pkg) => pkg.eventType === form.eventType
            );
        }

        return [];
    }, [form.eventType]);

    const selectedPackage = useMemo(() => {
        return (
            allPackages.find(
                (pkg) =>
                    pkg.name === form.packageType &&
                    pkg.eventType === form.eventType
            ) || null
        );
    }, [form.packageType, form.eventType]);

    const guestCount = Number(form.guests || 0);

    const addOnsTotal = useMemo(() => {
        return form.addOns.reduce((sum, itemName) => {
            const matched = addOnOptions.find((item) => item.name === itemName);
            return sum + Number(matched?.price || 0);
        }, 0);
    }, [form.addOns]);

    const excessGuests = useMemo(() => {
        if (!selectedPackage) return 0;
        if (selectedPackage.pricingType === "perPax") return 0;

        const included = Number(selectedPackage.includedPax || 0);
        return guestCount > included ? guestCount - included : 0;
    }, [selectedPackage, guestCount]);

    const excessCost = useMemo(() => {
        if (!selectedPackage) return 0;
        if (selectedPackage.pricingType === "perPax") return 0;

        return excessGuests * PAX_RATE;
    }, [selectedPackage, excessGuests]);

    const packagePrice = useMemo(() => {
        if (!selectedPackage) return 0;

        if (selectedPackage.pricingType === "perPax") {
            return guestCount * Number(selectedPackage.ratePerPax || 0);
        }

        return Number(selectedPackage.price || 0) + excessCost;
    }, [selectedPackage, guestCount, excessCost]);

    const estimatedTotal = packagePrice + addOnsTotal;

    const packageCoverageText = useMemo(() => {
        if (!selectedPackage) return "Not selected";

        if (selectedPackage.pricingType === "perPax") {
            return `₱${selectedPackage.ratePerPax}/pax × ${guestCount || 0} guest(s)`;
        }

        if (excessGuests > 0) {
            return `${selectedPackage.includedPax} pax included (+ ${excessGuests} excess guest(s) × ₱400)`;
        }

        return `${selectedPackage.includedPax} pax included`;
    }, [selectedPackage, guestCount, excessGuests]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(
        today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const currentMonthBookings = useMemo(() => {
        return bookings.filter((booking) => {
            const d = new Date(booking.preferredDate);
            return (
                d.getFullYear() === year &&
                d.getMonth() === month &&
                booking.status !== "Cancelled"
            );
        });
    }, [bookings, year, month]);

    const upcomingEvents = useMemo(() => {
        return [...bookings]
            .filter(
                (item) =>
                    item.preferredDate &&
                    item.status !== "Cancelled" &&
                    new Date(item.preferredDate).getTime() >=
                    new Date(new Date().setHours(0, 0, 0, 0)).getTime()
            )
            .sort(
                (a, b) =>
                    new Date(a.preferredDate).getTime() -
                    new Date(b.preferredDate).getTime()
            )
            .slice(0, 6);
    }, [bookings]);

    const getBookingsForDay = (day) => {
        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day
        ).padStart(2, "0")}`;

        return currentMonthBookings.filter((booking) => {
            const bookingDate = new Date(booking.preferredDate);
            const bookingKey = `${bookingDate.getFullYear()}-${String(
                bookingDate.getMonth() + 1
            ).padStart(2, "0")}-${String(bookingDate.getDate()).padStart(
                2,
                "0"
            )}`;

            return bookingKey === dateKey;
        });
    };

    const changeMonth = (direction) => {
        setCurrentDate((prev) => {
            const updated = new Date(prev);
            updated.setMonth(prev.getMonth() + direction);
            return updated;
        });
    };

    const openAddModal = (dateStr) => {
        setSelectedDate(dateStr);
        setForm(getInitialForm(dateStr));
        setShowAddModal(true);
    };

    const openManageModal = (booking) => {
        setSelectedBooking(booking);
        setShowManageModal(true);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        setSelectedDate("");
        setForm(getInitialForm());
    };

    const closeManageModal = () => {
        setShowManageModal(false);
        setSelectedBooking(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => {
            const updated = {
                ...prev,
                [name]: value,
            };

            if (name === "eventType") {
                updated.packageType = "";
                updated.classicMenu = "";
            }

            return updated;
        });
    };

    const handleAddOnToggle = (addonName) => {
        setForm((prev) => {
            const alreadySelected = prev.addOns.includes(addonName);

            return {
                ...prev,
                addOns: alreadySelected
                    ? prev.addOns.filter((item) => item !== addonName)
                    : [...prev.addOns, addonName],
            };
        });
    };

    const handleAddBooking = (e) => {
        e.preventDefault();

        if (
            !form.fullName ||
            !form.eventType ||
            !form.preferredDate ||
            !form.packageType
        ) {
            alert("Please fill in the required booking details.");
            return;
        }

        const storageEmail =
            (form.email || "").trim().toLowerCase() || "walkin@guest.local";
        const scopedKey = `clientBookings_${storageEmail}`;
        const existing = safeParse(scopedKey, []);

        const booking = {
            id: `booking_${Date.now()}`,
            bookingId: `B${String(existing.length + 1).padStart(2, "0")}`,
            ownerName: form.fullName,
            ownerEmail: storageEmail,
            fullName: form.fullName,
            contactNumber: form.contactNumber,
            email: storageEmail,
            eventType: form.eventType,
            preferredDate: form.preferredDate,
            eventDate: form.preferredDate,
            eventTime: form.eventTime,
            venue: form.venue,
            guests: Number(form.guests || 0),
            guestCount: Number(form.guests || 0),
            packageType: form.packageType,
            classicMenu: form.classicMenu,
            addOns: form.addOns,
            themePreference: form.themePreference,
            specialRequests: form.specialRequests,
            packagePrice,
            addOnsTotal,
            estimatedTotal,
            totalAmount: estimatedTotal,
            includedPax: selectedPackage?.includedPax || null,
            pricingType: selectedPackage?.pricingType || "",
            ratePerPax: selectedPackage?.ratePerPax || null,
            excessGuests,
            excessCost,
            status: form.status || "Confirmed",
            source: "admin-manual-booking",
            createdAt: new Date().toLocaleString(),
        };

        localStorage.setItem(scopedKey, JSON.stringify([booking, ...existing]));
        refreshBookings();
        closeAddModal();
        setShowSuccessModal(true);
    };

    const updateSelectedStatus = (status) => {
        if (!selectedBooking) return;

        const keys = Object.keys(localStorage).filter((key) =>
            key.startsWith("clientBookings_")
        );

        let updatedBooking = null;

        keys.forEach((key) => {
            const items = safeParse(key, []);
            const updatedItems = items.map((item) => {
                if (item.id === selectedBooking.id) {
                    updatedBooking = {
                        ...item,
                        status,
                        updatedAt: new Date().toLocaleString(),
                    };
                    return updatedBooking;
                }
                return item;
            });

            localStorage.setItem(key, JSON.stringify(updatedItems));
        });

        refreshBookings();
        if (updatedBooking) {
            setSelectedBooking(updatedBooking);
        }
    };

    const handleDeleteBooking = () => {
        if (!selectedBooking) return;

        const confirmed = window.confirm(
            "Are you sure you want to cancel/delete this booking?"
        );

        if (!confirmed) return;

        const keys = Object.keys(localStorage).filter((key) =>
            key.startsWith("clientBookings_")
        );

        keys.forEach((key) => {
            const items = safeParse(key, []);
            const filtered = items.filter((item) => item.id !== selectedBooking.id);
            localStorage.setItem(key, JSON.stringify(filtered));
        });

        refreshBookings();
        closeManageModal();
    };

    const renderStatusBadge = (status) => {
        const baseClass =
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";

        if (status === "Completed") {
            return (
                <span className={`${baseClass} bg-emerald-100 text-emerald-700`}>
                    Completed
                </span>
            );
        }

        if (status === "Ongoing") {
            return (
                <span className={`${baseClass} bg-amber-100 text-amber-700`}>
                    Ongoing
                </span>
            );
        }

        if (status === "Cancelled") {
            return (
                <span className={`${baseClass} bg-red-100 text-red-700`}>
                    Cancelled
                </span>
            );
        }

        if (status === "Pending") {
            return (
                <span className={`${baseClass} bg-blue-100 text-blue-700`}>
                    Pending
                </span>
            );
        }

        return (
            <span className={`${baseClass} bg-green-100 text-green-700`}>
                Confirmed
            </span>
        );
    };

    const days = [];

    for (let i = 0; i < firstDayIndex; i++) {
        days.push(
            <div
                key={`blank-${i}`}
                className="min-h-[140px] rounded-[22px] border border-transparent"
            />
        );
    }

    for (let day = 1; day <= totalDays; day++) {
        const dayBookings = getBookingsForDay(day);
        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day
        ).padStart(2, "0")}`;
        const isToday = dateKey === todayKey;
        const hasBooking = dayBookings.length > 0;

        days.push(
            <motion.div
                key={day}
                whileHover={{ y: -2 }}
                className={`group relative min-h-[140px] rounded-[22px] border p-3 transition-all duration-200 ${hasBooking
                        ? "border-[#d5b33f] bg-[linear-gradient(180deg,#fff6cf_0%,#f5dea0_100%)] text-[#174c3c] shadow-sm"
                        : "border-[#e8eceb] bg-[#f8faf9] text-[#174c3c] hover:border-[#22b67f]/40 hover:shadow-sm"
                    } ${isToday ? "ring-2 ring-[#0f5b46]/60" : ""}`}
            >
                <div className="flex items-start justify-between">
                    <span className="text-base font-semibold">{day}</span>

                    {hasBooking ? (
                        <button
                            type="button"
                            onClick={() => openManageModal(dayBookings[0])}
                            className="h-3.5 w-3.5 rounded-full bg-[#0f5b46] shadow"
                            title="Manage booking"
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => openAddModal(dateKey)}
                            className="opacity-0 transition group-hover:opacity-100"
                            title="Add booking"
                        >
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0f5b46] shadow-sm">
                                <Plus size={16} />
                            </span>
                        </button>
                    )}
                </div>

                {hasBooking && (
                    <div className="mt-5 space-y-2">
                        <div className="line-clamp-1 text-sm font-bold">
                            {dayBookings[0].eventType || "Booking"}
                        </div>
                        <div className="line-clamp-1 text-xs opacity-80">
                            {dayBookings[0].fullName || "Unnamed client"}
                        </div>
                        <div className="pt-1">
                            {renderStatusBadge(dayBookings[0].status)}
                        </div>
                    </div>
                )}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.08 }}
            className="space-y-6"
        >
            <motion.section
                variants={fadeUp}
                className="overflow-hidden rounded-[30px] border border-[#dce7e2] bg-white shadow-[0_18px_50px_rgba(14,61,47,0.07)]"
            >
                <div className="relative overflow-hidden bg-[linear-gradient(135deg,#07382d_0%,#0c4d3d_34%,#0f6b52_68%,#18a06c_100%)] px-6 py-7 text-white md:px-8">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-12 right-[-30px] h-40 w-40 rounded-full bg-[#d4af37]/20 blur-3xl" />
                        <div className="absolute bottom-[-30px] left-[-20px] h-28 w-28 rounded-full bg-white/10 blur-3xl" />
                    </div>

                    <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
                                <Sparkles size={13} />
                                Event Calendar
                            </div>

                            <h1 className="mt-4 text-3xl font-extrabold md:text-[42px]">
                                Manage Event Schedules
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/85 md:text-[15px]">
                                Monitor all event schedules, create manual bookings, and
                                manage the status of upcoming catering events in one
                                premium calendar workspace.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:w-[420px]">
                            <HeaderMiniCard
                                label="Current Month Bookings"
                                value={currentMonthBookings.length}
                            />
                            <HeaderMiniCard
                                label="Upcoming Events"
                                value={upcomingEvents.length}
                            />
                        </div>
                    </div>
                </div>
            </motion.section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <motion.div
                    variants={fadeUp}
                    className="rounded-[28px] border border-[#e8eceb] bg-white p-5 shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
                >
                    <div className="rounded-[24px] bg-[linear-gradient(135deg,#0f5b46_0%,#138062_100%)] px-5 py-5 text-white">
                        <div className="flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => changeMonth(-1)}
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
                            >
                                <ChevronLeft size={18} />
                                Previous
                            </button>

                            <div className="flex items-center gap-3 text-xl font-bold">
                                <CalendarDays size={22} />
                                <span>{getMonthLabel(currentDate)}</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => changeMonth(1)}
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
                            >
                                Next
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-7 gap-3 pb-3 text-center text-base font-semibold text-[#174c3c]">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                            (day) => (
                                <div key={day}>{day}</div>
                            )
                        )}
                    </div>

                    <div className="grid grid-cols-7 gap-3">{days}</div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-[#174c3c]">
                        <div className="flex items-center gap-2">
                            <span className="h-4 w-4 rounded bg-[#f0d37a]" />
                            <span>Booked</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-4 w-4 rounded border border-[#e5e7eb] bg-[#f8faf9]" />
                            <span>Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-4 w-4 rounded border-2 border-[#0f5b46]" />
                            <span>Today</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={fadeUp}
                    className="overflow-hidden rounded-[28px] border border-[#e8eceb] bg-white shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
                >
                    <div className="bg-[linear-gradient(135deg,#22b67f_0%,#169566_100%)] px-6 py-5 text-lg font-bold text-white">
                        Upcoming Events
                    </div>

                    <div className="space-y-4 p-5">
                        {upcomingEvents.length === 0 ? (
                            <div className="rounded-[22px] border border-dashed border-[#dfe5e3] bg-[#fafafa] px-5 py-10 text-center text-slate-500">
                                No upcoming events yet.
                            </div>
                        ) : (
                            upcomingEvents.map((event) => (
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    type="button"
                                    key={event.id}
                                    onClick={() => openManageModal(event)}
                                    className="w-full rounded-[22px] border border-[#e7ecea] bg-[#f8f9f9] p-5 text-left transition hover:shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-[#174c3c]">
                                                {event.eventType || "Event"}
                                            </h3>
                                            <p className="mt-2 text-base text-slate-600">
                                                {event.fullName || "Unnamed client"}
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-[#b99117]">
                                                {formatDate(event.preferredDate)}
                                            </p>
                                            <p className="mt-2 text-sm text-slate-500">
                                                {event.guests || 0} guests •{" "}
                                                {formatCurrency(event.estimatedTotal)}
                                            </p>
                                        </div>

                                        <div>{renderStatusBadge(event.status)}</div>
                                    </div>
                                </motion.button>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {showAddModal && (
                    <ModalShell onClose={closeAddModal}>
                        <motion.div
                            initial={{ opacity: 0, y: 18, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18, scale: 0.98 }}
                            className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[30px] bg-[#f6f1e7] shadow-2xl"
                        >
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eadfc4] bg-[#f6f1e7] px-8 py-6">
                                <div>
                                    <h2 className="text-4xl font-extrabold text-[#22b67f]">
                                        Add Booking
                                    </h2>
                                    <p className="mt-1 text-slate-500">
                                        Fill in the event details using the same quotation flow
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeAddModal}
                                    className="rounded-full p-2 text-slate-500 transition hover:bg-white/70"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="grid gap-8 p-8 lg:grid-cols-[0.92fr_1.25fr]">
                                <div className="rounded-[28px] bg-gradient-to-br from-[#0b5a43] via-[#0c6048] to-[#094534] p-6 text-white shadow-[0_18px_45px_rgba(11,90,67,0.18)]">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d4af37] text-[#0f4d3c] text-xl font-extrabold">
                                            ✦
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                                                Event Planning
                                            </p>
                                            <h3 className="text-2xl font-extrabold">
                                                Plan your event with us
                                            </h3>
                                        </div>
                                    </div>

                                    <p className="mb-6 text-white/90 leading-8">
                                        Select the actual package, classic menu, and add-ons so
                                        the total booking amount is automatically computed.
                                    </p>

                                    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {[
                                            "Weddings",
                                            "Debuts",
                                            "Birthdays",
                                            "Anniversaries",
                                            "Baptismal celebrations",
                                        ].map((item) => (
                                            <div
                                                key={item}
                                                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium"
                                            >
                                                {item}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mb-6 rounded-[22px] border border-white/10 bg-white/10 p-5">
                                        <h4 className="mb-3 text-xl font-bold text-[#f5c94a]">
                                            Booking Summary
                                        </h4>

                                        <div className="space-y-3 text-sm">
                                            <SummaryRow
                                                label="Selected Date"
                                                value={selectedDate || "Not selected"}
                                            />
                                            <SummaryRow
                                                label="Selected Package"
                                                value={form.packageType || "Not selected"}
                                            />
                                            <SummaryRow
                                                label="Package Coverage"
                                                value={packageCoverageText}
                                            />
                                            <SummaryRow
                                                label="Classic Menu"
                                                value={form.classicMenu || "Not selected"}
                                            />
                                            <SummaryRow
                                                label="Package Price"
                                                value={
                                                    packagePrice
                                                        ? formatCurrency(packagePrice)
                                                        : "—"
                                                }
                                            />
                                            <SummaryRow
                                                label="Add-ons Total"
                                                value={formatCurrency(addOnsTotal)}
                                            />

                                            {!selectedPackage?.pricingType ||
                                                selectedPackage?.pricingType === "perPax" ? null : (
                                                <>
                                                    <SummaryRow
                                                        label="Excess Guests"
                                                        value={excessGuests}
                                                    />
                                                    <SummaryRow
                                                        label="Excess Cost"
                                                        value={formatCurrency(excessCost)}
                                                    />
                                                </>
                                            )}

                                            <div className="flex items-center justify-between gap-4 border-t border-white/20 pt-4">
                                                <span className="font-bold text-base">
                                                    Estimated Total
                                                </span>
                                                <span className="text-xl font-extrabold text-[#f5c94a]">
                                                    {estimatedTotal
                                                        ? formatCurrency(estimatedTotal)
                                                        : "—"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-[22px] border-2 border-[#efd67a] bg-[#fff9ea] p-5 text-[#0f4d3c]">
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#b99117]">
                                            Pricing Note
                                        </p>
                                        <p className="text-sm leading-7">
                                            Standard per-head rate is <strong>₱400 per guest</strong>{" "}
                                            for Birthday, Anniversary, and Baptismal packages.
                                            Wedding and Debut packages use fixed package pricing
                                            with excess guest computation when applicable.
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-[28px] border border-[#ece4d4] bg-white p-7 shadow-[0_18px_45px_rgba(0,0,0,0.06)]">
                                    <div className="mb-8 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#b99117]">
                                                Booking Details
                                            </p>
                                            <h3 className="text-2xl font-extrabold text-[#0f4d3c] sm:text-3xl">
                                                Add Booking Form
                                            </h3>
                                        </div>

                                        <div className="hidden items-center gap-2 rounded-full border border-[#ecd88d] bg-[#f8f3e4] px-4 py-2 md:flex">
                                            <span className="h-2.5 w-2.5 rounded-full bg-[#0f8a61]" />
                                            <span className="text-sm font-medium text-[#0f4d3c]">
                                                Ready to submit
                                            </span>
                                        </div>
                                    </div>

                                    <form onSubmit={handleAddBooking}>
                                        <div className="grid gap-5 md:grid-cols-2">
                                            <Field
                                                label="Full Name"
                                                name="fullName"
                                                value={form.fullName}
                                                onChange={handleFormChange}
                                                placeholder="Enter client name"
                                                required
                                            />

                                            <Field
                                                label="Contact Number"
                                                name="contactNumber"
                                                value={form.contactNumber}
                                                onChange={handleFormChange}
                                                placeholder="Enter contact number"
                                            />

                                            <Field
                                                label="Email Address"
                                                name="email"
                                                value={form.email}
                                                onChange={handleFormChange}
                                                placeholder="Enter email address"
                                            />

                                            <SelectField
                                                label="Event Type"
                                                name="eventType"
                                                value={form.eventType}
                                                onChange={handleFormChange}
                                                options={[
                                                    "Wedding",
                                                    "Debut",
                                                    "Birthday",
                                                    "Anniversary",
                                                    "Baptismal",
                                                ]}
                                                required
                                            />

                                            <Field
                                                label="Preferred Date"
                                                name="preferredDate"
                                                type="date"
                                                value={form.preferredDate}
                                                onChange={handleFormChange}
                                                required
                                            />

                                            <Field
                                                label="Event Time"
                                                name="eventTime"
                                                type="time"
                                                value={form.eventTime}
                                                onChange={handleFormChange}
                                            />

                                            <Field
                                                label="Venue / Location"
                                                name="venue"
                                                value={form.venue}
                                                onChange={handleFormChange}
                                                placeholder="Enter venue or event location"
                                            />

                                            <Field
                                                label="Number of Guests"
                                                name="guests"
                                                type="number"
                                                value={form.guests}
                                                onChange={handleFormChange}
                                                placeholder="Enter number of guests"
                                            />

                                            <SelectField
                                                label="Preferred Package"
                                                name="packageType"
                                                value={form.packageType}
                                                onChange={handleFormChange}
                                                options={availablePackages.map((pkg) => pkg.name)}
                                                required
                                                disabled={!form.eventType}
                                                emptyLabel={
                                                    form.eventType
                                                        ? "Select preferred package"
                                                        : "Select event type first"
                                                }
                                            />

                                            <SelectField
                                                label="Classic Menu"
                                                name="classicMenu"
                                                value={form.classicMenu}
                                                onChange={handleFormChange}
                                                options={classicMenus}
                                            />

                                            <div className="md:col-span-2">
                                                <Field
                                                    label="Theme / Style Preference"
                                                    name="themePreference"
                                                    value={form.themePreference}
                                                    onChange={handleFormChange}
                                                    placeholder="Enter preferred motif, theme, or style"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block">
                                                    <span className="mb-3 block text-sm font-semibold text-[#0f4d3c]">
                                                        Add-ons
                                                    </span>

                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        {addOnOptions.map((item) => {
                                                            const checked = form.addOns.includes(
                                                                item.name
                                                            );

                                                            return (
                                                                <label
                                                                    key={item.name}
                                                                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 transition ${checked
                                                                            ? "border-[#d4af37] bg-[#fff8e6] shadow-sm"
                                                                            : "border-gray-200 bg-white hover:border-[#d4af37]"
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={checked}
                                                                            onChange={() =>
                                                                                handleAddOnToggle(
                                                                                    item.name
                                                                                )
                                                                            }
                                                                            className="accent-[#0f4d3c]"
                                                                        />
                                                                        <span className="font-medium text-[#0f4d3c]">
                                                                            {item.name}
                                                                        </span>
                                                                    </div>

                                                                    <span className="font-bold text-[#b99117]">
                                                                        {formatCurrency(item.price)}
                                                                    </span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </label>
                                            </div>

                                            <div className="md:col-span-2">
                                                <TextAreaField
                                                    label="Special Requests"
                                                    name="specialRequests"
                                                    value={form.specialRequests}
                                                    onChange={handleFormChange}
                                                    placeholder="Add preferred menu, setup, add-ons, or other requests"
                                                />
                                            </div>

                                            <div>
                                                <SelectField
                                                    label="Status"
                                                    name="status"
                                                    value={form.status}
                                                    onChange={handleFormChange}
                                                    options={[
                                                        "Confirmed",
                                                        "Pending",
                                                        "Ongoing",
                                                        "Completed",
                                                    ]}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                                            <button
                                                type="submit"
                                                className="flex-1 rounded-2xl bg-[#0f4d3c] py-3.5 font-bold text-white shadow-md transition hover:bg-[#0c3f31]"
                                            >
                                                Add Booking
                                            </button>

                                            <button
                                                type="button"
                                                onClick={closeAddModal}
                                                className="flex-1 rounded-2xl bg-[#d4af37] py-3.5 text-center font-bold text-[#0b4a3a] shadow-sm transition hover:bg-[#c79f23]"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </ModalShell>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showManageModal && selectedBooking && (
                    <ModalShell onClose={closeManageModal}>
                        <motion.div
                            initial={{ opacity: 0, y: 18, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18, scale: 0.98 }}
                            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[30px] bg-white shadow-2xl"
                        >
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-8 py-6">
                                <div>
                                    <h2 className="text-4xl font-extrabold text-[#22b67f]">
                                        Manage Booking
                                    </h2>
                                    <p className="mt-1 text-slate-500">
                                        Review full booking details and update event status
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeManageModal}
                                    className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8">
                                <div className="rounded-[24px] bg-[#f8faf9] p-6">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <h3 className="text-3xl font-extrabold text-[#174c3c]">
                                                {selectedBooking.eventType || "Booking"}
                                            </h3>
                                            <p className="mt-2 text-lg text-slate-500">
                                                Complete booking details based on your current system
                                            </p>
                                        </div>

                                        <div>{renderStatusBadge(selectedBooking.status)}</div>
                                    </div>

                                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        <InfoCard
                                            icon={<User size={18} />}
                                            label="Full Name"
                                            value={selectedBooking.fullName}
                                        />
                                        <InfoCard
                                            icon={<Phone size={18} />}
                                            label="Contact Number"
                                            value={selectedBooking.contactNumber}
                                        />
                                        <InfoCard
                                            icon={<Mail size={18} />}
                                            label="Email Address"
                                            value={selectedBooking.email}
                                        />
                                        <InfoCard
                                            icon={<PartyPopper size={18} />}
                                            label="Event Type"
                                            value={selectedBooking.eventType}
                                        />
                                        <InfoCard
                                            icon={<CalendarDays size={18} />}
                                            label="Preferred Date"
                                            value={formatDate(selectedBooking.preferredDate)}
                                        />
                                        <InfoCard
                                            icon={<Clock3 size={18} />}
                                            label="Event Time"
                                            value={selectedBooking.eventTime}
                                        />
                                        <InfoCard
                                            icon={<MapPin size={18} />}
                                            label="Venue / Location"
                                            value={selectedBooking.venue}
                                        />
                                        <InfoCard
                                            icon={<Users size={18} />}
                                            label="Number of Guests"
                                            value={selectedBooking.guests}
                                        />
                                        <InfoCard
                                            icon={<FileText size={18} />}
                                            label="Preferred Package"
                                            value={selectedBooking.packageType}
                                        />
                                        <InfoCard
                                            icon={<BadgeCheck size={18} />}
                                            label="Classic Menu"
                                            value={selectedBooking.classicMenu}
                                        />
                                        <InfoCard
                                            icon={<CircleDollarSign size={18} />}
                                            label="Package Price"
                                            value={formatCurrency(selectedBooking.packagePrice)}
                                        />
                                        <InfoCard
                                            icon={<CircleDollarSign size={18} />}
                                            label="Add-ons Total"
                                            value={formatCurrency(selectedBooking.addOnsTotal)}
                                        />
                                        <InfoCard
                                            icon={<CircleDollarSign size={18} />}
                                            label="Estimated Total"
                                            value={formatCurrency(selectedBooking.estimatedTotal)}
                                        />
                                        <InfoCard
                                            icon={<BadgeCheck size={18} />}
                                            label="Pricing Type"
                                            value={selectedBooking.pricingType || "—"}
                                        />
                                        <InfoCard
                                            icon={<Users size={18} />}
                                            label="Included Pax"
                                            value={selectedBooking.includedPax || "—"}
                                        />
                                        <InfoCard
                                            icon={<CircleDollarSign size={18} />}
                                            label="Rate Per Pax"
                                            value={
                                                selectedBooking.ratePerPax
                                                    ? formatCurrency(selectedBooking.ratePerPax)
                                                    : "—"
                                            }
                                        />
                                        <InfoCard
                                            icon={<Users size={18} />}
                                            label="Excess Guests"
                                            value={selectedBooking.excessGuests || 0}
                                        />
                                        <InfoCard
                                            icon={<CircleDollarSign size={18} />}
                                            label="Excess Cost"
                                            value={formatCurrency(selectedBooking.excessCost)}
                                        />
                                        <InfoCard
                                            icon={<BadgeCheck size={18} />}
                                            label="Theme / Style Preference"
                                            value={selectedBooking.themePreference}
                                        />
                                        <InfoCard
                                            icon={<BadgeCheck size={18} />}
                                            label="Status"
                                            value={selectedBooking.status}
                                        />
                                    </div>

                                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                        <LongInfoCard
                                            label="Add-ons"
                                            value={
                                                Array.isArray(selectedBooking.addOns)
                                                    ? selectedBooking.addOns.join(", ")
                                                    : "—"
                                            }
                                        />
                                        <LongInfoCard
                                            label="Special Requests"
                                            value={selectedBooking.specialRequests}
                                        />
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h4 className="text-xl font-bold text-[#174c3c]">
                                        Change Status
                                    </h4>

                                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                                        <ActionButton
                                            label="Mark as Confirmed"
                                            onClick={() => updateSelectedStatus("Confirmed")}
                                            className="border-[#22b67f] text-[#174c3c] hover:bg-[#ecfff7]"
                                        />
                                        <ActionButton
                                            label="Mark as Pending"
                                            onClick={() => updateSelectedStatus("Pending")}
                                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                        />
                                        <ActionButton
                                            label="Mark as Ongoing"
                                            onClick={() => updateSelectedStatus("Ongoing")}
                                            className="border-amber-200 text-amber-700 hover:bg-amber-50"
                                        />
                                        <ActionButton
                                            label="Mark as Completed"
                                            onClick={() => updateSelectedStatus("Completed")}
                                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={handleDeleteBooking}
                                        className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-red-600 px-7 py-4 text-base font-bold text-white transition hover:bg-red-700"
                                    >
                                        <Trash2 size={18} />
                                        Cancel / Delete Booking
                                    </button>

                                    <button
                                        type="button"
                                        onClick={closeManageModal}
                                        className="rounded-[16px] border border-slate-200 px-7 py-4 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </ModalShell>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.96 }}
                            className="w-full max-w-md overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-2xl"
                        >
                            <div className="bg-gradient-to-r from-[#0f5b46] to-[#22b67f] px-6 py-7 text-center text-white">
                                <div className="mb-4 flex justify-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl font-bold">
                                        ✓
                                    </div>
                                </div>

                                <h3 className="text-2xl font-extrabold">
                                    Booking Added Successfully
                                </h3>
                                <p className="mt-1 text-sm text-white/80">
                                    The event has been saved to your calendar.
                                </p>
                            </div>

                            <div className="px-6 py-6 text-center">
                                <p className="text-gray-600">
                                    You can now manage this booking anytime in your admin panel.
                                </p>

                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="mt-6 w-full rounded-2xl bg-[#d4af37] py-3 font-bold text-[#0b4a3a] transition hover:bg-[#c79f23]"
                                >
                                    Continue
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function ModalShell({ children, onClose }) {
    return (
        <div
            className="fixed inset-0 z-[90] overflow-y-auto bg-black/45 px-3 py-4 backdrop-blur-[3px] sm:px-4"
            onClick={onClose}
        >
            <div className="flex min-h-full items-start justify-center">
                <div onClick={(e) => e.stopPropagation()} className="w-full">
                    {children}
                </div>
            </div>
        </div>
    );
}

function HeaderMiniCard({ label, value }) {
    return (
        <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                {label}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-white">{value}</p>
        </div>
    );
}

function SummaryRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-white/75">{label}</span>
            <span className="max-w-[190px] text-right font-semibold">{value}</span>
        </div>
    );
}

function Field({
    label,
    name,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                {label} {required ? <span className="text-red-500">*</span> : null}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
            />
        </div>
    );
}

function SelectField({
    label,
    name,
    value,
    onChange,
    options = [],
    required = false,
    disabled = false,
    emptyLabel,
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                {label} {required ? <span className="text-red-500">*</span> : null}
            </label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 disabled:bg-gray-100"
            >
                <option value="">
                    {emptyLabel || `Select ${label.toLowerCase()}`}
                </option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

function TextAreaField({
    label,
    name,
    value,
    onChange,
    placeholder,
    rows = 5,
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                {label}
            </label>
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className="w-full resize-none rounded-2xl border border-gray-300 px-4 py-3.5 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
            />
        </div>
    );
}

function InfoCard({ icon, label, value }) {
    return (
        <div className="rounded-[18px] border border-[#e7ecea] bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#174c3c]">
                <span>{icon}</span>
                <span>{label}</span>
            </div>
            <p className="mt-2 text-base text-slate-600">{value || "—"}</p>
        </div>
    );
}

function LongInfoCard({ label, value }) {
    return (
        <div className="rounded-[18px] border border-[#e7ecea] bg-white p-4">
            <div className="text-sm font-semibold text-[#174c3c]">{label}</div>
            <p className="mt-2 whitespace-pre-line text-base text-slate-600">
                {value || "—"}
            </p>
        </div>
    );
}

function ActionButton({ label, onClick, className = "" }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-[16px] border px-5 py-4 text-base font-semibold transition ${className}`}
        >
            {label}
        </button>
    );
}

export default AdminCalendar;