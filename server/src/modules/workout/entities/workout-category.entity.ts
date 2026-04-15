import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { WorkoutPlan } from './workout-plan.entity';

@Entity('workout_categories')
export class WorkoutCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  sortOrder: number;

  @OneToMany(() => WorkoutPlan, (plan) => plan.category)
  plans: WorkoutPlan[];

  @CreateDateColumn()
  createdAt: Date;
}
