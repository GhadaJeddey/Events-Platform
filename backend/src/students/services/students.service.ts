import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from '../dto/create-student.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { Roles } from '../../auth/decorators/roles.decorator';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) { }

  async create(user: User, createStudentDto: CreateStudentDto): Promise<Student> {

    const existingStudentCardNumber = await this.studentRepository.findOne({
      where: { studentCardNumber: createStudentDto.studentCardNumber }
    });

    if (existingStudentCardNumber) {
      throw new Error('Student with this card number already exists');
    }

    const student = this.studentRepository.create({
      ...createStudentDto,
      user: user
    });

    return this.studentRepository.save(student);
  }

  async findAll(): Promise<Student[]> {
    return await this.studentRepository.find({
      relations: ['user'],
    });
  }


  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['user', 'registrations'], // On charge l'historique
    });

    if (!student) {
      throw new NotFoundException(`Student profile #${id} not found`);
    }
    return student;
  }

  async findOneByUserId(userId: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'registrations', 'registrations.event'],
    });

    if (!student) {
      throw new NotFoundException('Student profile not found for this user');
    }
    return student;
  }

  async findOneByStudentCardNumber(studentCardNumber: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { studentCardNumber },
      relations: ['user', 'registrations', 'registrations.event'],
    });
    if (!student) {
      throw new NotFoundException('Student profile not found for this card number');
    }
    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    // On vérifie d'abord que le student existe
    const student = await this.findOne(id);

    // Si on modifie le numéro de carte, attention aux doublons
    if (updateStudentDto.studentCardNumber && updateStudentDto.studentCardNumber !== student.studentCardNumber) {
      const existing = await this.studentRepository.findOne({ where: { studentCardNumber: updateStudentDto.studentCardNumber } });
      if (existing) throw new ConflictException('Card number already taken');
    }

    // Fusion et sauvegarde
    Object.assign(student, updateStudentDto);
    return await this.studentRepository.save(student);
  }


}
