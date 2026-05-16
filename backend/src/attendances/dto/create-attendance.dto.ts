import { IsOptional, IsString } from 'class-validator';

export class CreateAttendanceDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
