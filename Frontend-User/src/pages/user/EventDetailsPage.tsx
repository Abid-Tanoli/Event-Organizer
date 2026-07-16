import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI } from '../../api/events';
import { ticketsAPI } from '../../api/tickets';
import { Event } from '../../types';
import Loader from '../../components/common/Loader';
import { Calendar, MapPin, Share2, Heart, ArrowLeft, Globe, Mail, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const EventDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, user } = useAuthStore();
    const [ticketQuantity, setTicketQuantity] = useState<Record<string, number>>({});

    // Booking Modal State
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [attendeeInfo, setAttendeeInfo] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!id) return;
            try {
                const response = await eventsAPI.getEventById(id);
                // Correctly handle the response structure
                // Backend returns: { success: true, data: event }
                const eventData = response.data.data || response.data;
                setEvent(eventData);

                // Initialize ticket quantities
                const initialQuantities: Record<string, number> = {};
                eventData.ticketTypes?.forEach((ticket: any) => {
                    initialQuantities[ticket.name] = 0;
                });
                setTicketQuantity(initialQuantities);

                // Pre-fill attendee info if user is logged in
                if (user) {
                    setAttendeeInfo({
                        name: user.name || '',
                        email: user.email || '',
                        phone: '', // Phone might not be in user object, adjust if needed
                    });
                }
            } catch (error) {
                console.error('Failed to fetch event details:', error);
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
            toast.success('Event link copied to clipboard!');
        } catch (error) {
            toast.error('Failed to share event');
        }
    };

    const handleLike = async () => {
        if (!event) return;
        if (!isAuthenticated) {
            toast.error('Please login to like events');
            return;
        }
        try {
            await eventsAPI.likeEvent(event._id);
            toast.success('Event liked!');
        } catch (error) {
            toast.error('Failed to like event');
        }
    };

    const updateQuantity = (ticketName: string, delta: number) => {
        setTicketQuantity(prev => {
            const current = prev[ticketName] || 0;
            const newValue = Math.max(0, current + delta);
            return { ...prev, [ticketName]: newValue };
        });
    };

    const openBookingModal = () => {
        if (!isAuthenticated) {
            toast.error('Please login to book tickets');
            navigate('/login');
            return;
        }
        setIsBookingModalOpen(true);
    };

    const handleBookTickets = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!event || !user) return;

        if (!attendeeInfo.name || !attendeeInfo.email || !attendeeInfo.phone) {
            toast.error('Please fill in all attendee information');
            return;
        }

        setBookingLoading(true);
        try {
            const ticketsToBook = Object.entries(ticketQuantity)
                .filter(([_, qty]) => qty > 0)
                .map(([name, qty]) => {
                    const ticketType = event.ticketTypes.find(t => t.name === name);
                    return {
                        ticketType: name,
                        quantity: qty,
                        price: ticketType?.price || 0,
                        subtotal: (ticketType?.price || 0) * qty,
                    };
                });

            const totalAmount = ticketsToBook.reduce((sum, t) => sum + t.subtotal, 0);
            const serviceFee = totalAmount * 0.05; // 5% service fee example
            const finalAmount = totalAmount + serviceFee;

            const organizerId = typeof event.organizer === 'object'
                ? (event.organizer._id || (event.organizer as any).id)
                : event.organizer;

            // Fallback for User ID (handle old session data)
            const userId = user?._id || (user as any)?.id;

            const bookingData = {
                event: event._id,
                user: userId,
                organizer: organizerId,
                tickets: ticketsToBook,
                totalAmount,
                serviceFee,
                finalAmount,
                paymentMethod: 'card',
                attendeeInfo,
            };


            // Validation removed as requested
            // if (!bookingData.event || !bookingData.user || !bookingData.organizer) {
            //     toast.error('Missing required booking information');
            //     setBookingLoading(false);
            //     return;
            // }

            await ticketsAPI.create(bookingData);
            toast.success('Tickets booked successfully!');
            setIsBookingModalOpen(false);
            // Reset quantities
            const resetQuantities: Record<string, number> = {};
            event.ticketTypes?.forEach((ticket: any) => {
                resetQuantities[ticket.name] = 0;
            });
            setTicketQuantity(resetQuantities);

            // Ideally fetch event again to update available tickets or navigate to tickets page
            navigate('/events');

        } catch (error: any) {
            console.error('Booking failed:', error);
            let message = error.response?.data?.message || 'Failed to book tickets';

            // Handle Zod validation errors array
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                message = error.response.data.errors.join(', ');
            }

            toast.error(message);
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <Loader />;
    if (!event) return null;

    const organizer = typeof event.organizer === 'object' ? event.organizer : null;

    const totalSelectedPrice = Object.entries(ticketQuantity).reduce((total, [name, qty]) => {
        const ticket = event.ticketTypes.find(t => t.name === name);
        return total + (ticket ? ticket.price * qty : 0);
    }, 0);

    const hasSelectedTickets = Object.values(ticketQuantity).some(q => q > 0);

    return (
        <div className="min-h-screen bg-gray-50 py-8 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Events
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Hero Section */}
                    <div className="relative h-96 w-full">
                        <img
                            src={event.coverImage}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="flex gap-2 mb-4">
                                        {event.isFeatured && (
                                            <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                                                ⭐ Featured
                                            </span>
                                        )}
                                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold capitalize">
                                            {event.eventType}
                                        </span>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
                                    <div className="flex flex-wrap gap-6 text-gray-200">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-5 h-5" />
                                            <span>
                                                {format(new Date(event.eventDate), 'EEEE, MMMM dd, yyyy')} • {event.eventTime}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            <span>{event.venue.name}, {event.venue.city}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleLike}
                                        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors"
                                    >
                                        <Heart className="w-6 h-6 text-white" />
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors"
                                    >
                                        <Share2 className="w-6 h-6 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                                <div className="prose max-w-none text-gray-600">
                                    <p className="whitespace-pre-line">{event.description}</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tags</h2>
                                <div className="flex flex-wrap gap-2">
                                    {event.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            {/* Organizer Info */}
                            {organizer && (
                                <section className="border-t border-gray-200 pt-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Organizer</h2>
                                    <div className="flex items-start gap-6 bg-gray-50 p-6 rounded-xl">
                                        {organizer.logo ? (
                                            <img
                                                src={organizer.logo}
                                                alt={organizer.organizationName}
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                                {organizer.organizationName.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                {organizer.organizationName}
                                            </h3>
                                            <p className="text-gray-600 mb-4">{organizer.description}</p>

                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                {organizer.website && (
                                                    <a
                                                        href={organizer.website}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Globe className="w-4 h-4" />
                                                        Website
                                                    </a>
                                                )}
                                                <a
                                                    href={`mailto:${organizer.contactEmail}`}
                                                    className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                    Contact
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar - Ticket Selection */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Select Tickets</h3>

                                <div className="space-y-4 mb-6">
                                    {event.ticketTypes?.map((ticket) => (
                                        <div
                                            key={ticket.name}
                                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{ticket.name}</h4>
                                                    <p className="text-sm text-gray-500">{ticket.description}</p>
                                                </div>
                                                <span className="text-lg font-bold text-blue-600">
                                                    ${ticket.price}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center mt-3">
                                                <span className={`text-sm ${ticket.quantity - ticket.soldCount > 0
                                                    ? 'text-green-600'
                                                    : 'text-red-500'
                                                    }`}>
                                                    {ticket.quantity - ticket.soldCount > 0
                                                        ? `${ticket.quantity - ticket.soldCount} available`
                                                        : 'Sold Out'
                                                    }
                                                </span>

                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => updateQuantity(ticket.name, -1)}
                                                        disabled={!ticketQuantity[ticket.name]}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center font-medium">
                                                        {ticketQuantity[ticket.name] || 0}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(ticket.name, 1)}
                                                        disabled={
                                                            (ticketQuantity[ticket.name] || 0) >= Math.min(ticket.maxPerOrder, ticket.quantity - ticket.soldCount)
                                                        }
                                                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-gray-200 pt-4 mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Total</span>
                                        <span className="text-2xl font-bold text-gray-900">
                                            ${totalSelectedPrice}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={openBookingModal}
                                    disabled={!hasSelectedTickets}
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    Book Tickets
                                </button>

                                <p className="text-center text-xs text-gray-500 mt-4">
                                    Secure payment powered by Stripe
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {isBookingModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
                            <button
                                onClick={() => setIsBookingModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleBookTickets} className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900">Attendee Information</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={attendeeInfo.name}
                                        onChange={(e) => setAttendeeInfo({ ...attendeeInfo, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={attendeeInfo.email}
                                        onChange={(e) => setAttendeeInfo({ ...attendeeInfo, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={attendeeInfo.phone}
                                        onChange={(e) => setAttendeeInfo({ ...attendeeInfo, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="+1 (234) 567-8900"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                                <div className="space-y-2 mb-4">
                                    {Object.entries(ticketQuantity)
                                        .filter(([_, qty]) => qty > 0)
                                        .map(([name, qty]) => {
                                            const ticket = event.ticketTypes.find(t => t.name === name);
                                            return (
                                                <div key={name} className="flex justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        {qty}x {name}
                                                    </span>
                                                    <span className="font-medium">
                                                        ${(ticket?.price || 0) * qty}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                </div>

                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                                    <span>Total</span>
                                    <span>${totalSelectedPrice}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={bookingLoading}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {bookingLoading ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    'Complete Booking'
                                )}
                            </button>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetailsPage;
