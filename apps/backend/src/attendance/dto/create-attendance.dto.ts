import { IsInt, IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus } from '@student-attendance/shared';

export class CreateAttendanceDto {
    @IsInt()
    @IsNotEmpty()
    studentId: number;

    @IsEnum(AttendanceStatus)
    @IsNotEmpty()
    status: AttendanceStatus;

    @IsISO8601()
    @IsNotEmpty()
    date: string;

    @IsOptional()
    @IsString()
    memo?: string;
}
