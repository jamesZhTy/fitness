import { IsString, IsOptional, IsEnum, IsNumber, MaxLength } from 'class-validator';
import { FitnessLevel } from '../user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  username?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  bio?: string;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsEnum(FitnessLevel)
  fitnessLevel?: FitnessLevel;
}
