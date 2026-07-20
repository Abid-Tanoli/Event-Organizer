import { Link, useNavigate } from 'react-router-dom';
import { Calendar, LogOut, User, Menu, X, ChevronDown, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/config/site';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
              <span className="text-xl font-bold text-foreground">{SITE_NAME}</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/events" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Events
            </Link>

            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full h-auto text-foreground font-medium">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm">{user?.name}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/my-bookings')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

          <button className="md:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-3">
          <Link to="/events" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Events</Link>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
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
