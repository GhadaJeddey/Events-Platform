import { join } from "path";
import { User } from "../../users/entities/user.entity";
import { Entity,Column, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Event } from "../../events/entities/event.entity.js";

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