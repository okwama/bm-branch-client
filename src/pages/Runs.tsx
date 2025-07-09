import React, { useState, useEffect } from 'react';
import RunsTable from '../components/Requests/RunsTable';
import TeamDetailsModal from '../components/Requests/TeamDetailsModal';
import { RequestData, requestService } from '../services/requestService';
import { Team, teamService } from '../services/teamService';
import { useAuth } from '../contexts/AuthContext';
import StatCards from '../components/Dashboard/StatCards';

const PendingRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const fetchRequests = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch requests with myStatus = 1 (pending)
      const data = await requestService.getRequests({ myStatus: 3 });
      // Filter requests to only show those belonging to the current user
      const userRequests = data.filter(request => request.userId === user.id);
      setRequests(userRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestClick = async (request: RequestData) => {
    setSelectedRequest(request);
    if (request.team_id) {
      try {
        const teams = await teamService.getTeams();
        const team = teams.find(t => t.id === request.team_id);
        setSelectedTeam(team || null);
      } catch (error) {
        console.error('Error fetching team details:', error);
        setSelectedTeam(null);
      }
    } else {
      setSelectedTeam(null);
    }
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchRequests();
  }, [user?.id]); // Re-fetch when user ID changes

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Runs Reports
            </h3>
          </div>
          <div className="p-2">
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <RunsTable 
                requests={requests} 
                onRequestClick={(requestId) => {
                  const request = requests.find(r => r.id === requestId);
                  if (request) {
                    handleRequestClick(request);
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {selectedRequest && (
        <TeamDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRequest(null);
            setSelectedTeam(null);
          }}
          request={selectedRequest}
          team={selectedTeam}
          onSuccess={() => {
            fetchRequests();
          }}
        />
      )}
    </div>
  );
};

export default PendingRequestsPage; 