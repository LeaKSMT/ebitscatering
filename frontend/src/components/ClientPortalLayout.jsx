import { Outlet } from "react-router-dom";
import ClientTopbar from "./ClientTopbar";

function ClientPortalLayout() {
    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <ClientTopbar />
            <main className="max-w-7xl mx-auto px-6 py-8">
                <Outlet />
            </main>
        </div>
    );
}

export default ClientPortalLayout;