import api from './api';
import { WorkoutCategory, WorkoutPlan } from '../types/workout';

export const workoutService = {
  getCategories: async (): Promise<WorkoutCategory[]> => {
    const res = await api.get('/workouts/categories');
    return res.data;
  },

  getPlansByCategory: async (categoryId: string, difficulty?: string): Promise<WorkoutPlan[]> => {
    const params = difficulty ? { difficulty } : {};
    const res = await api.get(`/workouts/categories/${categoryId}/plans`, { params });
    return res.data;
  },

  getPlanById: async (planId: string): Promise<WorkoutPlan> => {
    const res = await api.get(`/workouts/plans/${planId}`);
    return res.data;
  },
};
