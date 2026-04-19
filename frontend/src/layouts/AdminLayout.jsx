import { Navigate, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";

function AdminLayout() {
    const isAdminAuth = localStorage.getItem("adminAuth") === "true";
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    const isAdminUser = savedUser?.role === "admin";
    const location = useLocation();

    if (!isAdminAuth || !isAdminUser) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="relative h-screen overflow-hidden bg-[#f4f7f5] text-slate-800">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-[#d4af37]/10 blur-3xl" />
                <div className="absolute bottom-[-120px] left-[-120px] h-[260px] w-[260px] rounded-full bg-[#0f4d3c]/10 blur-3xl" />
            </div>

            <AdminSidebar />

            <div className="relative flex h-screen min-w-0 flex-col transition-all duration-300 lg:ml-[240px]">
                <AdminTopbar currentPath={location.pathname} />

                <main className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-5 lg:p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="relative min-h-full overflow-hidden rounded-[30px] border border-white/70 bg-white/70 shadow-[0_25px_60px_rgba(15,77,60,0.10)] backdrop-blur-xl"
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

                        <div className="relative h-full w-full p-3 sm:p-4 md:p-5 lg:p-6">
                            <Outlet />
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;