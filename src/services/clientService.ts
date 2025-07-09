import { api } from './api';

export interface Client {
  id: number;
  name: string;
  account_number: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  name: string;
  account_number: string;
  email: string;
  phone?: string;
  address?: string;
}

export const clientService = {
  getClients: async (): Promise<Client[]> => {
    try {
      console.log('Attempting to fetch clients...');
      const response = await api.get<Client[]>('/clients');
      console.log('Clients fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in getClients:', error);
      throw error; // Let the error propagate up
    }
  },

  getClient: async (id: number): Promise<Client> => {
    try {
      console.log('Fetching client:', id);
      const response = await api.get<Client>(`/clients/${id}`);
      console.log('Client fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching client:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch client details');
    }
  },

  createClient: async (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => {
    try {
      const response = await api.post<Client>('/clients', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to create client');
    }
  },

  updateClient: async (id: number, data: Partial<Client>): Promise<Client> => {
    try {
      const response = await api.put<Client>(`/clients/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to update client');
    }
  },

  deleteClient: async (id: number): Promise<void> => {
    try {
      await api.delete(`/clients/${id}`);
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to delete client');
    }
  }
}; 