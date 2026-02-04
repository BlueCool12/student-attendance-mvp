import { IsISO8601, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class AttendanceSummaryDto {
  @IsISO8601()
  startDate: string;

  @IsOptional()
  @IsISO8601()
  @Transform(({ value, obj }) => value || obj.startDate)
  endDate: string;
}
