import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/admin/Sidebar';
import { eventsAPI } from '../../api/events';
import { Calendar, DollarSign, Users } from 'lucide-react';
import { format } from 'date-fns';

const AdminBookings: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventsAPI.getAllEvents({ limit: 50 });
      setEvents(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBookings = events.reduce((sum: number, e: any) => sum + (e.soldTickets || 0), 0);
  const totalRevenue = events.reduce((sum: number, e: any) => {
    const minPrice = e.ticketTypes?.length ? Math.min(...e.ticketTypes.map((t: any) => t.price)) : 0;
    return sum + (minPrice * (e.soldTickets || 0));
  }, 0);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bookings Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg"><Calendar className="w-6 h-6 text-blue-600" /></div>
              <div><p className="text-sm text-gray-600">Total Events</p><p className="text-2xl font-bold">{events.length}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg"><Users className="w-6 h-6 text-green-600" /></div>
              <div><p className="text-sm text-gray-600">Total Bookings</p><p className="text-2xl font-bold">{totalBookings}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg"><DollarSign className="w-6 h-6 text-purple-600" /></div>
              <div><p className="text-sm text-gray-600">Estimated Revenue</p><p className="text-2xl font-bold">${totalRevenue}</p></div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event: any) => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{event.title}</td>
                    <td className="px-6 py-4 text-sm">
                      {event.eventDate ? format(new Date(event.eventDate), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">{event.soldTickets || 0}</td>
                    <td className="px-6 py-4">{event.availableTickets || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.status === 'approved' ? 'bg-green-100 text-green-800' :
                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{event.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
