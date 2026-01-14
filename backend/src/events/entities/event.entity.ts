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
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  })
  approvalStatus: string;

  @Column({
    type: 'enum',
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming',
  })
  eventStatus: string;

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

  // Méthodes calculées (getters)
  get isFull(): boolean {
    return this.currentRegistrations >= this.capacity;
  }

  get availableSpots(): number {
    return Math.max(0, this.capacity - this.currentRegistrations);
  }

  get isPast(): boolean {
    return this.endDate < new Date();
  }

  get isActive(): boolean {
    return !this.isPast && this.approvalStatus === 'approved';
  }
}