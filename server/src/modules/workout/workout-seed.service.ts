import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutCategory } from './entities/workout-category.entity';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { WorkoutPhase, PhaseType } from './entities/workout-phase.entity';
import { Exercise } from './entities/exercise.entity';

@Injectable()
export class WorkoutSeedService implements OnModuleInit {
  private readonly logger = new Logger(WorkoutSeedService.name);

  constructor(
    @InjectRepository(WorkoutCategory) private readonly categoryRepo: Repository<WorkoutCategory>,
    @InjectRepository(WorkoutPlan) private readonly planRepo: Repository<WorkoutPlan>,
    @InjectRepository(WorkoutPhase) private readonly phaseRepo: Repository<WorkoutPhase>,
    @InjectRepository(Exercise) private readonly exerciseRepo: Repository<Exercise>,
  ) {}

  async onModuleInit() {
    const count = await this.categoryRepo.count();
    if (count > 0) { this.logger.log('Workout data already seeded, skipping'); return; }
    this.logger.log('Seeding workout data...');
    await this.seed();
    this.logger.log('Workout data seeded successfully');
  }

  private async seed() {
    const categories = await this.categoryRepo.save([
      { name: 'Running', icon: '🏃', description: 'Cardio running workouts', sortOrder: 1 },
      { name: 'Yoga', icon: '🧘', description: 'Yoga and flexibility', sortOrder: 2 },
      { name: 'Strength', icon: '💪', description: 'Strength training', sortOrder: 3 },
      { name: 'Stretching', icon: '🤸', description: 'Stretching and mobility', sortOrder: 4 },
      { name: 'HIIT', icon: '🔥', description: 'High intensity interval training', sortOrder: 5 },
    ]);

    // Running plan
    const runPlan = await this.planRepo.save({ categoryId: categories[0].id, title: 'Beginner 30min Run', description: 'A gentle introduction to running with warm-up and cool-down stretches', difficulty: 'beginner' as any, duration: 30, caloriesBurned: 250 });
    const runWarmup = await this.phaseRepo.save({ planId: runPlan.id, name: 'Warm-up Stretching', type: PhaseType.WARMUP, sortOrder: 0, duration: 5 });
    await this.exerciseRepo.save([
      { phaseId: runWarmup.id, name: 'Neck stretch', description: 'Gently tilt head side to side', duration: 30, sortOrder: 0 },
      { phaseId: runWarmup.id, name: 'Arm circles', description: 'Circle arms forward and backward', duration: 30, sortOrder: 1 },
      { phaseId: runWarmup.id, name: 'Leg stretch', description: 'Stretch quads and hamstrings', duration: 60, sortOrder: 2 },
      { phaseId: runWarmup.id, name: 'Ankle rotation', description: 'Rotate ankles in circles', duration: 30, sortOrder: 3 },
    ]);
    const runMain = await this.phaseRepo.save({ planId: runPlan.id, name: 'Main Training', type: PhaseType.MAIN, sortOrder: 1, duration: 20 });
    await this.exerciseRepo.save([{ phaseId: runMain.id, name: 'Jogging', description: 'Light jog at comfortable pace', duration: 1200, sortOrder: 0 }]);
    const runCooldown = await this.phaseRepo.save({ planId: runPlan.id, name: 'Cool-down Stretching', type: PhaseType.COOLDOWN, sortOrder: 2, duration: 5 });
    await this.exerciseRepo.save([
      { phaseId: runCooldown.id, name: 'Quad stretch', description: 'Hold each leg for 30 seconds', duration: 60, sortOrder: 0 },
      { phaseId: runCooldown.id, name: 'Calf stretch', description: 'Wall calf stretch', duration: 60, sortOrder: 1 },
      { phaseId: runCooldown.id, name: 'Full body relaxation', description: 'Deep breathing and gentle stretching', duration: 60, sortOrder: 2 },
    ]);

    // Yoga plan
    const yogaPlan = await this.planRepo.save({ categoryId: categories[1].id, title: 'Morning Yoga Flow', description: 'A calming morning yoga routine for beginners', difficulty: 'beginner' as any, duration: 20, caloriesBurned: 120 });
    const yogaWarmup = await this.phaseRepo.save({ planId: yogaPlan.id, name: 'Breathing & Centering', type: PhaseType.WARMUP, sortOrder: 0, duration: 3 });
    await this.exerciseRepo.save([
      { phaseId: yogaWarmup.id, name: 'Deep breathing', description: 'Inhale 4s, hold 4s, exhale 4s', duration: 90, sortOrder: 0 },
      { phaseId: yogaWarmup.id, name: 'Cat-Cow pose', description: 'Alternate between cat and cow pose', duration: 90, sortOrder: 1 },
    ]);
    const yogaMain = await this.phaseRepo.save({ planId: yogaPlan.id, name: 'Sun Salutation Flow', type: PhaseType.MAIN, sortOrder: 1, duration: 14 });
    await this.exerciseRepo.save([
      { phaseId: yogaMain.id, name: 'Mountain pose', description: 'Stand tall, arms at sides', duration: 60, sortOrder: 0 },
      { phaseId: yogaMain.id, name: 'Forward fold', description: 'Bend forward, touch toes', duration: 60, sortOrder: 1 },
      { phaseId: yogaMain.id, name: 'Downward dog', description: 'Inverted V shape', duration: 120, sortOrder: 2 },
      { phaseId: yogaMain.id, name: 'Warrior I', description: 'Lunge with arms raised', duration: 120, sortOrder: 3 },
      { phaseId: yogaMain.id, name: 'Warrior II', description: 'Wide stance, arms extended', duration: 120, sortOrder: 4 },
      { phaseId: yogaMain.id, name: 'Tree pose', description: 'Balance on one foot', duration: 120, sortOrder: 5 },
    ]);
    const yogaCooldown = await this.phaseRepo.save({ planId: yogaPlan.id, name: 'Relaxation', type: PhaseType.COOLDOWN, sortOrder: 2, duration: 3 });
    await this.exerciseRepo.save([
      { phaseId: yogaCooldown.id, name: 'Child pose', description: 'Rest in child pose', duration: 90, sortOrder: 0 },
      { phaseId: yogaCooldown.id, name: 'Savasana', description: 'Lie flat, relax completely', duration: 90, sortOrder: 1 },
    ]);

    // Strength plan
    const strPlan = await this.planRepo.save({ categoryId: categories[2].id, title: 'Full Body Beginner', description: 'Basic bodyweight strength training for beginners', difficulty: 'beginner' as any, duration: 25, caloriesBurned: 200 });
    const strWarmup = await this.phaseRepo.save({ planId: strPlan.id, name: 'Warm-up', type: PhaseType.WARMUP, sortOrder: 0, duration: 5 });
    await this.exerciseRepo.save([
      { phaseId: strWarmup.id, name: 'Jumping jacks', description: 'Full body warm-up', duration: 60, sortOrder: 0 },
      { phaseId: strWarmup.id, name: 'Arm swings', description: 'Swing arms across body', duration: 60, sortOrder: 1 },
      { phaseId: strWarmup.id, name: 'High knees', description: 'Jog in place lifting knees high', duration: 60, sortOrder: 2 },
    ]);
    const strMain = await this.phaseRepo.save({ planId: strPlan.id, name: 'Main Workout', type: PhaseType.MAIN, sortOrder: 1, duration: 15 });
    await this.exerciseRepo.save([
      { phaseId: strMain.id, name: 'Push-ups', description: 'Standard or knee push-ups', sets: 3, reps: 10, sortOrder: 0 },
      { phaseId: strMain.id, name: 'Squats', description: 'Bodyweight squats', sets: 3, reps: 15, sortOrder: 1 },
      { phaseId: strMain.id, name: 'Lunges', description: 'Alternating forward lunges', sets: 3, reps: 10, sortOrder: 2 },
      { phaseId: strMain.id, name: 'Plank', description: 'Hold plank position', duration: 30, sets: 3, sortOrder: 3 },
    ]);
    const strCooldown = await this.phaseRepo.save({ planId: strPlan.id, name: 'Cool-down', type: PhaseType.COOLDOWN, sortOrder: 2, duration: 5 });
    await this.exerciseRepo.save([
      { phaseId: strCooldown.id, name: 'Hamstring stretch', description: 'Seated hamstring stretch', duration: 60, sortOrder: 0 },
      { phaseId: strCooldown.id, name: 'Shoulder stretch', description: 'Cross-body shoulder stretch', duration: 60, sortOrder: 1 },
    ]);
  }
}
