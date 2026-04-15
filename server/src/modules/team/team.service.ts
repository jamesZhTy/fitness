import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team) private teamRepo: Repository<Team>,
    @InjectRepository(TeamMember) private memberRepo: Repository<TeamMember>,
  ) {}

  async createTeam(userId: string, dto: CreateTeamDto): Promise<Team> {
    const team = this.teamRepo.create({ ...dto, captainId: userId, memberCount: 1 });
    const saved = await this.teamRepo.save(team);
    const member = this.memberRepo.create({ teamId: saved.id, userId });
    await this.memberRepo.save(member);
    return saved;
  }

  async getTeams(): Promise<Team[]> {
    return this.teamRepo.find({ relations: ['captain'], order: { createdAt: 'DESC' } });
  }

  async getTeamById(teamId: string): Promise<Team> {
    const team = await this.teamRepo.findOne({ where: { id: teamId }, relations: ['captain'] });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return this.memberRepo.find({ where: { teamId }, relations: ['user'], order: { joinedAt: 'ASC' } });
  }

  async joinTeam(userId: string, teamId: string): Promise<TeamMember> {
    const team = await this.teamRepo.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
    if (team.memberCount >= team.maxMembers) throw new BadRequestException('Team is full');
    const existing = await this.memberRepo.findOne({ where: { teamId, userId } });
    if (existing) throw new BadRequestException('Already a member');
    const member = this.memberRepo.create({ teamId, userId });
    const saved = await this.memberRepo.save(member);
    await this.teamRepo.increment({ id: teamId }, 'memberCount', 1);
    return saved;
  }

  async leaveTeam(userId: string, teamId: string): Promise<void> {
    const team = await this.teamRepo.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
    if (team.captainId === userId) throw new ForbiddenException('Captain cannot leave. Transfer captaincy or delete the team.');
    const member = await this.memberRepo.findOne({ where: { teamId, userId } });
    if (!member) throw new NotFoundException('Not a member');
    await this.memberRepo.remove(member);
    await this.teamRepo.decrement({ id: teamId }, 'memberCount', 1);
  }

  async deleteTeam(userId: string, teamId: string): Promise<void> {
    const team = await this.teamRepo.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
    if (team.captainId !== userId) throw new ForbiddenException();
    await this.teamRepo.remove(team);
  }

  async getMyTeams(userId: string): Promise<Team[]> {
    const memberships = await this.memberRepo.find({ where: { userId }, relations: ['team', 'team.captain'] });
    return memberships.map((m) => m.team);
  }
}
