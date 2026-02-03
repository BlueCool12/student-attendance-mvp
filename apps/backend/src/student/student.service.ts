import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';
import { FindStudentsDto } from './dto/find-students.dto';
import { AttendanceStatus } from '@student-attendance/shared';
import { Attendance } from '../attendance/entities/attendance.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>
  ) { }

  async create(createStudentDto: CreateStudentDto) {
    const student = this.studentRepository.create(createStudentDto);
    return await this.studentRepository.save(student);
  }

  async findAll(queryDto: FindStudentsDto) {
    const { startDate, endDate, status, page = 1, limit = 10 } = queryDto;
    const query = this.studentRepository.createQueryBuilder('student');

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let passedDaysInRange = 0;
    const tempDate = new Date(start);
    while (tempDate <= end) {
      if (tempDate <= today) passedDaysInRange++;
      tempDate.setDate(tempDate.getDate() + 1);
    }
    if (passedDaysInRange === 0) passedDaysInRange = 1;

    if (status === AttendanceStatus.UNRECORDED) {
      query.andWhere(qb => {
        const subQuery = qb.subQuery()
          .select("COUNT(a.id)")
          .from(Attendance, "a")
          .where("a.studentId = student.id")
          .andWhere("a.date BETWEEN :startDate AND :endDate")
          .getQuery();
        return `(${subQuery}) < :passedDaysInRange`;
      }).setParameters({ startDate, endDate, passedDaysInRange });
    } else if (status !== AttendanceStatus.ALL) {
      query.andWhere(qb => {
        const subQuery = qb.subQuery()
          .select("a.id")
          .from(Attendance, "a")
          .where("a.studentId = student.id")
          .andWhere("a.date BETWEEN :startDate AND :endDate")
          .andWhere("a.status = :status")
          .getQuery();
        return `EXISTS (${subQuery})`;
      }).setParameters({ startDate, endDate, status });
    }

    query
      .loadRelationCountAndMap('student.presentCount', 'student.attendances', 'presentAttendance', (qb) => qb.where('presentAttendance.date BETWEEN :startDate AND :endDate AND presentAttendance.status = :present', { startDate, endDate, present: AttendanceStatus.PRESENT }))
      .loadRelationCountAndMap('student.lateCount', 'student.attendances', 'lateAttendance', (qb) => qb.where('lateAttendance.date BETWEEN :startDate AND :endDate AND lateAttendance.status = :late', { startDate, endDate, late: AttendanceStatus.LATE }))
      .loadRelationCountAndMap('student.absentCount', 'student.attendances', 'absentAttendance', (qb) => qb.where('absentAttendance.date BETWEEN :startDate AND :endDate AND absentAttendance.status = :absent', { startDate, endDate, absent: AttendanceStatus.ABSENT }));

    query
      .orderBy('student.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [students, total] = await query.getManyAndCount();

    const data = students.map(student => {
      const { presentCount, lateCount, absentCount, ...studentData } = student as any;
      const present = presentCount || 0;
      const late = lateCount || 0;
      const absent = absentCount || 0;
      const rate = Math.round(((present + late) / passedDaysInRange) * 100);

      return {
        ...studentData,
        stats: { present, late, absent, rate }
      };
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    return await this.studentRepository.update(id, updateStudentDto);
  }

  async remove(id: number) {
    return await this.studentRepository.softDelete(id);
  }
}
