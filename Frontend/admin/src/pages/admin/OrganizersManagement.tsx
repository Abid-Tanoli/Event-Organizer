import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { organizersAPI } from '@/api/organizers';
import { usersAPI } from '@/api/users';
import { Organizer, User } from '@/types';
import Modal from '@/components/common/Modal';
import { toast } from 'sonner';
import { Check, X, Trash2, Plus, MoreHorizontal, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Pagination from '@/components/common/Pagination';
import Loader from '@/components/common/Loader';

const organizerSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
  description: z.string().min(1, 'Description is required'),
  contactEmail: z.string().email('Valid email required'),
  contactPhone: z.string().min(1, 'Phone is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  addressLine: z.string().min(1, 'Address is required'),
});
type OrganizerFormValues = z.infer<typeof organizerSchema>;

const rejectSchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required'),
});
type RejectFormValues = z.infer<typeof rejectSchema>;

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'approved': return 'default';
    case 'pending': return 'secondary';
    case 'rejected': return 'destructive';
    default: return 'secondary';
  }
};

const ITEMS_PER_PAGE = 10;

const OrganizersManagement: React.FC = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const createForm = useForm<OrganizerFormValues>({
    resolver: zodResolver(organizerSchema),
    defaultValues: {
      userId: '', organizationName: '', description: '',
      contactEmail: '', contactPhone: '',
      city: '', country: '', postalCode: '', addressLine: '',
    },
  });

  const rejectForm = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { rejectionReason: '' },
  });

  useEffect(() => {
    fetchOrganizers();
    fetchUsers();
  }, []);

  const fetchOrganizers = async () => {
    setLoading(true);
    try {
      const response = await organizersAPI.getAll();
      setOrganizers(response.organizers ?? []);
    } catch {
      toast.error('Failed to fetch organizers');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response);
    } catch {
      toast.error('Failed to fetch users');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await organizersAPI.updateStatus(id, { status: 'approved' });
      toast.success('Organizer approved');
      fetchOrganizers();
    } catch {
      toast.error('Approval failed');
    }
  };

  const handleReject = async (data: RejectFormValues) => {
    if (!selectedOrganizer) return;
    try {
      await organizersAPI.updateStatus(selectedOrganizer._id, {
        status: 'rejected',
        rejectionReason: data.rejectionReason,
      });
      toast.success('Organizer rejected');
      setShowRejectModal(false);
      rejectForm.reset();
      setSelectedOrganizer(null);
      fetchOrganizers();
    } catch {
      toast.error('Rejection failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await organizersAPI.delete(deleteTargetId);
      toast.success('Deleted successfully');
      setDeleteTargetId(null);
      fetchOrganizers();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleCreateOrganizer = async (data: OrganizerFormValues) => {
    try {
      await organizersAPI.create({
        user: data.userId,
        organizationName: data.organizationName,
        description: data.description,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: {
          country: data.country,
          city: data.city,
          postalCode: data.postalCode,
          addressLine: data.addressLine,
        },
        status: 'pending',
      });
      toast.success('Organizer created');
      setShowCreateModal(false);
      createForm.reset();
      fetchOrganizers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Create failed');
    }
  };

  const filteredOrganizers = organizers.filter((org) => {
    const matchesSearch = !searchTerm || org.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) || org.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || statusFilter === 'all' || org.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrganizers.length / ITEMS_PER_PAGE);
  const paginatedOrganizers = filteredOrganizers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-background min-h-screen">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Organizers Management</h1>
          <Button onClick={() => setShowCreateModal(true)} className="flex gap-2">
            <Plus className="w-4 h-4" /> Create Organizer
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="bg-card rounded-xl shadow-lg overflow-hidden border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrganizers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No organizers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrganizers.map((org) => (
                    <TableRow key={org._id}>
                      <TableCell className="font-medium">{org.organizationName}</TableCell>
                      <TableCell className="text-muted-foreground">{org.contactEmail}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(org.status)}>
                          {org.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{org.totalEvents}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {org.status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprove(org._id)}>
                                  <Check className="w-4 h-4 mr-2 text-green-500" /> Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedOrganizer(org);
                                  setShowRejectModal(true);
                                }}>
                                  <X className="w-4 h-4 mr-2 text-destructive" /> Reject
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteTargetId(org._id)}
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
            <AlertDialogTitle>Delete Organizer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this organizer? This action cannot be undone.
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
        onClose={() => { setShowRejectModal(false); rejectForm.reset(); setSelectedOrganizer(null); }}
        title="Reject Organizer"
      >
        <form onSubmit={rejectForm.handleSubmit(handleReject)} className="space-y-4">
          <div className="space-y-1">
            <Label>Rejection Reason *</Label>
            <Textarea
              {...rejectForm.register('rejectionReason')}
              className="bg-background"
              placeholder="Enter rejection reason..."
            />
            {rejectForm.formState.errors.rejectionReason && (
              <p className="text-xs text-destructive">{rejectForm.formState.errors.rejectionReason.message}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="destructive">Reject</Button>
            <Button type="button" variant="outline" onClick={() => {
              setShowRejectModal(false);
              rejectForm.reset();
              setSelectedOrganizer(null);
            }}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Create Organizer Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); createForm.reset(); }}
        title="Create Organizer"
      >
        <form onSubmit={createForm.handleSubmit(handleCreateOrganizer)} className="space-y-3">
          {/* User */}
          <div className="space-y-1">
            <Label>User Account *</Label>
            <Controller
              name="userId"
              control={createForm.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user account" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {createForm.formState.errors.userId && (
              <p className="text-xs text-destructive">{createForm.formState.errors.userId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="organizationName">Organization Name *</Label>
              <Input id="organizationName" placeholder="Organization Name" {...createForm.register('organizationName')} />
              {createForm.formState.errors.organizationName && (
                <p className="text-xs text-destructive">{createForm.formState.errors.organizationName.message}</p>
              )}
            </div>

            <div className="col-span-2 space-y-1">
              <Label htmlFor="orgDescription">Description *</Label>
              <Textarea id="orgDescription" placeholder="Description" {...createForm.register('description')} />
              {createForm.formState.errors.description && (
                <p className="text-xs text-destructive">{createForm.formState.errors.description.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input id="contactEmail" type="email" placeholder="Email" {...createForm.register('contactEmail')} />
              {createForm.formState.errors.contactEmail && (
                <p className="text-xs text-destructive">{createForm.formState.errors.contactEmail.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="contactPhone">Phone *</Label>
              <Input id="contactPhone" placeholder="Phone" {...createForm.register('contactPhone')} />
              {createForm.formState.errors.contactPhone && (
                <p className="text-xs text-destructive">{createForm.formState.errors.contactPhone.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="country">Country *</Label>
              <Input id="country" placeholder="Country" {...createForm.register('country')} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="city">City *</Label>
              <Input id="city" placeholder="City" {...createForm.register('city')} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input id="postalCode" placeholder="Postal Code" {...createForm.register('postalCode')} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="addressLine">Address *</Label>
              <Input id="addressLine" placeholder="Address Line" {...createForm.register('addressLine')} />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">Create Organizer</Button>
            <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); createForm.reset(); }} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrganizersManagement;