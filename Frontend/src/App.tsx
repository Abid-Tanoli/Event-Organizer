import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

import HomePage from './pages/user/HomePage';
import EventsPage from './pages/user/EventsPage';

import AdminDashboard from './pages/admin/Dashboard';
import EventsManagement from './pages/admin/EventsManagement';
import OrganizersManagement from './pages/admin/OrganizersManagement';
import AdminUsers from './pages/admin/AdminUsers';
import CategoriesManagement from './pages/admin/CategoriesManagement';

const App = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/register"
              element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
            />

            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute requireAdmin>
                  <EventsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/organizers"
              element={
                <ProtectedRoute requireAdmin>
                  <OrganizersManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute requireAdmin>
                  <CategoriesManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/*"
              element={<Navigate to="/admin/dashboard" replace />}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
