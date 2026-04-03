import { useMemo, useState } from "react";
import {
    getActiveClientsFromBookings,
    getAllQuotations,
    getAllInquiries,
    formatCurrency,
    formatDate,
} from "../utils/AdminData";
import { buildPrintableTable, openPrintWindow } from "../utils/AdminPrint";

function AdminClients() {
    const [selectedClient, setSelectedClient] = useState(null);

    const bookingClients = useMemo(() => getActiveClientsFromBookings(), []);
    const quotations = useMemo(() => getAllQuotations(), []);
    const inquiries = useMemo(() => getAllInquiries(), []);

    const clients = useMemo(() => {
        const map = new Map();

        bookingClients.forEach((client) => {
            map.set(client.clientKey, {
                clientKey: client.clientKey,
                fullName: client.fullName || "Client",
                email: client.email || "",
                contactNumber: client.contactNumber || "",
                bookings: client.bookings || [],
                quotations: [],
                inquiries: [],
            });
        });

        quotations.forEach((quote) => {
            const key = quote.ownerEmail || quote.email || quote.fullName;
            if (!map.has(key)) {
                map.set(key, {
                    clientKey: key,
                    fullName: quote.fullName || "Client",
                    email: quote.email || quote.ownerEmail || "",
                    contactNumber: quote.contactNumber || "",
                    bookings: [],
                    quotations: [],
                    inquiries: [],
                });
            }
            map.get(key).quotations.push(quote);
        });

        inquiries.forEach((inq) => {
            const key = inq.ownerEmail || inq.email || inq.fullName;
            if (!map.has(key)) {
                map.set(key, {
                    clientKey: key,
                    fullName: inq.fullName || "Client",
                    email: inq.email || inq.ownerEmail || "",
                    contactNumber: inq.contactNumber || "",
                    bookings: [],
                    quotations: [],
                    inquiries: [],
                });
            }
            map.get(key).inquiries.push(inq);
        });

        return [...map.values()].sort((a, b) =>
            a.fullName.localeCompare(b.fullName)
        );
    }, [bookingClients, quotations, inquiries]);

    const handlePrintClients = () => {
        openPrintWindow({
            title: "Client Profiles Report",
            subtitle: "Current and past client information summary",
            summaryCards: [
                { label: "Total Clients", value: clients.length },
                {
                    label: "Clients with Bookings",
                    value: clients.filter((item) => item.bookings.length > 0).length,
                },
                {
                    label: "Clients with Quotations",
                    value: clients.filter((item) => item.quotations.length > 0).length,
                },
                {
                    label: "Clients with Inquiries",
                    value: clients.filter((item) => item.inquiries.length > 0).length,
                },
            ],
            content: `
                <div class="section">
                    <h2 class="section-title">Client Records</h2>
                    ${buildPrintableTable(
                [
                    "Client Name",
                    "Email",
                    "Contact Number",
                    "Bookings",
                    "Quotations",
                    "Inquiries",
                ],
                clients.map((client) => [
                    client.fullName,
                    client.email || "—",
                    client.contactNumber || "—",
                    client.bookings.length,
                    client.quotations.length,
                    client.inquiries.length,
                ])
            )}
                </div>
            `,
        });
    };

    return (
        <div className="space-y-6">
            <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[#0f4d3c]">
                            Client Profiles
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Complete client history based on bookings, quotations, and inquiries.
                        </p>
                    </div>

                    <button
                        onClick={handlePrintClients}
                        className="rounded-2xl bg-[#0b4a3a] px-5 py-3 font-bold text-white hover:bg-[#09382d] transition"
                    >
                        Generate PDF Report
                    </button>
                </div>
            </section>

            {clients.length === 0 ? (
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 text-center text-gray-500">
                    No client records yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6">
                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                        <h3 className="text-2xl font-bold text-[#0f4d3c] mb-4">
                            Client List
                        </h3>

                        <div className="space-y-3">
                            {clients.map((client) => (
                                <button
                                    key={client.clientKey}
                                    onClick={() => setSelectedClient(client)}
                                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${selectedClient?.clientKey === client.clientKey
                                        ? "border-[#d4af37] bg-[#fff8e6]"
                                        : "border-gray-200 bg-white hover:bg-gray-50"
                                        }`}
                                >
                                    <h4 className="font-bold text-[#0f4d3c]">
                                        {client.fullName}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {client.email || "No email"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {client.bookings.length} booking(s) •{" "}
                                        {client.quotations.length} quotation(s) •{" "}
                                        {client.inquiries.length} inquiry/inquiries
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                        {!selectedClient ? (
                            <div className="h-full flex items-center justify-center text-center text-gray-500 min-h-[400px]">
                                Select a client to view complete details.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-3xl font-extrabold text-[#0f4d3c]">
                                        {selectedClient.fullName}
                                    </h3>
                                    <p className="text-gray-500 mt-2">
                                        {selectedClient.email || "No email"} •{" "}
                                        {selectedClient.contactNumber || "No contact number"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <MiniStat
                                        label="Bookings"
                                        value={selectedClient.bookings.length}
                                    />
                                    <MiniStat
                                        label="Quotations"
                                        value={selectedClient.quotations.length}
                                    />
                                    <MiniStat
                                        label="Inquiries"
                                        value={selectedClient.inquiries.length}
                                    />
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-[#0f4d3c] mb-3">
                                        Booking History
                                    </h4>
                                    {selectedClient.bookings.length === 0 ? (
                                        <p className="text-sm text-gray-500">
                                            No booking history.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedClient.bookings.map((booking) => (
                                                <div
                                                    key={booking.id}
                                                    className="rounded-2xl border border-gray-200 bg-[#f8fafc] p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="font-bold text-[#0f4d3c]">
                                                                {booking.bookingId} • {booking.eventType}
                                                            </p>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {formatDate(booking.eventDate)} •{" "}
                                                                {booking.guestCount} guests
                                                            </p>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {booking.venue || "No venue"}
                                                            </p>
                                                        </div>

                                                        <div className="text-right">
                                                            <p className="font-bold text-[#10b981]">
                                                                {formatCurrency(booking.totalAmount)}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1 capitalize">
                                                                {booking.status}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-[#0f4d3c] mb-3">
                                        Quotation History
                                    </h4>
                                    {selectedClient.quotations.length === 0 ? (
                                        <p className="text-sm text-gray-500">
                                            No quotation history.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedClient.quotations.map((quote) => (
                                                <div
                                                    key={quote.id}
                                                    className="rounded-2xl border border-gray-200 bg-[#f8fafc] p-4"
                                                >
                                                    <p className="font-bold text-[#0f4d3c]">
                                                        {quote.quotationId} • {quote.eventType}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {formatDate(quote.preferredDate)} •{" "}
                                                        {quote.guests} guests
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1 capitalize">
                                                        {quote.status}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-[#0f4d3c] mb-3">
                                        Inquiry History
                                    </h4>
                                    {selectedClient.inquiries.length === 0 ? (
                                        <p className="text-sm text-gray-500">
                                            No inquiry history.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedClient.inquiries.map((inquiry) => (
                                                <div
                                                    key={inquiry.id}
                                                    className="rounded-2xl border border-gray-200 bg-[#f8fafc] p-4"
                                                >
                                                    <p className="font-bold text-[#0f4d3c]">
                                                        {inquiry.inquiryId} • {inquiry.eventType}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {formatDate(inquiry.preferredDate)} •{" "}
                                                        {inquiry.guests} guests
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1 capitalize">
                                                        {inquiry.status}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function MiniStat({ label, value }) {
    return (
        <div className="rounded-2xl bg-[#f8fafc] border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <h4 className="text-2xl font-extrabold text-[#0f4d3c] mt-2">{value}</h4>
        </div>
    );
}

export default AdminClients;