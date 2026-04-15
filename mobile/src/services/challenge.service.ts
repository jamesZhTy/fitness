import api from './api';
import { Challenge, ChallengeParticipant, ChallengeStatus } from '../types/team';

export const challengeService = {
  getChallenges: (status?: ChallengeStatus) =>
    api.get<Challenge[]>('/challenges', { params: status ? { status } : {} }).then((r) => r.data),
  getMyChallenges: () => api.get<Challenge[]>('/challenges/my').then((r) => r.data),
  getChallengeById: (id: string) => api.get<Challenge>(`/challenges/${id}`).then((r) => r.data),
  createChallenge: (data: any) => api.post<Challenge>('/challenges', data).then((r) => r.data),
  joinChallenge: (id: string) => api.post(`/challenges/${id}/join`).then((r) => r.data),
  getLeaderboard: (id: string) =>
    api.get<ChallengeParticipant[]>(`/challenges/${id}/leaderboard`).then((r) => r.data),
};
