import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Packages from "./pages/Packages";
import Quotation from "./pages/Quotation";
import Login from "./pages/Login";
import ClientRegister from "./pages/ClientRegister";
import Inquiry from "./pages/Inquiry";

import ClientPortalLayout from "./components/ClientPortalLayout";
import ClientDashboard from "./pages/ClientDashboard";
import ClientBookings from "./pages/ClientBookings";
import ClientCalendar from "./pages/ClientCalendar";
import ClientQuotations from "./pages/ClientQuotations";
import ClientInquiries from "./pages/ClientInquiries";

import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminFinancialManagement from "./pages/AdminFinancialManagement";
import AdminQuotations from "./pages/AdminQuotations";
import AdminEventManagement from "./pages/AdminEventManagement";
import AdminCalendar from "./pages/AdminCalendar";
import AdminPricing from "./pages/AdminPricing";
import AdminDecorations from "./pages/AdminDecorations";
import AdminEmployees from "./pages/AdminEmployees";
import AdminPayroll from "./pages/AdminPayroll";
import AdminInventory from "./pages/AdminInventory";
import AdminPaymentTracking from "./pages/AdminPaymentTracking";
import AdminClients from "./pages/AdminClients";
import AdminReports from "./pages/AdminReports";
import AdminInquiryManagement from "./pages/AdminInquiryManagement";
import AdminPackages from "./pages/AdminPackages";

function ProtectedClientRoute({ children }) {
  const clientUser = JSON.parse(localStorage.getItem("clientUser") || "null");
  const isClientLoggedIn = localStorage.getItem("isClientLoggedIn") === "true";

  if (!clientUser || !isClientLoggedIn) {
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/inquiry" element={<Inquiry />} />
        <Route path="/login" element={<Login />} />
        <Route path="/client-login" element={<Login />} />
        <Route path="/register" element={<ClientRegister />} />
        <Route path="/client-register" element={<ClientRegister />} />

        <Route
          path="/quotation"
          element={<Navigate to="/client/quotation" replace />}
        />

        {/* CLIENT */}
        <Route
          path="/client"
          element={
            <ProtectedClientRoute>
              <ClientPortalLayout />
            </ProtectedClientRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="quotation" element={<Quotation mode="client" />} />
          <Route path="quotations" element={<ClientQuotations />} />
          <Route path="bookings" element={<ClientBookings />} />
          <Route path="calendar" element={<ClientCalendar />} />
          <Route path="inquiries" element={<ClientInquiries />} />
        </Route>

        {/* ADMIN */}
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="inquiries" element={<AdminInquiryManagement />} />
          <Route
            path="financial-management"
            element={<AdminFinancialManagement />}
          />
          <Route path="quotations" element={<AdminQuotations />} />
          <Route path="event-management" element={<AdminEventManagement />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="pricing" element={<AdminPricing />} />
          <Route path="decorations" element={<AdminDecorations />} />
          <Route path="employees" element={<AdminEmployees />} />
          <Route path="payroll" element={<AdminPayroll />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="payment-tracking" element={<AdminPaymentTracking />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;