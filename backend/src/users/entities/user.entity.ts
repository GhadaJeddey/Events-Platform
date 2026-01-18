import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
/**
 * User Entity
 * Represents a user in the database.
 */
export class UserEntity {
    /**
     * Unique identifier for the user.
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * User's email address. Must be unique.
     */
    @Column({ unique: true })
    email: string;

    /**
     * Hashed password for the user.
     */
    @Column()
    password: string;

    /**
     * Role of the user (e.g., 'student', 'admin').
     */
    @Column()
    role: string;
}
