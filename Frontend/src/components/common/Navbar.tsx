import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from './Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">EventHub</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/events"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Events
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                  </Link>
                )}

                <Link
                  to="/my-bookings"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  My Bookings
                </Link>

                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </div>

                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/events"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Events
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;