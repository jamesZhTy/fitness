import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { Like } from './entities/like.entity';
import { Follow } from './entities/follow.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepo: Repository<Post>,
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
    @InjectRepository(Like) private likeRepo: Repository<Like>,
    @InjectRepository(Follow) private followRepo: Repository<Follow>,
  ) {}

  // ---- Posts ----

  async createPost(userId: string, dto: CreatePostDto): Promise<Post> {
    const post = this.postRepo.create({ ...dto, userId });
    return this.postRepo.save(post);
  }

  async deletePost(userId: string, postId: string): Promise<void> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException();
    await this.postRepo.remove(post);
  }

  async getPostById(postId: string): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['user', 'checkIn'],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async getFeed(userId: string, page = 1, limit = 20): Promise<Post[]> {
    const follows = await this.followRepo.find({
      where: { followerId: userId },
      select: ['followingId'],
    });
    const followingIds = follows.map((f) => f.followingId);
    followingIds.push(userId);

    return this.postRepo.find({
      where: { userId: In(followingIds) },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getPostsByUser(targetUserId: string, page = 1, limit = 20): Promise<Post[]> {
    return this.postRepo.find({
      where: { userId: targetUserId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  // ---- Comments ----

  async createComment(userId: string, postId: string, dto: CreateCommentDto): Promise<Comment> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const comment = this.commentRepo.create({ ...dto, userId, postId });
    const saved = await this.commentRepo.save(comment);

    await this.postRepo.increment({ id: postId }, 'commentsCount', 1);
    return saved;
  }

  async getComments(postId: string, page = 1, limit = 20): Promise<Comment[]> {
    return this.commentRepo.find({
      where: { postId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async deleteComment(userId: string, commentId: string): Promise<void> {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) throw new ForbiddenException();

    await this.commentRepo.remove(comment);
    await this.postRepo.decrement({ id: comment.postId }, 'commentsCount', 1);
  }

  // ---- Likes ----

  async toggleLike(userId: string, postId: string): Promise<{ liked: boolean }> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.likeRepo.findOne({ where: { userId, postId } });
    if (existing) {
      await this.likeRepo.remove(existing);
      await this.postRepo.decrement({ id: postId }, 'likesCount', 1);
      return { liked: false };
    }

    const like = this.likeRepo.create({ userId, postId });
    await this.likeRepo.save(like);
    await this.postRepo.increment({ id: postId }, 'likesCount', 1);
    return { liked: true };
  }

  async isLiked(userId: string, postId: string): Promise<boolean> {
    const like = await this.likeRepo.findOne({ where: { userId, postId } });
    return !!like;
  }

  // ---- Follows ----

  async toggleFollow(followerId: string, followingId: string): Promise<{ following: boolean }> {
    if (followerId === followingId) {
      throw new ForbiddenException('Cannot follow yourself');
    }

    const existing = await this.followRepo.findOne({
      where: { followerId, followingId },
    });
    if (existing) {
      await this.followRepo.remove(existing);
      return { following: false };
    }

    const follow = this.followRepo.create({ followerId, followingId });
    await this.followRepo.save(follow);
    return { following: true };
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followRepo.findOne({
      where: { followerId, followingId },
    });
    return !!follow;
  }

  async getFollowers(userId: string): Promise<Follow[]> {
    return this.followRepo.find({
      where: { followingId: userId },
      relations: ['follower'],
    });
  }

  async getFollowing(userId: string): Promise<Follow[]> {
    return this.followRepo.find({
      where: { followerId: userId },
      relations: ['following'],
    });
  }

  async getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
    const [followers, following] = await Promise.all([
      this.followRepo.count({ where: { followingId: userId } }),
      this.followRepo.count({ where: { followerId: userId } }),
    ]);
    return { followers, following };
  }
}
