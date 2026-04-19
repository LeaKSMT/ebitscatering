import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    getAdminEmployees,
    saveAdminEmployees,
} from "../utils/AdminData";
import { buildPrintableTable, openPrintWindow } from "../utils/AdminPrint";
import {
    Sparkles,
    Users,
    UserPlus,
    BadgeCheck,
    BriefcaseBusiness,
    Mail,
    Phone,
    Trash2,
    FileSpreadsheet,
} from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
};

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

    const availableCount = employees.filter(
        (item) => item.status === "Available"
    ).length;
    const busyCount = employees.filter((item) => item.status === "Busy").length;
    const inactiveCount = employees.filter(
        (item) => item.status === "Inactive"
    ).length;

    return (
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
                            Employee Management
                        </div>

                        <h1 className="mt-4 text-3xl font-extrabold md:text-[42px]">
                            Staff Records & Workforce Overview
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/85 md:text-[15px]">
                            Add employees, monitor availability, and manage staff records
                            using a polished and defense-ready employee workspace.
                        </p>
                    </div>
                </div>
            </motion.section>

            <motion.section
                variants={fadeUp}
                transition={{ duration: 0.46, ease: "easeOut" }}
                className="grid gap-4 md:grid-cols-4"
            >
                <StatCard icon={Users} label="Total Employees" value={employees.length} delay={0.04} />
                <StatCard icon={BadgeCheck} label="Available" value={availableCount} delay={0.1} />
                <StatCard icon={BriefcaseBusiness} label="Busy" value={busyCount} delay={0.16} />
                <StatCard icon={Mail} label="Inactive" value={inactiveCount} delay={0.22} />
            </motion.section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                <motion.div
                    variants={fadeUp}
                    transition={{ duration: 0.46, ease: "easeOut" }}
                    className="rounded-[28px] border border-[#dce7e2] bg-white p-6 shadow-[0_14px_36px_rgba(14,61,47,0.06)]"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7e3] text-[#b99117]">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-[#0f4d3c]">
                                Add Employee
                            </h2>
                            <p className="text-sm text-slate-500">
                                Register new staff members into the system
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleAddEmployee} className="mt-5 space-y-4">
                        <Field
                            label="Full Name"
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            required
                        />
                        <Field
                            label="Role"
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            placeholder="Chef, Server, Coordinator, etc."
                            required
                        />
                        <Field
                            label="Contact Number"
                            name="contactNumber"
                            value={form.contactNumber}
                            onChange={handleChange}
                        />
                        <Field
                            label="Email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                        />

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#0f4d3c]">
                                Status
                            </label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                            >
                                <option value="Available">Available</option>
                                <option value="Busy">Busy</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <motion.button
                            whileHover={{ y: -2, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full rounded-2xl bg-[#d4af37] px-5 py-3 font-bold text-[#0b4a3a] transition hover:bg-[#c79f23]"
                        >
                            Add Employee
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
                                Employee Management
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Review, organize, and delete employee records.
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ y: -2, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handlePrintEmployees}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#0b4a3a] px-5 py-3 font-bold text-white transition hover:bg-[#09382d]"
                        >
                            <FileSpreadsheet size={18} />
                            Generate PDF Report
                        </motion.button>
                    </div>

                    {employees.length === 0 ? (
                        <div className="mt-6 rounded-[24px] border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-slate-500">
                            No employees yet.
                        </div>
                    ) : (
                        <div className="mt-6 space-y-3">
                            <AnimatePresence>
                                {employees.map((employee, index) => (
                                    <motion.div
                                        key={employee.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 16 }}
                                        transition={{ duration: 0.38, delay: index * 0.04, ease: "easeOut" }}
                                        whileHover={{ y: -3 }}
                                        className="rounded-2xl border border-gray-200 bg-[#f8fafc] p-4 transition-shadow hover:shadow-md"
                                    >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                            <div>
                                                <h4 className="font-bold text-[#0f4d3c]">
                                                    {employee.fullName}
                                                </h4>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {employee.role || "No role"}
                                                </p>
                                                <div className="mt-2 space-y-1 text-sm text-slate-500">
                                                    <p className="flex items-center gap-2">
                                                        <Phone size={14} />
                                                        {employee.contactNumber || "No contact number"}
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <Mail size={14} />
                                                        {employee.email || "No email"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex rounded-full bg-[#fff8e6] px-3 py-1 text-xs font-semibold text-[#b99117]">
                                                    {employee.status || "Available"}
                                                </span>

                                                <motion.button
                                                    whileHover={{ y: -2, scale: 1.01 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleDeleteEmployee(employee.id)}
                                                    className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-600"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </section>
        </motion.div>
    );
}

function StatCard({ icon: Icon, label, value, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="rounded-[22px] border border-[#dce7e2] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf8f3] text-[#0f4d3c]">
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-sm text-slate-500">{label}</p>
                    <h3 className="mt-1 text-3xl font-extrabold text-[#0f4d3c]">
                        {value}
                    </h3>
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

export default AdminEmployees;