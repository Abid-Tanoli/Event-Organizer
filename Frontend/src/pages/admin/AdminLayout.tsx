import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/admin/Sidebar';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <Outlet /> 
      </div>
    </div>
  );
};

export default AdminLayout;
