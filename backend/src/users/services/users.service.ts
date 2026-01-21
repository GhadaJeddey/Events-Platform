import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
          const salt = await bcrypt.genSalt();
          const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
  
          const user = this.userRepository.create({
              ...createUserDto,
              password: hashedPassword,
          });
          return this.userRepository.save(user);
      }

  // FIND ALL users
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  // FIND ONE user by ID
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // UPDATE a user
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const updatedUser = this.userRepository.merge(user, updateUserDto);
    return await this.userRepository.save(updatedUser);
  }

  // DELETE a user
  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
   async findByEmail(email: string): Promise<User | null> {
          return this.userRepository.findOne({ where: { email } });
      }
}
