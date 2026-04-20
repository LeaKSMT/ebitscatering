import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ClientTopbar from "./ClientTopbar";

function ClientPortalLayout() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("clientPortalTheme") || "light";
    });

    useEffect(() => {
        const applyTheme = () => {
            const stored = localStorage.getItem("clientPortalTheme") || "light";
            setTheme(stored);
            document.documentElement.setAttribute("data-theme", stored);
        };

        applyTheme();

        const handleThemeChange = () => {
            applyTheme();
        };

        window.addEventListener("storage", applyTheme);
        window.addEventListener("client-theme-change", handleThemeChange);

        return () => {
            window.removeEventListener("storage", applyTheme);
            window.removeEventListener("client-theme-change", handleThemeChange);
        };
    }, []);

    return (
        <div
            className={`client-portal-shell relative min-h-screen overflow-hidden ${theme === "dark" ? "client-theme-dark" : "client-theme-light"
                }`}
        >
            <div className="client-portal-bg pointer-events-none absolute inset-0">
                <div className="client-orb client-orb-1" />
                <div className="client-orb client-orb-2" />
                <div className="client-orb client-orb-3" />
                <div className="client-grid-overlay" />
                <div className="client-noise-overlay" />
            </div>

            <ClientTopbar />

            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="relative z-[1] mx-auto max-w-[1380px] px-4 pb-10 pt-6 sm:px-6 md:pt-8 lg:px-8"
            >
                <Outlet />
            </motion.main>
        </div>
    );
}

export default ClientPortalLayout;