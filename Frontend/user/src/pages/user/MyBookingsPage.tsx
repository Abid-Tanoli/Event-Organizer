import React, { useEffect, useState } from 'react';
import { ticketsAPI } from '@/api/tickets';
import { useAuthStore } from '@/store/authStore';
import { Ticket } from '@/types';
import Loader from '@/components/common/Loader';
import { Calendar, MapPin, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const MyBookingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await ticketsAPI.getByUser(user!._id);
      setBookings(response.tickets ?? []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (ticketId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await ticketsAPI.cancel(ticketId, 'Cancelled by user');
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border shadow-sm">
            <p className="text-xl text-muted-foreground mb-4">No bookings yet</p>
            <Button onClick={() => navigate('/events')}>
              Browse Events
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const event = typeof booking.event === 'object' ? booking.event : null;
              return (
                <div key={booking._id} className="bg-card rounded-xl border shadow-sm p-6 flex flex-col md:flex-row gap-6">
                  {event && (
                    <img
                      src={(event as any).coverImage || '/event-placeholder.svg'}
                      alt={(event as any).title}
                      className="w-full md:w-48 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">
                      {event ? (event as any).title : 'Event'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Reference: {booking.bookingReference}
                    </p>
                    {event && (
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date((event as any).eventDate), 'MMM dd, yyyy')} at {(event as any).eventTime}
                        </div>
                        {event && (event as any).venue && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {(event as any).venue?.name}, {(event as any).venue?.city}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant={booking.bookingStatus === 'confirmed' ? 'default' : booking.bookingStatus === 'cancelled' ? 'destructive' : 'secondary'}>
                        {booking.bookingStatus}
                      </Badge>
                      <Badge variant={booking.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                        {booking.paymentStatus}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold text-primary mt-2">${booking.finalAmount}</p>
                  </div>
                  <div className="flex flex-col gap-2 justify-center">
                    {booking.bookingStatus === 'confirmed' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancel(booking._id)}
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
