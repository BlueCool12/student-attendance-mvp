import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Attendance } from '../../attendance/entities/attendance.entity';

@Entity()
export class Student {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 6 })
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Attendance, (attendance) => attendance.student)
    attendances: Attendance[];
}
