import api from './api';
import { Post, Comment, FollowCounts } from '../types/social';

export const postService = {
  createPost: (data: { content: string; images?: string[]; checkInId?: string }) =>
    api.post<Post>('/posts', data).then((r) => r.data),

  getFeed: (page = 1, limit = 20) =>
    api.get<Post[]>('/posts/feed', { params: { page, limit } }).then((r) => r.data),

  getPostById: (id: string) =>
    api.get<Post>(`/posts/${id}`).then((r) => r.data),

  getUserPosts: (userId: string, page = 1, limit = 20) =>
    api.get<Post[]>(`/users/${userId}/posts`, { params: { page, limit } }).then((r) => r.data),

  deletePost: (id: string) =>
    api.delete(`/posts/${id}`).then((r) => r.data),

  getComments: (postId: string, page = 1, limit = 20) =>
    api.get<Comment[]>(`/posts/${postId}/comments`, { params: { page, limit } }).then((r) => r.data),

  createComment: (postId: string, content: string) =>
    api.post<Comment>(`/posts/${postId}/comments`, { content }).then((r) => r.data),

  deleteComment: (id: string) =>
    api.delete(`/comments/${id}`).then((r) => r.data),

  toggleLike: (postId: string) =>
    api.post<{ liked: boolean }>(`/posts/${postId}/like`).then((r) => r.data),

  toggleFollow: (userId: string) =>
    api.post<{ following: boolean }>(`/users/${userId}/follow`).then((r) => r.data),

  getFollowers: (userId: string) =>
    api.get(`/users/${userId}/followers`).then((r) => r.data),

  getFollowing: (userId: string) =>
    api.get(`/users/${userId}/following`).then((r) => r.data),

  getFollowCounts: (userId: string) =>
    api.get<FollowCounts>(`/users/${userId}/follow-counts`).then((r) => r.data),
};
