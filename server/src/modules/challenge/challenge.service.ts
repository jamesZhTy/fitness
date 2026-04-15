import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge, ChallengeStatus } from './entities/challenge.entity';
import { ChallengeParticipant } from './entities/challenge-participant.entity';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { CheckInService } from '../checkin/checkin.service';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectRepository(Challenge) private challengeRepo: Repository<Challenge>,
    @InjectRepository(ChallengeParticipant) private participantRepo: Repository<ChallengeParticipant>,
    private checkInService: CheckInService,
  ) {}

  async createChallenge(userId: string, dto: CreateChallengeDto): Promise<Challenge> {
    const now = new Date().toISOString().split('T')[0];
    let status = ChallengeStatus.UPCOMING;
    if (dto.startDate <= now && dto.endDate >= now) status = ChallengeStatus.ACTIVE;
    if (dto.endDate < now) status = ChallengeStatus.COMPLETED;
    const challenge = this.challengeRepo.create({ ...dto, creatorId: userId, status });
    return this.challengeRepo.save(challenge);
  }

  async getChallenges(status?: ChallengeStatus): Promise<Challenge[]> {
    const where = status ? { status } : {};
    return this.challengeRepo.find({ where, relations: ['creator'], order: { createdAt: 'DESC' } });
  }

  async getChallengeById(challengeId: string): Promise<Challenge> {
    const challenge = await this.challengeRepo.findOne({ where: { id: challengeId }, relations: ['creator'] });
    if (!challenge) throw new NotFoundException('Challenge not found');
    return challenge;
  }

  async joinChallenge(userId: string, challengeId: string): Promise<ChallengeParticipant> {
    const challenge = await this.challengeRepo.findOne({ where: { id: challengeId } });
    if (!challenge) throw new NotFoundException('Challenge not found');
    if (challenge.status === ChallengeStatus.COMPLETED) throw new BadRequestException('Challenge already ended');
    const existing = await this.participantRepo.findOne({ where: { challengeId, userId } });
    if (existing) throw new BadRequestException('Already joined');
    const participant = this.participantRepo.create({ challengeId, userId });
    const saved = await this.participantRepo.save(participant);
    await this.challengeRepo.increment({ id: challengeId }, 'participantCount', 1);
    return saved;
  }

  async getLeaderboard(challengeId: string): Promise<ChallengeParticipant[]> {
    return this.participantRepo.find({ where: { challengeId }, relations: ['user'], order: { progress: 'DESC' } });
  }

  async getMyChallenges(userId: string): Promise<Challenge[]> {
    const participations = await this.participantRepo.find({ where: { userId }, relations: ['challenge', 'challenge.creator'] });
    return participations.map((p) => p.challenge);
  }

  async updateProgress(userId: string, challengeId: string, progress: number): Promise<ChallengeParticipant> {
    const participant = await this.participantRepo.findOne({ where: { challengeId, userId } });
    if (!participant) throw new NotFoundException('Not a participant');
    participant.progress = progress;
    return this.participantRepo.save(participant);
  }
}
