import api from './api';
import { CheckIn, CheckInStats } from '../types/checkin';

export const checkinService = {
  create: async (data: Partial<CheckIn>): Promise<CheckIn> => {
    const res = await api.post('/checkins', data);
    return res.data;
  },
  getByMonth: async (year: number, month: number): Promise<CheckIn[]> => {
    const res = await api.get('/checkins', { params: { year, month } });
    return res.data;
  },
  getStats: async (period: 'week' | 'month' | 'year'): Promise<CheckInStats> => {
    const res = await api.get('/checkins/stats', { params: { period } });
    return res.data;
  },
};
