import { IsInt, IsEnum, IsDateString, IsNotEmpty } from 'class-validator';
import { AttendanceStatus } from '@student-attendance/shared';

export class CreateAttendanceDto {
    @IsInt()
    @IsNotEmpty()
    studentId: number;

    @IsEnum(AttendanceStatus)
    @IsNotEmpty()
    status: AttendanceStatus;

    @IsDateString()
    @IsNotEmpty()
    date: string;
}
