import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, SelectQueryBuilder } from 'typeorm';
import { Student } from './entities/student.entity';
import { FindStudentsDto } from './dto/find-students.dto';
import { AttendanceStatus } from '@student-attendance/shared';
import { Attendance } from '../attendance/entities/attendance.entity';

@Injectable()
export class StudentRepository {
  constructor(
    @InjectRepository(Student)
    private readonly repository: Repository<Student>,
  ) { }

  async create(data: DeepPartial<Student>) {
    const student = this.repository.create(data);
    return await this.repository.save(student);
  }

  async bulkCreate(data: DeepPartial<Student>[]) {
    const students = this.repository.create(data);
    return await this.repository.save(students);
  }

  async findAndCountWithStats(queryDto: FindStudentsDto, passedDaysInRange: number) {
    const { startDate, endDate, status, page, limit, search } = queryDto;

    const query = this.repository.createQueryBuilder('student')
      .setParameter('startDate', startDate)
      .setParameter('endDate', endDate)
      .orderBy('student.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      query.andWhere('student.name LIKE :search', { search: `%${search}%` });
    }

    this.applyStatusFilter(query, queryDto, passedDaysInRange);
    this.applyStatsMapping(query, startDate, endDate);

    return await query.getManyAndCount();
  }

  async count() {
    return await this.repository.count();
  }

  async update(id: number, data: Partial<Student>) {
    return await this.repository.update(id, data);
  }

  async softDelete(id: number) {
    return await this.repository.softDelete(id);
  }

  private applyStatusFilter(
    query: SelectQueryBuilder<Student>,
    queryDto: FindStudentsDto,
    passedDaysInRange: number
  ) {
    const { startDate, endDate, status } = queryDto;
    if (status === AttendanceStatus.ALL) return;

    if (status === AttendanceStatus.UNRECORDED) {
      query.andWhere(qb => {
        const subQuery = qb.subQuery()
          .select("COUNT(a.id)")
          .from(Attendance, "a")
          .where("a.studentId = student.id AND a.date BETWEEN :startDate AND :endDate")
          .andWhere("a.status != :unrecorded")
          .getQuery();
        return `${subQuery} < :passedDaysInRange`;
      }, { startDate, endDate, passedDaysInRange, unrecorded: AttendanceStatus.UNRECORDED });
    } else {
      query.andWhere(qb => {
        const subQuery = qb.subQuery()
          .select("a.id")
          .from(Attendance, "a")
          .where("a.studentId = student.id AND a.date BETWEEN :startDate AND :endDate")
          .andWhere("a.status = :status")
          .getQuery();
        return `EXISTS ${subQuery}`;
      }, { startDate, endDate, status });
    }
  }

  private applyStatsMapping(query: SelectQueryBuilder<Student>, startDate: string, endDate: string) {
    const stats = [
      { key: 'presentCount', status: AttendanceStatus.PRESENT },
      { key: 'lateCount', status: AttendanceStatus.LATE },
      { key: 'absentCount', status: AttendanceStatus.ABSENT },
    ];

    stats.forEach(({ key, status }) => {
      query.loadRelationCountAndMap(
        `student.${key}`,
        'student.attendances',
        'att',
        (qb) => qb.where('att.date BETWEEN :startDate AND :endDate AND att.status = :status', {
          startDate,
          endDate,
          status
        })
      );
    });
  }
}
