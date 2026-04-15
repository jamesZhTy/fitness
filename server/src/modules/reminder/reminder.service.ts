import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reminder } from './reminder.entity';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class ReminderService {
  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
  ) {}

  private normalizeTime(time: string): string {
    // Ensure time is in HH:MM:SS format
    const parts = time.split(':');
    if (parts.length === 2) return `${time}:00`;
    return time;
  }

  async create(userId: string, dto: CreateReminderDto): Promise<Reminder> {
    const reminder = this.reminderRepository.create({
      userId,
      time: this.normalizeTime(dto.time),
      repeatDays: dto.repeatDays,
      isEnabled: dto.isEnabled ?? true,
      message: dto.message ?? 'Time to work out!',
    });
    return this.reminderRepository.save(reminder);
  }

  findByUser(userId: string): Promise<Reminder[]> {
    return this.reminderRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
  }

  async update(userId: string, id: string, dto: UpdateReminderDto): Promise<Reminder> {
    const reminder = await this.reminderRepository.findOne({ where: { id, userId } });
    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }
    Object.assign(reminder, dto);
    return this.reminderRepository.save(reminder);
  }

  async delete(userId: string, id: string): Promise<void> {
    const reminder = await this.reminderRepository.findOne({ where: { id, userId } });
    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }
    await this.reminderRepository.remove(reminder);
  }
}
