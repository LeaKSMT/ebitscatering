import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";

function AdminLayout() {
    const location = useLocation();

    const getSafeJson = (key) => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    };

    const adminAuth = localStorage.getItem("adminAuth") === "true";
    const adminUser = getSafeJson("adminUser");
    const genericUser = getSafeJson("user");

    const isAdmin =
        adminAuth &&
        (adminUser?.role === "admin" || genericUser?.role === "admin");

    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("adminTheme");
        return savedTheme === "dark" ? "dark" : "light";
    });

    useEffect(() => {
        localStorage.setItem("adminTheme", theme);
        document.body.setAttribute("data-theme", theme);
    }, [theme]);

    const handleToggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    if (!isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div
            className={`admin-shell admin-theme-${theme} relative min-h-screen overflow-x-hidden transition-colors duration-300`}
        >
            <div className="pointer-events-none absolute inset-0 admin-shell-bg">
                <div className="admin-orb admin-orb-1" />
                <div className="admin-orb admin-orb-2" />
                <div className="admin-orb admin-orb-3" />
                <div className="admin-grid-overlay" />
                <div className="admin-noise-overlay" />
            </div>

            <AdminSidebar theme={theme} />

            <div className="relative min-w-0 transition-all duration-300 lg:ml-[240px]">
                <AdminTopbar
                    currentPath={location.pathname}
                    theme={theme}
                    onToggleTheme={handleToggleTheme}
                />

                <main className="min-w-0 px-3 pb-4 pt-3 sm:px-4 sm:pb-5 sm:pt-4 md:px-5 md:pb-6 md:pt-5 lg:px-6 lg:pb-6 lg:pt-5">
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="admin-main-surface relative min-w-0 overflow-visible rounded-[30px] border shadow-[0_25px_60px_rgba(15,77,60,0.10)] backdrop-blur-xl"
                    >
                        <div className="pointer-events-none absolute inset-0">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 6, repeat: Infinity }}
                                className="absolute -top-10 right-10 h-40 w-40 rounded-full bg-[#d4af37]/12 blur-3xl"
                            />
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 7, repeat: Infinity }}
                                className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#0f4d3c]/8 blur-3xl"
                            />
                        </div>

                        <div className="relative w-full p-3 sm:p-4 md:p-5 lg:p-6">
                            <Outlet />
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;