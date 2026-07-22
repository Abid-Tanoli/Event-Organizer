import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

import ProtectedRoute from "./components/common/ProtectedRoute";
import Sidebar from "./components/admin/Sidebar";
import Login from "./pages/auth/Login";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import EventsManagement from "./pages/admin/EventsManagement";
import OrganizersManagement from "./pages/admin/OrganizersManagement";
import AdminUsers from "./pages/admin/AdminUsers";
import CategoriesManagement from "./pages/admin/CategoriesManagement";
import AdminBookings from "./pages/admin/AdminBookings";

const AdminLayout = () => (
  <div className="flex min-h-screen bg-muted/30">
    <Sidebar />
    <div className="flex-1">
      <Outlet />
    </div>
  </div>
);

const App = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        <Route
          path="/admin/login"
          element={
            isAuthenticated ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="events" element={<EventsManagement />} />
          <Route path="organizers" element={<OrganizersManagement />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="categories" element={<CategoriesManagement />} />
          <Route path="bookings" element={<AdminBookings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
