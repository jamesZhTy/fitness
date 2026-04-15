import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkoutModule } from './modules/workout/workout.module';

@Module({
  imports: [DatabaseModule, UserModule, AuthModule, WorkoutModule],
})
export class AppModule {}
