import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import { RequestData } from '../../services/requestService';
import { TableCell, TableRow, Chip, IconButton } from '@mui/material';
import { Visibility } from '@mui/icons-material';

interface RequestsTableProps {
  requests: RequestData[];
  onRequestClick?: (requestId: number) => void;
}

const RequestsTable: React.FC<RequestsTableProps> = ({ requests, onRequestClick }) => {
  const navigate = useNavigate();

  const handleRequestClick = (requestId: number) => {
    if (onRequestClick) {
      onRequestClick(requestId);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Charges
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pickup Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pickup Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.clientName}</TableCell>
                      <TableCell>{request.branchName}</TableCell>
                      <TableCell>{request.serviceTypeName}</TableCell>
                      <TableCell>{Number(request.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>{request.pickupLocation}</TableCell>
                      <TableCell>{request.deliveryLocation}</TableCell>
                      <TableCell>{new Date(request.pickupDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={request.status}
                          color={
                            request.status === 'completed'
                              ? 'success'
                              : request.status === 'in_progress'
                              ? 'warning'
                              : request.status === 'cancelled'
                              ? 'error'
                              : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleRequestClick(request.id)}
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestsTable; 