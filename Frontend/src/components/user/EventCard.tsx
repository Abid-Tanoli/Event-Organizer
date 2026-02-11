import React from 'react';
import { Calendar, MapPin, Users, Heart, Share2 } from 'lucide-react';
import { Event } from '../../types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '../../api/events';
import toast from 'react-hot-toast';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await eventsAPI.likeEvent(event._id);
      toast.success('Event liked!');
    } catch (error) {
      toast.error('Failed to like event');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await eventsAPI.shareEvent(event._id);
      navigator.clipboard.writeText(window.location.origin + `/events/${event._id}`);
      toast.success('Event link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to share event');
    }
  };

  const minPrice = Math.min(...event.ticketTypes.map((t) => t.price));

  return (
    <div
      onClick={() => navigate(`/events/${event._id}`)}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {event.isFeatured && (
          <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
            ⭐ Featured
          </div>
        )}
        {event.isSoldOut && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">SOLD OUT</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 flex-1">
            {event.title}
          </h3>
          <div className="flex gap-2 ml-2">
            <button
              onClick={handleLike}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Heart className="w-5 h-5 text-red-500" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.shortDescription}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm">
              {format(new Date(event.eventDate), 'MMM dd, yyyy')} at {event.eventTime}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-sm">{event.venue.city}, {event.venue.country}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm">
              {event.availableTickets} / {event.totalTickets} tickets available
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-600">Starting from</p>
            <p className="text-2xl font-bold text-blue-600">${minPrice}</p>
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};