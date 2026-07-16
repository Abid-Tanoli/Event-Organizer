import React, { useEffect, useState } from 'react';
import { ticketsAPI } from '../../api/tickets';
import { useAuthStore } from '../../store/authStore';
import { Ticket } from '../../types';
import Loader from '../../components/common/Loader';
import { Calendar, MapPin, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <p className="text-xl text-gray-600 mb-4">No bookings yet</p>
            <button
              onClick={() => navigate('/events')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const event = typeof booking.event === 'object' ? booking.event : null;
              return (
                <div key={booking._id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-6">
                  {event && (
                    <img
                      src={(event as any).coverImage || '/event-placeholder.svg'}
                      alt={(event as any).title}
                      className="w-full md:w-48 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {event ? (event as any).title : 'Event'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      Reference: {booking.bookingReference}
                    </p>
                    {event && (
                      <div className="space-y-1 text-sm text-gray-600">
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-blue-600 mt-2">${booking.finalAmount}</p>
                  </div>
                  <div className="flex flex-col gap-2 justify-center">
                    {booking.bookingStatus === 'confirmed' && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
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
