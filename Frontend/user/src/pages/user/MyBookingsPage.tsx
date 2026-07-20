import React, { useEffect, useState } from 'react';
import { ticketsAPI } from '@/api/tickets';
import { useAuthStore } from '@/store/authStore';
import { Ticket } from '@/types';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { Calendar, MapPin, X, Ticket as TicketIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

const MyBookingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?._id) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ticketsAPI.getByUser(user!._id);
      setBookings(response.tickets ?? []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setError('Failed to load bookings. Please try again.');
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTargetId) return;
    try {
      await ticketsAPI.cancel(cancelTargetId, 'Cancelled by user');
      toast.success('Booking cancelled');
      setCancelTargetId(null);
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel');
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground mb-8">My Bookings</h1>
          <ErrorState message={error} onRetry={() => { setError(null); fetchBookings(); }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <EmptyState
            icon={TicketIcon}
            title="No bookings yet"
            description="Browse events and book your first ticket."
            action={{ label: 'Browse Events', onClick: () => navigate('/events') }}
          />
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
                        onClick={() => setCancelTargetId(booking._id)}
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

      {/* Cancel Booking AlertDialog */}
      <AlertDialog open={!!cancelTargetId} onOpenChange={(open) => !open && setCancelTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Booking</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyBookingsPage;
