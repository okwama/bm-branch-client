import React, { useState } from 'react';
import { SosData, sosService } from '../services/sosService';
import { TableCell, TableRow, Chip, IconButton, Select, MenuItem, FormControl, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { MapPin } from 'lucide-react';
import LocationModal from '../components/Requests/LocationModal';
import { useSos } from '../contexts/SosContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const SosListPage: React.FC = () => {
  const { sosList, isLoading, hasActiveSos, refreshSosList } = useSos();
  const [selectedSos, setSelectedSos] = useState<SosData | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ id: number; status: SosData['status'] } | null>(null);
  const [statusFilter, setStatusFilter] = useState<SosData['status'] | 'all'>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleViewLocation = (sos: SosData) => {
    setSelectedSos(sos);
    setIsLocationModalOpen(true);
  };

  const handleStatusChange = async (sosId: number, newStatus: SosData['status']) => {
    setPendingStatusUpdate({ id: sosId, status: newStatus });
    setIsCommentDialogOpen(true);
  };

  const handleCommentSubmit = async () => {
    if (!pendingStatusUpdate) return;

    try {
      await sosService.updateSosStatus(pendingStatusUpdate.id, pendingStatusUpdate.status, comment);
      await refreshSosList();
      setIsCommentDialogOpen(false);
      setComment('');
      setPendingStatusUpdate(null);
    } catch (error) {
      console.error('Error updating SOS status:', error);
    }
  };

  const handleCommentCancel = () => {
    setIsCommentDialogOpen(false);
    setComment('');
    setPendingStatusUpdate(null);
  };

  const handleDateChange = (setter: React.Dispatch<React.SetStateAction<Date | null>>) => (date: Date | null) => {
    setter(date);
  };

  const filteredSosList = sosList.filter(sos => {
    const sosDate = new Date(sos.created_at);
    const matchesStatus = statusFilter === 'all' ? true : sos.status === statusFilter;
    
    const matchesDateRange = (!startDate || sosDate >= startDate) && 
                            (!endDate || sosDate <= new Date(endDate.setHours(23, 59, 59, 999)));
    
    return matchesStatus && matchesDateRange;
  });

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                SOS Alerts
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={handleDateChange(setStartDate)}
                      slotProps={{ textField: { size: 'small' } }}
                    />
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={handleDateChange(setEndDate)}
                      slotProps={{ textField: { size: 'small' } }}
                    />
                  </Box>
                </LocalizationProvider>
                <FormControl size="small" variant="outlined" sx={{ minWidth: 150 }}>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as SosData['status'] | 'all')}
                    size="small"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
          </div>
          <div className="p-2">
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
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
                        Comment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSosList.map((sos) => (
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
                          {sos.comment || '-'}
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
            )}
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

      <Dialog open={isCommentDialogOpen} onClose={handleCommentCancel}>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCommentCancel}>Cancel</Button>
          <Button onClick={handleCommentSubmit} variant="contained" color="primary">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SosListPage; 