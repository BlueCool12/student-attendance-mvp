import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { FindAttendanceDto } from './dto/find-attendance.dto';
import { AttendanceSummaryDto } from './dto/attendance-summary.dto';
import { AttendanceStatus } from '@student-attendance/shared';

@Injectable()
export class AttendanceRepository {
  constructor(
    @InjectRepository(Attendance)
    private readonly repository: Repository<Attendance>,
  ) { }

  async findOne(studentId: number, date: string) {
    return await this.repository.findOne({
      where: { studentId, date }
    });
  }

  async findAll(queryDto: FindAttendanceDto) {
    const { startDate, endDate, studentId } = queryDto;

    return await this.repository.createQueryBuilder('attendance')
      .innerJoin('attendance.student', 'student')
      .where('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('attendance.studentId = :studentId', { studentId })
      .orderBy('attendance.date', 'ASC')
      .getMany();
  }

  async getRawSummary(queryDto: AttendanceSummaryDto) {
    const { startDate, endDate } = queryDto;

    return await this.repository.createQueryBuilder('attendance')
      .innerJoin('attendance.student', 'student')
      .select(`CAST(SUM(CASE WHEN attendance.status = ${AttendanceStatus.PRESENT} THEN 1 ELSE 0 END) AS INT)`, 'present')
      .addSelect(`CAST(SUM(CASE WHEN attendance.status = ${AttendanceStatus.LATE} THEN 1 ELSE 0 END) AS INT)`, 'late')
      .addSelect(`CAST(SUM(CASE WHEN attendance.status = ${AttendanceStatus.ABSENT} THEN 1 ELSE 0 END) AS INT)`, 'absent')
      .where('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('student.deletedAt IS NULL')
      .getRawOne();
  }

  async upsert(data: Partial<Attendance>) {
    return await this.repository.upsert(data, ['studentId', 'date']);
  }
}
