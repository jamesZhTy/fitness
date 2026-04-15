import { IsString, IsOptional, IsEnum, IsInt, IsDateString, Min } from 'class-validator';
import { ChallengeType } from '../entities/challenge.entity';

export class CreateChallengeDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ChallengeType)
  type: ChallengeType;

  @IsInt()
  @Min(1)
  goal: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
