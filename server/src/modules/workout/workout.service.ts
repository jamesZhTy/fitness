import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutCategory } from './entities/workout-category.entity';
import { WorkoutPlan } from './entities/workout-plan.entity';

@Injectable()
export class WorkoutService {
  constructor(
    @InjectRepository(WorkoutCategory)
    private readonly categoryRepo: Repository<WorkoutCategory>,
    @InjectRepository(WorkoutPlan)
    private readonly planRepo: Repository<WorkoutPlan>,
  ) {}

  async findAllCategories(): Promise<WorkoutCategory[]> {
    return this.categoryRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async findCategoryById(id: string): Promise<WorkoutCategory | null> {
    return this.categoryRepo.findOne({ where: { id } });
  }

  async findPlansByCategory(categoryId: string, difficulty?: string): Promise<WorkoutPlan[]> {
    const query = this.planRepo
      .createQueryBuilder('plan')
      .where('plan.categoryId = :categoryId', { categoryId })
      .orderBy('plan.createdAt', 'DESC');
    if (difficulty) {
      query.andWhere('plan.difficulty = :difficulty', { difficulty });
    }
    return query.getMany();
  }

  async findPlanById(id: string): Promise<WorkoutPlan | null> {
    return this.planRepo.findOne({
      where: { id },
      relations: ['category', 'phases', 'phases.exercises'],
      order: { phases: { sortOrder: 'ASC', exercises: { sortOrder: 'ASC' } } },
    });
  }
}
