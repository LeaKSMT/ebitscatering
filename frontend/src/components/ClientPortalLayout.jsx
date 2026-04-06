import { Outlet } from "react-router-dom";
import ClientTopbar from "./ClientTopbar";

function ClientPortalLayout() {
    return (
        <div className="min-h-screen bg-[#f4f7f6]">
            <ClientTopbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
                <Outlet />
            </main>
        </div>
    );
}

export default ClientPortalLayout;