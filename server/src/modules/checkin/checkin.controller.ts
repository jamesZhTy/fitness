import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { CheckInService } from './checkin.service';
import { CreateCheckInDto } from './dto/create-checkin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('checkins')
@UseGuards(JwtAuthGuard)
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateCheckInDto) {
    return this.checkInService.create(user.id, dto);
  }

  @Get()
  getByMonth(
    @CurrentUser() user: { id: string },
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = year ? parseInt(year, 10) : new Date().getFullYear();
    const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
    return this.checkInService.findByUserAndMonth(user.id, y, m);
  }

  @Get('stats')
  getStats(
    @CurrentUser() user: { id: string },
    @Query('period') period: 'week' | 'month' | 'year' = 'week',
  ) {
    return this.checkInService.getStats(user.id, period);
  }
}
