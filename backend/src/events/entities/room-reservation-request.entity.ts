import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organizer } from '../../organizers/entities/organizer.entity';
import { RoomLocation } from '../../common/enums/room-location.enum';
import { ReservationStatus } from '../../common/enums/room-status.enum';

@Entity('room_reservation_requests')
export class RoomReservationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organizer, { eager: true })
  @JoinColumn({ name: 'organizerId' })
  organizer: Organizer;

  @Column()
  organizerId: string;

  @Column({
    type: 'enum',
    enum: RoomLocation,
  })
  room: RoomLocation;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  eventTitle?: string;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
