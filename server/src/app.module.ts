import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkoutModule } from './modules/workout/workout.module';
import { CheckInModule } from './modules/checkin/checkin.module';
import { ReminderModule } from './modules/reminder/reminder.module';
import { PostModule } from './modules/post/post.module';

@Module({
  imports: [DatabaseModule, UserModule, AuthModule, WorkoutModule, CheckInModule, ReminderModule, PostModule],
})
export class AppModule {}
