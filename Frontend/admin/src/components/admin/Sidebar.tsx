import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Ticket,
  Building2,
  Tags,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Events', path: '/admin/events', icon: Calendar },
  { name: 'Organizers', path: '/admin/organizers', icon: Building2 },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Categories', path: '/admin/categories', icon: Tags },
  { name: 'Bookings', path: '/admin/bookings', icon: Ticket },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        'bg-sidebar text-sidebar-foreground min-h-screen flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && <h2 className="font-bold text-lg">Admin Panel</h2>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className={cn('p-3 border-b border-sidebar-border', collapsed && 'flex justify-center')}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={cn('flex items-center gap-3 w-full justify-start px-3 py-2 h-auto hover:bg-sidebar-accent', collapsed && 'justify-center p-2')}>
              <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-sidebar-primary-foreground" />
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email || ''}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-sidebar-foreground/60" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={collapsed ? 'center' : 'start'} className="w-56">
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { logout(); navigate('/admin/login'); }} className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
