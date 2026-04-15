import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutCategory } from './entities/workout-category.entity';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { WorkoutPhase } from './entities/workout-phase.entity';
import { Exercise } from './entities/exercise.entity';
import { WorkoutService } from './workout.service';
import { WorkoutController } from './workout.controller';
import { WorkoutSeedService } from './workout-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutCategory, WorkoutPlan, WorkoutPhase, Exercise])],
  controllers: [WorkoutController],
  providers: [WorkoutService, WorkoutSeedService],
  exports: [WorkoutService],
})
export class WorkoutModule {}
