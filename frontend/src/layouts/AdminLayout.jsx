import { Navigate, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";

function AdminLayout() {
    const isAdminAuth = localStorage.getItem("adminAuth") === "true";
    const location = useLocation();

    if (!isAdminAuth) {
        return <Navigate to="/admin-login" replace />;
    }

    return (
        <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.09),transparent_20%),linear-gradient(180deg,#f9fbfa_0%,#f3f7f5_45%,#eef3f1_100%)] text-slate-800">
            <AdminSidebar />

            <div className="min-h-screen min-w-0 flex flex-col transition-all duration-300 lg:ml-[240px]">
                <AdminTopbar currentPath={location.pathname} />

                <main className="flex-1 min-w-0 overflow-x-hidden p-3 sm:p-4 md:p-5 lg:p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="relative min-h-[calc(100vh-96px)] overflow-hidden rounded-[28px] border border-white/70 bg-white/78 shadow-[0_20px_50px_rgba(15,77,60,0.08)] backdrop-blur-xl"
                    >
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -top-10 right-10 h-36 w-36 rounded-full bg-[#d4af37]/10 blur-3xl" />
                            <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#0f4d3c]/5 blur-3xl" />
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