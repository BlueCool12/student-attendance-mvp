import { Injectable } from '@nestjs/common';
import { StudentRepository } from './student.repository';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { FindStudentsDto } from './dto/find-students.dto';

import { StudentResponseDto } from './dto/student-response.dto';
import { calculatePassedDays } from '../common/utils/date.util';

@Injectable()
export class StudentService {
  constructor(
    private readonly studentRepository: StudentRepository
  ) { }

  async create(createStudentDto: CreateStudentDto) {
    return await this.studentRepository.create(createStudentDto);
  }

  async findAll(queryDto: FindStudentsDto) {
    const { startDate, endDate, limit, page } = queryDto;
    const passedDaysInRange = calculatePassedDays(startDate, endDate);

    const [students, total] = await this.studentRepository.findAndCountWithStats(queryDto, passedDaysInRange);

    return {
      data: students.map((s) => StudentResponseDto.fromEntity(s, passedDaysInRange)),
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
