import React from 'react';
import { Calendar, MapPin, Users, Heart, Share2 } from 'lucide-react';
import { Event } from '@/types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '@/api/events';
import { toast } from 'sonner';

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

  const minPrice = event.ticketTypes.length > 0 ? Math.min(...event.ticketTypes.map((t) => t.price)) : null;

  return (
    <div
      onClick={() => navigate(`/events/${event._id}`)}
      className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-border"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.coverImage || '/event-placeholder.svg'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {event.isFeatured && (
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
            Featured
          </div>
        )}
        {event.isSoldOut && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">SOLD OUT</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-foreground line-clamp-2 flex-1">
            {event.title}
          </h3>
          <div className="flex gap-2 ml-2">
            <button
              onClick={handleLike}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <Heart className="w-5 h-5 text-destructive" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {event.shortDescription}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm">
              {format(new Date(event.eventDate), 'MMM dd, yyyy')} at {event.eventTime}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm">{event.venue.city}, {event.venue.country}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm">
              {event.availableTickets} / {event.totalTickets} tickets available
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground">{minPrice !== null ? 'Starting from' : ''}</p>
            <p className="text-2xl font-bold text-primary">{minPrice !== null ? `$${minPrice}` : 'No tickets'}</p>
          </div>
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};
