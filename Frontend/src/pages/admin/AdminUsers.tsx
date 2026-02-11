import React from 'react';
import { Sidebar } from '../../components/admin/Sidebar';

const AdminUsers: React.FC = () => {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Users Management
        </h1>
        <p className="text-gray-600">
          Here you can manage all users of the system.
        </p>

        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-500">No users to display yet.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
