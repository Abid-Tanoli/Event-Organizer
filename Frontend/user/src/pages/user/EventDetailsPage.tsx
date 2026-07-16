import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI } from '@/api/events';
import { ticketsAPI } from '@/api/tickets';
import { Event } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Share2, Heart, ArrowLeft, Globe, Mail } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuthStore();
  const [ticketQuantity, setTicketQuantity] = useState<Record<string, number>>({});
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [attendeeInfo, setAttendeeInfo] = useState({ name: '', email: '', phone: '' });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        const response = await eventsAPI.getEventById(id);
        const eventData = response;
        setEvent(eventData);
        const initial: Record<string, number> = {};
        eventData.ticketTypes?.forEach((t: any) => { initial[t.name] = 0; });
        setTicketQuantity(initial);
        if (user) setAttendeeInfo({ name: user.name || '', email: user.email || '', phone: '' });
      } catch (error) {
        toast.error('Failed to load event details');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate, user]);

  const handleShare = async () => {
    if (!event) return;
    try {
      await eventsAPI.shareEvent(event._id);
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    } catch { toast.error('Failed to share'); }
  };

  const handleLike = async () => {
    if (!event) return;
    if (!isAuthenticated) { toast.error('Please login to like'); return; }
    try { await eventsAPI.likeEvent(event._id); toast.success('Liked!'); }
    catch { toast.error('Failed to like'); }
  };

  const updateQuantity = (name: string, delta: number) => {
    setTicketQuantity(prev => ({ ...prev, [name]: Math.max(0, (prev[name] || 0) + delta) }));
  };

  const openBooking = () => {
    if (!isAuthenticated) { toast.error('Please login first'); navigate('/login'); return; }
    setIsBookingOpen(true);
  };

  const handleBookTickets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !user) return;
    if (!attendeeInfo.name || !attendeeInfo.email || !attendeeInfo.phone) {
      toast.error('Please fill all fields'); return;
    }
    setBookingLoading(true);
    try {
      const ticketsToBook = Object.entries(ticketQuantity)
        .filter(([_, qty]) => qty > 0)
        .map(([name, qty]) => {
          const ticketType = event.ticketTypes.find(t => t.name === name);
          return { ticketType: name, quantity: qty, price: ticketType?.price || 0, subtotal: (ticketType?.price || 0) * qty };
        });
      const totalAmount = ticketsToBook.reduce((sum, t) => sum + t.subtotal, 0);
      const serviceFee = totalAmount * 0.05;
      const organizerId = typeof event.organizer === 'object' ? (event.organizer as any)._id : event.organizer;
      await ticketsAPI.create({
        event: event._id, user: user._id, organizer: organizerId, tickets: ticketsToBook,
        totalAmount, serviceFee, finalAmount: totalAmount + serviceFee, paymentMethod: 'card', attendeeInfo,
      });
      toast.success('Tickets booked!');
      setIsBookingOpen(false);
      navigate('/my-bookings');
    } catch (error: any) {
      const msg = error.response?.data?.errors?.join(', ') || error.response?.data?.message || 'Booking failed';
      toast.error(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Skeleton className="h-96 w-full max-w-3xl rounded-xl" /></div>;
  if (!event) return null;

  const organizer = typeof event.organizer === 'object' ? event.organizer as any : null;
  const hasSelectedTickets = Object.values(ticketQuantity).some(q => q > 0);
  const totalPrice = Object.entries(ticketQuantity).reduce((sum, [name, qty]) => {
    const ticket = event.ticketTypes.find(t => t.name === name);
    return sum + (ticket ? ticket.price * qty : 0);
  }, 0);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Events
        </button>

        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="relative h-96 w-full">
            <img src={event.coverImage || '/event-placeholder.svg'} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex justify-between items-end">
                <div>
                  <div className="flex gap-2 mb-4">
                    {event.isFeatured && <Badge variant="default" className="bg-yellow-500 text-yellow-950">Featured</Badge>}
                    <Badge variant="secondary" className="capitalize">{event.eventType}</Badge>
                    <Badge variant="outline" className="border-white/30 text-white capitalize">{event.status}</Badge>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
                  <div className="flex flex-wrap gap-6 text-gray-200">
                    <div className="flex items-center gap-2"><Calendar className="w-5 h-5" /><span>{format(new Date(event.eventDate), 'EEEE, MMMM dd, yyyy')} • {event.eventTime}</span></div>
                    <div className="flex items-center gap-2"><MapPin className="w-5 h-5" /><span>{event.venue.name}, {event.venue.city}</span></div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleLike} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors">
                    <Heart className="w-6 h-6 text-white" />
                  </button>
                  <button onClick={handleShare} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors">
                    <Share2 className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
              </section>

              {event.tags.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">#{tag}</Badge>
                    ))}
                  </div>
                </section>
              )}

              {organizer && (
                <section className="border-t pt-8">
                  <h2 className="text-2xl font-bold mb-6">Organizer</h2>
                  <div className="flex items-start gap-6 bg-muted p-6 rounded-xl">
                    {organizer.logo ? (
                      <img src={organizer.logo} alt={organizer.organizationName} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                        {organizer.organizationName?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{organizer.organizationName}</h3>
                      <p className="text-muted-foreground mb-4">{organizer.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {organizer.website && (
                          <a href={organizer.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                            <Globe className="w-4 h-4" /> Website
                          </a>
                        )}
                        <a href={`mailto:${organizer.contactEmail}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                          <Mail className="w-4 h-4" /> Contact
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="border rounded-xl p-6 sticky top-24 bg-card">
                <h3 className="text-xl font-bold mb-6">Select Tickets</h3>
                <div className="space-y-4 mb-6">
                  {event.ticketTypes?.map((ticket) => (
                    <div key={ticket.name} className="border rounded-lg p-4 hover:border-primary transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{ticket.name}</h4>
                          <p className="text-sm text-muted-foreground">{ticket.description}</p>
                        </div>
                        <span className="text-lg font-bold text-primary">${ticket.price}</span>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className={`text-sm ${ticket.quantity - ticket.soldCount > 0 ? 'text-green-600' : 'text-destructive'}`}>
                          {ticket.quantity - ticket.soldCount > 0 ? `${ticket.quantity - ticket.soldCount} available` : 'Sold Out'}
                        </span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(ticket.name, -1)} disabled={!ticketQuantity[ticket.name]}
                            className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-muted disabled:opacity-50">
                            -
                          </button>
                          <span className="w-8 text-center font-medium">{ticketQuantity[ticket.name] || 0}</span>
                          <button onClick={() => updateQuantity(ticket.name, 1)}
                            disabled={(ticketQuantity[ticket.name] || 0) >= Math.min(ticket.maxPerOrder, ticket.quantity - ticket.soldCount)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-muted disabled:opacity-50">
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-2xl font-bold">${totalPrice}</span>
                  </div>
                </div>

                <Button className="w-full" onClick={openBooking} disabled={!hasSelectedTickets}>
                  Book Tickets
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4">Secure payment powered by Stripe</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBookTickets} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Attendee Information</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input required value={attendeeInfo.name} onChange={(e) => setAttendeeInfo({ ...attendeeInfo, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input type="email" required value={attendeeInfo.email} onChange={(e) => setAttendeeInfo({ ...attendeeInfo, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input type="tel" required value={attendeeInfo.phone} onChange={(e) => setAttendeeInfo({ ...attendeeInfo, phone: e.target.value })} placeholder="+1 (234) 567-8900" />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                {Object.entries(ticketQuantity).filter(([_, q]) => q > 0).map(([name, qty]) => {
                  const ticket = event.ticketTypes.find(t => t.name === name);
                  return (
                    <div key={name} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{qty}x {name}</span>
                      <span className="font-medium">${(ticket?.price || 0) * qty}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={bookingLoading} className="w-full">
                {bookingLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 'Complete Booking'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetailsPage;
