import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceLog } from './entities/attendance-log.entity';
import { AttendanceStatus } from '@student-attendance/shared';

@Injectable()
export class AttendanceLogRepository {
  constructor(
    @InjectRepository(AttendanceLog)
    private readonly repository: Repository<AttendanceLog>,
  ) { }

  async createLog(params: { studentId: number; date: string; status: AttendanceStatus }) {
    return await this.repository.save(params);
  }

  async findByStudentAndDate(studentId: number, date: string) {
    return await this.repository.find({
      where: { studentId, date },
      order: { id: 'DESC' },
    });
  }
}
