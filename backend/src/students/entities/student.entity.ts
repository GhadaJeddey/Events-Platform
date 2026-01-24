import { Registration } from "src/registrations/entities/registration.entity";
import { User } from "src/users/entities/user.entity";
import { Entity, Column, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('student')
export class Student {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    studentCardNumber: string;

    @Column()
    major: string; // Exemple : 'RT'

    @OneToOne(() => User, (user) => user.studentProfile)
    @JoinColumn()
    user: User;


    @OneToMany(() => Registration, (registration) => registration.student)
    registrations: Registration[];

}
