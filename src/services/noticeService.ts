import { api } from './api';

export interface Notice {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  created_by_name?: string;
  status: number;
}

export interface CreateNoticeData {
  title: string;
  content: string;
}

class NoticeService {
  async getNotices(): Promise<Notice[]> {
    const response = await api.get('/notices');
    return response.data;
  }

  async createNotice(data: CreateNoticeData): Promise<Notice> {
    const response = await api.post('/notices', data);
    return response.data;
  }

  async updateNotice(id: number, data: CreateNoticeData): Promise<Notice> {
    const response = await api.patch(`/notices/${id}`, data);
    return response.data;
  }

  async deleteNotice(id: number): Promise<void> {
    await api.delete(`/notices/${id}`);
  }

  async toggleNoticeStatus(id: number, status: number): Promise<Notice> {
    const response = await api.patch(`/notices/${id}/status`, { status });
    return response.data;
  }
}

export const noticeService = new NoticeService(); 