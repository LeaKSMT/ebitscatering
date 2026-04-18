import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import ClientTopbar from "./ClientTopbar";

function ClientPortalLayout() {
    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.10),_transparent_22%),linear-gradient(180deg,#f7fbf9_0%,#edf4f1_100%)]">
            <ClientTopbar />

            <motion.main
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 md:pt-8 md:pb-10"
            >
                <Outlet />
            </motion.main>
        </div>
    );
}

export default ClientPortalLayout;