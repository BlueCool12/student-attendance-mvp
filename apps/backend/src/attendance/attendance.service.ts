import { Injectable } from '@nestjs/common';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceLogRepository } from './attendance-log.repository';
import { StudentRepository } from '../student/student.repository';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { CreateBulkAttendanceDto } from './dto/create-bulk-attendance.dto';
import { FindAttendanceDto } from './dto/find-attendance.dto';
import { AttendanceSummaryDto } from './dto/attendance-summary.dto';
import { FindAttendanceLogsDto } from './dto/find-attendance-logs.dto';
import { AttendanceStatus } from '@student-attendance/shared';
import { getDatesInRange } from '../common/utils/date.util';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly attendanceLogRepository: AttendanceLogRepository,
    private readonly studentRepository: StudentRepository,
  ) { }

  async findAll(queryDto: FindAttendanceDto) {
    return await this.attendanceRepository.findAll(queryDto);
  }

  async getSummary(queryDto: AttendanceSummaryDto) {
    const totalStudents = await this.studentRepository.count();
    const stats = await this.attendanceRepository.getRawSummary(queryDto);

    return {
      totalStudents,
      present: stats?.present || 0,
      late: stats?.late || 0,
      absent: stats?.absent || 0,
    };
  }

  async findLogs(queryDto: FindAttendanceLogsDto) {
    const { studentId, date } = queryDto;
    return await this.attendanceLogRepository.findByStudentAndDate(studentId, date);
  }

  async upsert(createAttendanceDto: CreateAttendanceDto) {
    const { studentId, date, status, memo } = createAttendanceDto;

    const existing = await this.attendanceRepository.findOne(studentId, date);
    const isUpdated = (!existing || existing.status !== status) && status !== AttendanceStatus.UNRECORDED;
    const memoToSave = memo !== undefined ? memo : existing?.memo;

    await this.attendanceRepository.upsert({ studentId, date, status, memo: memoToSave });

    if (isUpdated) {
      await this.attendanceLogRepository.createLog({ studentId, date, status });
    }

    return { studentId, date, status, memo: memoToSave };
  }

  async bulkUpdate(bulkDto: CreateBulkAttendanceDto) {
    const { studentIds, startDate, endDate, status } = bulkDto;

    const dates = getDatesInRange(startDate, endDate || startDate);

    const targets: Promise<{ studentId: number; date: string; status: AttendanceStatus; memo?: string }>[] = [];
    for (const studentId of studentIds) {
      for (const date of dates) {
        targets.push(this.upsert({ studentId, date, status }));
      }
    }

    return await Promise.all(targets);
  }
}
