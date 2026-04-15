export enum FitnessLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  height: number | null;
  weight: number | null;
  fitnessLevel: FitnessLevel;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
