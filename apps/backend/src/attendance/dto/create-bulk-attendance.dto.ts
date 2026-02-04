import { IsArray, IsISO8601, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { AttendanceStatus } from '@student-attendance/shared';
import { IsAfter } from '../../common/decorators/is-after.decorator';

export class CreateBulkAttendanceDto {
  @IsArray()
  @IsNumber({}, { each: true })
  studentIds: number[];

  @IsISO8601()
  startDate: string;

  @IsOptional()
  @IsISO8601()
  @IsAfter('startDate')
  endDate?: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}
