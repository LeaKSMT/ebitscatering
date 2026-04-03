import { useMemo, useState } from "react";
import {
    getAdminEmployees,
    getAdminPayrollRecords,
    saveAdminPayrollRecords,
    formatCurrency,
    formatDate,
} from "../utils/AdminData";
import { buildPrintableTable, openPrintWindow } from "../utils/AdminPrint";

function AdminPayroll() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [form, setForm] = useState({
        employeeId: "",
        employeeName: "",
        role: "",
        workUnits: "",
        ratePerUnit: "",
        payoutStatus: "Pending",
    });

    const [deleteTarget, setDeleteTarget] = useState(null);

    const employees = useMemo(() => getAdminEmployees(), [refreshKey]);
    const payrollRecords = useMemo(() => getAdminPayrollRecords(), [refreshKey]);

    const totals = useMemo(() => {
        const totalPayroll = payrollRecords.reduce(
            (sum, item) => sum + Number(item.totalSalary || 0),
            0
        );

        const released = payrollRecords
            .filter((item) => item.payoutStatus === "Paid")
            .reduce((sum, item) => sum + Number(item.totalSalary || 0), 0);

        const pending = payrollRecords
            .filter((item) => item.payoutStatus !== "Paid")
            .reduce((sum, item) => sum + Number(item.totalSalary || 0), 0);

        return { totalPayroll, released, pending };
    }, [payrollRecords]);

    const handleEmployeeSelect = (e) => {
        const employeeId = e.target.value;
        const employee = employees.find((item) => item.id === employeeId);

        if (!employee) {
            setForm((prev) => ({
                ...prev,
                employeeId,
                employeeName: "",
                role: "",
            }));
            return;
        }

        setForm((prev) => ({
            ...prev,
            employeeId,
            employeeName: employee.fullName,
            role: employee.role || "",
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddPayroll = (e) => {
        e.preventDefault();

        const totalSalary =
            Number(form.workUnits || 0) * Number(form.ratePerUnit || 0);

        const newRecord = {
            id: `payroll_${Date.now()}`,
            employeeId: form.employeeId,
            employeeName: form.employeeName,
            role: form.role,
            workUnits: Number(form.workUnits || 0),
            ratePerUnit: Number(form.ratePerUnit || 0),
            totalSalary,
            payoutStatus: form.payoutStatus,
            createdAt: new Date().toISOString(),
        };

        saveAdminPayrollRecords([newRecord, ...payrollRecords]);

        setForm({
            employeeId: "",
            employeeName: "",
            role: "",
            workUnits: "",
            ratePerUnit: "",
            payoutStatus: "Pending",
        });

        setRefreshKey((prev) => prev + 1);
    };

    const openDeleteModal = (record) => {
        setDeleteTarget(record);
    };

    const closeDeleteModal = () => {
        setDeleteTarget(null);
    };

    const confirmDeletePayroll = () => {
        if (!deleteTarget) return;

        const updatedRecords = payrollRecords.filter(
            (item) => item.id !== deleteTarget.id
        );

        saveAdminPayrollRecords(updatedRecords);
        setDeleteTarget(null);
        setRefreshKey((prev) => prev + 1);
    };

    const handlePrintPayroll = () => {
        openPrintWindow({
            title: "Payroll Report",
            subtitle: "Employee payroll and payout summary",
            summaryCards: [
                { label: "Payroll Records", value: payrollRecords.length },
                { label: "Total Payroll", value: formatCurrency(totals.totalPayroll) },
                { label: "Released", value: formatCurrency(totals.released) },
                { label: "Pending", value: formatCurrency(totals.pending) },
            ],
            content: `
                <div class="section">
                    <h2 class="section-title">Payroll Records</h2>
                    ${buildPrintableTable(
                [
                    "Employee",
                    "Role",
                    "Work Units",
                    "Rate",
                    "Total Salary",
                    "Status",
                    "Date",
                ],
                payrollRecords.map((item) => [
                    item.employeeName,
                    item.role || "—",
                    item.workUnits,
                    formatCurrency(item.ratePerUnit),
                    formatCurrency(item.totalSalary),
                    item.payoutStatus,
                    formatDate(item.createdAt),
                ])
            )}
                </div>
            `,
        });
    };

    return (
        <>
            <div className="space-y-6">
                <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <SummaryCard
                        title="Total Payroll"
                        value={formatCurrency(totals.totalPayroll)}
                    />
                    <SummaryCard
                        title="Released"
                        value={formatCurrency(totals.released)}
                    />
                    <SummaryCard
                        title="Pending"
                        value={formatCurrency(totals.pending)}
                    />
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.15fr] gap-6">
                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-[#0f4d3c]">
                            Add Payroll Record
                        </h2>

                        <form onSubmit={handleAddPayroll} className="mt-5 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                    Employee
                                </label>
                                <select
                                    value={form.employeeId}
                                    onChange={handleEmployeeSelect}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                    required
                                >
                                    <option value="">Select employee</option>
                                    {employees.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {employee.fullName}
                                        </option>
                                    ))}
                                </select>
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
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                    Work Units
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    name="workUnits"
                                    value={form.workUnits}
                                    onChange={handleChange}
                                    placeholder="No. of days or events worked"
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                    Rate Per Unit
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    name="ratePerUnit"
                                    value={form.ratePerUnit}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0f4d3c] mb-2">
                                    Payout Status
                                </label>
                                <select
                                    name="payoutStatus"
                                    value={form.payoutStatus}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d4af37]"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-2xl bg-[#d4af37] px-5 py-3 font-bold text-[#0b4a3a] hover:bg-[#c79f23] transition"
                            >
                                Save Payroll Record
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-[#0f4d3c]">
                                    Payroll Management
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Employee payroll records and payout summary.
                                </p>
                            </div>

                            <button
                                onClick={handlePrintPayroll}
                                className="rounded-2xl bg-[#0b4a3a] px-5 py-3 font-bold text-white hover:bg-[#09382d] transition"
                            >
                                Generate PDF Report
                            </button>
                        </div>

                        {payrollRecords.length === 0 ? (
                            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                                No payroll records yet.
                            </div>
                        ) : (
                            <div className="mt-6 overflow-x-auto">
                                <table className="w-full min-w-[980px] text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-left text-gray-500">
                                            <th className="py-3 font-semibold">Employee</th>
                                            <th className="py-3 font-semibold">Role</th>
                                            <th className="py-3 font-semibold">Work Units</th>
                                            <th className="py-3 font-semibold">Rate</th>
                                            <th className="py-3 font-semibold">Total Salary</th>
                                            <th className="py-3 font-semibold">Status</th>
                                            <th className="py-3 font-semibold">Date</th>
                                            <th className="py-3 font-semibold text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payrollRecords.map((item) => (
                                            <tr key={item.id} className="border-b border-gray-50">
                                                <td className="py-4 font-semibold text-[#0f4d3c]">
                                                    {item.employeeName}
                                                </td>
                                                <td className="py-4">{item.role}</td>
                                                <td className="py-4">{item.workUnits}</td>
                                                <td className="py-4">
                                                    {formatCurrency(item.ratePerUnit)}
                                                </td>
                                                <td className="py-4 font-semibold text-[#10b981]">
                                                    {formatCurrency(item.totalSalary)}
                                                </td>
                                                <td className="py-4">
                                                    <span className="inline-flex rounded-full bg-[#fff8e6] px-3 py-1 text-xs font-semibold text-[#b99117]">
                                                        {item.payoutStatus}
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    {formatDate(item.createdAt)}
                                                </td>
                                                <td className="py-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => openDeleteModal(item)}
                                                        className="inline-flex items-center justify-center rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <DeleteModal
                isOpen={!!deleteTarget}
                title="Delete Payroll Record"
                message={
                    deleteTarget
                        ? `Are you sure you want to delete the payroll record for ${deleteTarget.employeeName}?`
                        : ""
                }
                onCancel={closeDeleteModal}
                onConfirm={confirmDeletePayroll}
            />
        </>
    );
}

function SummaryCard({ title, value }) {
    return (
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">{title}</p>
            <h2 className="text-3xl font-extrabold text-[#0f4d3c] mt-2">{value}</h2>
        </div>
    );
}

function DeleteModal({ isOpen, title, message, onCancel, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
            <div className="w-full max-w-md rounded-[28px] bg-white shadow-2xl border border-gray-100 p-6 animate-[fadeIn_.2s_ease-out]">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v4m0 4h.01M10.29 3.86l-7.09 12.3A1 1 0 004.06 18h15.88a1 1 0 00.86-1.84l-7.09-12.3a1 1 0 00-1.72 0z"
                            />
                        </svg>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#0f4d3c]">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-gray-500">{message}</p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="rounded-2xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminPayroll;