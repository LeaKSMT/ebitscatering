import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function safeParse(key, fallback = []) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function getClientUser() {
    try {
        return (
            JSON.parse(localStorage.getItem("clientUser")) ||
            JSON.parse(localStorage.getItem("user")) ||
            {}
        );
    } catch {
        return {};
    }
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function Inquiry() {
    const navigate = useNavigate();
    const clientUser = useMemo(() => getClientUser(), []);

    const [form, setForm] = useState({
        fullName: clientUser?.name || "",
        email: clientUser?.email || "",
        contactNumber: "",
        eventType: "",
        preferredDate: "",
        guests: "",
        message: "",
    });

    const [submittedInquiry, setSubmittedInquiry] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const inquiryId = `INQ-${Date.now()}`;
        const ownerEmail = form.email.trim().toLowerCase();
        const scopedKey = ownerEmail
            ? `clientInquiries_${ownerEmail}`
            : "clientInquiries_guest";

        const newInquiry = {
            id: inquiryId,
            inquiryId,
            ownerEmail,
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            contactNumber: form.contactNumber.trim(),
            eventType: form.eventType,
            preferredDate: form.preferredDate,
            guests: Number(form.guests || 0),
            message: form.message.trim(),
            status: "New",
            adminReply: "",
            createdAt: new Date().toISOString(),
        };

        const scopedInquiries = safeParse(scopedKey, []);
        localStorage.setItem(
            scopedKey,
            JSON.stringify([newInquiry, ...scopedInquiries])
        );

        const adminInquiries = safeParse("adminInquiries", []);
        localStorage.setItem(
            "adminInquiries",
            JSON.stringify([newInquiry, ...adminInquiries])
        );

        setSubmittedInquiry(newInquiry);

        setForm({
            fullName: clientUser?.name || "",
            email: clientUser?.email || "",
            contactNumber: "",
            eventType: "",
            preferredDate: "",
            guests: "",
            message: "",
        });
    };

    return (
        <div className="min-h-screen bg-[#F4F1EA]">
            <nav className="bg-[#0b4d3b] text-white h-[86px] px-8 md:px-14 flex items-center justify-between shadow-md">
                <Link to="/" className="leading-none">
                    <h1 className="text-[26px] font-bold text-yellow-400">
                        Ebit&apos;s Catering
                    </h1>
                    <p className="text-[13px] text-white mt-1">For making parties better</p>
                </Link>

                <div className="hidden md:flex items-center gap-9 text-[15px] font-medium">
                    <Link to="/" className="hover:text-yellow-400 transition">
                        Home
                    </Link>
                    <Link to="/packages" className="hover:text-yellow-400 transition">
                        Packages
                    </Link>
                    <Link to="/login" className="hover:text-yellow-400 transition">
                        Login
                    </Link>
                </div>
            </nav>

            <section className="px-6 md:px-16 py-12">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-8">
                    <div className="bg-gradient-to-br from-[#0B4F3A] to-[#0E5B43] rounded-[30px] p-8 md:p-10 text-white">
                        <p className="uppercase tracking-[0.22em] text-sm text-white/70 font-semibold">
                            Start an Inquiry
                        </p>
                        <h1 className="text-4xl md:text-5xl font-extrabold mt-3 leading-tight">
                            Tell us about your <span className="text-[#D4AF37]">event</span>
                        </h1>
                        <p className="mt-5 text-white/85 text-lg leading-8">
                            Submit your inquiry here so our team can review your event details
                            and guide you to the best package, quotation, and next step.
                        </p>

                        <div className="mt-8 space-y-4 text-white/90">
                            <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                                <p className="font-semibold">What to include</p>
                                <p className="mt-2 text-sm leading-7">
                                    Full Name, Email, Contact Number, Event Type, Preferred Date,
                                    Number of Guests, and Special Requests.
                                </p>
                            </div>

                            <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                                <p className="font-semibold">What happens next</p>
                                <p className="mt-2 text-sm leading-7">
                                    Your inquiry will appear in the admin Inquiry Management page,
                                    where it can be reviewed, replied to, and converted into a quotation.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 p-8">
                        {submittedInquiry ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto rounded-full bg-[#edf8f3] flex items-center justify-center text-[#0B4F3A] text-3xl font-bold">
                                    ✓
                                </div>

                                <h2 className="text-3xl font-bold text-[#0f4d3c] mt-5">
                                    Inquiry Submitted
                                </h2>

                                <p className="text-gray-600 mt-3 leading-7">
                                    Your inquiry has been saved successfully.
                                </p>

                                <div className="mt-6 text-left bg-[#f9fafb] rounded-[24px] border border-gray-100 p-5 space-y-2">
                                    <p>
                                        <span className="font-semibold text-[#0f4d3c]">Inquiry ID:</span>{" "}
                                        {submittedInquiry.inquiryId}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-[#0f4d3c]">Event Type:</span>{" "}
                                        {submittedInquiry.eventType}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-[#0f4d3c]">Preferred Date:</span>{" "}
                                        {formatDate(submittedInquiry.preferredDate)}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-[#0f4d3c]">Guests:</span>{" "}
                                        {submittedInquiry.guests}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-[#0f4d3c]">Status:</span>{" "}
                                        {submittedInquiry.status}
                                    </p>
                                </div>

                                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={() => setSubmittedInquiry(null)}
                                        className="px-6 py-3 rounded-2xl bg-[#D4AF37] text-[#0B4F3A] font-bold hover:brightness-95 transition"
                                    >
                                        Submit Another Inquiry
                                    </button>

                                    <button
                                        onClick={() => navigate("/")}
                                        className="px-6 py-3 rounded-2xl border border-gray-300 text-[#0f4d3c] font-semibold hover:bg-gray-50 transition"
                                    >
                                        Back to Home
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <h2 className="text-3xl font-bold text-[#0f4d3c]">
                                        Inquiry Form
                                    </h2>
                                    <p className="text-gray-500 mt-2">
                                        Fill out the details below.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={form.fullName}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#D4AF37]"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#D4AF37]"
                                                placeholder="Enter your email"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                                Contact Number
                                            </label>
                                            <input
                                                type="text"
                                                name="contactNumber"
                                                value={form.contactNumber}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#D4AF37]"
                                                placeholder="09XXXXXXXXX"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                                Event Type
                                            </label>
                                            <select
                                                name="eventType"
                                                value={form.eventType}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#D4AF37]"
                                            >
                                                <option value="">Select event type</option>
                                                <option value="Wedding">Wedding</option>
                                                <option value="Debut">Debut</option>
                                                <option value="Birthday">Birthday</option>
                                                <option value="Anniversary">Anniversary</option>
                                                <option value="Baptismal">Baptismal</option>
                                                <option value="Corporate">Corporate</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                                Preferred Date
                                            </label>
                                            <input
                                                type="date"
                                                name="preferredDate"
                                                value={form.preferredDate}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#D4AF37]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                                Number of Guests
                                            </label>
                                            <input
                                                type="number"
                                                name="guests"
                                                value={form.guests}
                                                onChange={handleChange}
                                                required
                                                min="1"
                                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#D4AF37]"
                                                placeholder="Enter guest count"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                            Message / Special Requests
                                        </label>
                                        <textarea
                                            name="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            rows="5"
                                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#D4AF37] resize-none"
                                            placeholder="Tell us more about your event, preferred package, theme, or special requests."
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            type="submit"
                                            className="flex-1 rounded-2xl bg-[#D4AF37] text-[#0B4F3A] font-bold py-3 hover:brightness-95 transition"
                                        >
                                            Submit Inquiry
                                        </button>

                                        <Link
                                            to="/packages"
                                            className="flex-1 rounded-2xl border border-gray-300 text-center text-[#0f4d3c] font-semibold py-3 hover:bg-gray-50 transition"
                                        >
                                            View Packages
                                        </Link>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Inquiry;