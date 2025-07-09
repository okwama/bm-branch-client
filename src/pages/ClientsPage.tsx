import React from 'react';
import { useNavigate } from 'react-router-dom';
import ClientsTable from '../components/Dashboard/ClientsTable';

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
           
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/dashboard/clients/add')}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
          >
            Add Client
          </button>
        </div>
      </div>
      <div className="mt-8">
        <ClientsTable />
      </div>
    </div>
  );
};

export default ClientsPage; 