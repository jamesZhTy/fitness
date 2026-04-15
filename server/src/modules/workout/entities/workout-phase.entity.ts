import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { WorkoutPlan } from './workout-plan.entity';
import { Exercise } from './exercise.entity';

export enum PhaseType {
  WARMUP = 'warmup',
  MAIN = 'main',
  COOLDOWN = 'cooldown',
}

@Entity('workout_phases')
export class WorkoutPhase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  planId: string;

  @ManyToOne(() => WorkoutPlan, (plan) => plan.phases)
  @JoinColumn({ name: 'planId' })
  plan: WorkoutPlan;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: PhaseType })
  type: PhaseType;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ type: 'int' })
  duration: number;

  @OneToMany(() => Exercise, (ex) => ex.phase, { cascade: true })
  exercises: Exercise[];
}
