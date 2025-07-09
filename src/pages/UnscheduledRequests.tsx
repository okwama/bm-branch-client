import React, { useState, useEffect } from 'react';
import RequestFormModal from '../components/Requests/RequestFormModal';
import RequestsTable from '../components/Requests/RequestsTable';
import { RequestData, requestService } from '../services/requestService';
import { useAuth } from '../contexts/AuthContext';
import StatCards from '../components/Dashboard/StatCards';

const UnscheduledRequestsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchRequests = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch requests with myStatus = 0 (unscheduled)
      const data = await requestService.getRequests({ myStatus: 0 });
      // Filter requests to only show those belonging to the current branch
      const userRequests = data.filter(request => request.branchId === user.id);
      setRequests(userRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user?.id]); // Re-fetch when user ID changes

  const handleSuccess = () => {
    fetchRequests(); // Refresh the table data after successful submission
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8">
      <StatCards/>
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Unscheduled Requests
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-900 hover:bg-red-700 opacity-80"
            >
              Add New Request
            </button>
          </div>
          <div className="p-2">
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <RequestsTable 
                requests={requests} 
              />
            )}
          </div>
        </div>
      </div>

      <RequestFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default UnscheduledRequestsPage;