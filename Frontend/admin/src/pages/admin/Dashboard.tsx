import { useEffect, useState } from 'react';
import { statsAPI, AdminStats } from '@/api/stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ErrorState from '@/components/common/ErrorState';
import { Calendar, Users, Building2, Ticket } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setError(null);
    try {
      const data = await statsAPI.getSummary();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setError('Failed to load dashboard data. Please try again.');
    }
  };

  const statCards = stats
    ? [
        { title: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'text-primary' },
        { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-accent' },
        { title: 'Organizers', value: stats.totalOrganizers, icon: Building2, color: 'text-secondary-foreground' },
        { title: 'Tickets Sold', value: stats.totalTicketsSold, icon: Ticket, color: 'text-muted-foreground' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

        {error ? (
          <ErrorState message={error} onRetry={fetchStats} />
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
