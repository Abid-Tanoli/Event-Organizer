import { useEffect, useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import { eventsAPI } from '@/api/events';
import { usersAPI } from '@/api/users';
import { organizersAPI } from '@/api/organizers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Building2, Ticket } from 'lucide-react';

interface Stats {
  totalEvents: number;
  totalUsers: number;
  totalOrganizers: number;
  totalBookings: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0, totalUsers: 0, totalOrganizers: 0, totalBookings: 0,
  });

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [eventsRes, usersRes, organizersRes] = await Promise.all([
        eventsAPI.getAllEvents(),
        usersAPI.getAll(),
        organizersAPI.getAll(),
      ]);
      const eventsData = eventsRes.items;
      const events = Array.isArray(eventsData) ? eventsData : [];
      const usersData = usersRes;
      const organizersData = organizersRes.organizers ?? [];
      setStats({
        totalEvents: events.length,
        totalUsers: Array.isArray(usersData) ? usersData.length : 0,
        totalOrganizers: organizersData.length,
        totalBookings: events.reduce((sum: number, e: any) => sum + (e.soldTickets || 0), 0),
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const statCards = [
    { title: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'text-primary' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-emerald-500' },
    { title: 'Organizers', value: stats.totalOrganizers, icon: Building2, color: 'text-violet-500' },
    { title: 'Tickets Sold', value: stats.totalBookings, icon: Ticket, color: 'text-orange-500' },
  ];

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Pending Approvals</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No pending approvals</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
