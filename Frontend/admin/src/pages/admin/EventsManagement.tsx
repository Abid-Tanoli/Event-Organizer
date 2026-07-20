import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { eventsAPI } from '@/api/events';
import { organizersAPI } from '@/api/organizers';
import { categoriesAPI } from '@/api/categories';
import { Event, Organizer, Category } from '@/types';
import Modal from '@/components/common/Modal';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Check, X, Eye, Trash2, Plus, MoreHorizontal, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogFooter, AlertDialogTitle, AlertDialogDescription,
  AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Pagination from '@/components/common/Pagination';
import Loader from '@/components/common/Loader';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  shortDescription: z.string().min(1, 'Short description is required'),
  description: z.string().min(1, 'Description is required'),
  organizer: z.string().min(1, 'Organizer is required'),
  category: z.string().min(1, 'Category is required'),
  venueName: z.string().min(1, 'Venue name is required'),
  venueAddress: z.string().optional(),
  venueCity: z.string().min(1, 'City is required'),
  venueCountry: z.string().min(1, 'Country is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  eventTime: z.string().min(1, 'Event time is required'),
  eventType: z.enum(['online', 'offline', 'hybrid']),
  ticketPrice: z.coerce.number().min(0),
  ticketQuantity: z.coerce.number().min(1),
  refundPolicy: z.string().optional(),
  termsAndConditions: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

const rejectSchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required'),
});
type RejectFormValues = z.infer<typeof rejectSchema>;

const ITEMS_PER_PAGE = 10;

const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'approved': return 'default';
    case 'pending': return 'secondary';
    case 'rejected': return 'destructive';
    case 'draft': return 'outline';
    default: return 'secondary';
  }
};

