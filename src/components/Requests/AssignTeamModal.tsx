import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from 'lucide-react';
import { Team, teamService } from '../../services/teamService';
import { RequestData, requestService } from '../../services/requestService';

interface AssignTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  request: RequestData;
}

const AssignTeamModal: React.FC<AssignTeamModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  request 
}) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true);
        const teamsData = await teamService.getTeams(true);
        setTeams(teamsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to load teams');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchTeams();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) {
      setError('Please select a team');
      return;
    }

    try {
      setIsSubmitting(true);
      // Find the selected team and its team leader
      const selectedTeam = teams.find(t => t.id === selectedTeamId);
      let staff_id = null;
      if (selectedTeam) {
        const teamLeader = selectedTeam.members.find(m => m.role === 'Team Leader');
        if (teamLeader) {
          staff_id = teamLeader.id;
        }
      }
      await requestService.updateRequest(request.id, {
        team_id: selectedTeamId,
        status: 2, // 2 represents in_progress
        myStatus: 1, // Update to pending status
        staff_id // Set the crew commander (team leader)
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error assigning team:', err);
      setError('Failed to assign team');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-4"
                >
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Assign Team to Request
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                {error && (
                  <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="team" className="block text-sm font-medium text-gray-700">
                      Select Team
                    </label>
                    <select
                      id="team"
                      value={selectedTeamId || ''}
                      onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                      disabled={isLoading}
                    >
                      <option value="">Select a team</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.members.length} members)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Assigning...' : 'Assign Team'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AssignTeamModal; 