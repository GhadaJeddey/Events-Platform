import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Role } from '../auth/enums/role.enum';

@Injectable()
/**
 * Service for managing user data.
 */
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
    ) { }

    /**
     * Creates a new user with hashed password.
     * @param {CreateUserDto} createUserDto - The user creation DTO.
     * @returns {Promise<UserEntity>} The created user entity.
     */
    async create(createUserDto: CreateUserDto): Promise<UserEntity> {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

        const user = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });
        return this.usersRepository.save(user);
    }

    /**
     * Finds a user by email address.
     * @param {string} email - The email to search for.
     * @returns {Promise<UserEntity | null>} The found user or null.
     */
    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.usersRepository.findOne({ where: { email } });
    }
}
