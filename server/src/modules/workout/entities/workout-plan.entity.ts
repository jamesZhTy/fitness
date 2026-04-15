import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from 'typeorm';
import { WorkoutCategory } from './workout-category.entity';
import { WorkoutPhase } from './workout-phase.entity';

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('workout_plans')
export class WorkoutPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  categoryId: string;

  @ManyToOne(() => WorkoutCategory, (cat) => cat.plans)
  @JoinColumn({ name: 'categoryId' })
  category: WorkoutCategory;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: Difficulty, default: Difficulty.BEGINNER })
  difficulty: Difficulty;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'int', default: 0 })
  caloriesBurned: number;

  @OneToMany(() => WorkoutPhase, (phase) => phase.plan, { cascade: true })
  phases: WorkoutPhase[];

  @CreateDateColumn()
  createdAt: Date;
}
