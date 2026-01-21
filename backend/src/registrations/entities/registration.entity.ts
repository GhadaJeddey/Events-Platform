import { Entity, Unique, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import { RegistrationStatus } from '../../common/enums/registration-status.enum';

@Entity()
@Unique(['user', 'event']) // Prevents multiple registrations to the same event by same user 
export class Registration {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.registrations, { onDelete: 'CASCADE' })
    user: User;

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
