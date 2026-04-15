import { User } from './user';
import { CheckIn } from './checkin';

export interface Post {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'username' | 'avatar'>;
  content: string;
  images: string[] | null;
  checkInId: string | null;
  checkIn: CheckIn | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: Pick<User, 'id' | 'username' | 'avatar'>;
  content: string;
  createdAt: string;
}

export interface FollowCounts {
  followers: number;
  following: number;
}
