import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CheckIn } from './checkin.entity';
import { CreateCheckInDto } from './dto/create-checkin.dto';

@Injectable()
export class CheckInService {
  constructor(
    @InjectRepository(CheckIn)
    private readonly checkInRepository: Repository<CheckIn>,
  ) {}

  create(userId: string, dto: CreateCheckInDto): Promise<CheckIn> {
    const today = new Date().toISOString().split('T')[0];
    const checkIn = this.checkInRepository.create({
      userId,
      workoutPlanId: dto.workoutPlanId,
      date: dto.date ?? today,
      duration: dto.duration ?? 0,
      caloriesBurned: dto.caloriesBurned ?? 0,
      mood: dto.mood,
      note: dto.note,
      photos: dto.photos,
    });
    return this.checkInRepository.save(checkIn);
  }

  findByUserAndMonth(userId: string, year: number, month: number): Promise<CheckIn[]> {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return this.checkInRepository.find({
      where: {
        userId,
        date: Between(start, end),
      },
      order: { date: 'ASC' },
    });
  }

  async getStats(userId: string, period: 'week' | 'month' | 'year'): Promise<{
    totalCheckIns: number;
    totalDuration: number;
    totalCalories: number;
    streak: number;
  }> {
    const today = new Date();
    let start: Date;

    if (period === 'week') {
      start = new Date(today);
      start.setDate(today.getDate() - 6);
    } else if (period === 'month') {
      start = new Date(today);
      start.setDate(today.getDate() - 29);
    } else {
      start = new Date(today);
      start.setDate(today.getDate() - 364);
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = today.toISOString().split('T')[0];

    const checkIns = await this.checkInRepository.find({
      where: {
        userId,
        date: Between(startStr, endStr),
      },
      order: { date: 'DESC' },
    });

    const totalCheckIns = checkIns.length;
    const totalDuration = checkIns.reduce((sum, c) => sum + (c.duration ?? 0), 0);
    const totalCalories = checkIns.reduce((sum, c) => sum + (c.caloriesBurned ?? 0), 0);

    // Calculate streak: count consecutive days from today backward that have check-ins
    const dateSet = new Set(checkIns.map((c) => c.date));
    let streak = 0;
    const cursor = new Date(today);
    while (true) {
      const dateStr = cursor.toISOString().split('T')[0];
      if (dateSet.has(dateStr)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    return { totalCheckIns, totalDuration, totalCalories, streak };
  }
}
