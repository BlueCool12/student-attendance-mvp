import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Attendance } from './entities/attendance.entity';
import { Student } from '../student/entities/student.entity';
import { AttendanceLog } from './entities/attendance-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, Student, AttendanceLog])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule { }
