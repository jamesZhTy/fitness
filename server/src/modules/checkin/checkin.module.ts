import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckIn } from './checkin.entity';
import { CheckInService } from './checkin.service';
import { CheckInController } from './checkin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CheckIn])],
  controllers: [CheckInController],
  providers: [CheckInService],
  exports: [CheckInService],
})
export class CheckInModule {}
