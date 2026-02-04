import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne, DeleteDateColumn, Unique, Index } from 'typeorm';
import { Student } from '../../student/entities/student.entity';
import { AttendanceStatus } from '@student-attendance/shared';

@Entity()
@Unique(['studentId', 'date'])
@Index(['date', 'status'])
export class Attendance {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    studentId: number;

    @ManyToOne(() => Student, (student) => student.attendances)
    @JoinColumn({ name: 'studentId' })
    student: Student;

    @Column({ type: 'int' })
    status: AttendanceStatus;

    @Column({ type: 'date' })
    date: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'text', nullable: true })
    memo: string;

    @DeleteDateColumn()
    deletedAt: Date;
}
