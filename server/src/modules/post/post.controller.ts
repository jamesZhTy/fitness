import {
  Controller, Get, Post as HttpPost, Delete, Param, Body, Query, UseGuards,
  DefaultValuePipe, ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @HttpPost('posts')
  createPost(@CurrentUser() user: any, @Body() dto: CreatePostDto) {
    return this.postService.createPost(user.id, dto);
  }

  @Get('posts/feed')
  getFeed(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.postService.getFeed(user.id, page, limit);
  }

  @Get('posts/:id')
  getPost(@Param('id') id: string) {
    return this.postService.getPostById(id);
  }

  @Delete('posts/:id')
  deletePost(@CurrentUser() user: any, @Param('id') id: string) {
    return this.postService.deletePost(user.id, id);
  }

  @Get('users/:userId/posts')
  getUserPosts(
    @Param('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.postService.getPostsByUser(userId, page, limit);
  }

  @HttpPost('posts/:postId/comments')
  createComment(
    @CurrentUser() user: any,
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postService.createComment(user.id, postId, dto);
  }

  @Get('posts/:postId/comments')
  getComments(
    @Param('postId') postId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.postService.getComments(postId, page, limit);
  }

  @Delete('comments/:id')
  deleteComment(@CurrentUser() user: any, @Param('id') id: string) {
    return this.postService.deleteComment(user.id, id);
  }

  @HttpPost('posts/:postId/like')
  toggleLike(@CurrentUser() user: any, @Param('postId') postId: string) {
    return this.postService.toggleLike(user.id, postId);
  }

  @HttpPost('users/:userId/follow')
  toggleFollow(@CurrentUser() user: any, @Param('userId') userId: string) {
    return this.postService.toggleFollow(user.id, userId);
  }

  @Get('users/:userId/followers')
  getFollowers(@Param('userId') userId: string) {
    return this.postService.getFollowers(userId);
  }

  @Get('users/:userId/following')
  getFollowing(@Param('userId') userId: string) {
    return this.postService.getFollowing(userId);
  }

  @Get('users/:userId/follow-counts')
  getFollowCounts(@Param('userId') userId: string) {
    return this.postService.getFollowCounts(userId);
  }
}
