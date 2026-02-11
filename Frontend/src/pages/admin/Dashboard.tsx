import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/admin/Sidebar';
import StatsCard from '../../components/admin/StatsCard';
import { eventsAPI } from '../../api/events';
import { usersAPI } from '../../api/users';
import { organizersAPI } from '../../api/organizers';
import { Calendar, Users, Building2, Ticket } from 'lucide-react';

interface Stats {
  totalEvents: number;
  totalUsers: number;
  totalOrganizers: number;
  totalBookings: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalUsers: 0,
    totalOrganizers: 0,
    totalBookings: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [eventsRes, usersRes, organizersRes] = await Promise.all([
        eventsAPI.getAllEvents(),
        usersAPI.getAll(),
        organizersAPI.getAll(),
      ]);

      // Use correct properties according to your API types
      const events = eventsRes.events || [];
      const totalBookings = events.reduce(
        (sum: number, event: any) => sum + (event.bookings?.length || 0),
        0
      );

      setStats({
        totalEvents: eventsRes.pagination?.total || 0,
        totalUsers: Array.isArray(usersRes) ? usersRes.length : 0,
        totalOrganizers: organizersRes.pagination?.total || 0,
        totalBookings,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar className="h-screen sticky top-0" />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Events"
            value={stats.totalEvents}
            icon={Calendar}
            color="blue"
            change="+12%"
          />
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="green"
            change="+8%"
          />
          <StatsCard
            title="Organizers"
            value={stats.totalOrganizers}
            icon={Building2}
            color="purple"
            change="+5%"
          />
          <StatsCard
            title="Bookings"
            value={stats.totalBookings}
            icon={Ticket}
            color="orange"
            change="+15%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">No recent activity</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Approvals</h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">No pending approvals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
