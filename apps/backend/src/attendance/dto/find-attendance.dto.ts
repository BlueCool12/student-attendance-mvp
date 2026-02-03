import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceSummaryDto } from './attendance-summary.dto';

export class FindAttendanceDto extends AttendanceSummaryDto {
  @IsNumber()
  @Type(() => Number)
  studentId: number;
}
