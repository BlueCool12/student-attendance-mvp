import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { FindAttendanceDto } from './dto/find-attendance.dto';
import { AttendanceSummaryDto } from './dto/attendance-summary.dto';
import { AttendanceStatus } from '@student-attendance/shared';
import { Attendance } from './entities/attendance.entity';
import { Student } from '../student/entities/student.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) { }

  async updateRecord(createAttendanceDto: CreateAttendanceDto) {
    const { studentId, date, status } = createAttendanceDto;

    await this.attendanceRepository.upsert(
      { studentId, date, status },
      ['studentId', 'date'],
    );

    return { studentId, date, status };
  }

  async findAll(queryDto: FindAttendanceDto) {
    const { startDate, endDate, studentId } = queryDto;
    return await this.attendanceRepository.createQueryBuilder('attendance')
      .innerJoin('attendance.student', 'student')
      .where('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('attendance.studentId = :studentId', { studentId })
      .getMany();
  }

  async getSummary(queryDto: AttendanceSummaryDto) {
    const { startDate, endDate } = queryDto;
    const totalStudents = await this.studentRepository.count();

    const summaryRaw = await this.attendanceRepository.createQueryBuilder('attendance')
      .innerJoin('attendance.student', 'student')
      .select('attendance.status', 'status')
      .addSelect('COUNT(attendance.id)', 'count')
      .where('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('attendance.status')
      .getRawMany();

    return {
      totalStudents,
      present: parseInt(summaryRaw.find(s => s.status === AttendanceStatus.PRESENT)?.count || '0'),
      late: parseInt(summaryRaw.find(s => s.status === AttendanceStatus.LATE)?.count || '0'),
      absent: parseInt(summaryRaw.find(s => s.status === AttendanceStatus.ABSENT)?.count || '0'),
    };
  }


}
