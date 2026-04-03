import { useMemo, useState } from "react";
import {
    getAllBookings,
    updateRecordInCollection,
    formatCurrency,
    formatDate,
} from "../utils/AdminData";
import {
    CalendarDays,
    FileText,
    MapPin,
    Phone,
    User,
    Users,
    X,
    ClipboardCheck,
    SquarePen,
} from "lucide-react";

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
        <div className="space-y-6">
            {bookings.length > 0 ? (
                bookings.map((booking) => (
                    <div
                        key={booking.id}
                        className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6"
                    >
                        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-5">
                                    <h2 className="text-3xl font-extrabold text-[#0f4d3c]">
                                        {booking.eventType}
                                    </h2>
                                    <span className="inline-flex rounded-full bg-[#0b4a3a] text-white px-3 py-1 text-xs font-bold capitalize">
                                        {capitalizeStatus(booking.status)}
                                    </span>
                                </div>

                                <div className="grid sm:grid-cols-3 gap-y-5 gap-x-6 text-sm">
                                    <InfoItem label="Booking ID" value={booking.bookingId} />
                                    <InfoItem label="Client" value={booking.fullName} />
                                    <InfoItem
                                        label="Event Date"
                                        value={formatDate(booking.eventDate)}
                                    />
                                    <InfoItem
                                        label="Venue"
                                        value={booking.venue || "Not set"}
                                    />
                                    <InfoItem
                                        label="Guests"
                                        value={booking.guestCount}
                                    />
                                    <InfoItem
                                        label="Total Amount"
                                        value={formatCurrency(booking.totalAmount)}
                                        highlight
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-[22px] bg-[#f8fafc] p-5">
                                    <h3 className="text-2xl font-bold text-[#0f4d3c] mb-3">
                                        Assigned Staff
                                    </h3>

                                    {booking.assignedStaff.length > 0 ? (
                                        <div className="space-y-2">
                                            {booking.assignedStaff.map((staff) => (
                                                <div
                                                    key={staff}
                                                    className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3"
                                                >
                                                    <span className="text-[#0f4d3c] font-medium">{staff}</span>
                                                    <button
                                                        onClick={() => handleRemoveStaff(booking, staff)}
                                                        className="text-sm font-bold text-red-500 hover:text-red-600"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No assigned staff yet.</p>
                                    )}

                                    <div className="mt-4 flex gap-3">
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
                                            className="flex-1 rounded-2xl border border-gray-300 px-4 py-3"
                                        />
                                        <button
                                            onClick={() => handleAddStaff(booking)}
                                            className="rounded-2xl bg-[#0b4a3a] px-5 py-3 font-bold text-white hover:bg-[#09382d] transition"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleOpenEdit(booking)}
                                        className="w-full rounded-2xl bg-[#0b4a3a] text-white py-3 font-bold hover:bg-[#09382d] transition"
                                    >
                                        Edit Event Details
                                    </button>

                                    <button
                                        onClick={() => handleOpenEvaluate(booking)}
                                        className="w-full rounded-2xl bg-[#d4af37] text-[#0b4a3a] py-3 font-bold hover:bg-[#c79f23] transition"
                                    >
                                        Evaluate Event
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 text-center text-gray-500">
                    No booking records yet.
                </div>
            )}

            {showEditModal && selectedBooking && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4 py-6">
                    <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[30px] bg-white shadow-2xl border border-gray-100">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-8 py-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-[#0f4d3c] text-white flex items-center justify-center">
                                    <SquarePen size={22} />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.24em] text-[#b99117] font-semibold">
                                        Event Management
                                    </p>
                                    <h2 className="text-3xl font-extrabold text-[#0f4d3c]">
                                        Edit Event Details
                                    </h2>
                                </div>
                            </div>

                            <button
                                onClick={handleCloseEdit}
                                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="p-8">
                            <div className="grid md:grid-cols-2 gap-5">
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
                                    options={["Confirmed", "Pending", "Ongoing", "Completed", "Cancelled"]}
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

                            <div className="mt-8 flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 rounded-2xl bg-[#0f4d3c] text-white py-3.5 font-bold hover:bg-[#0c3f31] transition"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseEdit}
                                    className="flex-1 rounded-2xl bg-[#d4af37] text-[#0b4a3a] py-3.5 font-bold hover:bg-[#c79f23] transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEvaluateModal && selectedBooking && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4 py-6">
                    <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-[30px] bg-white shadow-2xl border border-gray-100">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-8 py-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-[#d4af37] text-[#0f4d3c] flex items-center justify-center">
                                    <ClipboardCheck size={22} />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.24em] text-[#b99117] font-semibold">
                                        Event Evaluation
                                    </p>
                                    <h2 className="text-3xl font-extrabold text-[#0f4d3c]">
                                        Evaluate Event
                                    </h2>
                                </div>
                            </div>

                            <button
                                onClick={handleCloseEvaluate}
                                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEvaluation} className="p-8 space-y-5">
                            <SelectField
                                label="Event Status"
                                name="status"
                                value={evaluationForm.status}
                                onChange={handleEvaluationChange}
                                options={["Confirmed", "Pending", "Ongoing", "Completed", "Cancelled"]}
                            />

                            <SelectField
                                label="Client Satisfaction"
                                name="clientSatisfaction"
                                value={evaluationForm.clientSatisfaction}
                                onChange={handleEvaluationChange}
                                options={["Very Satisfied", "Satisfied", "Neutral", "Unsatisfied"]}
                            />

                            <SelectField
                                label="Staff Performance"
                                name="staffPerformance"
                                value={evaluationForm.staffPerformance}
                                onChange={handleEvaluationChange}
                                options={["Excellent", "Good", "Average", "Needs Improvement"]}
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

                            <div className="flex gap-4 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 rounded-2xl bg-[#0f4d3c] text-white py-3.5 font-bold hover:bg-[#0c3f31] transition"
                                >
                                    Save Evaluation
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseEvaluate}
                                    className="flex-1 rounded-2xl bg-[#d4af37] text-[#0b4a3a] py-3.5 font-bold hover:bg-[#c79f23] transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {popup.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4">
                    <div className="w-full max-w-md rounded-[28px] bg-white shadow-[0_25px_60px_rgba(0,0,0,0.25)] border border-gray-100 overflow-hidden">
                        <div
                            className={`px-6 py-5 text-white ${popup.type === "success"
                                    ? "bg-gradient-to-r from-[#0f4d3c] via-[#11614c] to-[#22b67f]"
                                    : "bg-gradient-to-r from-[#b91c1c] via-[#dc2626] to-[#ef4444]"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-full bg-white/15 flex items-center justify-center">
                                    {popup.type === "success" ? (
                                        <ClipboardCheck size={30} />
                                    ) : (
                                        <X size={30} />
                                    )}
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-[0.25em] text-white/80 font-semibold">
                                        System Update
                                    </p>
                                    <h3 className="mt-1 text-2xl font-extrabold">
                                        {popup.title}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-6">
                            <p className="text-gray-600 leading-7 text-[15px]">
                                {popup.message}
                            </p>

                            <button
                                onClick={closePopup}
                                className={`mt-6 w-full rounded-2xl px-5 py-3.5 font-bold text-white transition ${popup.type === "success"
                                        ? "bg-[#0f4d3c] hover:bg-[#0c3f31]"
                                        : "bg-red-500 hover:bg-red-600"
                                    }`}
                            >
                                Okay
                            </button>
                        </div>
                    </div>
                </div>
            )}
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

function InfoItem({ label, value, highlight = false }) {
    return (
        <div>
            <p className="text-gray-500">{label}:</p>
            <p className={`font-semibold ${highlight ? "text-[#d4af37]" : "text-[#0f4d3c]"}`}>
                {value || "—"}
            </p>
        </div>
    );
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
            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
            />
        </div>
    );
}

function SelectField({ label, name, value, onChange, options = [] }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                {label}
            </label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
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
            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                {label}
            </label>
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition resize-none"
            />
        </div>
    );
}

export default AdminEventManagement;