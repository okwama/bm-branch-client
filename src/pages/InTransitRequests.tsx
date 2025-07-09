import React, { useState, useEffect } from 'react';
import RequestsTable from '../components/Requests/RequestsTable';
import { RequestData, requestService } from '../services/requestService';
import { useAuth } from '../contexts/AuthContext';
import StatCards from '../components/Dashboard/StatCards';
import { MapPin } from 'lucide-react';
import LocationModal from '../components/Requests/LocationModal';

const InTransitRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const fetchRequests = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch requests with myStatus = 2 (in transit)
      const data = await requestService.getRequests({ myStatus: 2 });
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

  const handleViewLocation = (request: RequestData) => {
    console.log('Viewing location for request:', request);
    setSelectedRequest(request);
    setIsLocationModalOpen(true);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8">
        <StatCards />
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              In Transit Requests
            </h3>
          </div>
          <div className="p-2">
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <RequestsTable 
                requests={requests} 
                onRequestClick={(requestId) => {
                  const request = requests.find(r => r.id === requestId);
                  if (request) {
                    handleViewLocation(request);
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {selectedRequest && (
        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => {
            setIsLocationModalOpen(false);
            setSelectedRequest(null);
          }}
          latitude={selectedRequest.latitude}
          longitude={selectedRequest.longitude}
          requestId={selectedRequest.id.toString()}
        />
      )}
    </div>
  );
};

export default InTransitRequestsPage; 