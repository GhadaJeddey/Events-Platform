import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { UserRole } from '../../common/enums/user.enums';
import { Registration } from '../../registrations/entities/registration.entity';
import { Student } from '../../students/entities/student.entity';
import { Organizer } from '../../organizers/entities/organizer.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  firstName: string;  

  @Column({ length: 255 })
  lastName: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Lien vers le profil Étudiant
  @OneToOne(() => Student, (student) => student.user)
  studentProfile: Student;

  // Lien vers le profil Club (Organizer)
  @OneToOne(() => Organizer, (organizer) => organizer.user)
  organizerProfile: Organizer;

}
