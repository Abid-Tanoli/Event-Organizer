import React, { useEffect, useState } from 'react';
import { organizersAPI } from '@/api/organizers';
import { usersAPI } from '@/api/users';
import { Organizer, User } from '@/types';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';
import { Check, X, Trash2, Plus } from 'lucide-react';

interface CreateOrganizerForm {
  userId: string;
  organizationName: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  country: string;
  postalCode: string;
  addressLine: string;
}

const emptyOrganizerForm: CreateOrganizerForm = {
  userId: '',
  organizationName: '',
  description: '',
  contactEmail: '',
  contactPhone: '',
  city: '',
  country: '',
  postalCode: '',
  addressLine: '',
};

const OrganizersManagement: React.FC = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [newOrganizer, setNewOrganizer] = useState<CreateOrganizerForm>(emptyOrganizerForm);

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

  const handleReject = async () => {
    if (!selectedOrganizer || !rejectionReason) {
      toast.error('Provide rejection reason');
      return;
    }

    try {
      await organizersAPI.updateStatus(selectedOrganizer._id, {
        status: 'rejected',
        rejectionReason,
      });
      toast.success('Organizer rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedOrganizer(null);
      fetchOrganizers();
    } catch {
      toast.error('Rejection failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this organizer?')) return;

    try {
      await organizersAPI.delete(id);
      toast.success('Deleted successfully');
      fetchOrganizers();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleCreateOrganizer = async () => {
    const {
      userId,
      organizationName,
      description,
      contactEmail,
      contactPhone,
      city,
      country,
      postalCode,
      addressLine,
    } = newOrganizer;

    if (!userId || !organizationName || !description || !contactEmail || !contactPhone || !city || !country || !postalCode || !addressLine) {
      toast.error('Fill all fields');
      return;
    }

    try {
      await organizersAPI.create({
        user: userId,
        organizationName,
        description,
        contactEmail,
        contactPhone,
        address: {
          country,
          city,
          postalCode,
          addressLine,
        },
        status: 'pending',
      });

      toast.success('Organizer created');
      setShowCreateModal(false);
      setNewOrganizer(emptyOrganizerForm);
      fetchOrganizers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Create failed');
    }
  };

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="p-8">
        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold">Organizers Management</h1>
          <Button onClick={() => setShowCreateModal(true)} className="flex gap-2">
            <Plus className="w-4 h-4" /> Create Organizer
          </Button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-card rounded-xl shadow-lg overflow-hidden border">
            <table className="w-full">
              <thead className="bg-muted/60">
                <tr>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase">Organization</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase">Events</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizers.map((org) => (
                  <tr key={org._id} className="border-b last:border-0">
                    <td className="p-4">{org.organizationName}</td>
                    <td className="p-4">{org.contactEmail}</td>
                    <td className="p-4 capitalize">{org.status}</td>
                    <td className="p-4">{org.totalEvents}</td>
                    <td className="p-4 flex gap-2">
                      {org.status === 'pending' && (
                        <>
                          <Button size="sm" variant="success" onClick={() => handleApprove(org._id)}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              setSelectedOrganizer(org);
                              setShowRejectModal(true);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="danger" onClick={() => handleDelete(org._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Organizer"
      >
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg bg-background"
          placeholder="Enter rejection reason..."
        />
        <div className="flex gap-2 mt-4">
          <Button variant="danger" onClick={handleReject}>Reject</Button>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
        </div>
      </Modal>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Organizer"
      >
        <div className="space-y-4">
          <select
            value={newOrganizer.userId}
            onChange={(e) => setNewOrganizer({ ...newOrganizer, userId: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg bg-background"
          >
            <option value="">Select user account</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
            ))}
          </select>

          <input type="text" placeholder="Organization Name" value={newOrganizer.organizationName} onChange={(e) => setNewOrganizer({ ...newOrganizer, organizationName: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-background" />
          <input type="text" placeholder="Description" value={newOrganizer.description} onChange={(e) => setNewOrganizer({ ...newOrganizer, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-background" />
          <input type="email" placeholder="Contact Email" value={newOrganizer.contactEmail} onChange={(e) => setNewOrganizer({ ...newOrganizer, contactEmail: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-background" />
          <input type="text" placeholder="Contact Phone" value={newOrganizer.contactPhone} onChange={(e) => setNewOrganizer({ ...newOrganizer, contactPhone: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-background" />
          <input type="text" placeholder="Country" value={newOrganizer.country} onChange={(e) => setNewOrganizer({ ...newOrganizer, country: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-background" />
          <input type="text" placeholder="City" value={newOrganizer.city} onChange={(e) => setNewOrganizer({ ...newOrganizer, city: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-background" />
          <input type="text" placeholder="Postal Code" value={newOrganizer.postalCode} onChange={(e) => setNewOrganizer({ ...newOrganizer, postalCode: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-background" />
          <input type="text" placeholder="Address Line" value={newOrganizer.addressLine} onChange={(e) => setNewOrganizer({ ...newOrganizer, addressLine: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-background" />

          <Button onClick={handleCreateOrganizer}>Create Organizer</Button>
        </div>
      </Modal>
    </div>
  );
};

export default OrganizersManagement;