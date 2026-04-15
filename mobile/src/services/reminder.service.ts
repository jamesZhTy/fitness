import api from './api';
import { Reminder } from '../types/checkin';

export const reminderService = {
  getAll: async (): Promise<Reminder[]> => {
    const res = await api.get('/reminders');
    return res.data;
  },
  create: async (data: { time: string; repeatDays: string[]; message?: string }): Promise<Reminder> => {
    const res = await api.post('/reminders', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Reminder>): Promise<Reminder> => {
    const res = await api.patch(`/reminders/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/reminders/${id}`);
  },
};
