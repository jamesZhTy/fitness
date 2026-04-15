import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ChallengeService } from './challenge.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { ChallengeStatus } from './entities/challenge.entity';

@Controller('challenges')
@UseGuards(JwtAuthGuard)
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateChallengeDto) {
    return this.challengeService.createChallenge(user.id, dto);
  }

  @Get()
  getAll(@Query('status') status?: ChallengeStatus) {
    return this.challengeService.getChallenges(status);
  }

  @Get('my')
  getMyChallenges(@CurrentUser() user: any) {
    return this.challengeService.getMyChallenges(user.id);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.challengeService.getChallengeById(id);
  }

  @Post(':id/join')
  join(@CurrentUser() user: any, @Param('id') id: string) {
    return this.challengeService.joinChallenge(user.id, id);
  }

  @Get(':id/leaderboard')
  leaderboard(@Param('id') id: string) {
    return this.challengeService.getLeaderboard(id);
  }
}
