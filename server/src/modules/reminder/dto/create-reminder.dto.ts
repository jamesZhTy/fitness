import { IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class CreateReminderDto {
  @IsString() time: string;
  @IsArray() repeatDays: string[];
  @IsOptional() @IsBoolean() isEnabled?: boolean;
  @IsOptional() @IsString() message?: string;
}
