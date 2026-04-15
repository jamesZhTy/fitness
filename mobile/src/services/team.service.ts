import api from './api';
import { Team, TeamMember } from '../types/team';

export const teamService = {
  getTeams: () => api.get<Team[]>('/teams').then((r) => r.data),
  getMyTeams: () => api.get<Team[]>('/teams/my').then((r) => r.data),
  getTeamById: (id: string) => api.get<Team>(`/teams/${id}`).then((r) => r.data),
  getMembers: (id: string) => api.get<TeamMember[]>(`/teams/${id}/members`).then((r) => r.data),
  createTeam: (data: { name: string; description?: string; maxMembers?: number }) =>
    api.post<Team>('/teams', data).then((r) => r.data),
  joinTeam: (id: string) => api.post(`/teams/${id}/join`).then((r) => r.data),
  leaveTeam: (id: string) => api.post(`/teams/${id}/leave`).then((r) => r.data),
  deleteTeam: (id: string) => api.delete(`/teams/${id}`).then((r) => r.data),
};
