import React, { useState, useEffect } from 'react';
import { Notice, noticeService, CreateNoticeData } from '../services/noticeService';
import { TableCell, TableRow, Chip, IconButton, TextField, Button } from '@mui/material';
import { Visibility, Edit, Delete, Add } from '@mui/icons-material';

const NoticePage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [newNotice, setNewNotice] = useState<CreateNoticeData>({
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
      try {
        setIsLoading(true);
      const data = await noticeService.getNotices();
      setNotices(data);
        setError(null);
      } catch (err) {
      console.error('Error fetching notices:', err);
      setError('Failed to load notices. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewNotice(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && editingNotice) {
        const updatedNotice = await noticeService.updateNotice(editingNotice.id, newNotice);
        setNotices(prev => prev.map(n => n.id === editingNotice.id ? updatedNotice : n));
      } else {
        const createdNotice = await noticeService.createNotice(newNotice);
        setNotices(prev => [...prev, createdNotice]);
      }

      // Reset form and close modal
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingNotice(null);
      setNewNotice({
        title: '',
        content: ''
      });
    } catch (err) {
      console.error('Error saving notice:', err);
      setError(isEditMode ? 'Failed to update notice' : 'Failed to create notice');
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setNewNotice({
      title: notice.title,
      content: notice.content
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await noticeService.deleteNotice(id);
        setNotices(prev => prev.filter(n => n.id !== id));
    } catch (err) {
        console.error('Error deleting notice:', err);
        setError('Failed to delete notice');
      }
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      const updatedNotice = await noticeService.toggleNoticeStatus(id, newStatus);
      setNotices(prev => prev.map(n => n.id === id ? updatedNotice : n));
    } catch (err) {
      console.error('Error updating notice status:', err);
      setError('Failed to update notice status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading notices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Notice Board
            </h3>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => {
                setIsModalOpen(true);
                setIsEditMode(false);
                setEditingNotice(null);
                setNewNotice({
                  title: '',
                  content: ''
                });
              }}
              >
                Add Notice
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No notices found
                    </td>
                  </tr>
                ) : (
                  notices.map((notice) => (
                    <TableRow key={notice.id}>
                      <TableCell>{notice.title}</TableCell>
                      <TableCell className="max-w-md truncate">{notice.content}</TableCell>
                      <TableCell>{new Date(notice.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={notice.status === 1 ? 'Active' : 'Inactive'}
                          color={notice.status === 1 ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(notice)}
                            title="Edit"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(notice.id)}
                            title="Delete"
                          >
                            <Delete />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(notice.id, notice.status)}
                            title={notice.status === 1 ? 'Deactivate' : 'Activate'}
                          >
                            <Visibility />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditMode ? 'Edit Notice' : 'Add New Notice'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditMode(false);
                  setEditingNotice(null);
                  setNewNotice({
                    title: '',
                    content: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <TextField
                  type="text"
                  name="title"
                  id="title"
                  required
                  fullWidth
                  value={newNotice.title}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <TextField
                  name="content"
                  id="content"
                  required
                  fullWidth
                  multiline
                  rows={4}
                  value={newNotice.content}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setEditingNotice(null);
                    setNewNotice({
                      title: '',
                      content: ''
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  {isEditMode ? 'Update Notice' : 'Add Notice'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticePage;