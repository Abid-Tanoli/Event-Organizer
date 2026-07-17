import React, { useEffect, useState } from 'react';
import { ticketsAPI } from '@/api/tickets';
import { Calendar, DollarSign, Users, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AdminBookings: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketsAPI.getAll();
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      ticket.bookingReference?.toLowerCase().includes(searchLower) ||
      ticket.user?.name?.toLowerCase().includes(searchLower) ||
      ticket.user?.email?.toLowerCase().includes(searchLower) ||
      ticket.event?.title?.toLowerCase().includes(searchLower)
    );
  });

  const totalRevenue = tickets
    .filter((t) => t.paymentStatus === 'completed')
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  const confirmedCount = tickets.filter((t) => t.bookingStatus === 'confirmed').length;
  const cancelledCount = tickets.filter((t) => t.bookingStatus === 'cancelled').length;

  const statusVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default' as const;
      case 'cancelled': return 'destructive' as const;
      case 'attended': return 'secondary' as const;
      case 'pending': return 'secondary' as const;
      default: return 'secondary' as const;
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Bookings</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
              <Users className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tickets.length}</div>
              <p className="text-xs text-muted-foreground mt-1">{confirmedCount} confirmed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">From completed payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle>
              <Calendar className="w-5 h-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{cancelledCount}</div>
              <p className="text-xs text-muted-foreground mt-1">{tickets.length > 0 ? ((cancelledCount / tickets.length) * 100).toFixed(1) : 0}% cancellation rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by reference, name, email, or event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket._id}>
                      <TableCell className="font-mono text-sm">{ticket.bookingReference}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ticket.user?.name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{ticket.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{ticket.event?.title || 'N/A'}</TableCell>
                      <TableCell>
                        {ticket.tickets?.length || 0} type{(ticket.tickets?.length || 0) !== 1 ? 's' : ''}
                      </TableCell>
                      <TableCell className="font-medium">${ticket.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <Badge variant={ticket.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                          {ticket.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(ticket.bookingStatus)}>
                          {ticket.bookingStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
