import React, { useState } from 'react';
import { SosData, sosService } from '../../services/sosService';
import { TableCell, TableRow, Chip, IconButton, Select, MenuItem, FormControl, Alert } from '@mui/material';
import { MapPin } from 'lucide-react';
import LocationModal from '../Requests/LocationModal';
import { useSos } from '../../contexts/SosContext';

const SosList: React.FC = () => {
  const { sosList, isLoading, hasActiveSos, error, refreshSosList } = useSos();
  const [selectedSos, setSelectedSos] = useState<SosData | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const handleViewLocation = (sos: SosData) => {
    setSelectedSos(sos);
    setIsLocationModalOpen(true);
  };

  const handleStatusChange = async (sosId: number, newStatus: SosData['status']) => {
    try {
      console.log(`Updating SOS ${sosId} status to ${newStatus}`);
      await sosService.updateSosStatus(sosId, newStatus);
      console.log('Status updated successfully, refreshing list...');
      await refreshSosList();
    } catch (error) {
      console.error('Error updating SOS status:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mt-8">
          <Alert severity="error">{error}</Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8">
        {hasActiveSos && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Active SOS Alert!</strong>
            <span className="block sm:inline"> There are active SOS alerts requiring attention.</span>
          </div>
        )}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              SOS Alerts
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SOS Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guard Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sosList.map((sos) => (
                  <TableRow 
                    key={sos.id}
                    className={sos.status === 'pending' ? 'bg-red-50' : ''}
                  >
                    <TableCell>
                      <Chip
                        label={sos.sos_type}
                        color={sos.sos_type === 'emergency' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{sos.guard_name}</TableCell>
                    <TableCell>
                      {new Date(sos.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" variant="outlined">
                        <Select
                          value={sos.status}
                          onChange={(e) => handleStatusChange(sos.id, e.target.value as SosData['status'])}
                          size="small"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="in_progress">In Progress</MenuItem>
                          <MenuItem value="resolved">Resolved</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewLocation(sos)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <MapPin className="h-5 w-5" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedSos && (
        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => {
            setIsLocationModalOpen(false);
            setSelectedSos(null);
          }}
          latitude={selectedSos.latitude}
          longitude={selectedSos.longitude}
          requestId={selectedSos.id.toString()}
        />
      )}
    </div>
  );
};

export default SosList; 