import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    X,
    ClipboardCheck,
    SquarePen,
    CalendarDays,
    MapPin,
    User,
    Users,
    FileText,
    Sparkles,
    BadgeCheck,
    ClipboardList,
    ArrowRight,
    UserPlus,
    Star,
} from "lucide-react";
import {
    getAllBookings,
    updateRecordInCollection,
    formatCurrency,
    formatDate,
} from "../utils/AdminData";

function AdminEventManagement() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [staffInput, setStaffInput] = useState({});
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showEvaluateModal, setShowEvaluateModal] = useState(false);
    const [editForm, setEditForm] = useState(getEditInitialState());
    const [evaluationForm, setEvaluationForm] = useState(getEvaluationInitialState());
    const [popup, setPopup] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });

    const bookings = useMemo(() => {
        return getAllBookings().filter(
            (item) => String(item.status || "").toLowerCase() !== "cancelled"
        );
    }, [refreshKey]);

    const refresh = () => setRefreshKey((prev) => prev + 1);

    const openPopup = (type, title, message) => {
        setPopup({
            open: true,
            type,
            title,
            message,
        });
    };

    const closePopup = () => {
        setPopup({
            open: false,
            type: "success",
            title: "",
            message: "",
        });
    };

    const handleAddStaff = (booking) => {
        const value = (staffInput[booking.id] || "").trim();
        if (!value) return;

        updateRecordInCollection("clientBookings", booking.id, (record) => ({
            ...record,
            assignedStaff: [...(record.assignedStaff || []), value],
        }));

        setStaffInput((prev) => ({ ...prev, [booking.id]: "" }));
        refresh();
        openPopup("success", "Staff Added", "The staff member was added successfully.");
    };

    const handleRemoveStaff = (booking, staffName) => {
        updateRecordInCollection("clientBookings", booking.id, (record) => ({
            ...record,
            assignedStaff: (record.assignedStaff || []).filter((name) => name !== staffName),
        }));

        refresh();
        openPopup("success", "Staff Removed", "The staff member was removed successfully.");
    };

    const handleOpenEdit = (booking) => {
        setSelectedBooking(booking);
        setEditForm({
            fullName: booking.fullName || "",
            contactNumber: booking.contactNumber || "",
            email: booking.email || "",
            eventType: booking.eventType || "",
            eventDate: booking.eventDate ? toInputDate(booking.eventDate) : "",
            eventTime: booking.eventTime || "",
            venue: booking.venue || "",
            guestCount: booking.guestCount || "",
            packageType: booking.packageType || "",
            classicMenu: booking.classicMenu || "",
            themePreference: booking.themePreference || "",
            specialRequests: booking.specialRequests || "",
            status: capitalizeStatus(booking.status || "confirmed"),
        });
        setShowEditModal(true);
    };

    const handleOpenEvaluate = (booking) => {
        setSelectedBooking(booking);
        setEvaluationForm({
            status: capitalizeStatus(booking.status || "confirmed"),
            eventOutcome: booking.eventOutcome || "",
            evaluationNotes: booking.evaluationNotes || "",
            clientSatisfaction: booking.clientSatisfaction || "Satisfied",
            staffPerformance: booking.staffPerformance || "Good",
        });
        setShowEvaluateModal(true);
    };

    const handleCloseEdit = () => {
        setSelectedBooking(null);
        setShowEditModal(false);
        setEditForm(getEditInitialState());
    };

    const handleCloseEvaluate = () => {
        setSelectedBooking(null);
        setShowEvaluateModal(false);
        setEvaluationForm(getEvaluationInitialState());
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEvaluationChange = (e) => {
        const { name, value } = e.target;
        setEvaluationForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        if (!selectedBooking) return;

        updateRecordInCollection("clientBookings", selectedBooking.id, (record) => ({
            ...record,
            fullName: editForm.fullName,
            contactNumber: editForm.contactNumber,
            email: editForm.email,
            ownerEmail: editForm.email || record.ownerEmail || "",
            eventType: editForm.eventType,
            eventDate: editForm.eventDate,
            preferredDate: editForm.eventDate,
            eventTime: editForm.eventTime,
            venue: editForm.venue,
            guestCount: Number(editForm.guestCount || 0),
            guests: Number(editForm.guestCount || 0),
            packageType: editForm.packageType,
            classicMenu: editForm.classicMenu,
            themePreference: editForm.themePreference,
            specialRequests: editForm.specialRequests,
            status: String(editForm.status || "Confirmed").toLowerCase(),
            updatedAt: new Date().toLocaleString(),
        }));

        refresh();
        handleCloseEdit();
        openPopup(
            "success",
            "Event Updated",
            "The booking details were updated successfully."
        );
    };

    const handleSaveEvaluation = (e) => {
        e.preventDefault();
        if (!selectedBooking) return;

        updateRecordInCollection("clientBookings", selectedBooking.id, (record) => ({
            ...record,
            status: String(evaluationForm.status || "Completed").toLowerCase(),
            eventOutcome: evaluationForm.eventOutcome,
            evaluationNotes: evaluationForm.evaluationNotes,
            clientSatisfaction: evaluationForm.clientSatisfaction,
            staffPerformance: evaluationForm.staffPerformance,
            evaluatedAt: new Date().toLocaleString(),
        }));

        refresh();
        handleCloseEvaluate();
        openPopup(
            "success",
            "Event Evaluated",
            "The event evaluation was saved successfully."
        );
    };

    return (
        <>
            <div className="space-y-6">
                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="overflow-hidden rounded-[30px] border border-[#dce7e2] bg-white shadow-[0_18px_50px_rgba(14,61,47,0.07)]"
                >
                    <div className="relative overflow-hidden bg-[linear-gradient(135deg,#07382d_0%,#0c4d3d_34%,#0f6b52_68%,#18a06c_100%)] px-6 py-7 text-white md:px-8">
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -top-12 right-[-30px] h-40 w-40 rounded-full bg-[#d4af37]/20 blur-3xl" />
                            <div className="absolute bottom-[-30px] left-[-20px] h-28 w-28 rounded-full bg-white/10 blur-3xl" />
                        </div>

                        <motion.div
                            animate={{ x: ["-30%", "130%"] }}
                            transition={{
                                duration: 7,
                                repeat: Infinity,
                                repeatDelay: 2,
                                ease: "linear",
                            }}
                            className="pointer-events-none absolute inset-y-0 left-[-35%] w-[28%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        />

                        <div className="relative">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
                                <Sparkles size={13} />
                                Event Management
                            </div>

                            <h1 className="mt-4 text-3xl font-extrabold md:text-[42px]">
                                Admin Event Management
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/85 md:text-[15px]">
                                Manage booking schedules, assign staff, update event details,
                                and evaluate completed events in one polished workspace.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 border-t border-[#e8efeb] bg-[#fbfdfc] px-5 py-5 md:grid-cols-3 md:px-6">
                        <SummaryCard
                            icon={ClipboardList}
                            label="Active Events"
                            value={bookings.length}
                            delay={0.05}
                        />
                        <SummaryCard
                            icon={CalendarDays}
                            label="Upcoming Schedule"
                            value={
                                bookings.filter((item) => {
                                    const d = new Date(item.eventDate || "");
                                    return !Number.isNaN(d.getTime());
                                }).length
                            }
                            delay={0.1}
                        />
                        <SummaryCard
                            icon={BadgeCheck}
                            label="Confirmed Events"
                            value={
                                bookings.filter(
                                    (item) =>
                                        String(item.status || "").toLowerCase() === "confirmed"
                                ).length
                            }
                            delay={0.15}
                        />
                    </div>
                </motion.section>

                {bookings.length > 0 ? (
                    bookings.map((booking, index) => (
                        <MotionCard key={booking.id} delay={index * 0.06}>
                            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                                <div>
                                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b99117]">
                                                Event Record
                                            </p>
                                            <h2 className="mt-1 text-2xl font-extrabold text-[#0f4d3c] md:text-3xl">
                                                {booking.eventType || "Event"}
                                            </h2>
                                        </div>

                                        <span
                                            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusChip(
                                                booking.status
                                            )}`}
                                        >
                                            {capitalizeStatus(booking.status)}
                                        </span>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        <InfoCard
                                            icon={FileText}
                                            label="Booking ID"
                                            value={booking.bookingId}
                                        />
                                        <InfoCard
                                            icon={User}
                                            label="Client"
                                            value={booking.fullName}
                                        />
                                        <InfoCard
                                            icon={CalendarDays}
                                            label="Event Date"
                                            value={formatDate(booking.eventDate)}
                                        />
                                        <InfoCard
                                            icon={MapPin}
                                            label="Venue"
                                            value={booking.venue || "Not set"}
                                        />
                                        <InfoCard
                                            icon={Users}
                                            label="Guests"
                                            value={booking.guestCount}
                                        />
                                        <InfoCard
                                            icon={ClipboardCheck}
                                            label="Total Amount"
                                            value={formatCurrency(booking.totalAmount)}
                                            highlight
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        transition={{ duration: 0.2 }}
                                        className="rounded-[24px] border border-[#e4ece8] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-5 shadow-sm"
                                    >
                                        <div className="mb-3 flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0f4d3c]">
                                                <UserPlus size={19} />
                                            </div>
                                            <h3 className="text-xl font-extrabold text-[#0f4d3c]">
                                                Assigned Staff
                                            </h3>
                                        </div>

                                        {Array.isArray(booking.assignedStaff) &&
                                            booking.assignedStaff.length > 0 ? (
                                            <div className="space-y-2">
                                                {booking.assignedStaff.map((staff, staffIndex) => (
                                                    <motion.div
                                                        key={staff}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{
                                                            duration: 0.25,
                                                            delay: staffIndex * 0.03,
                                                        }}
                                                        className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3"
                                                    >
                                                        <span className="font-medium text-[#0f4d3c]">
                                                            {staff}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                handleRemoveStaff(booking, staff)
                                                            }
                                                            className="text-sm font-bold text-red-500 transition hover:scale-105 hover:text-red-600"
                                                        >
                                                            Remove
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-[#dce7e2] bg-[#f8fbf9] px-4 py-5 text-sm text-slate-500">
                                                No assigned staff yet.
                                            </div>
                                        )}

                                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                            <input
                                                type="text"
                                                value={staffInput[booking.id] || ""}
                                                onChange={(e) =>
                                                    setStaffInput((prev) => ({
                                                        ...prev,
                                                        [booking.id]: e.target.value,
                                                    }))
                                                }
                                                placeholder="Enter staff name"
                                                className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                                            />
                                            <motion.button
                                                whileHover={{ y: -2, scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleAddStaff(booking)}
                                                className="rounded-2xl bg-[#0b4a3a] px-5 py-3 font-bold text-white transition hover:bg-[#09382d]"
                                            >
                                                Add Staff
                                            </motion.button>
                                        </div>
                                    </motion.div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <motion.button
                                            whileHover={{ y: -2, scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleOpenEdit(booking)}
                                            className="w-full rounded-2xl bg-[#0b4a3a] px-5 py-3 font-bold text-white transition hover:bg-[#09382d]"
                                        >
                                            Edit Event Details
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ y: -2, scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleOpenEvaluate(booking)}
                                            className="w-full rounded-2xl bg-[#d4af37] px-5 py-3 font-bold text-[#0b4a3a] transition hover:bg-[#c79f23]"
                                        >
                                            Evaluate Event
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </MotionCard>
                    ))
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[24px] border border-gray-100 bg-white p-8 text-center text-gray-500 shadow-sm"
                    >
                        No booking records yet.
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {showEditModal && selectedBooking && (
                    <ModalShell onClose={handleCloseEdit}>
                        <motion.div
                            initial={{ opacity: 0, y: 24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 24, scale: 0.98 }}
                            transition={{ duration: 0.24 }}
                            className="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-gray-100 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.20)]"
                        >
                            <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 px-5 py-5 backdrop-blur-md sm:px-8">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0f4d3c] text-white">
                                            <SquarePen size={22} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b99117]">
                                                Event Management
                                            </p>
                                            <h2 className="truncate text-2xl font-extrabold text-[#0f4d3c] sm:text-3xl">
                                                Edit Event Details
                                            </h2>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Update booking information without cutting off the modal
                                                view.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCloseEdit}
                                        className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <form
                                onSubmit={handleSaveEdit}
                                className="flex min-h-0 flex-1 flex-col"
                            >
                                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
                                    <div className="mb-5 grid gap-4 md:grid-cols-3">
                                        <PreviewInfo
                                            label="Booking ID"
                                            value={selectedBooking.bookingId || "—"}
                                        />
                                        <PreviewInfo
                                            label="Current Status"
                                            value={capitalizeStatus(selectedBooking.status)}
                                        />
                                        <PreviewInfo
                                            label="Current Amount"
                                            value={formatCurrency(selectedBooking.totalAmount)}
                                        />
                                    </div>

                                    <div className="grid gap-5 md:grid-cols-2">
                                        <Field
                                            label="Full Name"
                                            name="fullName"
                                            value={editForm.fullName}
                                            onChange={handleEditChange}
                                        />
                                        <Field
                                            label="Contact Number"
                                            name="contactNumber"
                                            value={editForm.contactNumber}
                                            onChange={handleEditChange}
                                        />
                                        <Field
                                            label="Email Address"
                                            name="email"
                                            value={editForm.email}
                                            onChange={handleEditChange}
                                        />
                                        <Field
                                            label="Event Type"
                                            name="eventType"
                                            value={editForm.eventType}
                                            onChange={handleEditChange}
                                        />
                                        <Field
                                            label="Event Date"
                                            name="eventDate"
                                            type="date"
                                            value={editForm.eventDate}
                                            onChange={handleEditChange}
                                        />
                                        <Field
                                            label="Event Time"
                                            name="eventTime"
                                            type="time"
                                            value={editForm.eventTime}
                                            onChange={handleEditChange}
                                        />
                                        <Field
                                            label="Venue / Location"
                                            name="venue"
                                            value={editForm.venue}
                                            onChange={handleEditChange}
                                        />
                                        <Field
                                            label="Number of Guests"
                                            name="guestCount"
                                            type="number"
                                            value={editForm.guestCount}
                                            onChange={handleEditChange}
                                        />
                                        <Field
                                            label="Preferred Package"
                                            name="packageType"
                                            value={editForm.packageType}
                                            onChange={handleEditChange}
                                        />
                                        <Field
                                            label="Classic Menu"
                                            name="classicMenu"
                                            value={editForm.classicMenu}
                                            onChange={handleEditChange}
                                        />
                                        <Field
                                            label="Theme / Style Preference"
                                            name="themePreference"
                                            value={editForm.themePreference}
                                            onChange={handleEditChange}
                                        />
                                        <SelectField
                                            label="Status"
                                            name="status"
                                            value={editForm.status}
                                            onChange={handleEditChange}
                                            options={[
                                                "Confirmed",
                                                "Pending",
                                                "Ongoing",
                                                "Completed",
                                                "Cancelled",
                                            ]}
                                        />
                                    </div>

                                    <div className="mt-5">
                                        <TextAreaField
                                            label="Special Requests"
                                            name="specialRequests"
                                            value={editForm.specialRequests}
                                            onChange={handleEditChange}
                                        />
                                    </div>
                                </div>

                                <div className="sticky bottom-0 z-20 border-t border-gray-100 bg-white/95 px-5 py-4 backdrop-blur-md sm:px-8">
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <motion.button
                                            whileHover={{ y: -2, scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0f4d3c] py-3.5 font-bold text-white transition hover:bg-[#0c3f31]"
                                        >
                                            Save Changes
                                            <ArrowRight size={17} />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ y: -2, scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="button"
                                            onClick={handleCloseEdit}
                                            className="flex-1 rounded-2xl bg-[#d4af37] py-3.5 font-bold text-[#0b4a3a] transition hover:bg-[#c79f23]"
                                        >
                                            Cancel
                                        </motion.button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </ModalShell>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showEvaluateModal && selectedBooking && (
                    <ModalShell onClose={handleCloseEvaluate}>
                        <motion.div
                            initial={{ opacity: 0, y: 24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 24, scale: 0.98 }}
                            transition={{ duration: 0.24 }}
                            className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[30px] border border-gray-100 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.20)]"
                        >
                            <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 px-5 py-5 backdrop-blur-md sm:px-8">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d4af37] text-[#0f4d3c]">
                                            <ClipboardCheck size={22} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b99117]">
                                                Event Evaluation
                                            </p>
                                            <h2 className="truncate text-2xl font-extrabold text-[#0f4d3c] sm:text-3xl">
                                                Evaluate Event
                                            </h2>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Review the event outcome and save evaluation notes.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCloseEvaluate}
                                        className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <form
                                onSubmit={handleSaveEvaluation}
                                className="flex min-h-0 flex-1 flex-col"
                            >
                                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <PreviewInfo
                                            label="Client"
                                            value={selectedBooking.fullName || "—"}
                                        />
                                        <PreviewInfo
                                            label="Event Type"
                                            value={selectedBooking.eventType || "—"}
                                        />
                                        <PreviewInfo
                                            label="Event Date"
                                            value={formatDate(selectedBooking.eventDate)}
                                        />
                                    </div>

                                    <SelectField
                                        label="Event Status"
                                        name="status"
                                        value={evaluationForm.status}
                                        onChange={handleEvaluationChange}
                                        options={[
                                            "Confirmed",
                                            "Pending",
                                            "Ongoing",
                                            "Completed",
                                            "Cancelled",
                                        ]}
                                    />

                                    <SelectField
                                        label="Client Satisfaction"
                                        name="clientSatisfaction"
                                        value={evaluationForm.clientSatisfaction}
                                        onChange={handleEvaluationChange}
                                        options={[
                                            "Very Satisfied",
                                            "Satisfied",
                                            "Neutral",
                                            "Unsatisfied",
                                        ]}
                                    />

                                    <SelectField
                                        label="Staff Performance"
                                        name="staffPerformance"
                                        value={evaluationForm.staffPerformance}
                                        onChange={handleEvaluationChange}
                                        options={[
                                            "Excellent",
                                            "Good",
                                            "Average",
                                            "Needs Improvement",
                                        ]}
                                    />

                                    <TextAreaField
                                        label="Event Outcome"
                                        name="eventOutcome"
                                        value={evaluationForm.eventOutcome}
                                        onChange={handleEvaluationChange}
                                        placeholder="Describe the overall outcome of the event"
                                    />

                                    <TextAreaField
                                        label="Evaluation Notes"
                                        name="evaluationNotes"
                                        value={evaluationForm.evaluationNotes}
                                        onChange={handleEvaluationChange}
                                        placeholder="Add admin remarks, observations, or recommendations"
                                    />
                                </div>

                                <div className="sticky bottom-0 z-20 border-t border-gray-100 bg-white/95 px-5 py-4 backdrop-blur-md sm:px-8">
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <motion.button
                                            whileHover={{ y: -2, scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0f4d3c] py-3.5 font-bold text-white transition hover:bg-[#0c3f31]"
                                        >
                                            Save Evaluation
                                            <Star size={17} />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ y: -2, scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="button"
                                            onClick={handleCloseEvaluate}
                                            className="flex-1 rounded-2xl bg-[#d4af37] py-3.5 font-bold text-[#0b4a3a] transition hover:bg-[#c79f23]"
                                        >
                                            Cancel
                                        </motion.button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </ModalShell>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {popup.open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.97 }}
                            className="w-full max-w-md overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.25)]"
                        >
                            <div
                                className={`px-6 py-5 text-white ${popup.type === "success"
                                        ? "bg-gradient-to-r from-[#0f4d3c] via-[#11614c] to-[#22b67f]"
                                        : "bg-gradient-to-r from-[#b91c1c] via-[#dc2626] to-[#ef4444]"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
                                        {popup.type === "success" ? (
                                            <ClipboardCheck size={30} />
                                        ) : (
                                            <X size={30} />
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                                            System Update
                                        </p>
                                        <h3 className="mt-1 text-2xl font-extrabold">
                                            {popup.title}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-6">
                                <p className="text-[15px] leading-7 text-gray-600">
                                    {popup.message}
                                </p>

                                <motion.button
                                    whileHover={{ y: -2, scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={closePopup}
                                    className={`mt-6 w-full rounded-2xl px-5 py-3.5 font-bold text-white transition ${popup.type === "success"
                                            ? "bg-[#0f4d3c] hover:bg-[#0c3f31]"
                                            : "bg-red-500 hover:bg-red-600"
                                        }`}
                                >
                                    Okay
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function ModalShell({ children, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] overflow-y-auto bg-black/45 px-3 py-4 backdrop-blur-[3px] sm:px-4"
            onClick={onClose}
        >
            <div className="flex min-h-full items-start justify-center">
                <div onClick={(e) => e.stopPropagation()} className="w-full">
                    {children}
                </div>
            </div>
        </motion.div>
    );
}

function SummaryCard({ icon: Icon, label, value, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay }}
            whileHover={{ y: -4 }}
            className="rounded-[22px] border border-[#e2ebe7] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#edf8f3_0%,#dff1e8_100%)] text-[#0f4d3c]">
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {label}
                    </p>
                    <h3 className="mt-1 text-2xl font-extrabold text-[#0f4d3c]">
                        {value}
                    </h3>
                </div>
            </div>
        </motion.div>
    );
}

function MotionCard({ children, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.38, delay, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="rounded-[28px] border border-[#dce7e2] bg-white p-6 shadow-[0_14px_36px_rgba(14,61,47,0.06)] transition-shadow hover:shadow-[0_18px_42px_rgba(14,61,47,0.10)]"
        >
            {children}
        </motion.div>
    );
}

function InfoCard({ icon: Icon, label, value, highlight = false }) {
    return (
        <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.18 }}
            className="rounded-[22px] border border-[#e4ece8] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] p-4 shadow-sm"
        >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0f4d3c]">
                <Icon size={18} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                {label}
            </p>
            <p
                className={`mt-2 text-base font-bold ${highlight ? "text-[#b99117]" : "text-[#0f4d3c]"
                    }`}
            >
                {value || "—"}
            </p>
        </motion.div>
    );
}

function PreviewInfo({ label, value }) {
    return (
        <div className="rounded-[20px] border border-[#e4ece8] bg-[#f8fbf9] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                {label}
            </p>
            <p className="mt-2 text-base font-bold text-[#0f4d3c]">{value || "—"}</p>
        </div>
    );
}

function getEditInitialState() {
    return {
        fullName: "",
        contactNumber: "",
        email: "",
        eventType: "",
        eventDate: "",
        eventTime: "",
        venue: "",
        guestCount: "",
        packageType: "",
        classicMenu: "",
        themePreference: "",
        specialRequests: "",
        status: "Confirmed",
    };
}

function getEvaluationInitialState() {
    return {
        status: "Completed",
        eventOutcome: "",
        evaluationNotes: "",
        clientSatisfaction: "Satisfied",
        staffPerformance: "Good",
    };
}

function toInputDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toISOString().split("T")[0];
}

function capitalizeStatus(status = "") {
    const normalized = String(status).toLowerCase();
    if (!normalized) return "Confirmed";
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getStatusChip(status = "") {
    const normalized = String(status).toLowerCase();

    if (normalized === "confirmed" || normalized === "completed") {
        return "bg-[#ecf8f2] text-[#0f7a51]";
    }

    if (normalized === "pending" || normalized === "ongoing") {
        return "bg-[#fff8e8] text-[#b07d12]";
    }

    if (normalized === "cancelled") {
        return "bg-[#fef2f2] text-[#dc2626]";
    }

    return "bg-[#eef2f7] text-[#64748b]";
}

function Field({
    label,
    name,
    value,
    onChange,
    type = "text",
    placeholder = "",
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
            />
        </div>
    );
}

function SelectField({ label, name, value, onChange, options = [] }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                {label}
            </label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
            >
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
    placeholder = "",
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

export default AdminEventManagement;