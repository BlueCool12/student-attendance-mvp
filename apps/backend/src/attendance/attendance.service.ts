import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Attendance } from './entities/attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) { }

  async create(createAttendanceDto: CreateAttendanceDto) {
    const { studentId, date, status } = createAttendanceDto;

    // Check if attendance already exists for this student on this date
    const existing = await this.attendanceRepository.findOne({
      where: { studentId, date },
    });

    if (existing) {
      existing.status = status;
      return this.attendanceRepository.save(existing);
    }

    const attendance = this.attendanceRepository.create(createAttendanceDto);
    return this.attendanceRepository.save(attendance);
  }

  findAll(startDate: string, endDate: string) {
    return this.attendanceRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
    });
  }

  findOne(id: number) {
    return this.attendanceRepository.findOne({ where: { id } });
  }

  update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceRepository.update(id, updateAttendanceDto);
  }

  remove(id: number) {
    return this.attendanceRepository.delete(id);
  }
}
