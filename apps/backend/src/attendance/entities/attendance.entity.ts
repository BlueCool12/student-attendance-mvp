import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Student } from '../../student/entities/student.entity';

export enum AttendanceStatus {
    PRESENT = 1,
    LATE = 2,
    ABSENT = 3,
}

@Entity()
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

    // Store the date of attendance (e.g., '2023-10-27') to query by date easily
    @Column({ type: 'date' })
    date: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
