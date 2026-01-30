import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organizer } from '../entities/organizer.entity';
import { CreateOrganizerDto } from '../dto/create-organizer.dto';
import { UpdateOrganizerDto } from '../dto/update-organizer.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class OrganizersService {
  constructor(
    @InjectRepository(Organizer)
    private readonly organizerRepository: Repository<Organizer>,
  ) { }

  async create(user: User, createOrganizerDto: CreateOrganizerDto): Promise<Organizer> {

    // On vérifie si le nom du club est déjà pris 
    const existing = await this.organizerRepository.findOne({ where: { name: createOrganizerDto.name } });
    if (existing) {
      throw new ConflictException('Organization name already exists');
    }

    const organizer = this.organizerRepository.create({
      ...createOrganizerDto,
      user,
      isVerified: false,
    });

    return await this.organizerRepository.save(organizer);
  }

  async findAll(): Promise<Organizer[]> {
    return await this.organizerRepository.find({
      where: { isVerified: true },
      relations: ['user']
    });
  }

  async findOne(id: string): Promise<Organizer> {
    const organizer = await this.organizerRepository.findOne({
      where: { id },
      relations: ['events'], // On charge les événements du club
    });
    if (!organizer) throw new NotFoundException(`Organizer #${id} not found`);
    return organizer;
  }

  async findOneByUserId(userId: string): Promise<Organizer> {
    const organizer = await this.organizerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['events'],
    });
    if (!organizer) throw new NotFoundException('Organizer profile not found for this user');
    return organizer;
  }

  async update(id: string, updateOrganizerDto: UpdateOrganizerDto): Promise<Organizer> {
    const organizer = await this.organizerRepository.preload({
      id: id,
      ...updateOrganizerDto,
    });

    if (!organizer) {
      throw new NotFoundException(`Organizer with ID ${id} not found`);
    }

    return await this.organizerRepository.save(organizer);
  }

  async verifyOrganizer(id: string): Promise<Organizer> {
    const organizer = await this.findOne(id);
    organizer.isVerified = true;
    return await this.organizerRepository.save(organizer);
  }

  // --- ADMIN LOGIC ---

  async getPendingOrganizers(): Promise<Organizer[]> {

    return await this.organizerRepository.find({
      where: { isVerified: false },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async approveOrganizer(id: string): Promise<Organizer> {
    const organizer = await this.findOne(id);
    organizer.isVerified = true;
    return await this.organizerRepository.save(organizer);
  }

  async rejectOrganizer(id: string): Promise<void> {
    const organizer = await this.findOne(id);
    await this.organizerRepository.delete(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.organizerRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Organizer with ID ${id} not found`);
    }
  }

}