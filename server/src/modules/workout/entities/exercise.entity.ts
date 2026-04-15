import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { WorkoutPhase } from './workout-phase.entity';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phaseId: string;

  @ManyToOne(() => WorkoutPhase, (phase) => phase.exercises)
  @JoinColumn({ name: 'phaseId' })
  phase: WorkoutPhase;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  sets: number;

  @Column({ type: 'int', nullable: true })
  reps: number;

  @Column({ type: 'int', nullable: true })
  duration: number;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: 0 })
  sortOrder: number;
}
