import React, { useEffect, useState, useRef } from 'react';
import { eventsAPI } from '@/api/events';
import { organizersAPI } from '@/api/organizers';
import { categoriesAPI } from '@/api/categories';
import { Event, Organizer, Category } from '@/types';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Check, X, Eye, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const EventsManagement: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const coverImageRef = useRef<HTMLInputElement>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    shortDescription: '',
    coverImage: '',
    organizer: '',
    category: '',
    venue: {
      name: '',
      address: '',
      city: '',
      country: '',
    },
    eventDate: '',
    eventTime: '',
    eventType: 'offline' as 'online' | 'offline' | 'hybrid',
    ticketTypes: [
      {
        name: 'General',
        description: 'General admission',
        price: 0,
        quantity: 100,
        soldCount: 0,
      },
    ],
    refundPolicy: 'Full refund available up to 24 hours before the event.',
    termsAndConditions: 'Standard terms and conditions apply.',
    tags: [] as string[],
  });

  useEffect(() => {
    fetchEvents();
    fetchOrganizers();
    fetchCategories();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventsAPI.getAllEvents();
      setEvents(response.items);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizers = async () => {
    try {
      const response = await organizersAPI.getAll();
      setOrganizers(response.organizers ?? []);
    } catch (error) {
      console.error('Failed to fetch organizers');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleApprove = async (eventId: string) => {
    try {
      await eventsAPI.updateStatus(eventId, { status: 'approved' });
      toast.success('Event approved successfully');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to approve event');
    }
  };

  const handleReject = async () => {
    if (!selectedEvent || !rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await eventsAPI.updateStatus(selectedEvent._id, {
        status: 'rejected',
        rejectionReason,
      });
      toast.success('Event rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      toast.error('Failed to reject event');
    }
  };

  const handleToggleFeatured = async (eventId: string, isFeatured: boolean) => {
    try {
      await eventsAPI.toggleFeatured(eventId, !isFeatured);
      toast.success(`Event ${!isFeatured ? 'featured' : 'unfeatured'} successfully`);
      fetchEvents();
    } catch (error) {
      toast.error('Failed to update event');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventsAPI.deleteEvent(eventId);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleCreateEvent = async () => {
    if (
      !newEvent.title ||
      !newEvent.description ||
      !newEvent.shortDescription ||
      !newEvent.organizer ||
      !newEvent.category ||
      !newEvent.venue.name ||
      !newEvent.venue.city ||
      !newEvent.venue.country ||
      !newEvent.eventDate ||
      !newEvent.eventTime
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newEvent.title);
      formData.append('description', newEvent.description);
      formData.append('shortDescription', newEvent.shortDescription);
      formData.append('organizer', newEvent.organizer);
      formData.append('category', newEvent.category);
      formData.append('venue', JSON.stringify(newEvent.venue));
      formData.append('eventDate', newEvent.eventDate);
      formData.append('eventTime', newEvent.eventTime);
      formData.append('eventType', newEvent.eventType);
      formData.append('ticketTypes', JSON.stringify(newEvent.ticketTypes));
      formData.append('refundPolicy', newEvent.refundPolicy);
      formData.append('termsAndConditions', newEvent.termsAndConditions);
      formData.append('tags', JSON.stringify(newEvent.tags));
      if (coverImageFile) {
        formData.append('coverImage', coverImageFile);
      }

      await eventsAPI.createEvent(formData);
      toast.success('Event created successfully');
      setShowCreateModal(false);
      setCoverImageFile(null);
      if (coverImageRef.current) coverImageRef.current.value = '';
      setNewEvent({
        title: '',
        description: '',
        shortDescription: '',
        coverImage: '',
        organizer: '',
        category: '',
        venue: { name: '', address: '', city: '', country: '' },
        eventDate: '',
        eventTime: '',
        eventType: 'offline',
        ticketTypes: [
          { name: 'General', description: 'General admission', price: 0, quantity: 100, soldCount: 0 },
        ],
        refundPolicy: 'Full refund available up to 24 hours before the event.',
        termsAndConditions: 'Standard terms and conditions apply.',
        tags: [],
      });
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Events Management</h1>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Event
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading events...</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Featured
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        No events found. Create your first event!
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => (
                      <tr key={event._id} className="hover:bg-muted/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={event.coverImage || event.images?.[0] || '/event-placeholder.svg'}
                              alt={event.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                            <div>
                              <div className="font-medium text-foreground">{event.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {event.venue?.city || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {event.eventDate
                            ? format(new Date(event.eventDate), 'MMM dd, yyyy')
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusBadgeVariant(event.status)}>
                            {event.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={event.isFeatured ? 'default' : 'secondary'}
                            className="cursor-pointer"
                            onClick={() =>
                              handleToggleFeatured(event._id, event.isFeatured)
                            }
                          >
                            {event.isFeatured ? 'Featured' : 'Not Featured'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {event.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleApprove(event._id)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => {
                                    setSelectedEvent(event);
                                    setShowRejectModal(true);
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                window.open(`/events/${event._id}`, '_blank')
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(event._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason('');
          setSelectedEvent(null);
        }}
        title="Reject Event"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Please provide a reason for rejecting this event:
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-32"
            placeholder="Enter rejection reason..."
          />
          <div className="flex gap-2">
            <Button variant="danger" onClick={handleReject} className="flex-1">
              Reject Event
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
                setSelectedEvent(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Event Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Event"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Title *</label>
              <input
                type="text"
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Short Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Short Description *
              </label>
              <input
                type="text"
                placeholder="Brief summary of the event"
                value={newEvent.shortDescription}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, shortDescription: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Description *
              </label>
              <textarea
                placeholder="Full event description"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary h-24"
              />
            </div>

            {/* Organizer Dropdown */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Organizer *
              </label>
              <select
                value={newEvent.organizer}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, organizer: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select organizer</option>
                {organizers.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.organizationName}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Category *
              </label>
              <select
                value={newEvent.category}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, category: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Venue Name */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Venue Name *
              </label>
              <input
                type="text"
                placeholder="Venue name"
                value={newEvent.venue.name}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    venue: { ...newEvent.venue, name: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Venue Address */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Venue Address
              </label>
              <input
                type="text"
                placeholder="Street address"
                value={newEvent.venue.address}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    venue: { ...newEvent.venue, address: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">City *</label>
              <input
                type="text"
                placeholder="City"
                value={newEvent.venue.city}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    venue: { ...newEvent.venue, city: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Country *
              </label>
              <input
                type="text"
                placeholder="Country"
                value={newEvent.venue.country}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    venue: { ...newEvent.venue, country: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Event Date */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Event Date *
              </label>
              <input
                type="date"
                value={newEvent.eventDate}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, eventDate: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Event Time */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Event Time *
              </label>
              <input
                type="time"
                value={newEvent.eventTime}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, eventTime: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Event Type
              </label>
              <select
                value={newEvent.eventType}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    eventType: e.target.value as 'online' | 'offline' | 'hybrid',
                  })
                }
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Ticket Price */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Ticket Price
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={newEvent.ticketTypes[0].price}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    ticketTypes: [
                      { ...newEvent.ticketTypes[0], price: Number(e.target.value) },
                    ],
                  })
                }
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Ticket Quantity */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Total Tickets
              </label>
              <input
                type="number"
                min="1"
                placeholder="100"
                value={newEvent.ticketTypes[0].quantity}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    ticketTypes: [
                      {
                        ...newEvent.ticketTypes[0],
                        quantity: Number(e.target.value),
                      },
                    ],
                  })
                }
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Cover Image */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Cover Image
              </label>
              <input
                ref={coverImageRef}
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              />
              {coverImageFile && (
                <p className="text-sm text-muted-foreground mt-1">Selected: {coverImageFile.name}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="primary" onClick={handleCreateEvent} className="flex-1">
              Create Event
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EventsManagement;
