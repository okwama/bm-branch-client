import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon, Edit2, Users } from 'lucide-react';
import { RequestData, requestService } from '../../services/requestService';
import { Team, teamService } from '../../services/teamService';
import AssignTeamModal from './AssignTeamModal';

interface TeamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: RequestData;
  team: Team | null;
  onSuccess: () => void;
}

const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({
  isOpen,
  onClose,
  request,
  team,
  onSuccess
}) => {
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState(request.deliveryLocation);
  const [isAssignTeamModalOpen, setIsAssignTeamModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await requestService.updateRequest(request.id, {
        deliveryLocation
      });
      setIsEditingLocation(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating delivery location:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
                      Request Details
                    </h3>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                    >
                      <XIcon className="h-6 w-6" />
                    </button>
                  </Dialog.Title>

                  <div className="mt-4">
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Request Information</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-500">Pickup Location</p>
                          <p className="text-sm font-medium">{request.pickupLocation}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Delivery Location</p>
                          {isEditingLocation ? (
                            <form onSubmit={handleLocationSubmit} className="mt-1">
                              <input
                                type="text"
                                value={deliveryLocation}
                                onChange={(e) => setDeliveryLocation(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                                disabled={isSubmitting}
                              />
                              <div className="mt-2 flex justify-end space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsEditingLocation(false);
                                    setDeliveryLocation(request.deliveryLocation);
                                  }}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={isSubmitting}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-900 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  {isSubmitting ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{request.deliveryLocation}</p>
                              <button
                                onClick={() => setIsEditingLocation(true)}
                                className="text-gray-400 hover:text-gray-500"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Pickup Date</p>
                          <p className="text-sm font-medium">
                            {new Date(request.pickupDate).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Priority</p>
                          <p className="text-sm font-medium capitalize">{request.priority}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">Assigned Team</h4>
                        <button
                          onClick={() => setIsAssignTeamModalOpen(true)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-900 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Users className="h-4 w-4 mr-1" />
                          {team ? 'Reassign Team' : 'Assign Team'}
                        </button>
                      </div>
                      {team ? (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium mb-4">{team.name}</p>
                          <div className="space-y-4">
                            {team.members.map((member) => (
                              <div key={member.id} className="flex items-center space-x-3">
                                {member.photo_url && (
                                  <img
                                    src={member.photo_url}
                                    alt={member.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                )}
                                <div>
                                  <p className="text-sm font-medium">{member.name}</p>
                                  <p className="text-sm text-gray-500">{member.role}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No team has been assigned to this request yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {isAssignTeamModalOpen && (
        <AssignTeamModal
          isOpen={isAssignTeamModalOpen}
          onClose={() => setIsAssignTeamModalOpen(false)}
          onSuccess={() => {
            setIsAssignTeamModalOpen(false);
            onSuccess();
          }}
          request={request}
        />
      )}
    </>
  );
};

export default TeamDetailsModal; 