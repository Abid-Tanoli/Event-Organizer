import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/admin/Sidebar';
import { organizersAPI } from '../../api/organizers';
import { Organizer } from '../../types';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { Check, X, Trash2 } from 'lucide-react';

const OrganizersManagement: React.FC = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    setLoading(true);
    try {
      const response = await organizersAPI.getAll();
      setOrganizers(response.data?.organizers || []);
    } catch (error) {
      toast.error('Failed to fetch organizers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (organizerId: string) => {
    try {
      await organizersAPI.updateStatus(organizerId, { status: 'approved' });
      toast.success('Organizer approved successfully');
      fetchOrganizers();
    } catch (error) {
      toast.error('Failed to approve organizer');
    }
  };

  const handleReject = async () => {
    if (!selectedOrganizer || !rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await organizersAPI.updateStatus(selectedOrganizer._id, {
        status: 'rejected',
        rejectionReason,
      });
      toast.success('Organizer rejected');
      setShowModal(false);
      setRejectionReason('');
      setSelectedOrganizer(null);
      fetchOrganizers();
    } catch (error) {
      toast.error('Failed to reject organizer');
    }
  };

  const handleDelete = async (organizerId: string) => {
    if (!window.confirm('Are you sure you want to delete this organizer?')) return;

    try {
      await organizersAPI.delete(organizerId);
      toast.success('Organizer deleted successfully');
      fetchOrganizers();
    } catch (error) {
      toast.error('Failed to delete organizer');
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Organizers Management</h1>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Events
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {organizers.map((organizer) => (
                    <tr key={organizer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {organizer.organizationName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {organizer.address.city}, {organizer.address.country}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{organizer.contactEmail}</div>
                        <div className="text-gray-500">{organizer.contactPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            organizer.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : organizer.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {organizer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {organizer.totalEvents}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {organizer.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleApprove(organizer._id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => {
                                  setSelectedOrganizer(organizer);
                                  setShowModal(true);
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(organizer._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setRejectionReason('');
          setSelectedOrganizer(null);
        }}
        title="Reject Organizer"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please provide a reason for rejecting this organizer:
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none h-32"
            placeholder="Enter rejection reason..."
          />
          <div className="flex gap-2">
            <Button variant="danger" onClick={handleReject} className="flex-1">
              Reject Organizer
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setRejectionReason('');
                setSelectedOrganizer(null);
              }}
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

export default OrganizersManagement;