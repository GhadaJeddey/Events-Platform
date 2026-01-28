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
import { Organizer } from '../../organizers/entities/organizer.entity';
import { RoomLocation } from 'src/common/enums/room-location.enum';

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

  @Column({
    type: 'enum',
    enum: RoomLocation,
    nullable: true 
  })
  location: RoomLocation;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  currentRegistrations: number;

  @Column({ nullable: true, length: 500, default: '/uploads/events/default.jpg' })
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Registration, (registration) => registration.event)
  registrations: Registration[];

  @ManyToOne(() => Organizer, (organizer) => organizer.events, {onDelete : 'CASCADE'})
  @JoinColumn({ name: 'organizerId' })
  organizer: Organizer;

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
