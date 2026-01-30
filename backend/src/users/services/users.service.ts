import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
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
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findAllPaginated(skip: number = 0, take: number = 10): Promise<User[]> {
    return await this.userRepository.find({
      skip,
      take,
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive'],
      order: { createdAt: 'DESC' },
    });
  }

  async countAll(): Promise<number> {
    return await this.userRepository.count();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['studentProfile', 'organizerProfile'],
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['studentProfile', 'organizerProfile'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Hash password if it exists
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    // Merge changes and save
    const updatedUser = this.userRepository.merge(user, updateUserDto);

    return await this.userRepository.save(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`User with ID ${id} not found`);
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.findOne(id);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update to new password (hashing assuré par update())
    await this.update(id, { password: changePasswordDto.newPassword });
    return { message: 'Password changed successfully' };
  }
}