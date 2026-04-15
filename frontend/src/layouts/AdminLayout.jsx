import { Navigate, Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";

function AdminLayout() {
    const isAdminAuth = localStorage.getItem("adminAuth") === "true";
    const location = useLocation();

    if (!isAdminAuth) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-[#f4f6f8]">
            <AdminSidebar />

            <div className="ml-[240px] min-h-screen flex min-w-0 flex-col">
                <AdminTopbar currentPath={location.pathname} />

                <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-7">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;