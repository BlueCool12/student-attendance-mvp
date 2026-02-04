import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceLogRepository } from './attendance-log.repository';
import { StudentModule } from '../student/student.module';
import { AttendanceController } from './attendance.controller';
import { Attendance } from './entities/attendance.entity';
import { AttendanceLog } from './entities/attendance-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, AttendanceLog]),
    StudentModule
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceRepository, AttendanceLogRepository],
})
export class AttendanceModule { }
