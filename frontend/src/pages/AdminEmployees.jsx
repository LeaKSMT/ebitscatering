import { useMemo, useState } from "react";
import {
    getAdminEmployees,
    saveAdminEmployees,
} from "../utils/AdminData";
import { buildPrintableTable, openPrintWindow } from "../utils/AdminPrint";

function AdminEmployees() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [form, setForm] = useState({
        fullName: "",
        role: "",
        contactNumber: "",
        email: "",
        status: "Available",
    });

    const employees = useMemo(() => getAdminEmployees(), [refreshKey]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddEmployee = (e) => {
        e.preventDefault();

        const newEmployee = {
            id: `employee_${Date.now()}`,
            ...form,
            createdAt: new Date().toISOString(),
        };

        saveAdminEmployees([newEmployee, ...employees]);
        setForm({
            fullName: "",
            role: "",
            contactNumber: "",
            email: "",
            status: "Available",
        });
        setRefreshKey((prev) => prev + 1);
    };

    const handleDeleteEmployee = (id) => {
        const confirmed = window.confirm("Delete this employee?");
        if (!confirmed) return;

        const updated = employees.filter((item) => item.id !== id);
        saveAdminEmployees(updated);
        setRefreshKey((prev) => prev + 1);
    };

    const handlePrintEmployees = () => {
        openPrintWindow({
            title: "Employees Report",
            subtitle: "Current employee list and status",
            summaryCards: [
                { label: "Total Employees", value: employees.length },
                {
                    label: "Available",
                    value: employees.filter((item) => item.status === "Available").length,
                },
                {
                    label: "Busy",
                    value: employees.filter((item) => item.status === "Busy").length,
                },
                {
                    label: "Inactive",
                    value: employees.filter((item) => item.status === "Inactive").length,
                },
            ],
            content: `
                <div class="section">
                    <h2 class="section-title">Employee Records</h2>
                    ${buildPrintableTable(
                ["Full Name", "Role", "Contact Number", "Email", "Status"],
                employees.map((item) => [
                    item.fullName,
                    item.role || "—",
                    item.contactNumber || "—",
                    item.email || "—",
                    item.status || "—",
                ])
            )}
                </div>
            `,
        });
    };

    return (
        <div className="space-y-6">
            <section className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.15fr] gap-6">
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-[#0f4d3c]">
                        Add Employee
                    </h2>

                    <form onSubmit={handleAddEmployee} className="mt-5 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                Role
                            </label>
                            <input
                                type="text"
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                placeholder="Chef, Server, Coordinator, etc."
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                required
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
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                Status
                            </label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                            >
                                <option value="Available">Available</option>
                                <option value="Busy">Busy</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-2xl bg-[#d4af37] px-5 py-3 font-bold text-[#0b4a3a] hover:bg-[#c79f23] transition"
                        >
                            Add Employee
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-[#0f4d3c]">
                                Employee Management
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Add, review, and delete employee records.
                            </p>
                        </div>

                        <button
                            onClick={handlePrintEmployees}
                            className="rounded-2xl bg-[#0b4a3a] px-5 py-3 font-bold text-white hover:bg-[#09382d] transition"
                        >
                            Generate PDF Report
                        </button>
                    </div>

                    {employees.length === 0 ? (
                        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                            No employees yet.
                        </div>
                    ) : (
                        <div className="mt-6 space-y-3">
                            {employees.map((employee) => (
                                <div
                                    key={employee.id}
                                    className="rounded-2xl border border-gray-200 bg-[#f8fafc] p-4"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div>
                                            <h4 className="font-bold text-[#0f4d3c]">
                                                {employee.fullName}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {employee.role || "No role"}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {employee.contactNumber || "No contact number"} •{" "}
                                                {employee.email || "No email"}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex rounded-full bg-[#fff8e6] px-3 py-1 text-xs font-semibold text-[#b99117]">
                                                {employee.status || "Available"}
                                            </span>

                                            <button
                                                onClick={() => handleDeleteEmployee(employee.id)}
                                                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default AdminEmployees;