const EventsManagement: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const coverImageRef = useRef<HTMLInputElement>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const createForm = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '', shortDescription: '', description: '',
      organizer: '', category: '',
      venueName: '', venueAddress: '', venueCity: '', venueCountry: '',
      eventDate: '', eventTime: '',
      eventType: 'offline',
      ticketPrice: 0, ticketQuantity: 100,
      refundPolicy: 'Full refund available up to 24 hours before the event.',
      termsAndConditions: 'Standard terms and conditions apply.',
    },
  });

  const rejectForm = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { rejectionReason: '' },
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
    } catch {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizers = async () => {
    try {
      const response = await organizersAPI.getAll();
      setOrganizers(response.organizers ?? []);
    } catch {
      console.error('Failed to fetch organizers');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response);
    } catch {
      console.error('Failed to fetch categories');
    }
  };

  const handleApprove = async (eventId: string) => {
    try {
      await eventsAPI.updateStatus(eventId, { status: 'approved' });
      toast.success('Event approved successfully');
      fetchEvents();
    } catch {
      toast.error('Failed to approve event');
    }
  };

  const handleReject = async (data: RejectFormValues) => {
    if (!selectedEvent) return;
    try {
      await eventsAPI.updateStatus(selectedEvent._id, {
        status: 'rejected',
        rejectionReason: data.rejectionReason,
      });
      toast.success('Event rejected');
      setShowRejectModal(false);
      rejectForm.reset();
      setSelectedEvent(null);
      fetchEvents();
    } catch {
      toast.error('Failed to reject event');
    }
  };

  const handleToggleFeatured = async (eventId: string, isFeatured: boolean) => {
    try {
      await eventsAPI.toggleFeatured(eventId, !isFeatured);
      toast.success(`Event ${!isFeatured ? 'featured' : 'unfeatured'} successfully`);
      fetchEvents();
    } catch {
      toast.error('Failed to update event');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await eventsAPI.deleteEvent(deleteTargetId);
      toast.success('Event deleted successfully');
      setDeleteTargetId(null);
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleCreateEvent = async (data: EventFormValues) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('shortDescription', data.shortDescription);
      formData.append('organizer', data.organizer);
      formData.append('category', data.category);
      formData.append('venue', JSON.stringify({
        name: data.venueName,
        address: data.venueAddress || '',
        city: data.venueCity,
        country: data.venueCountry,
      }));
      formData.append('eventDate', data.eventDate);
      formData.append('eventTime', data.eventTime);
      formData.append('eventType', data.eventType);
      formData.append('ticketTypes', JSON.stringify([{
        name: 'General', description: 'General admission',
        price: data.ticketPrice, quantity: data.ticketQuantity, soldCount: 0,
      }]));
      formData.append('refundPolicy', data.refundPolicy || '');
      formData.append('termsAndConditions', data.termsAndConditions || '');
      formData.append('tags', JSON.stringify([]));
      if (coverImageFile) formData.append('coverImage', coverImageFile);

      await eventsAPI.createEvent(formData);
      toast.success('Event created successfully');
      setShowCreateModal(false);
      createForm.reset();
      setCoverImageFile(null);
      if (coverImageRef.current) coverImageRef.current.value = '';
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    }
  };

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch = !searchTerm || event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-background min-h-screen">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Events Management</h1>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Event
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="bg-card rounded-xl shadow-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No events found. Create your first event!
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEvents.map((event) => (
                    <TableRow key={event._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={event.coverImage || event.images?.[0] || '/event-placeholder.svg'}
                            alt={event.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <div className="font-medium text-foreground">{event.title}</div>
                            <div className="text-sm text-muted-foreground">{event.venue?.city || 'N/A'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {event.eventDate ? format(new Date(event.eventDate), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(event.status)}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={event.isFeatured}
                          onCheckedChange={() => handleToggleFeatured(event._id, event.isFeatured)}
                        />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(`/events/${event._id}`, '_blank')}>
                              <Eye className="w-4 h-4 mr-2" /> View
                            </DropdownMenuItem>
                            {event.status === 'pending' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleApprove(event._id)}>
                                  <Check className="w-4 h-4 mr-2 text-green-500" /> Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedEvent(event);
                                  setShowRejectModal(true);
                                }}>
                                  <X className="w-4 h-4 mr-2 text-destructive" /> Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteTargetId(event._id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="pb-4">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        )}
      </div>

      {/* Delete AlertDialog */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          rejectForm.reset();
          setSelectedEvent(null);
        }}
        title="Reject Event"
      >
        <form onSubmit={rejectForm.handleSubmit(handleReject)} className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Please provide a reason for rejecting this event:
          </p>
          <div className="space-y-1">
            <Textarea
              {...rejectForm.register('rejectionReason')}
              className="h-32"
              placeholder="Enter rejection reason..."
            />
            {rejectForm.formState.errors.rejectionReason && (
              <p className="text-xs text-destructive">{rejectForm.formState.errors.rejectionReason.message}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" className="flex-1">Reject Event</Button>
            <Button type="button" variant="outline" onClick={() => {
              setShowRejectModal(false);
              rejectForm.reset();
              setSelectedEvent(null);
            }} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Create Event Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); createForm.reset(); }}
        title="Create Event"
        size="lg"
      >
        <form onSubmit={createForm.handleSubmit(handleCreateEvent)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Title */}
            <div className="md:col-span-2 space-y-1">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" placeholder="Event Title" {...createForm.register('title')} />
              {createForm.formState.errors.title && (
                <p className="text-xs text-destructive">{createForm.formState.errors.title.message}</p>
              )}
            </div>

            {/* Short Description */}
            <div className="md:col-span-2 space-y-1">
              <Label htmlFor="shortDescription">Short Description *</Label>
              <Input id="shortDescription" placeholder="Brief summary" {...createForm.register('shortDescription')} />
              {createForm.formState.errors.shortDescription && (
                <p className="text-xs text-destructive">{createForm.formState.errors.shortDescription.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-1">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" placeholder="Full event description" className="h-24" {...createForm.register('description')} />
              {createForm.formState.errors.description && (
                <p className="text-xs text-destructive">{createForm.formState.errors.description.message}</p>
              )}
            </div>

            {/* Organizer */}
            <div className="space-y-1">
              <Label>Organizer *</Label>
              <Controller
                name="organizer"
                control={createForm.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select organizer" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizers.map((org) => (
                        <SelectItem key={org._id} value={org._id}>{org.organizationName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {createForm.formState.errors.organizer && (
                <p className="text-xs text-destructive">{createForm.formState.errors.organizer.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1">
              <Label>Category *</Label>
              <Controller
                name="category"
                control={createForm.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {createForm.formState.errors.category && (
                <p className="text-xs text-destructive">{createForm.formState.errors.category.message}</p>
              )}
            </div>

            {/* Venue Name */}
            <div className="space-y-1">
              <Label htmlFor="venueName">Venue Name *</Label>
              <Input id="venueName" placeholder="Venue name" {...createForm.register('venueName')} />
              {createForm.formState.errors.venueName && (
                <p className="text-xs text-destructive">{createForm.formState.errors.venueName.message}</p>
              )}
            </div>

            {/* Venue Address */}
            <div className="space-y-1">
              <Label htmlFor="venueAddress">Venue Address</Label>
              <Input id="venueAddress" placeholder="Street address" {...createForm.register('venueAddress')} />
            </div>

            {/* City */}
            <div className="space-y-1">
              <Label htmlFor="venueCity">City *</Label>
              <Input id="venueCity" placeholder="City" {...createForm.register('venueCity')} />
              {createForm.formState.errors.venueCity && (
                <p className="text-xs text-destructive">{createForm.formState.errors.venueCity.message}</p>
              )}
            </div>

            {/* Country */}
            <div className="space-y-1">
              <Label htmlFor="venueCountry">Country *</Label>
              <Input id="venueCountry" placeholder="Country" {...createForm.register('venueCountry')} />
              {createForm.formState.errors.venueCountry && (
                <p className="text-xs text-destructive">{createForm.formState.errors.venueCountry.message}</p>
              )}
            </div>

            {/* Event Date */}
            <div className="space-y-1">
              <Label htmlFor="eventDate">Event Date *</Label>
              <Input id="eventDate" type="date" {...createForm.register('eventDate')} />
              {createForm.formState.errors.eventDate && (
                <p className="text-xs text-destructive">{createForm.formState.errors.eventDate.message}</p>
              )}
            </div>

            {/* Event Time */}
            <div className="space-y-1">
              <Label htmlFor="eventTime">Event Time *</Label>
              <Input id="eventTime" type="time" {...createForm.register('eventTime')} />
              {createForm.formState.errors.eventTime && (
                <p className="text-xs text-destructive">{createForm.formState.errors.eventTime.message}</p>
              )}
            </div>

            {/* Event Type */}
            <div className="space-y-1">
              <Label>Event Type</Label>
              <Controller
                name="eventType"
                control={createForm.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Ticket Price */}
            <div className="space-y-1">
              <Label htmlFor="ticketPrice">Ticket Price</Label>
              <Input id="ticketPrice" type="number" min="0" placeholder="0" {...createForm.register('ticketPrice')} />
            </div>

            {/* Ticket Quantity */}
            <div className="space-y-1">
              <Label htmlFor="ticketQuantity">Total Tickets</Label>
              <Input id="ticketQuantity" type="number" min="1" placeholder="100" {...createForm.register('ticketQuantity')} />
            </div>

            {/* Cover Image */}
            <div className="md:col-span-2 space-y-1">
              <Label htmlFor="coverImage">Cover Image</Label>
              <Input
                ref={coverImageRef}
                id="coverImage"
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
              />
              {coverImageFile && (
                <p className="text-sm text-muted-foreground">Selected: {coverImageFile.name}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">Create Event</Button>
            <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); createForm.reset(); }} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EventsManagement;
