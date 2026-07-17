import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '@/api/events';
import { statsAPI } from '@/api/stats';
import { Event } from '@/types';
import { EventCard } from '@/components/user/EventCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Calendar, Ticket, TrendingUp, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { EVENTS_PER_PAGE } from '@/config/constants';
import { SITE_NAME } from '@/config/site';

interface Stats {
  totalEvents: number;
  totalUsers: number;
  totalTicketsSold: number;
}

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [currentPage]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const [featuredRes, publicRes] = await Promise.all([
        eventsAPI.getFeaturedEvents(),
        eventsAPI.getPublicEvents({ page: currentPage, limit: EVENTS_PER_PAGE }),
      ]);

      const featuredData = featuredRes;
      setFeaturedEvents(Array.isArray(featuredData) ? featuredData : []);

      const publicData = publicRes.items;
      setAllEvents(Array.isArray(publicData) ? publicData : []);
      setTotalPages(publicRes.pagination.totalPages);
    } catch (error: any) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await statsAPI.getSummary();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-24 lg:py-32">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" /> Discover Amazing Events
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Your Gateway to
              <span className="text-primary"> Unforgettable </span>
              Experiences
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Book tickets for concerts, conferences, sports, and more. Join thousands of event-goers who trust {SITE_NAME}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/events')} className="gap-2">
                <Search className="w-5 h-5" />
                Browse Events
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Calendar, title: stats ? `${stats.totalEvents.toLocaleString()}+ Events` : 'Events', desc: 'Discover events across multiple categories' },
              { icon: Ticket, title: 'Easy Booking', desc: 'Book tickets in just a few clicks' },
              { icon: TrendingUp, title: stats ? `${stats.totalTicketsSold.toLocaleString()}+ Tickets Sold` : 'Tickets Sold', desc: 'Trusted by thousands of event-goers' },
            ].map((item) => (
              <div key={item.title} className="text-center p-8 rounded-xl border bg-card hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-5">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!loading && featuredEvents.length > 0 && (
        <section className="py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Events</h2>
              <p className="text-lg text-muted-foreground">Don't miss these amazing events!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.slice(0, 3).map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-lg text-muted-foreground">Explore all available events</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: EVENTS_PER_PAGE }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : allEvents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">No events available at the moment</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {allEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        className="w-9"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
