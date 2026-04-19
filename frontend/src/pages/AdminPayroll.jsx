import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    getAdminEmployees,
    getAdminPayrollRecords,
    saveAdminPayrollRecords,
    formatCurrency,
    formatDate,
} from "../utils/AdminData";
import { buildPrintableTable, openPrintWindow } from "../utils/AdminPrint";
import {
    Sparkles,
    WalletCards,
    BadgeDollarSign,
    CircleDollarSign,
    FileSpreadsheet,
    AlertTriangle,
    Trash2,
} from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
};

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
            <motion.div
                initial="hidden"
                animate="show"
                transition={{ staggerChildren: 0.1 }}
                className="space-y-6"
            >
                <motion.section
                    variants={fadeUp}
                    transition={{ duration: 0.46, ease: "easeOut" }}
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
                                Payroll Management
                            </div>

                            <h1 className="mt-4 text-3xl font-extrabold md:text-[42px]">
                                Employee Payroll Management
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/85 md:text-[15px]">
                                Manage compensation records, compute payout totals, and
                                maintain payroll history in one premium admin workspace.
                            </p>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    variants={fadeUp}
                    transition={{ duration: 0.46, ease: "easeOut" }}
                    className="grid grid-cols-1 gap-5 md:grid-cols-3"
                >
                    <SummaryCard
                        icon={WalletCards}
                        title="Total Payroll"
                        value={formatCurrency(totals.totalPayroll)}
                        delay={0.04}
                    />
                    <SummaryCard
                        icon={BadgeDollarSign}
                        title="Released"
                        value={formatCurrency(totals.released)}
                        delay={0.1}
                    />
                    <SummaryCard
                        icon={CircleDollarSign}
                        title="Pending"
                        value={formatCurrency(totals.pending)}
                        delay={0.16}
                    />
                </motion.section>

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                    <motion.div
                        variants={fadeUp}
                        transition={{ duration: 0.46, ease: "easeOut" }}
                        className="rounded-[28px] border border-[#dce7e2] bg-white p-6 shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
                    >
                        <h2 className="text-2xl font-extrabold text-[#0f4d3c]">
                            Add Payroll Record
                        </h2>

                        <form onSubmit={handleAddPayroll} className="mt-5 space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                                    Employee
                                </label>
                                <select
                                    value={form.employeeId}
                                    onChange={handleEmployeeSelect}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
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

                            <Field
                                label="Role"
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                required
                            />

                            <Field
                                label="Work Units"
                                name="workUnits"
                                type="number"
                                value={form.workUnits}
                                onChange={handleChange}
                                placeholder="No. of days or events worked"
                                required
                            />

                            <Field
                                label="Rate Per Unit"
                                name="ratePerUnit"
                                type="number"
                                value={form.ratePerUnit}
                                onChange={handleChange}
                                required
                            />

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                                    Payout Status
                                </label>
                                <select
                                    name="payoutStatus"
                                    value={form.payoutStatus}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </div>

                            <motion.button
                                whileHover={{ y: -2, scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full rounded-2xl bg-[#d4af37] px-5 py-3 font-bold text-[#0b4a3a] transition hover:bg-[#c79f23]"
                            >
                                Save Payroll Record
                            </motion.button>
                        </form>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        transition={{ duration: 0.46, ease: "easeOut" }}
                        className="rounded-[28px] border border-[#dce7e2] bg-white p-6 shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
                    >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-2xl font-extrabold text-[#0f4d3c]">
                                    Payroll Management
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Employee payroll records and payout summary.
                                </p>
                            </div>

                            <motion.button
                                whileHover={{ y: -2, scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handlePrintPayroll}
                                className="inline-flex items-center gap-2 rounded-2xl bg-[#0b4a3a] px-5 py-3 font-bold text-white transition hover:bg-[#09382d]"
                            >
                                <FileSpreadsheet size={18} />
                                Generate PDF Report
                            </motion.button>
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
                                            <th className="py-3 text-center font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payrollRecords.map((item, index) => (
                                            <motion.tr
                                                key={item.id}
                                                initial={{ opacity: 0, y: 14 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.38, delay: index * 0.04, ease: "easeOut" }}
                                                className="border-b border-gray-50 transition hover:bg-[#fbfdfc]"
                                            >
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
                                                    <motion.button
                                                        whileHover={{ y: -2, scale: 1.01 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        type="button"
                                                        onClick={() => openDeleteModal(item)}
                                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-600"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </motion.button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                </section>
            </motion.div>

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

function SummaryCard({ icon: Icon, title, value, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_14px_36px_rgba(14,61,47,0.06)] transition-shadow hover:shadow-md"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0f4d3c]">
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <h2 className="mt-2 text-3xl font-extrabold text-[#0f4d3c]">
                        {value}
                    </h2>
                </div>
            </div>
        </motion.div>
    );
}

function Field({
    label,
    name,
    value,
    onChange,
    placeholder = "",
    type = "text",
    required = false,
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                {label}
            </label>
            <input
                type={type}
                min={type === "number" ? "1" : undefined}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
            />
        </div>
    );
}

function DeleteModal({ isOpen, title, message, onCancel, onConfirm }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.97 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                        className="w-full max-w-md rounded-[28px] border border-gray-100 bg-white p-6 shadow-2xl"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                                <AlertTriangle size={24} />
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-[#0f4d3c]">{title}</h3>
                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    {message}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <motion.button
                                whileHover={{ y: -2, scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={onCancel}
                                className="rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ y: -2, scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={onConfirm}
                                className="rounded-2xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-600"
                            >
                                Delete
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default AdminPayroll;