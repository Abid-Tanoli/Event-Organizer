import { Link, useNavigate } from 'react-router-dom';
import { Calendar, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-background border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Calendar className="w-7 h-7 text-primary" />
              <span className="text-xl font-bold text-foreground">EventHub</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/events" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Events
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/my-bookings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  My Bookings
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{user?.name}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-3">
          <Link to="/events" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Events</Link>
          {isAuthenticated ? (
            <>
              <Link to="/my-bookings" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>My Bookings</Link>
              <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)}><Button variant="outline" size="sm" className="w-full">Login</Button></Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}><Button size="sm" className="w-full">Register</Button></Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
