import { IsISO8601, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAttendanceLogsDto {
  @IsNumber()
  @Type(() => Number)
  studentId: number;

  @IsISO8601()
  date: string;
}
