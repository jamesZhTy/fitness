import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkoutModule } from './modules/workout/workout.module';
import { CheckInModule } from './modules/checkin/checkin.module';
import { ReminderModule } from './modules/reminder/reminder.module';
import { PostModule } from './modules/post/post.module';
import { TeamModule } from './modules/team/team.module';
import { ChallengeModule } from './modules/challenge/challenge.module';

@Module({
  imports: [DatabaseModule, UserModule, AuthModule, WorkoutModule, CheckInModule, ReminderModule, PostModule, TeamModule, ChallengeModule],
})
export class AppModule {}
