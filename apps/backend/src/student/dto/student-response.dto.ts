import { Student } from '../entities/student.entity';

export interface StudentWithStats extends Student {
  presentCount?: number;
  lateCount?: number;
  absentCount?: number;
}

export class StudentResponseDto {
  id: number;
  name: string;
  createdAt: Date;
  stats: {
    present: number;
    late: number;
    absent: number;
    rate: number;
  };

  static fromEntity(student: StudentWithStats, passedDaysInRange: number): StudentResponseDto {
    const { presentCount = 0, lateCount = 0, absentCount = 0, ...data } = student;
    const rate = Math.round(((presentCount + lateCount) / passedDaysInRange) * 100);

    return {
      id: data.id,
      name: data.name,
      createdAt: data.createdAt,
      stats: {
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        rate,
      },
    };
  }
}
