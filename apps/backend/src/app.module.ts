import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentModule } from './student/student.module';
import { AttendanceModule } from './attendance/attendance.module';
import { Student } from './student/entities/student.entity';
import { Attendance } from './attendance/entities/attendance.entity';
import { AttendanceLog } from './attendance/entities/attendance-log.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [Student, Attendance, AttendanceLog],
      synchronize: true,
    }),
    StudentModule,
    AttendanceModule,
  ],
})
export class AppModule { }
