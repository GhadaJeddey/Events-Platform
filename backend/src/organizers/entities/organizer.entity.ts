import { join } from "path";
import { User } from "src/users/entities/user.entity";
import { Column, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Entity } from "typeorm/browser/decorator/entity/Entity.js";
import { Event } from "src/events/entities/event.entity.js";

@Entity('organizer')
export class Organizer {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column({ nullable: true })
    description: string

    @Column({ nullable: true })
    website: string

    @Column({ default: false })
    isVerified: boolean // validé ou pas par un admin

    @OneToOne(() => User, (user) => user.organizerProfile)
    @JoinColumn()
    user: User;

    @OneToMany(() => Event, (event) => event.organizer)
    events: Event[];

}