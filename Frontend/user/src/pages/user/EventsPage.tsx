import { useEffect, useState } from 'react';
import { eventsAPI } from '@/api/events';
import { categoriesAPI } from '@/api/categories';
import { Event, Category } from '@/types';
import { EventCard } from '@/components/user/EventCard';
import { Skeleton } from '@/components/ui/skeleton';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { Input } from '@/components/ui/input';
import { Search, CalendarX } from 'lucide-react';

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(6);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, selectedType]);

  useEffect(() => {
    let isActive = true;
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await eventsAPI.getPublicEvents({
          category: selectedCategory || undefined,
          eventType: selectedType || undefined,
          search: debouncedSearch || undefined,
          page: currentPage,
          limit,
        });
        if (isActive) {
          const { items, pagination } = response;
          setEvents(items);
          setTotalPages(pagination.totalPages);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setError('Failed to load events. Please try again.');
      } finally {
        if (isActive) setLoading(false);
      }
    };
    fetchEvents();
    return () => { isActive = false; };
  }, [debouncedSearch, selectedCategory, selectedType, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-6">Explore Events</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">All Types</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => { setError(null); setLoading(true); }} />
        ) : events.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="No events found"
            description={searchTerm || selectedCategory || selectedType ? 'Try adjusting your filters or search terms.' : 'Check back later for new events.'}
            action={searchTerm || selectedCategory || selectedType ? { label: 'Clear filters', onClick: () => { setSearchTerm(''); setSelectedCategory(''); setSelectedType(''); } } : undefined}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
