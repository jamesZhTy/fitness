import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'time' })
  time: string;

  @Column('simple-array')
  repeatDays: string[];

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ default: 'Time to work out!' })
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
