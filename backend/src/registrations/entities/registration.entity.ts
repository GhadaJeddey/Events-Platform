import { Entity, Unique, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import { RegistrationStatus } from '../../common/enums/registration-status.enum';
import { Student } from '../../students/entities/student.entity';

@Entity()
@Unique(['student', 'event']) // Prevents multiple registrations to the same event by same user 
export class Registration {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Student, (student) => student.registrations, { onDelete: 'CASCADE' })
    student: Student;

    @ManyToOne(() => Event, (event) => event.registrations, { onDelete: 'CASCADE' })
    event: Event;

    // status for waitlist or confirmed
    @Column({
        type: 'enum',
        enum: RegistrationStatus,
        default: RegistrationStatus.CONFIRMED
    })
    status: RegistrationStatus;

    @CreateDateColumn()
    createdAt: Date;
}
