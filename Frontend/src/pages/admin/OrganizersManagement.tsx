import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/admin/Sidebar';
import { organizersAPI } from '../../api/organizers';
import { Organizer } from '../../types';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { Check, X, Trash2, Plus } from 'lucide-react';

interface CreateOrganizerForm {
  organizationName: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  country: string;
  postalCode: string;
  addressLine: string;
}

const OrganizersManagement: React.FC = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [newOrganizer, setNewOrganizer] = useState<CreateOrganizerForm>({
    organizationName: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    city: '',
    country: '',
    postalCode: '',
    addressLine: '',
  });

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    setLoading(true);
    try {
      const response = await organizersAPI.getAll();
      setOrganizers(response.data?.organizers || []);
    } catch {
      toast.error('Failed to fetch organizers');
    } finally {
      setLoading(false);
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
      organizationName,
      description,
      contactEmail,
      contactPhone,
      city,
      country,
      postalCode,
      addressLine,
    } = newOrganizer;

    if (
      !organizationName ||
      !description ||
      !contactEmail ||
      !contactPhone ||
      !city ||
      !country ||
      !postalCode ||
      !addressLine
    ) {
      toast.error('Fill all fields');
      return;
    }

    try {
      await organizersAPI.create({
        user: "698dbcc4857ee2791536c531", // replace later with real user
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

      setNewOrganizer({
        organizationName: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
        city: '',
        country: '',
        postalCode: '',
        addressLine: '',
      });

      fetchOrganizers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Create failed');
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold">Organizers Management</h1>
          <Button onClick={() => setShowCreateModal(true)} className="flex gap-2">
            <Plus className="w-4 h-4" /> Create Organizer
          </Button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <tbody>
                {organizers.map((org) => (
                  <tr key={org._id} className="border-b">
                    <td className="p-4">{org.organizationName}</td>
                    <td className="p-4">{org.contactEmail}</td>
                    <td className="p-4">{org.status}</td>
                    <td className="p-4">{org.totalEvents}</td>
                    <td className="p-4 flex gap-2">
                      {org.status === 'pending' && (
                        <>
                          <Button onClick={() => handleApprove(org._id)}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedOrganizer(org);
                              setShowRejectModal(true);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button onClick={() => handleDelete(org._id)}>
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

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Organizer"
      >
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="Enter rejection reason..."
        />
        <div className="flex gap-2 mt-4">
          <Button onClick={handleReject}>Reject</Button>
          <Button onClick={() => setShowRejectModal(false)}>Cancel</Button>
        </div>
      </Modal>

      {/* Create Organizer Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Organizer"
      >
        <div className="space-y-4">
          <input type="text" placeholder="Organization Name"
            value={newOrganizer.organizationName}
            onChange={(e) => setNewOrganizer({ ...newOrganizer, organizationName: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input type="text" placeholder="Description"
            value={newOrganizer.description}
            onChange={(e) => setNewOrganizer({ ...newOrganizer, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input type="email" placeholder="Contact Email"
            value={newOrganizer.contactEmail}
            onChange={(e) => setNewOrganizer({ ...newOrganizer, contactEmail: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input type="text" placeholder="Contact Phone"
            value={newOrganizer.contactPhone}
            onChange={(e) => setNewOrganizer({ ...newOrganizer, contactPhone: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input type="text" placeholder="Country"
            value={newOrganizer.country}
            onChange={(e) => setNewOrganizer({ ...newOrganizer, country: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input type="text" placeholder="City"
            value={newOrganizer.city}
            onChange={(e) => setNewOrganizer({ ...newOrganizer, city: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input type="text" placeholder="Postal Code"
            value={newOrganizer.postalCode}
            onChange={(e) => setNewOrganizer({ ...newOrganizer, postalCode: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input type="text" placeholder="Address Line"
            value={newOrganizer.addressLine}
            onChange={(e) => setNewOrganizer({ ...newOrganizer, addressLine: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <Button onClick={handleCreateOrganizer}>Create Organizer</Button>
        </div>
      </Modal>
    </div>
  );
};

export default OrganizersManagement;
