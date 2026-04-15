import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(100)
  maxMembers?: number;
}
