import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { WorkoutService } from './workout.service';

@Controller('workouts')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Get('categories')
  getCategories() {
    return this.workoutService.findAllCategories();
  }

  @Get('categories/:id')
  async getCategory(@Param('id') id: string) {
    const category = await this.workoutService.findCategoryById(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  @Get('categories/:categoryId/plans')
  getPlans(@Param('categoryId') categoryId: string, @Query('difficulty') difficulty?: string) {
    return this.workoutService.findPlansByCategory(categoryId, difficulty);
  }

  @Get('plans/:id')
  async getPlan(@Param('id') id: string) {
    const plan = await this.workoutService.findPlanById(id);
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }
}
