import { Registration } from "src/registrations/entities/registration.entity";
import { User } from "src/users/entities/user.entity";
import { Column } from "typeorm/browser/decorator/columns/Column.js";
import { PrimaryGeneratedColumn } from "typeorm/browser/decorator/columns/PrimaryGeneratedColumn.js";
import { Entity } from "typeorm/browser/decorator/entity/Entity.js";
import { JoinColumn } from "typeorm/browser/decorator/relations/JoinColumn.js";
import { OneToMany } from "typeorm/browser/decorator/relations/OneToMany.js";
import { OneToOne } from "typeorm/browser/decorator/relations/OneToOne.js";


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
