import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { AttendanceStatus } from '@student-attendance/shared';

@Entity()
export class AttendanceLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @Column({ type: 'int' })
  status: AttendanceStatus;

  @Column({ type: 'date' })
  date: string;

  @CreateDateColumn()
  createdAt: Date;
}
