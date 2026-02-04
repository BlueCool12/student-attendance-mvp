import { IsString, IsNotEmpty, IsISO8601, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AttendanceStatus } from '@student-attendance/shared';
import { IsAfter } from '../../common/decorators/is-after.decorator';

export class FindStudentsDto {
  @IsISO8601()
  @IsNotEmpty()
  startDate: string;

  @IsOptional()
  @IsISO8601()
  @IsAfter('startDate')
  @Transform(({ value, obj }) => value || obj.startDate)
  endDate: string;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus = AttendanceStatus.ALL;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @IsString()
  search?: string;
}
