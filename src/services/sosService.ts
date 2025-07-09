import api from './api';

export interface SosData {
  id: number;
  sos_type: string;
  latitude: number;
  longitude: number;
  created_at: string;
  staff_id: number;
  guard_name: string;
  status: 'pending' | 'in_progress' | 'resolved';
  comment?: string;
}

export const sosService = {
  getSosList: async (): Promise<SosData[]> => {
    try {
      console.log('Fetching SOS list...');
      const response = await api.get<SosData[]>('/sos');
      console.log('SOS list fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('Error response:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  },

  updateSosStatus: async (sosId: number, status: SosData['status'], comment?: string): Promise<SosData> => {
    try {
      const response = await api.patch(`/sos/${sosId}/status`, { status, comment });
      return response.data;
    } catch (error) {
      console.error('Error updating SOS status:', error);
      throw error;
    }
  }
}; 