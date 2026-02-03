import { IsInt, IsEnum, IsDateString, IsNotEmpty } from 'class-validator';
import { AttendanceStatus } from '../entities/attendance.entity';

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
