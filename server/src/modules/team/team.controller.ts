import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  createTeam(@CurrentUser() user: any, @Body() dto: CreateTeamDto) {
    return this.teamService.createTeam(user.id, dto);
  }

  @Get()
  getTeams() { return this.teamService.getTeams(); }

  @Get('my')
  getMyTeams(@CurrentUser() user: any) { return this.teamService.getMyTeams(user.id); }

  @Get(':id')
  getTeam(@Param('id') id: string) { return this.teamService.getTeamById(id); }

  @Get(':id/members')
  getMembers(@Param('id') id: string) { return this.teamService.getTeamMembers(id); }

  @Post(':id/join')
  join(@CurrentUser() user: any, @Param('id') id: string) { return this.teamService.joinTeam(user.id, id); }

  @Post(':id/leave')
  leave(@CurrentUser() user: any, @Param('id') id: string) { return this.teamService.leaveTeam(user.id, id); }

  @Delete(':id')
  delete(@CurrentUser() user: any, @Param('id') id: string) { return this.teamService.deleteTeam(user.id, id); }
}
