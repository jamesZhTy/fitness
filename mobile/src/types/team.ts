import { User } from './user';

export interface Team {
  id: string;
  name: string;
  description: string | null;
  captainId: string;
  captain: Pick<User, 'id' | 'username' | 'avatar'>;
  maxMembers: number;
  memberCount: number;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  user: Pick<User, 'id' | 'username' | 'avatar'>;
  joinedAt: string;
}

export enum ChallengeType {
  CONSECUTIVE_CHECKIN = 'consecutive_checkin',
  TOTAL_DURATION = 'total_duration',
  TEAM_PK = 'team_pk',
}

export enum ChallengeStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  type: ChallengeType;
  status: ChallengeStatus;
  goal: number;
  startDate: string;
  endDate: string;
  creatorId: string;
  creator: Pick<User, 'id' | 'username' | 'avatar'>;
  participantCount: number;
  createdAt: string;
}

export interface ChallengeParticipant {
  id: string;
  challengeId: string;
  userId: string;
  user: Pick<User, 'id' | 'username' | 'avatar'>;
  progress: number;
  joinedAt: string;
}
