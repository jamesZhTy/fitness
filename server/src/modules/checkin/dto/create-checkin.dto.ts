import { IsString, IsOptional, IsInt, IsArray, Min } from 'class-validator';

export class CreateCheckInDto {
  @IsOptional() @IsString() workoutPlanId?: string;
  @IsOptional() @IsString() date?: string;
  @IsOptional() @IsInt() @Min(0) duration?: number;
  @IsOptional() @IsInt() @Min(0) caloriesBurned?: number;
  @IsOptional() @IsString() mood?: string;
  @IsOptional() @IsString() note?: string;
  @IsOptional() @IsArray() photos?: string[];
}
