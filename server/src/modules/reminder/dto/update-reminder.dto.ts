import { IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class UpdateReminderDto {
  @IsOptional() @IsString() time?: string;
  @IsOptional() @IsArray() repeatDays?: string[];
  @IsOptional() @IsBoolean() isEnabled?: boolean;
  @IsOptional() @IsString() message?: string;
}
