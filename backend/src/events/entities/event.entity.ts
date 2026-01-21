import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { ApprovalStatus, EventStatus } from '../../common/enums/event.enums';
import { Registration } from '../../registrations/entities/registration.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ length: 255 })
  location: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  currentRegistrations: number;

  @Column({ nullable: true, length: 500 })
  imageUrl?: string;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  approvalStatus: ApprovalStatus;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.UPCOMING,
  })
  eventStatus: EventStatus;

  // Relations 

  // @ManyToOne(() => Club, (club) => club.events, { eager: true })
  // @JoinColumn({ name: 'clubId' })
  // club: Club;

  @Column({ type: 'uuid', nullable: true })
  clubId?: string;

  // @ManyToOne(() => User, (user) => user.createdEvents, { eager: true })
  // @JoinColumn({ name: 'organizerId' })
  // organizer: User;

  @Column({ type: 'uuid', nullable: true })
  organizerId?: string;

  // @OneToMany(() => Registration, (registration) => registration.event)
  // registrations: Registration[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Registration, (registration) => registration.event)
  registrations: Registration[];

  // getters
  /* a utiliser pour interdire l'inscription si l'evenement est plein */
  get isFull(): boolean {
    return this.currentRegistrations >= this.capacity;
  }

  /* a utiliser pour afficher le nombre de places restantes */
  get availableSpots(): number {
    return Math.max(0, this.capacity - this.currentRegistrations);
  }

  /* a utiliser pour afficher si l'evenement est passé */
  get isPast(): boolean {
    return this.endDate < new Date();
  }
  /* a utiliser pour verifier si un utilisateur peut s'inscrire */
  get isActive(): boolean {
    return !this.isPast && this.approvalStatus === 'approved';
  }
}